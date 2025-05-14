const OnlineStatus = ({ connectionStatus }: any) => {
  return (
    <div className="flex items-center gap-2">
      <div
        title={connectionStatus ? "Online" : "Offline"}
        className={`w-3 h-3 rounded-full ${
          connectionStatus ? "bg-blue-500" : "bg-yellow-500"
        }`}
      />
      <span className="text-xs text-gray-600">
        {/* {isOnline ? "Online" : "Offline"} */}
      </span>
    </div>
  );
};

export default OnlineStatus;
