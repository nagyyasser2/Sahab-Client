import {
  IoChatbubbleEllipsesOutline,
  IoLocationOutline,
} from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../../store";
import { createChat, setCurrentChat } from "../../../store/slices/chatSlice";

const getStatusColor = (status: any) => {
  switch (status) {
    case "online":
      return "bg-green-500";
    case "busy":
      return "bg-red-500";
    case "away":
      return "bg-yellow-500";
    case "foucs": // Note: typo in original code
      return "bg-blue-500";
    default:
      return "bg-gray-400";
  }
};

const UserItem = ({
  user,
  hasExistingChat,
  existingChat = null,
  closeSidebar,
}: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user: currentUser } = useSelector((state: any) => state.auth);

  // Handle user selection - either use existing chat or create a new one
  const handleUserSelected = () => {
    if (hasExistingChat && existingChat) {
      // Simply set the existing chat as current
      dispatch(setCurrentChat(existingChat));
    } else {
      // Create a new direct chat with this user
      const chatData: any = {
        type: "direct",
        participants: [user._id], // Assuming the current user ID is added by the backend
        name: user.name || user.username,
        receiverId: user._id,
        projection: {
          _id: true,
          username: true,
          country: true,
          profilePic: true,
          status: true,
          lastSeen: true,
          privacySettings: true,
        },
      };

      // Method 1: Using the result promise directly
      dispatch<any>(createChat(chatData))
        .then((result: any) => {
          // Check if the action was fulfilled
          if (createChat.fulfilled.match(result)) {
            dispatch(setCurrentChat(result.payload));
          }
        })
        .catch((error: any) => {
          console.error("Failed to create chat:", error);
        });

      // Alternative method 2 (uncomment if you prefer this approach):
      /*
      // Using the createAsyncThunk API correctly
      void dispatch(createChat(chatData)).then((result) => {
        if (result.meta.requestStatus === 'fulfilled') {
          dispatch(setCurrentChat(result.payload));
        }
      });
      */
    }
    closeSidebar();
  };

  return (
    <li
      key={user._id}
      className="p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center justify-between"
      onClick={handleUserSelected}
    >
      <div className="flex items-center">
        <div
          className={`w-2 h-2 rounded-full ${getStatusColor(user.status)} mr-2`}
        ></div>

        {user.profilePic && (
          <img
            src={user.profilePic}
            alt={`${user.name || user.username}'s profile`}
            className="w-8 h-8 rounded-full object-cover mr-2"
          />
        )}
        <div className="flex flex-col">
          <span>{user.name || user.username}</span>
          {user.country && (
            <div className="flex items-center">
              <IoLocationOutline className="text-xs" />
              <span className="text-xs text-gray-400 ml-1">{user.country}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center">
        {hasExistingChat && (
          <div
            className="flex items-center text-blue-500"
            title="Existing chat"
          >
            <IoChatbubbleEllipsesOutline />
          </div>
        )}
      </div>
    </li>
  );
};

export default UserItem;
