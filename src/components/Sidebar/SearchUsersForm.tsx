import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Search } from "lucide-react";
import type { AppDispatch } from "../../store";
import { searchUsers } from "../../store/slices/usersSlice";

const SearchUsersForm = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [query, setQuery] = useState("");
  const [field, setField] = useState<"username" | "phoneNumber" | "country">(
    "username"
  );
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    dispatch(
      searchUsers({
        q: query.trim(),
        field,
        fields: "username,email,profilePic,status,country", // fixed fields
      }) as any
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto mb-5 mt-2 px-2 pb-1">
      <div
        className={`relative flex items-center rounded-full border border-gray-300 transition-all duration-300 `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Search Button - Left side */}
        <button
          onClick={handleSubmit}
          className="absolute left-4 text-gray-400 text-blue-500 transition-colors focus:outline-none"
          aria-label="Search"
        >
          <Search size={18} />
        </button>

        {/* Search Query Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search ..."
          className="flex-grow py-2 pl-12 pr-32 rounded-full outline-none text-gray-700"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {/* Field Selector - Right side, styled as a pill */}
        <div className="absolute right-0 h-full">
          <select
            value={field}
            onChange={(e) => setField(e.target.value as any)}
            className="h-full pr-8 pl-4 rounded-full bg-gray-100/80 text-gray-700 border-none outline-none cursor-pointer appearance-none transition-colors hover:bg-gray-100"
            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
          >
            <option value="username">Username</option>
            <option value="phoneNumber">Phone</option>
            <option value="country">Country</option>
          </select>

          {/* Custom select arrow */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1L5 5L9 1"
                stroke="#2B7FFF"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchUsersForm;
