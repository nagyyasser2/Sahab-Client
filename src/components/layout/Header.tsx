import { useCurrentUser } from "../../features/auth/authHooks";
import { CiMenuFries } from "react-icons/ci";

type HeaderProps = {
  username?: string;
  toggleSidebar?: () => void;
};

const Header = ({ username, toggleSidebar }: HeaderProps) => {
  const user = useCurrentUser();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4">
      {/* Menu icon for mobile, visible only on small screens */}
      {toggleSidebar && (
        <button
          onClick={toggleSidebar}
          className="mr-4 p-1 rounded-md hover:bg-gray-100 md:hidden"
          aria-label="Toggle sidebar"
        >
          <CiMenuFries className="h-6 w-6 text-gray-800 cursor-pointer" />
        </button>
      )}

      <h1 className="text-xl font-semibold">
        {username ||
          (user?.username
            ? `Welcome, ${user.username}nagy yasser ahmed fathy mohamed ali`
            : "Chat App")}
      </h1>
    </header>
  );
};

export default Header;
