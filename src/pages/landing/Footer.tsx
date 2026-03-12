export default function Footer() {
  return (
    <footer className="footer">
      <div className="flogo">
        <img src="/logo-dark.svg" alt="UI Studio" className="logo-dark" />
        <img src="/logo-light.svg" alt="UI Studio" className="logo-light" />
      </div>
      <ul className="flinks">
        <li><a href="#">Docs</a></li><li><a href="#">Components</a></li>
        <li><a href="#">GitHub</a></li><li><a href="#">Privacy</a></li><li><a href="#">Terms</a></li>
      </ul>
      <div className="fcopy">&copy; 2026 J6. All rights reserved.</div>
    </footer>
  );
}
