import { CiMenuFries } from "react-icons/ci";
import TypingIndicator from "../Sidebar/Chats/TypingIndicator";
import ImagePopup from "../Common/ImagePopup";
import ChatInfoPopup from "../Chat/ChatInfoPopup"; // Import the ChatInfoPopup
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { emitSocketAction } from "../../store/middleware/socketMiddleware";
import { SOCKET_EVENTS } from "../../api/socket";
import { GrCircleInformation } from "react-icons/gr";

type HeaderProps = {
  currentChat: any;
  toggleSidebar?: () => void;
};

const Header = ({ currentChat, toggleSidebar }: HeaderProps) => {
  const dispatch = useDispatch();
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);
  const [isChatInfoOpen, setIsChatInfoOpen] = useState(false); // Add state for chat info popup

  // Get userStatuses from Redux store
  const userStatuses = useSelector((state: any) => state.chats.userStatuses);

  const isUserOnline = userStatuses[currentChat.otherParticipant?._id] || false;

  useEffect(() => {
    dispatch(
      emitSocketAction(SOCKET_EVENTS.USER_STATUS_CHECK, {
        userId: currentChat.otherParticipant?._id,
      }) as any
    );
  }, [dispatch, currentChat.otherParticipant?._id]);

  const handleImageClick = () => {
    setIsImagePopupOpen(true);
  };

  const closeImagePopup = () => {
    setIsImagePopupOpen(false);
  };

  const handleInfoClick = () => {
    setIsChatInfoOpen(true);
  };

  const closeChatInfo = () => {
    setIsChatInfoOpen(false);
  };

  return (
    <>
      <header className="h-14.5 bg-white flex items-center justify-between px-4 shadow-md shadow-gray-200 border-b border-gray-200">
        {/* Left side content */}
        <div className="flex items-center">
          {/* Menu icon for mobile, visible only on small screens */}
          {toggleSidebar && (
            <button
              onClick={toggleSidebar}
              className="font-xl mr-1 p-1 rounded-md hover:bg-gray-100 md:hidden"
              aria-label="Toggle sidebar"
            >
              <CiMenuFries className="h-7 w-7  text-gray-800 cursor-pointer scale-x-[-1]" />
            </button>
          )}
          <div className="flex items-center space-x-3">
            {/* Profile picture with status indicator */}
            <div className="relative">
              <img
                src={currentChat.otherParticipant?.profilePic}
                alt={currentChat.otherParticipant?.username}
                className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleImageClick}
              />
              {/* Status dot indicator with inline style for blue shadow */}
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                  isUserOnline ? "bg-blue-500" : "bg-gray-400"
                } ${isUserOnline ? "animate-pulse" : ""}`}
                style={
                  isUserOnline
                    ? {
                        boxShadow:
                          "0 0 10px rgba(59, 130, 246, 0.6), 0 0 20px rgba(59, 130, 246, 0.3)",
                      }
                    : {}
                }
              />
            </div>

            <div className="flex flex-col">
              <TypingIndicator
                chatId={currentChat?._id}
                chat={currentChat}
                isHeader={true}
              />
            </div>
          </div>
        </div>

        {/* Right side content */}
        <div className="flex items-center space-x-2">
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            onClick={handleInfoClick}
          >
            <span className="text-gray-600 text-2xl cursor-pointer">
              <GrCircleInformation />
            </span>
          </button>
        </div>
      </header>

      {/* Image Popup */}
      <ImagePopup
        isOpen={isImagePopupOpen}
        imageUrl={currentChat.otherParticipant?.profilePic}
        altText={`${currentChat.otherParticipant?.username} profile picture`}
        onClose={closeImagePopup}
      />

      {/* Chat Info Popup */}
      <ChatInfoPopup
        currentChat={currentChat}
        isOpen={isChatInfoOpen}
        onClose={closeChatInfo}
      />
    </>
  );
};

export default Header;
