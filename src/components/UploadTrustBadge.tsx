import { Lock } from "lucide-react";

export default function UploadTrustBadge() {
  return (
    <div className="bg-gradient-to-r from-gold-500/20 to-accent-500/20 border border-gold-400/50 rounded-lg p-4 mb-6 flex items-start gap-3">
      <Lock className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-white mb-1">
          🔒 Your video never leaves your phone
        </p>
        <p className="text-sm text-gray-300">
          Videos are processed on your device. Only still-frame thumbnails are analyzed.
          Nothing is uploaded, stored, or seen by anyone.
        </p>
      </div>
    </div>
  );
}
