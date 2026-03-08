import React, { useState, useEffect } from 'react';
import { ThemeContext, palette } from './landing/theme';
import { NavBar } from './landing/NavBar';
import { Hero } from './landing/Hero';
import { BentoFeatures } from './landing/BentoFeatures';
import { LiveDemo } from './landing/LiveDemo';
import { HowItWorks } from './landing/HowItWorks';
import { Pricing } from './landing/Pricing';
import { FAQ } from './landing/FAQ';
import { FinalCTA } from './landing/FinalCTA';
import { Footer } from './landing/Footer';

const LandingPage: React.FC = () => {
  const [isDark, setIsDark] = useState(true);
  const t = isDark ? palette.dark : palette.light;

  useEffect(() => {
    document.body.style.background = t.bg;
    document.body.style.transition = 'background 0.3s';
    document.body.style.margin = '0';
  }, [t.bg]);

  return (
    <ThemeContext.Provider value={{ dark: isDark, toggle: () => setIsDark(d => !d), t }}>
      <div
        className="antialiased"
        style={{
          fontFamily: "'Space Grotesk', 'Manrope', system-ui, sans-serif",
          background: t.bg,
          color: t.text,
        }}
      >
        <NavBar />
        <main>
          <Hero />
          <BentoFeatures />
          <LiveDemo />
          <HowItWorks />
          <Pricing />
          <FAQ />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </ThemeContext.Provider>
  );
};

export default LandingPage;
