/**
 * Client-side video frame extraction utility.
 * Extracts key frames from a video file using <video> + <canvas> in the browser.
 * No external dependencies required.
 */

export interface ExtractedFrame {
  timestamp: number; // seconds into the video
  label: string; // e.g., "0:15"
  blob: Blob; // JPEG image blob
  dataUrl: string; // base64 data URL for preview
}

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
}

export interface ExtractionProgress {
  stage: "loading" | "extracting" | "done";
  current: number;
  total: number;
  message: string;
}

/**
 * Load video metadata without extracting frames
 */
export function loadVideoMetadata(file: File): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;

    const url = URL.createObjectURL(file);
    video.src = url;

    video.onloadedmetadata = () => {
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      });
      URL.revokeObjectURL(url);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load video. Please try a different format."));
    };
  });
}

/**
 * Format seconds as m:ss
 */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Extract evenly-spaced frames from a video file.
 * Uses the browser's native video decoder — works with MP4, MOV, WebM, etc.
 *
 * @param file - Video file to extract frames from
 * @param frameCount - Number of frames to extract (default 20)
 * @param onProgress - Progress callback
 * @returns Array of extracted frames as JPEG blobs
 */
export function extractFrames(
  file: File,
  frameCount: number = 20,
  onProgress?: (progress: ExtractionProgress) => void
): Promise<ExtractedFrame[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;

    const url = URL.createObjectURL(file);
    video.src = url;

    onProgress?.({
      stage: "loading",
      current: 0,
      total: frameCount,
      message: "Loading video...",
    });

    video.onloadedmetadata = async () => {
      const duration = video.duration;
      if (!duration || !isFinite(duration)) {
        URL.revokeObjectURL(url);
        reject(new Error("Could not determine video duration."));
        return;
      }

      // Calculate target resolution — cap at 512px width to keep payload small
      const scale = Math.min(1, 512 / video.videoWidth);
      const canvasWidth = Math.round(video.videoWidth * scale);
      const canvasHeight = Math.round(video.videoHeight * scale);

      const canvas = document.createElement("canvas");
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext("2d")!;

      // Calculate timestamps: skip first/last 0.5s, evenly distribute
      const start = Math.min(0.5, duration * 0.02);
      const end = duration - Math.min(0.5, duration * 0.02);
      const interval = (end - start) / (frameCount - 1);
      const timestamps = Array.from(
        { length: frameCount },
        (_, i) => start + i * interval
      );

      const frames: ExtractedFrame[] = [];

      for (let i = 0; i < timestamps.length; i++) {
        const timestamp = timestamps[i];

        onProgress?.({
          stage: "extracting",
          current: i + 1,
          total: frameCount,
          message: `Extracting frame ${i + 1}/${frameCount} at ${formatTime(timestamp)}`,
        });

        try {
          const frame = await captureFrameAtTime(
            video,
            canvas,
            ctx,
            timestamp,
            canvasWidth,
            canvasHeight
          );
          frames.push({
            timestamp,
            label: formatTime(timestamp),
            ...frame,
          });
        } catch {
          // Skip frames that fail to capture (rare, usually at very end)
          console.warn(`Failed to capture frame at ${timestamp}s, skipping`);
        }
      }

      URL.revokeObjectURL(url);

      onProgress?.({
        stage: "done",
        current: frameCount,
        total: frameCount,
        message: "Frame extraction complete",
      });

      if (frames.length === 0) {
        reject(new Error("Could not extract any frames from this video."));
      } else {
        resolve(frames);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(
        new Error(
          "Failed to load video. The format may not be supported by your browser."
        )
      );
    };
  });
}

/**
 * Seek video to a specific timestamp and capture the frame
 */
function captureFrameAtTime(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  time: number,
  width: number,
  height: number
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Frame capture timed out"));
    }, 10000);

    video.currentTime = time;

    video.onseeked = () => {
      clearTimeout(timeout);
      try {
        ctx.drawImage(video, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.6);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, dataUrl });
            } else {
              reject(new Error("Canvas toBlob returned null"));
            }
          },
          "image/jpeg",
          0.6
        );
      } catch (err) {
        reject(err);
      }
    };
  });
}

/**
 * Convert extracted frames to base64 strings for API submission
 */
export async function framesToBase64(
  frames: ExtractedFrame[]
): Promise<{ timestamp: number; label: string; base64: string }[]> {
  return Promise.all(
    frames.map(async (frame) => {
      const buffer = await frame.blob.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(buffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );
      return {
        timestamp: frame.timestamp,
        label: frame.label,
        base64,
      };
    })
  );
}
