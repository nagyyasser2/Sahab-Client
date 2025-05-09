import { useSelector } from "react-redux";
import SearchUsersForm from "./SearchUsersForm";
import { IoLocationOutline } from "react-icons/io5";

const UsersTab = () => {
  const { users, loading, error } = useSelector((state: any) => state.users);

  const getStatusColor = (status: any) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "busy":
        return "bg-red-500";
      case "away":
        return "bg-yellow-500";
      case "foucs":
        return "bg-blue-500";
      default:
        return "bg-gray-400";
    }
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
            {users.map((user: any) => (
              <li
                key={user._id}
                className="p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center"
              >
                <div
                  className={`w-2 h-2 rounded-full ${getStatusColor(
                    user.status
                  )} mr-2`}
                ></div>

                {user.profilePic && (
                  <img
                    src={user.profilePic}
                    alt={`${user.name || user.username}'s profile`}
                    className="w-8 h-8 rounded-full object-cover mr-2"
                  />
                )}
                <div className="flex flex-col items-center">
                  <span>{user.name || user.username}</span>
                  {user.country && (
                    <div className="flex">
                      <IoLocationOutline />
                      <span className="text-xs text-gray-400">
                        {user.country}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-500 ml-2">
                  • {user.status || "unknown"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UsersTab;
