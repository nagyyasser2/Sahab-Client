import { useCurrentUser } from "../features/auth/authHooks";

export const HomePage = () => {
  const user = useCurrentUser();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">
        Welcome to the Home Page {user?.username}
      </h1>
    </div>
  );
};
