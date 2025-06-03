import React from "react";
import { useForm } from "react-hook-form";
import { useLogin } from "../../features/auth/authHooks";
import { FormInput } from "../Common/FormInput";
import { Button } from "../Common/Button";
import { passwordValidator } from "../../utils/validators";
import type { LoginFormValues } from "../../features/auth/authTypes";

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormValues>({
    mode: "onChange",
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    login.mutate(data);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6">
        Login to Your Account
      </h2>

      {login.isError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          Failed to login. Please check your credentials.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormInput
          label="Username or Phone Number"
          id="identifier"
          type="text"
          error={errors.identifier}
          {...register("identifier", {
            required: "Username or phone number is required",
          })}
        />

        <FormInput
          label="Password"
          id="password"
          type="password"
          error={errors.password}
          {...register("password", passwordValidator)}
        />

        <Button
          type="submit"
          fullWidth
          isLoading={login.isPending}
          disabled={!isValid || login.isPending}
        >
          Login
        </Button>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-blue-500 hover:text-blue-700 font-medium"
        >
          Don't have an account? Register
        </button>
      </div>
    </div>
  );
};
