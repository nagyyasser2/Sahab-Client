const OnlineStatus = ({ connectionStatus }: any) => {
  return (
    <div className="flex items-center gap-2">
      <div
        title={connectionStatus ? "Online" : "Offline"}
        className={`w-3 h-3 rounded-full border-2 border-white ${
          connectionStatus ? "bg-blue-500 animate-pulse" : "bg-gray-400"
        }`}
        style={
          connectionStatus
            ? {
                boxShadow:
                  "0 0 8px rgba(59, 130, 246, 0.6), 0 0 16px rgba(59, 130, 246, 0.3)",
              }
            : {}
        }
      />
    </div>
  );
};

export default OnlineStatus;
