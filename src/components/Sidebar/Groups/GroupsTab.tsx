const GroupsTab = () => {
  const groups = [
    { id: 1, name: "Project Team", members: 5, lastActivity: "10m ago" },
    { id: 2, name: "Marketing", members: 8, lastActivity: "1h ago" },
    { id: 3, name: "Development", members: 12, lastActivity: "30m ago" },
    { id: 4, name: "Design", members: 4, lastActivity: "2h ago" },
  ];

  return (
    <div className="flex-1 overflow-y-auto ">
      <div className="p-4">
        <h3 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">
          Groups & Channels
        </h3>
        <ul className="space-y-2">
          {groups.map((group) => (
            <li
              key={group.id}
              className="p-2 rounded hover:bg-gray-200 cursor-pointer"
            >
              <div className="flex justify-between">
                <span className="font-medium">{group.name}</span>
                <span className="text-xs text-gray-500">
                  {group.lastActivity}
                </span>
              </div>
              <p className="text-xs text-gray-500">{group.members} members</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GroupsTab;
