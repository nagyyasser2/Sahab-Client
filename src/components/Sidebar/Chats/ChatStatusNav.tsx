type ChatStatusNavProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

const ChatStatusNav = ({ activeTab, setActiveTab }: ChatStatusNavProps) => {
  const tabs = [
    { id: "active", label: "Available" },
    { id: "blocked", label: "Blocked" },
  ];

  return (
    <div className="">
      <nav className="flex justify-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 font-medium text-xs  tracking-wider  text-center cursor-pointer ${
              activeTab === tab.id
                ? "text-blue-600"
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

export default ChatStatusNav;
