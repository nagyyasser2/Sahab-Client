import { useCurrentUser } from "../../features/auth/authHooks";

type HeaderProps = {
  username?: string;
};

const Header = ({ username }: HeaderProps) => {
  const user = useCurrentUser();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4">
      <h1 className="text-xl font-semibold">
        {/* Welcome to the Home Page {user?.username} */}
      </h1>
    </header>
  );
};

export default Header;
