import { ExtractedFrame } from "./types";

export async function extractFrames(
  file: File,
  frameCount: number = 12
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
      const interval = (end - start) / (frameCount - 1);
      const timestamps = Array.from(
        { length: frameCount },
        (_, i) => Math.round((start + i * interval) * 100) / 100
      );

      const frames: ExtractedFrame[] = [];
      let currentIndex = 0;

      const captureFrame = () => {
        // Scale down to max 720p width for reasonable payload size
        const scale = Math.min(1, 720 / video.videoWidth);
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);

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
