import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import {
  fetchChats,
  setCurrentChat,
  setPage,
} from "../../../store/slices/chatSlice";
import type { Chat } from "../../../types";

type SideBarProp = {
  closeSidebar: () => void;
};

const ChatsTab = ({ closeSidebar }: SideBarProp) => {
  const dispatch = useDispatch();

  const { chats, loading, error, total, page, limit } = useSelector(
    (state: any) => state.chats
  );

  useEffect(() => {
    dispatch(fetchChats({ page, limit }) as any);
  }, [dispatch, page, limit]);

  const totalPages = Math.ceil(total / limit);

  const handleChatSelection = (chat: Chat) => {
    dispatch(setCurrentChat(chat));
    closeSidebar();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    dispatch(setPage(newPage));
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Title */}
      <div className="px-4 pt-4 pb-2 flex-shrink-0">
        <h3 className="text-xs uppercase tracking-wider text-gray-500 font-medium">
          Recent Chats
        </h3>
      </div>

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
        ) : chats.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No chats found</div>
        ) : (
          <ul className="space-y-2 py-2 overflow-y-auto scrollbar-custom">
            {chats.map((chat: Chat) => (
              <li
                key={chat._id}
                className="p-2 rounded hover:bg-gray-200 cursor-pointer flex justify-between items-center"
                onClick={() => handleChatSelection(chat)}
              >
                <div className="flex items-center space-x-2">
                  <img
                    src={chat.otherParticipant.profilePic}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <span className="font-medium">
                      {chat.otherParticipant?.username}
                    </span>
                    <p className="text-xs text-gray-500 truncate max-w-[160px]">
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

      {/* Pagination */}
      {!loading && chats.length > 0 && (
        <div className="sticky bottom-0 z-10 border-t border-gray-200 bg-white px-4 py-1 shadow-md">
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
