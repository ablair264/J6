import { useState, useEffect } from "react";

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav className={`nav ${scrolled ? "s" : ""}`}>
      <div className="nav-logo">
        <img src="/logo-dark.svg" alt="UI Studio - Visual React Component Designer" className="logo-dark" />
        <img src="/logo-light.svg" alt="UI Studio - Visual React Component Designer" className="logo-light" />
      </div>
      <ul className="nav-links">
        <li><a href="#how">How it works</a></li>
        <li><a href="#motion">Motion</a></li>
        <li><a href="#components">Components</a></li>
        <li><a href="#effects">Effects</a></li>
        <li><a href="#pricing">Pricing</a></li>
      </ul>
      <button className="nav-cta">Start Free</button>
    </nav>
  );
}
