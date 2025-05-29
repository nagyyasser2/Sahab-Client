import { CiMenuFries } from "react-icons/ci";
import TypingIndicator from "../Sidebar/Chats/TypingIndicator";

type HeaderProps = {
  currentChat: any;
  toggleSidebar?: () => void;
};

const Header = ({ currentChat, toggleSidebar }: HeaderProps) => {
  return (
    // <header className="h-14 bg-white flex items-center px-4">
    // <header className="h-14 bg-white flex items-center px-4 shadow">
    // <header className="h-14 bg-white flex items-center px-4 shadow-lg shadow-gray-300">
    <header className="h-14 bg-white flex items-center px-4 shadow-md shadow-gray-200">
      {/* Menu icon for mobile, visible only on small screens */}
      {toggleSidebar && (
        <button
          onClick={toggleSidebar}
          className="mr-4 p-1 rounded-md hover:bg-gray-100 md:hidden"
          aria-label="Toggle sidebar"
        >
          <CiMenuFries className="h-6 w-6 text-gray-800 cursor-pointer" />
        </button>
      )}
      <div className="flex items-center space-x-2">
        <img
          src={currentChat.otherParticipant?.profilePic}
          alt={currentChat.otherParticipant?.username}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <span className="text-xl font-semibold">
            {currentChat?.otherParticipant.username}
          </span>
          <TypingIndicator chatId={currentChat._id} />
        </div>
      </div>
    </header>
  );
};

export default Header;
