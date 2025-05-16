import { useSelector } from "react-redux";
import ChatInput from "./ChatInput";
import ChatMessageList from "./ChatMessageList";
import Header from "./Header";
import ChatOverlay from "./ChatOverlay";
import { useCurrentUser } from "../../features/auth/authHooks";

type ChatSectionProp = {
  toggleSidebar: () => void;
};

const ChatSection = ({ toggleSidebar }: ChatSectionProp) => {
  const { currentChat, loading, error } = useSelector(
    (state: any) => state.chats
  );

  const user: any = useCurrentUser();

  if (currentChat._id == "") {
    return <ChatOverlay toggleSidebar={toggleSidebar} />;
  }

  return (
    <main className="flex-1 flex flex-col w-full">
      <Header toggleSidebar={toggleSidebar} currentChat={currentChat} />
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <ChatMessageList currentChat={currentChat} currentUser={user} />
      </div>
      <ChatInput currentChat={currentChat} currentUser={user} />
    </main>
  );
};

export default ChatSection;
