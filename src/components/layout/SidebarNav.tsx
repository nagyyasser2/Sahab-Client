import { useState } from "react";

const SidebarNav = ({ activeTab, setActiveTab }: any) => {
  const tabs = [
    { id: "chats", label: "Chats" },
    { id: "groups", label: "Groups" },
    { id: "users", label: "Users" },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 font-medium text-sm flex-1 text-center cursor-pointer ${
              activeTab === tab.id
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default SidebarNav;
