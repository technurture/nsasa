import Footer from '../Footer'

export default function FooterExample() {
  const handleNewsletterSignup = (email: string) => {
    console.log('Newsletter signup:', email);
    alert(`Thank you for subscribing with email: ${email}`);
  };

  return (
    <div className="w-full">
      <Footer onNewsletterSignup={handleNewsletterSignup} />
    </div>
  );
}