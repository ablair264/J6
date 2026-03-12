import { CSS } from "./landing/styles";
import NavBar from "./landing/NavBar";
import Hero from "./landing/Hero";
import FeaturePills from "./landing/FeaturePills";
import BentoFeatures from "./landing/BentoFeatures";
import MotionShowcase from "./landing/MotionShowcase";
import LiveDemo from "./landing/LiveDemo";
import EffectsShowcase from "./landing/EffectsShowcase";
import ExportWorkflow from "./landing/ExportWorkflow";
import ComponentCatalog from "./landing/ComponentCatalog";
import WhyUIStudio from "./landing/WhyUIStudio";
import LibraryCTA from "./landing/LibraryCTA";
import Testimonials from "./landing/Testimonials";
import Pricing from "./landing/Pricing";
import FinalCTA from "./landing/FinalCTA";
import Footer from "./landing/Footer";

export default function LandingPage() {
  return (
    <>
      <style>{CSS}</style>
      <NavBar />
      <Hero />
      <FeaturePills />
      <BentoFeatures />
      <MotionShowcase />
      <LiveDemo />
      <EffectsShowcase />
      <ExportWorkflow />
      <ComponentCatalog />
      <WhyUIStudio />
      <LibraryCTA />
      <Testimonials />
      <Pricing />
      <FinalCTA />
      <Footer />
    </>
  );
}
