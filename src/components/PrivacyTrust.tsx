import { Shield, Lock, CheckCircle } from "lucide-react";

export default function PrivacyTrust() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-gold-500" />
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Your Dancer's Privacy is Sacred
            </h2>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            A dance mom emailed us with a question we hear a lot. We want to answer it completely.
          </p>
        </div>

        <div className="bg-white/5 border border-gold-400/30 rounded-lg p-6 mb-12 italic text-gray-300 text-base leading-relaxed">
          <p className="mb-2 text-gold-300 font-semibold not-italic">💬 From a real parent:</p>
          "I really love the idea of this product. Would love to try it — but I'm wondering about your privacy policy. What happens to the videos of the children being uploaded? Privacy in this world is a real issue and we want to protect our children. Are videos sold to third parties? I'm looking for any information about safety, privacy, and security."
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20">
            <CheckCircle className="w-8 h-8 text-gold-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Videos Stay on Your Device</h3>
            <p className="text-gray-300">
              Your video is processed right on your phone. Nothing is uploaded to our servers.
              The full video never leaves your device.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20">
            <Lock className="w-8 h-8 text-gold-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Only Thumbnails Are Analyzed</h3>
            <p className="text-gray-300">
              We extract small still-frame snapshots at key moments. These low-resolution
              images are what get analyzed by AI — not your full video.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20">
            <Shield className="w-8 h-8 text-gold-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">No Storage. No Viewing. Ever.</h3>
            <p className="text-gray-300">
              We don't store your videos. No human ever sees the footage. We don't sell data.
              Only your AI-generated feedback is saved.
            </p>
          </div>
        </div>

        <div className="bg-gold-500/10 border-l-4 border-gold-500 rounded-lg p-6 text-center">
          <p className="text-lg text-white font-semibold">
            Your child's privacy isn't an afterthought — it's how we built RoutineX from day one.
          </p>
        </div>
      </div>
    </section>
  );
}
