import Header from '../Header'

export default function HeaderExample() {
  const mockUser = {
    name: "John Doe",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
    role: 'student' as const
  };

  const handleAuthAction = () => {
    console.log('Auth action triggered');
  };

  return (
    <div className="w-full">
      <Header user={mockUser} onAuthAction={handleAuthAction} />
    </div>
  );
}