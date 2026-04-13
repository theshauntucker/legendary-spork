interface PullQuoteProps {
  quote: string;
  attribution?: string;
  className?: string;
}

export default function PullQuote({
  quote,
  attribution,
  className = "",
}: PullQuoteProps) {
  return (
    <blockquote className={`pull-quote max-w-2xl mx-auto ${className}`}>
      {quote}
      {attribution && <cite>&mdash; {attribution}</cite>}
    </blockquote>
  );
}
