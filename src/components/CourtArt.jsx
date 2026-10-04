// Pickleball court that draws itself, with a bouncing ball. Pure decoration.
export default function CourtArt() {
  return (
    <div className="court-art" aria-hidden="true">
      <svg viewBox="0 0 520 320" fill="none">
        <rect className="ln" x="10" y="10" width="500" height="300" rx="6" pathLength="1" />
        <path className="ln" d="M150 10V310M370 10V310M10 160H150M370 160H510" pathLength="1" />
        <path className="ln net" d="M260 2V318" pathLength="1" />
      </svg>
      <span className="ball" /><span className="ball-shadow" />
    </div>
  );
}
