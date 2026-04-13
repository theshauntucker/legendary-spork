import Link from "next/link";

export default function FTCDisclosure({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs text-ink-400 leading-relaxed ${className}`}>
      Some links on this page are affiliate links. If you make a purchase through
      these links, we may earn a small commission at no additional cost to you.
      This helps support the site.{" "}
      <Link href="/legal/ftc-disclosure" className="underline hover:text-primary-500">
        Full disclosure
      </Link>
      .
    </p>
  );
}
