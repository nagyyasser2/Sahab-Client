import { FiLogOut } from "react-icons/fi";

const LogoutButton = () => {
  return (
    <button
      //onClick={}
      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-white hover:bg-red-500 cursor: pointer; transition-colors duration-200 rounded-md mt-4"
    >
      <FiLogOut className="text-xl" />
      <span className="font-medium">Logout</span>
    </button>
  );
};

export default LogoutButton;
