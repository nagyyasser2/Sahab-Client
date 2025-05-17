import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import SearchUsersForm from "../SearchUsersForm";
import UserItem from "./UserItem";
import { useCurrentUser } from "../../../features/auth/authHooks";
import { searchUsers } from "../../../store/slices/usersSlice";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

type SideBarProp = {
  closeSidebar: () => void;
};

const UsersTab = ({ closeSidebar }: SideBarProp) => {
  const dispatch = useDispatch();
  const { users, loading, error, total, page, limit } = useSelector(
    (state: any) => state.users
  );
  const { chats } = useSelector((state: any) => state.chats);
  const user: any = useCurrentUser();
  const [searchParams, setSearchParams] = useState({
    q: "",
    field: "username" as "username" | "phoneNumber" | "country",
  });

  // Total number of pages
  const totalPages = Math.ceil(total / limit);

  // Find existing chat with a user (returns the chat object or null)
  const findExistingChat = (userId: any) => {
    return chats.find((chat: any) => {
      // Check for chats with conversationKey
      if (chat.conversationKey) {
        return (
          chat.conversationKey.includes(userId) &&
          chat.conversationKey.includes(user._id)
        );
      }
      return false;
    });
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;

    dispatch(
      searchUsers({
        ...searchParams,
        page: newPage,
        limit,
      }) as any
    );
  };

  // Update search parameters when form submits
  const updateSearchParams = (params: {
    q: string;
    field: "username" | "phoneNumber" | "country";
  }) => {
    setSearchParams(params);
    dispatch(
      searchUsers({
        ...params,
        page: 1, // Reset to first page on new search
        limit,
      }) as any
    );
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Search Form */}
      <div className="flex-shrink-0">
        <SearchUsersForm onSearch={updateSearchParams} />
      </div>

      {/* Title */}
      <div className="px-4 pt-2 pb-1 flex-shrink-0">
        <h3 className="text-xs uppercase tracking-wider text-gray-500 font-medium">
          People
        </h3>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <p>Loading...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-4 text-gray-500">No people found</div>
        ) : (
          <ul className="py-2 space-y-2  overflow-y-auto scrollbar-custom">
            {users.map((user: any) => {
              const existingChat = findExistingChat(user._id);
              return (
                <UserItem
                  key={user._id}
                  user={user}
                  hasExistingChat={!!existingChat}
                  existingChat={existingChat}
                  closeSidebar={closeSidebar}
                />
              );
            })}
          </ul>
        )}
      </div>

      {/* Fixed Pagination */}
      {!loading && users.length > 0 && (
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

export default UsersTab;
