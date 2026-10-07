// Original illustration; never presented as a photograph of a venue.
export default function CourtVisual({
  variant = 0,
  hero = false
}) {
  const palettes = [["#d5e3d6", "#477565", "#f2bb91"], ["#eedbce", "#be7456", "#f4d9aa"], ["#dce3ef", "#718dab", "#b8cfdf"], ["#e6e2cf", "#858b58", "#d4d9ac"]];
  const [base, court, kitchen] = palettes[variant % palettes.length];
  return <svg viewBox="0 0 600 440" className={hero ? "scene-svg" : "court-visual"} aria-hidden="true">
    <rect width="600" height="440" fill={base} />
    <path d="M0 60H600M0 380H600" stroke="#fff" strokeOpacity=".3" strokeWidth="22" />
    <g transform="translate(108 64) rotate(-12 190 150)">
      <rect x="10" y="18" width="382" height="312" rx="6" fill="#183e2d" opacity=".16" />
      <rect width="382" height="312" rx="5" fill={court} />
      <rect x="40" y="30" width="302" height="252" fill="none" stroke="#fff" strokeWidth="3" />
      <path d="M40 106H342V206H40Z" fill={kitchen} />
      <path d="M40 106H342M40 206H342M191 30V106M191 206V282" stroke="#fff" strokeWidth="3" />
      <path d="M27 156H354" stroke="#193e30" strokeWidth="9" />
      <path d="M27 153H354" stroke="#fff" strokeWidth="2" strokeDasharray="3 3" />
      <path d="M28 146V165M354 146V165" stroke="#193e30" strokeWidth="5" />
      <g transform="translate(116 65)"><ellipse cy="7" rx="14" ry="8" fill="#142a21" opacity=".22" /><path d="M-7 8L-12 24M7 8L14 24" stroke="#26493b" strokeWidth="5" strokeLinecap="round" /><rect x="-9" y="-5" width="18" height="22" rx="8" fill="#f8e6c2" /><circle cy="-8" r="8" fill="#794b37" /><path d="M8 2L22 -6" stroke="#794b37" strokeWidth="5" strokeLinecap="round" /><ellipse cx="28" cy="-10" rx="7" ry="10" fill="#283d34" /></g>
      <g transform="translate(266 243)"><ellipse cy="7" rx="14" ry="8" fill="#142a21" opacity=".22" /><path d="M-7 8L-12 24M7 8L14 24" stroke="#f6eddb" strokeWidth="5" strokeLinecap="round" /><rect x="-9" y="-5" width="18" height="22" rx="8" fill="#223f34" /><circle cy="-8" r="8" fill="#b97753" /><path d="M-8 2L-22 -6" stroke="#b97753" strokeWidth="5" strokeLinecap="round" /><ellipse cx="-28" cy="-10" rx="7" ry="10" fill="#eee0bb" /></g>
      <circle className={hero ? "scene-ball" : ""} cx="240" cy="120" r="5" fill="#def26d" />
    </g>
    {[[52, 80], [550, 330], [545, 85], [60, 340]].map(([x, y], i) => <g key={i} transform={"translate(" + x + " " + y + ")"}><ellipse cx="5" cy="13" rx="29" ry="20" fill="#204736" opacity=".13" /><circle r="25" fill="#8cab82" /><circle cx="-7" cy="-6" r="18" fill="#a1bb92" /><path d="M0 18V-12M0 2L-11 -6M0 9L10 1" stroke="#68815c" strokeWidth="2" /></g>)}
    <g transform="translate(496 214) rotate(78)"><rect x="-25" y="-10" width="50" height="20" rx="3" fill="#ede8d7" /><path d="M-24 -3H24M-24 4H24" stroke="#c7c2b1" strokeWidth="2" /></g>
  </svg>;
}
