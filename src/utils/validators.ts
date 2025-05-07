import type { RegisterFormValues } from "../features/auth/authTypes";

export const usernameValidator = {
  required: "Username is required",
  minLength: {
    value: 3,
    message: "Username must be at least 3 characters",
  },
  pattern: {
    value: /^@?[a-zA-Z0-9_]+$/,
    message: "Username can only contain letters, numbers, and underscores",
  },
};

export const passwordValidator = {
  required: "Password is required",
  minLength: {
    value: 6,
    message: "Password must be at least 6 characters",
  },
};

export const phoneNumberValidator = {
  required: "Phone number is required",
  pattern: {
    value: /^[0-9]+$/,
    message: "Phone number can only contain numbers",
  },
};

export const countryValidator = {
  required: "Country is required",
};

export const validatePasswordMatch = (formValues: RegisterFormValues) => {
  if (formValues.password !== formValues.confirmPassword) {
    return {
      confirmPassword: "Passwords do not match",
    };
  }
  return {};
};
