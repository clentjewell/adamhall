interface Props {
  count?: number;
  className?: string;
}

/** Row of filled stars (used in testimonials). */
export default function Stars({ count = 5, className = "" }: Props) {
  return (
    <span
      className={`stars ${className}`}
      role="img"
      aria-label={`${count} out of 5 stars`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 2l2.9 6.26L21.6 9.2l-4.8 4.68 1.13 6.62L12 17.77 6.07 20.5 7.2 13.88 2.4 9.2l6.7-.94z"
          />
        </svg>
      ))}
    </span>
  );
}
