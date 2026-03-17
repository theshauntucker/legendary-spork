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

  // Scale down aggressively — 768px wide is plenty for AI analysis
  // 4K (3840px) → 768px = 5x reduction, huge payload savings
  const maxWidth = 768;
  const scale = Math.min(1, maxWidth / videoWidth);

  // Lower JPEG quality for larger source resolutions (less noticeable)
  const quality = videoWidth > 1920 ? 0.65 : 0.75;

  return { frameCount, scale, quality };
}

export async function extractFrames(
  file: File,
  overrideFrameCount?: number
): Promise<{ frames: ExtractedFrame[]; duration: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;

    const url = URL.createObjectURL(file);
    video.src = url;

    video.onloadedmetadata = () => {
      const duration = video.duration;
      if (!duration || duration <= 0) {
        URL.revokeObjectURL(url);
        reject(new Error("Could not determine video duration"));
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
        URL.revokeObjectURL(url);
        reject(new Error("Could not create canvas context"));
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

      const captureFrame = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);

        frames.push({
          timestamp: timestamps[currentIndex],
          dataUrl,
        });

        currentIndex++;
        if (currentIndex < timestamps.length) {
          video.currentTime = timestamps[currentIndex];
        } else {
          URL.revokeObjectURL(url);
          resolve({ frames, duration });
        }
      };

      video.onseeked = captureFrame;
      video.currentTime = timestamps[0];
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load video. Please try a different format (MP4 works best)."));
    };
  });
}
