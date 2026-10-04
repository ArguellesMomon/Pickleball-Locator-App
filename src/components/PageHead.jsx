import Ambient from "./Ambient.jsx";

// Header band shared by the inner pages: the same night-court backdrop as the court page
export default function PageHead({ eyebrow, title, children }) {
  return (
    <header className="pagehead">
      <Ambient />
      <div className="pagehead-in">
        {eyebrow && <p className="eyebrow light">{eyebrow}</p>}
        {title && <h1>{title}</h1>}
        {children}
      </div>
    </header>
  );
}
