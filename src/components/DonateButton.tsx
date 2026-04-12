import Link from "next/link";

interface DonateButtonProps {
  size?: "sm" | "md";
}

export default function DonateButton({ size = "sm" }: DonateButtonProps) {
  return (
    <Link
      href="/donate"
      className={`inline-flex items-center gap-2 bg-warm-500 text-white rounded-lg hover:bg-warm-600 transition-colors font-medium ${
        size === "sm" ? "px-3 py-1.5 text-sm" : "px-5 py-2.5 text-base"
      }`}
    >
      <span className="text-lg" aria-hidden="true">&#9749;</span>
      Buy Me a Coffee
    </Link>
  );
}
