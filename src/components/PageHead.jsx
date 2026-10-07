export default function PageHead({
  eyebrow,
  title,
  back,
  children
}) {
  return <header className="pagehead"><div className="pagehead-in">{back}{eyebrow && <p className="eyebrow">{eyebrow}</p>}{title && <h1>{title}</h1>}{children}</div></header>;
}
