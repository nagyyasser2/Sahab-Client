import { useDispatch, useSelector } from "react-redux";
import { setCurrentChat } from "../../../store/slices/chatSlice";
import type { Chat } from "../../../types";

type SideBarProp = {
  closeSidebar: () => void;
};

const ChatsTab = ({ closeSidebar }: SideBarProp) => {
  const dispatch = useDispatch();

  const { chats, loading, error } = useSelector((state: any) => state.chats);

  const handleChatSelection = (chat: any) => {
    dispatch(setCurrentChat(chat));
    closeSidebar();
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4">
        <h3 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">
          Recent Chats
        </h3>

        {loading ? (
          <div className="text-center py-4">Loading chats...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">
            Error loading chats:{" "}
            {typeof error === "string" ? error : "An error occurred"}
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No chats found</div>
        ) : (
          <ul className="space-y-2">
            {chats.map((chat: Chat) => (
              <li
                key={chat._id}
                className="p-2 rounded hover:bg-gray-200 cursor-pointer flex justify-between items-center"
                onClick={() => handleChatSelection(chat)}
              >
                <div className="flex items-center space-x-2">
                  <img
                    src={chat.otherParticipant.profilePic}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <span className="font-medium">
                      {chat.otherParticipant?.username}
                    </span>
                    <p className="text-xs text-gray-500 truncate">
                      {chat?.lastMessage || "No messages yet"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500">
                    {new Date(chat.lastActivityAt).toLocaleDateString()}
                  </span>
                  {chat.unreadMessagesCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mt-1">
                      {chat.unreadMessagesCount}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChatsTab;
