import React from "react";

/**
 * A reusable spinner component for loading states
 * @param {Object} props
 * @param {string} [props.size="md"] - Size of the spinner (sm, md, lg)
 * @param {string} [props.color="primary"] - Color theme of the spinner (primary, secondary, white)
 */
const Spinner: React.FC<{
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "white";
}> = ({ size = "md", color = "primary" }) => {
  // Size classes
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  // Color classes
  const colorClasses = {
    primary: "text-blue-600",
    secondary: "text-gray-600",
    white: "text-white",
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="w-full h-full"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    </div>
  );
};

export default Spinner;
