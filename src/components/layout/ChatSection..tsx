import { useDispatch, useSelector } from "react-redux";
import ChatInput from "./ChatInput";
import ChatMessageList from "./ChatMessageList";
import Header from "./Header";
import ChatOverlay from "./ChatOverlay";
import { useCurrentUser } from "../../features/auth/authHooks";
import { useEffect } from "react";
import { getBlockStatus } from "../../store/slices/chatSlice";
import type { AppDispatch } from "../../store";
import ChatMessageListWithPagination from "./ChatMessageList";

type ChatSectionProp = {
  toggleSidebar: () => void;
};

const ChatSection = ({ toggleSidebar }: ChatSectionProp) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentChat, blockingStatus } = useSelector(
    (state: any) => state.chats
  );

  const user = useCurrentUser();

  useEffect(() => {
    if (currentChat?._id) {
      dispatch(getBlockStatus(currentChat._id) as any);
    }
  }, [currentChat?._id, dispatch]);

  if (!currentChat?._id) {
    return <ChatOverlay toggleSidebar={toggleSidebar} />;
  }

  // Get block status with proper fallbacks
  const blockStatus = currentChat.blockStatus || {
    isBlockedByMe: false,
    isBlockedByOther: false,
    canSendMessages: true,
  };

  const { isBlockedByMe, isBlockedByOther, canSendMessages } = blockStatus;

  const isBlocked = isBlockedByMe || isBlockedByOther;

  return (
    <main className="flex-1 flex flex-col w-full">
      <Header toggleSidebar={toggleSidebar} currentChat={currentChat} />
      <div className="flex-1 overflow-y-auto px-0">
        <ChatMessageListWithPagination
          currentChat={currentChat}
          currentUser={user}
        />
      </div>

      {/* Show loading state while fetching block status */}
      {blockingStatus.loading && (
        <div className="p-4 text-center text-gray-500">
          Checking conversation status...
        </div>
      )}

      {/* Show error message if there was an error fetching block status */}
      {blockingStatus.error && !blockingStatus.loading && (
        <div className="p-4 text-center text-red-500">
          Error: {blockingStatus.error}
        </div>
      )}

      {/* Show ChatInput only if not loading, no error, and can send messages */}
      {!blockingStatus.loading &&
        !blockingStatus.error &&
        canSendMessages &&
        !isBlocked && (
          <ChatInput currentChat={currentChat} isBlocked={isBlocked} />
        )}

      {/* Show appropriate blocked message */}
      {!blockingStatus.loading && !blockingStatus.error && isBlocked && (
        <div className="p-4 text-center text-gray-500 bg-gray-50 border-t border-gray-200">
          {isBlockedByMe ? (
            <div>
              <p className="mb-2">
                You have blocked {currentChat.otherParticipant.username}.
              </p>
              <p className="text-sm">Unblock them to send messages again.</p>
            </div>
          ) : (
            <div>
              <p>
                You have been blocked by {currentChat.otherParticipant.username}
                .
              </p>
              <p className="text-sm">
                You cannot send messages in this conversation.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Fallback case: if canSendMessages is false but not explicitly blocked */}
      {!blockingStatus.loading &&
        !blockingStatus.error &&
        !canSendMessages &&
        !isBlocked && (
          <div className="p-4 text-center text-gray-500 bg-gray-50 border-t">
            <p>Messaging is currently unavailable for this conversation.</p>
          </div>
        )}
    </main>
  );
};

export default ChatSection;
