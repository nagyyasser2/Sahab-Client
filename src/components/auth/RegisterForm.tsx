import React from "react";
import { useForm } from "react-hook-form";
import { useRegister } from "../../features/auth/authHooks";
import { FormInput } from "../Common/FormInput";
import { FormSelect } from "../Common/FormSelect";
import { Button } from "../Common/Button";
import {
  usernameValidator,
  passwordValidator,
  phoneNumberValidator,
  countryValidator,
} from "../../utils/validators";
import type { RegisterFormValues } from "../../features/auth/authTypes";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

// List of countries for dropdown
const COUNTRIES = [
  { value: "Afghanistan", label: "Afghanistan" },
  { value: "Albania", label: "Albania" },
  { value: "Algeria", label: "Algeria" },
  { value: "Andorra", label: "Andorra" },
  { value: "Angola", label: "Angola" },
  { value: "Botswana", label: "Botswana" },
  { value: "Brazil", label: "Brazil" },
  { value: "Canada", label: "Canada" },
  { value: "China", label: "China" },
  { value: "Egypt", label: "Egypt" },
  { value: "France", label: "France" },
  { value: "Germany", label: "Germany" },
  { value: "India", label: "India" },
  { value: "Italy", label: "Italy" },
  { value: "Japan", label: "Japan" },
  { value: "Kenya", label: "Kenya" },
  { value: "Mexico", label: "Mexico" },
  { value: "Nigeria", label: "Nigeria" },
  { value: "Russia", label: "Russia" },
  { value: "United States", label: "United States" },
];

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSwitchToLogin,
}) => {
  const register$ = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<RegisterFormValues>({
    mode: "onChange",
    defaultValues: {
      username: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      country: "Botswana",
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    const { confirmPassword, ...registrationData } = data;

    register$.mutate(registrationData);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6">
        Create New Account
      </h2>

      {register$.isError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          Failed to register. Please try again.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormInput
          label="Username"
          id="username"
          error={errors.username}
          {...register("username", usernameValidator)}
        />

        <FormInput
          label="Phone Number"
          id="phoneNumber"
          type="tel"
          error={errors.phoneNumber}
          {...register("phoneNumber", phoneNumberValidator)}
        />

        <FormSelect
          label="Country"
          id="country"
          options={COUNTRIES}
          error={errors.country}
          {...register("country", countryValidator)}
        />

        <FormInput
          label="Password"
          id="password"
          type="password"
          error={errors.password}
          {...register("password", passwordValidator)}
        />

        <FormInput
          label="Confirm Password"
          id="confirmPassword"
          type="password"
          error={errors.confirmPassword}
          {...register("confirmPassword", {
            ...passwordValidator,
            validate: () => {
              if (watch("password") !== watch("confirmPassword")) {
                return "Passwords do not match";
              }
            },
          })}
        />

        <Button
          type="submit"
          variant="success"
          fullWidth
          isLoading={register$.isPending}
          disabled={!isValid || register$.isPending}
        >
          Register
        </Button>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-blue-500 hover:text-blue-700 font-medium"
        >
          Already have an account? Login
        </button>
      </div>
    </div>
  );
};
