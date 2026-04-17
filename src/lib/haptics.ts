type VibrationPattern = number | number[];

function vibrate(pattern: VibrationPattern) {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(pattern);
    } catch {
      // no-op — some browsers throw on repeat calls
    }
  }
}

export const haptics = {
  tap: () => vibrate(10),
  select: () => vibrate(15),
  success: () => vibrate([10, 40, 10]),
  error: () => vibrate([60, 30, 60]),
  milestone: () => vibrate([20, 40, 20, 40, 100]),
};

export default haptics;
