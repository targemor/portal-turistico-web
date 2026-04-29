export default function LeafIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path d="M17 8c0 5.5-5 10-5 10S7 13.5 7 8a5 5 0 0110 0z"/>
      <path d="M12 18v4"/>
    </svg>
  );
}
