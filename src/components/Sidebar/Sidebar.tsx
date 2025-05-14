import { useCurrentUser } from "../../features/auth/authHooks";
import { useState } from "react";
import UserProfile from "./UserProfile";
import SidebarNav from "./SidebarNav";
// import GroupsTab from "./Groups/GroupsTab";
import UsersTab from "./Users/UsersTab";
import ChatsTab from "./Chats/ChatsTab";

type SideBarProp = {
  closeSidebar: () => void;
  socketConnected?: boolean;
};

const Sidebar = ({ closeSidebar, socketConnected = false }: SideBarProp) => {
  const user = useCurrentUser();
  const [activeTab, setActiveTab] = useState("chats");

  return (
    <aside className="w-95 h-full bg-white border-r border-gray-200 flex flex-col">
      <UserProfile user={user} socketConnected={socketConnected} />
      <SidebarNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "chats" && <ChatsTab closeSidebar={closeSidebar} />}
      {/* {activeTab === "groups" && <GroupsTab />} */}
      {activeTab === "users" && <UsersTab closeSidebar={closeSidebar} />}
    </aside>
  );
};

export default Sidebar;
