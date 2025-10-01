import ContactForm from '../ContactForm'

export default function ContactFormExample() {
  const handleSubmit = (data: any) => {
    console.log('Contact form submitted:', data);
  };

  return (
    <div className="w-full min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
          <p className="text-muted-foreground">
            Get in touch with the Department of Sociology
          </p>
        </div>
        <ContactForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}