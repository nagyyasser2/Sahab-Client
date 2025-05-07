import React, { forwardRef } from 'react';
import type { FieldError } from 'react-hook-form';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError;
  prefix?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, className, prefix, ...props }, ref) => {
    return (
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={props.id}>
          {label}
        </label>
        <div className={`relative ${prefix ? 'flex items-center' : ''}`}>
          {prefix && (
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            className={`w-full px-3 ${prefix ? 'pl-7' : ''} py-2 border ${
              error ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className || ''}`}
            {...props}
          />
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';



