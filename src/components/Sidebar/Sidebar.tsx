import { useCurrentUser } from "../../features/auth/authHooks";
import { useState } from "react";
import UserProfile from "./UserProfile";
import SidebarNav from "./SidebarNav";
import GroupsTab from "./GroupsTab";
import UsersTab from "./UsersTab";
import ChatsTab from "./ChatsTab";

const Sidebar = () => {
  const user = useCurrentUser();
  const [activeTab, setActiveTab] = useState("chats");

  return (
    <aside className="w-95 h-full bg-white border-r border-gray-200 flex flex-col">
      <UserProfile user={user} />
      <SidebarNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "chats" && <ChatsTab />}
      {activeTab === "groups" && <GroupsTab />}
      {activeTab === "users" && <UsersTab />}
    </aside>
  );
};

export default Sidebar;
