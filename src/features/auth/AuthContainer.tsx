import { useState } from "react";
import { LoginForm } from "../../components/Auth/LoginForm";
import { RegisterForm } from "../../components/Auth/RegisterForm";

export const AuthContainer = () => {
  const [isLoginView, setIsLoginView] = useState(true);

  const switchToRegister = () => setIsLoginView(false);
  const switchToLogin = () => setIsLoginView(true);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        {isLoginView ? (
          <LoginForm onSwitchToRegister={switchToRegister} />
        ) : (
          <RegisterForm onSwitchToLogin={switchToLogin} />
        )}
      </div>
    </div>
  );
};
