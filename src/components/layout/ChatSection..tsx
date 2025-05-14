import { useSelector } from "react-redux";
import ChatInput from "./ChatInput";
import ChatMessageList from "./ChatMessageList";
import Header from "./Header";
import ChatOverlay from "./ChatOverlay";

type ChatSectionProp = {
  toggleSidebar: () => void;
};

const ChatSection = ({ toggleSidebar }: ChatSectionProp) => {
  const { currentChat, loading, error } = useSelector(
    (state: any) => state.chats
  );

  if (currentChat._id == "") {
    return <ChatOverlay toggleSidebar={toggleSidebar} />;
  }

  return (
    <main className="flex-1 flex flex-col w-full">
      <Header toggleSidebar={toggleSidebar} currentChat={currentChat} />
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <ChatMessageList currentChat={currentChat} />
      </div>
      <ChatInput currentChat={currentChat} />
    </main>
  );
};

export default ChatSection;
