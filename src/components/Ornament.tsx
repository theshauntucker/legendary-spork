interface OrnamentProps {
  variant?: "dinkus" | "rule" | "diamond";
  className?: string;
}

export default function Ornament({
  variant = "dinkus",
  className = "",
}: OrnamentProps) {
  if (variant === "rule") {
    return (
      <div className={`ornament-rule ${className}`}>
        <span className="dot" />
      </div>
    );
  }

  if (variant === "diamond") {
    return (
      <div className={`flex justify-center py-6 ${className}`}>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          className="text-cream-200"
        >
          <rect
            x="6"
            y="0"
            width="8.49"
            height="8.49"
            rx="1"
            transform="rotate(45 6 0)"
            fill="currentColor"
          />
        </svg>
      </div>
    );
  }

  // dinkus (default)
  return (
    <div className={`ornament-dinkus ${className}`} aria-hidden="true">
      <span>&#9679;</span>
      <span>&#9679;</span>
      <span>&#9679;</span>
    </div>
  );
}
