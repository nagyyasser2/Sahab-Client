import { useState } from "react";
import ChatInput from "../components/layout/ChatInput";
import ChatMessageList from "../components/layout/ChatMessageList";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";

export const HomePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        {/* Mobile sidebar overlay - more visible content with subtle blur */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-white/10 backdrop-blur-[2px] z-20 md:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Sidebar - hidden on mobile by default, can be toggled */}
        <div
          className={`fixed inset-y-0 left-0 transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:relative md:translate-x-0 transition duration-200 ease-in-out z-30 md:z-0`}
        >
          <Sidebar />
        </div>

        {/* Main content */}
        <main className="flex-1 flex flex-col w-full">
          <Header toggleSidebar={toggleSidebar} />
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            <ChatMessageList />
          </div>
          <ChatInput />
        </main>
      </div>
      <div id="modal-root"></div>
    </>
  );
};
