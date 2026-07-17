import ScrollStorySection from '@/components/landing/ScrollStorySection';
import HowItWorksSection  from '@/components/landing/HowItWorksSection';
import RoleChoiceSection  from '@/components/landing/RoleChoiceSection';
import Footer              from '@/components/landing/Footer';

export default function Home() {
  return (
    <>
      <ScrollStorySection />
      <HowItWorksSection />
      <RoleChoiceSection />
      <Footer />
    </>
  );
}
