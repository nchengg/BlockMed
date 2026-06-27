import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import SmallShipSection from '@/components/landing/SmallShipSection';
import RevealSection from '@/components/landing/RevealSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <SmallShipSection />
      <RevealSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </>
  );
}
