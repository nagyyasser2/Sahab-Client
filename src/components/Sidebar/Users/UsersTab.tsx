import { useSelector } from "react-redux";
import SearchUsersForm from "../SearchUsersForm";
import UserItem from "./UserItem";
import { useCurrentUser } from "../../../features/auth/authHooks";
type SideBarProp = {
  closeSidebar: () => void;
};

const UsersTab = ({ closeSidebar }: SideBarProp) => {
  const { users, loading, error } = useSelector((state: any) => state.users);
  const { chats } = useSelector((state: any) => state.chats);
  const user: any = useCurrentUser();

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

  return (
    <div className="flex-1 overflow-y-auto">
      <SearchUsersForm />
      <div className="py-4 px-4 pt-2">
        <h3 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">
          Users
        </h3>
        {loading ? (
          <div className="flex justify-center py-4">
            <p>Loading users...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-4 text-gray-500">No users found</div>
        ) : (
          <ul className="space-y-2">
            {users.map((user: any) => {
              const existingChat = findExistingChat(user._id);
              const hasExistingChat = !!existingChat;

              return (
                <UserItem
                  key={user._id}
                  user={user}
                  hasExistingChat={hasExistingChat}
                  existingChat={existingChat}
                  closeSidebar={closeSidebar}
                />
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UsersTab;
