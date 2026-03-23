import { ExtractedFrame } from "./types";

// Adaptive settings based on video duration and resolution
function getExtractionSettings(duration: number, videoWidth: number) {
  // Adaptive frame count: more frames for longer routines, capped to keep payload reasonable
  let frameCount: number;
  if (duration <= 60) frameCount = 20;
  else if (duration <= 120) frameCount = 25;
  else if (duration <= 180) frameCount = 30;
  else if (duration <= 300) frameCount = 35;
  else frameCount = 40; // 5+ min routines

  // On mobile, use fewer frames to avoid memory pressure
  if (isMobile()) {
    frameCount = Math.min(frameCount, 20);
  }

  // Scale down aggressively — 768px wide is plenty for AI analysis
  // 4K (3840px) → 768px = 5x reduction, huge payload savings
  const maxWidth = isMobile() ? 640 : 768;
  const scale = Math.min(1, maxWidth / videoWidth);

  // Lower JPEG quality for larger source resolutions (less noticeable)
  const quality = videoWidth > 1920 ? 0.6 : 0.7;

  return { frameCount, scale, quality };
}

function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

const METADATA_TIMEOUT_MS = 15000; // 15s to load metadata
const SEEK_TIMEOUT_MS = 10000; // 10s per seek operation
const TOTAL_TIMEOUT_MS = 120000; // 2 min total extraction limit

export async function extractFrames(
  file: File,
  overrideFrameCount?: number
): Promise<{ frames: ExtractedFrame[]; duration: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    // Critical for iOS — without these, Safari won't load the video inline
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    // Allow cross-origin for blob URLs (safety)
    video.crossOrigin = "anonymous";

    const url = URL.createObjectURL(file);
    video.src = url;

    let settled = false;
    const cleanup = () => {
      URL.revokeObjectURL(url);
      video.removeAttribute("src");
      video.load(); // release memory
    };

    const fail = (msg: string) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error(msg));
    };

    const succeed = (result: { frames: ExtractedFrame[]; duration: number }) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    };

    // Total timeout — never hang forever
    const totalTimer = setTimeout(() => {
      fail("Video processing timed out. Try a shorter video or MP4 format.");
    }, TOTAL_TIMEOUT_MS);

    // Metadata timeout — if the browser can't read the video at all
    const metadataTimer = setTimeout(() => {
      fail(
        "Could not read video file. Try converting to MP4 (H.264) format."
      );
    }, METADATA_TIMEOUT_MS);

    const startExtraction = () => {
      clearTimeout(metadataTimer);

      const duration = video.duration;
      if (!duration || !isFinite(duration) || duration <= 0) {
        clearTimeout(totalTimer);
        fail("Could not determine video duration. Please try a different file.");
        return;
      }

      const { frameCount, scale, quality } = getExtractionSettings(
        duration,
        video.videoWidth
      );
      const actualFrameCount = overrideFrameCount ?? frameCount;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        clearTimeout(totalTimer);
        fail("Could not create canvas context.");
        return;
      }

      // Calculate timestamps to capture (evenly spaced, skip first/last 0.5s)
      const start = Math.min(0.5, duration * 0.05);
      const end = duration - Math.min(0.5, duration * 0.05);
      const interval = (end - start) / (actualFrameCount - 1);
      const timestamps = Array.from(
        { length: actualFrameCount },
        (_, i) => Math.round((start + i * interval) * 100) / 100
      );

      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);

      const frames: ExtractedFrame[] = [];
      let currentIndex = 0;
      let seekTimer: ReturnType<typeof setTimeout> | null = null;

      const captureFrame = () => {
        if (seekTimer) clearTimeout(seekTimer);
        if (settled) return;

        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", quality);

          frames.push({
            timestamp: timestamps[currentIndex],
            dataUrl,
          });
        } catch {
          // Canvas tainted or draw failed — skip this frame silently
        }

        currentIndex++;
        if (currentIndex < timestamps.length) {
          seekToNext();
        } else {
          clearTimeout(totalTimer);
          if (frames.length === 0) {
            fail("Could not extract any frames. Try a different video format (MP4 works best).");
          } else {
            succeed({ frames, duration });
          }
        }
      };

      const seekToNext = () => {
        // Per-seek timeout: if a single seek hangs, skip it
        seekTimer = setTimeout(() => {
          // Seek timed out — skip this frame and try the next
          currentIndex++;
          if (currentIndex < timestamps.length) {
            seekToNext();
          } else {
            clearTimeout(totalTimer);
            if (frames.length === 0) {
              fail("Video seeking failed. Try converting to MP4 (H.264).");
            } else {
              // Return whatever frames we got
              succeed({ frames, duration });
            }
          }
        }, SEEK_TIMEOUT_MS);

        video.currentTime = timestamps[currentIndex];
      };

      video.onseeked = captureFrame;

      // Start seeking to first frame
      seekToNext();
    };

    video.onloadedmetadata = () => {
      // On some mobile browsers, videoWidth/videoHeight aren't ready at metadata time.
      // Wait for loadeddata if dimensions are zero.
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        startExtraction();
      } else {
        video.onloadeddata = () => startExtraction();
      }
    };

    // Fallback: on iOS, metadata may only be available after loadeddata
    video.onloadeddata = () => {
      if (!settled && video.duration && video.videoWidth > 0) {
        startExtraction();
      }
    };

    video.onerror = () => {
      clearTimeout(totalTimer);
      clearTimeout(metadataTimer);
      fail(
        "Failed to load video. Please try MP4 (H.264) format — it works best on all devices."
      );
    };

    // On mobile, we may need to trigger a load explicitly
    video.load();
  });
}
