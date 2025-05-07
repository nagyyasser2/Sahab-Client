import ChatInput from "../components/layout/ChatInput";
import ChatMessageList from "../components/layout/ChatMessageList";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";

export const HomePage = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <ChatMessageList />
        </div>
        <ChatInput />
      </main>
    </div>
  );
};
