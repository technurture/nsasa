import AboutSection from '../AboutSection'

export default function AboutSectionExample() {
  const handleGetInvolved = () => {
    console.log('Get involved clicked');
    alert('Redirecting to student registration...');
  };

  const handleViewPrograms = () => {
    console.log('View programs clicked');
    alert('Redirecting to academic programs page...');
  };

  const handleContactUs = () => {
    console.log('Contact us clicked');
    alert('Redirecting to contact page...');
  };

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <AboutSection 
          onGetInvolved={handleGetInvolved}
          onViewPrograms={handleViewPrograms}
          onContactUs={handleContactUs}
        />
      </div>
    </div>
  );
}