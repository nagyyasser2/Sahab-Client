import { CiMenuFries } from "react-icons/ci";

type ChatSectionProp = {
  toggleSidebar: () => void;
};

const ChatOverlay = ({ toggleSidebar }: ChatSectionProp) => {
  return (
    <main className="flex-1 flex flex-col w-full bg-gray-900">
      <header className="h-16 bg-white  flex items-center px-4">
        <button
          onClick={toggleSidebar}
          className="mr-4 p-1 rounded-md hover:bg-gray-100 md:hidden"
          aria-label="Toggle sidebar"
        >
          <CiMenuFries className="h-6 w-6 text-gray-800 cursor-pointer" />
        </button>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-24 w-24 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <h2 className="text-2xl font-semibold text-gray-500 mb-2">
            Select a Chat
          </h2>
          <p className="text-gray-600 mb-2 bg-gray-200 rounded px-2 py-1 inline-block">
            Choose a conversation from the sidebar or start a new chat
          </p>
          <p className="text-gray-600 mb-4 bg-gray-200 rounded px-2 py-1 inline-block">
            to begin messaging.
          </p>
        </div>
      </div>
    </main>
  );
};

export default ChatOverlay;
