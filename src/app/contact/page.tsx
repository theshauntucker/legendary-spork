import { Sparkles, Mail, MessageSquare } from "lucide-react";

export const metadata = {
  title: "Contact | RoutineX",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="mx-auto max-w-2xl">
        <a href="/" className="inline-flex items-center gap-2 mb-10">
          <Sparkles className="h-6 w-6 text-primary-400" />
          <span className="text-lg font-bold">
            Routine<span className="gradient-text">X</span>
          </span>
        </a>

        <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-display)] mb-4">
          Contact Us
        </h1>
        <p className="text-surface-200 mb-10">
          Have a question, suggestion, or need help? We&apos;d love to hear from you.
        </p>

        <div className="space-y-4">
          <a
            href="mailto:22tucker22@comcast.net"
            className="flex items-start gap-4 glass rounded-2xl p-6 hover:bg-white/10 transition-colors"
          >
            <Mail className="h-6 w-6 text-primary-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Email</p>
              <p className="text-sm text-surface-200 mt-1">
                22tucker22@comcast.net
              </p>
              <p className="text-xs text-surface-200/60 mt-1">
                We typically respond within 24 hours.
              </p>
            </div>
          </a>

          <div className="flex items-start gap-4 glass rounded-2xl p-6">
            <MessageSquare className="h-6 w-6 text-accent-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">General Inquiries</p>
              <p className="text-sm text-surface-200 mt-1">
                Questions about beta access, pricing, partnerships, or anything else — just email us and we&apos;ll get back to you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
