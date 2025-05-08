import React, { useEffect, useState } from "react";

const OnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const checkRealConnectivity = async () => {
      try {
        await fetch(`http://localhost:3000/ping?${Date.now()}`, {
          method: "GET",
          cache: "no-store",
        });
        setIsOnline(true);
      } catch (error) {
        console.log("Connectivity check failed:", error);
        setIsOnline(false);
      }
    };

    checkRealConnectivity();

    const handleOnline = () => checkRealConnectivity();
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const intervalId = setInterval(checkRealConnectivity, 15000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div
        title={isOnline ? "Online" : "Offline"}
        className={`w-3 h-3 rounded-full ${
          isOnline ? "bg-blue-500" : "bg-yellow-500"
        }`}
      />
      <span className="text-xs text-gray-600">
        {/* {isOnline ? "Online" : "Offline"} */}
      </span>
    </div>
  );
};

export default OnlineStatus;
