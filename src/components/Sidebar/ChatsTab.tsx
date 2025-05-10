import { useDispatch } from "react-redux";
import { setCurrentChat } from "../../store/slices/chatSlice";

const ChatsTab = () => {
  const recentChats = [
    {
      id: 1,
      name: "Alice",
      lastMessage: "Hey, how are you?",
      time: "2m ago",
      unread: 2,
    },
    {
      id: 2,
      name: "Bob",
      lastMessage: "Can you send me that file?",
      time: "1h ago",
      unread: 0,
    },
    {
      id: 3,
      name: "Charlie",
      lastMessage: "Thanks for your help!",
      time: "3h ago",
      unread: 1,
    },
  ];

  const dispatch = useDispatch();

  const handleChatSelection = (chat: any) => {
    dispatch(setCurrentChat(chat));
  };

  return (
    <div className="flex-1 overflow-y-auto ">
      <div className="p-4">
        <h3 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">
          Recent Chats
        </h3>
        <ul className="space-y-2">
          {recentChats.map((chat) => (
            <li
              key={chat.id}
              className="p-2 rounded hover:bg-gray-200 cursor-pointer flex justify-between items-center"
              onClick={() => handleChatSelection(chat)}
            >
              <div>
                <span className="font-medium">{chat.name}</span>
                <p className="text-xs text-gray-500 truncate">
                  {chat.lastMessage}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-500">{chat.time}</span>
                {chat.unread > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mt-1">
                    {chat.unread}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChatsTab;
