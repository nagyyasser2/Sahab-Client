import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiLock } from "react-icons/fi";
import {
  fetchChats,
  setCurrentChat,
  setPage,
} from "../../../store/slices/chatSlice";
import type { Chat } from "../../../types";
import { setSelectedUser } from "../../../store/slices/usersSlice";
import TypingIndicator from "./TypingIndicator";
import ChatStatusNav from "./ChatStatusNav";

type SideBarProp = {
  closeSidebar: () => void;
};

const ChatsTab = ({ closeSidebar }: SideBarProp) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("active");

  const { chats, loading, error, total, page, limit } = useSelector(
    (state: any) => state.chats
  );

  useEffect(() => {
    dispatch(fetchChats({ page, limit }) as any);
  }, [dispatch, page, limit]);

  // Filter chats based on active tab
  const filteredChats = chats.filter((chat: Chat) => {
    if (activeTab === "blocked") {
      return chat.isBlocked === true;
    } else {
      return chat.isBlocked !== true; // Show non-blocked chats for "active" tab
    }
  });

  const totalPages = Math.ceil(total / limit);

  const handleChatSelection = (chat: Chat) => {
    dispatch(setCurrentChat(chat));
    dispatch(setSelectedUser(chat.otherParticipant));
    closeSidebar();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    dispatch(setPage(newPage));
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <ChatStatusNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Chat List */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <p>Loading chats...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">
            Error loading chats:{" "}
            {typeof error === "string" ? error : "An error occurred"}
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No {activeTab === "blocked" ? "blocked" : "available"} chats found
          </div>
        ) : (
          <ul className="space-y-2 py-2 overflow-y-auto scrollbar-custom">
            {filteredChats.map((chat: Chat) => (
              <li
                key={chat._id}
                className={`p-2 rounded hover:bg-gray-200 cursor-pointer flex justify-between items-center ${
                  chat.isBlocked ? "opacity-80" : ""
                }`}
                onClick={() => handleChatSelection(chat)}
              >
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <img
                      src={chat.otherParticipant?.profilePic}
                      alt="Profile"
                      className={`w-10 h-10 rounded-full object-cover ${
                        chat.isBlocked ? "grayscale" : ""
                      }`}
                    />
                    {chat.isBlocked && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full">
                        <FiLock className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1">
                      <span className="font-medium block truncate">
                        {chat.otherParticipant?.username}
                      </span>
                      {chat.isBlocked && (
                        <span className="text-xs text-red-500"></span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 truncate max-w-[160px]">
                      <TypingIndicator
                        chatId={chat._id}
                        chat={chat}
                        isHeader={false}
                      />
                    </span>
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

      {/* Pagination */}
      {!loading && filteredChats.length > 0 && (
        <div className="sticky bottom-0 z-10 bg-white px-4 py-1 pb-4 shadow-md">
          <div className="flex justify-center items-center max-w-md mx-auto">
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  page === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FiArrowLeft className="w-6 h-6 cursor-pointer" />
              </button>
              <div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{(page - 1) * limit + 1}</span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(page * limit, total)}
                  </span>{" "}
                  of <span className="font-medium">{total}</span> results
                </p>
              </div>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  page >= totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FiArrowRight className="w-6 h-6 cursor-pointer" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatsTab;
