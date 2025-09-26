import HeroSection from '../HeroSection'

export default function HeroSectionExample() {
  const handleGetStarted = () => {
    console.log('Get Started clicked');
  };

  const handleLearnMore = () => {
    console.log('Learn More clicked');
  };

  return (
    <div className="w-full">
      <HeroSection onGetStarted={handleGetStarted} onLearnMore={handleLearnMore} />
    </div>
  );
}