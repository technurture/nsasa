import RegistrationForm from '../RegistrationForm'

export default function RegistrationFormExample() {
  const handleSubmit = (data: any) => {
    console.log('Registration submitted:', data);
    alert('Registration submitted successfully! You will receive an email once approved.');
  };

  const handleCancel = () => {
    console.log('Registration cancelled');
  };

  return (
    <div className="w-full min-h-screen bg-background p-4">
      <RegistrationForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
}