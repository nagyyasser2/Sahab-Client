const UsersTab = () => {
  const users = [
    { id: 1, name: "Alice", status: "online" },
    { id: 2, name: "Bob", status: "offline" },
    { id: 3, name: "Charlie", status: "busy" },
    { id: 4, name: "Diana", status: "away" },
    { id: 5, name: "Edward", status: "online" },
    { id: 6, name: "Fiona", status: "offline" },
  ];

  const getStatusColor = (status: any) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "busy":
        return "bg-red-500";
      case "away":
        return "bg-yellow-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4">
        <h3 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">
          Users
        </h3>
        <ul className="space-y-2">
          {users.map((user) => (
            <li
              key={user.id}
              className="p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center"
            >
              <div
                className={`w-2 h-2 rounded-full ${getStatusColor(
                  user.status
                )} mr-2`}
              ></div>
              <span>{user.name}</span>
              <span className="text-xs text-gray-500 ml-2">
                • {user.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UsersTab;
