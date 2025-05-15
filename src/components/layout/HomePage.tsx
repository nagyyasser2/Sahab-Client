import { useEffect, useState } from "react";
import Sidebar from "../Sidebar/Sidebar";
import { Provider } from "react-redux";
import { persistor, store } from "../../store";
import { PersistGate } from "redux-persist/integration/react";
import socket from "../../api/socket";
import ChatSection from "./ChatSection.";
import { fetchChats } from "../../store/slices/chatSlice";

export const HomePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (token) {
      socket.auth = { token };
      socket.connect();

      // Listen for socket connect event
      socket.on("connect", () => {
        console.log("Socket connected");
        setSocketConnected(true);

        // Fetch chats once socket is connected
        store.dispatch(fetchChats({}) as any);
      });

      // Listen for socket disconnect event
      socket.on("disconnect", () => {
        console.log("Socket disconnected");
        setSocketConnected(false);
      });
    }

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <div className="bg-gray-200 min-h-screen">
          <div className="max-w-[2000px] mx-auto flex h-screen overflow-hidden">
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
              <Sidebar
                closeSidebar={closeSidebar}
                socketConnected={socketConnected}
              />
            </div>

            {/* Main content */}
            <ChatSection toggleSidebar={toggleSidebar} />
          </div>
          <div id="modal-root"></div>
        </div>
      </PersistGate>
    </Provider>
  );
};
