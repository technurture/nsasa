import LoginForm from '../LoginForm'

export default function LoginFormExample() {
  const handleLogin = (credentials: { email: string; password: string; rememberMe: boolean }) => {
    console.log('Login attempt:', credentials);
    alert(`Login successful for ${credentials.email}`);
  };

  const handleForgotPassword = (email: string) => {
    console.log('Forgot password for:', email);
    alert(`Password reset link sent to ${email}`);
  };

  const handleSignUpRedirect = () => {
    console.log('Redirect to sign up');
    alert('Redirecting to registration page...');
  };

  return (
    <div className="w-full min-h-screen bg-background p-4 flex items-center justify-center">
      <LoginForm 
        onLogin={handleLogin}
        onForgotPassword={handleForgotPassword}
        onSignUpRedirect={handleSignUpRedirect}
      />
    </div>
  );
}