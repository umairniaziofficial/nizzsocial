import { Link, useNavigate } from "react-router-dom";
import { Button } from "../button";
import { useSignoutAccount } from "@/lib/react-query/querriesAndMutations";
import { INITIAL_USER, useUserContext } from "@/context/AuthContext";
import PostLoader from "./PostLoader";

const Topbar = () => {
  const navigate = useNavigate();
  const { user, setUser, setIsAuthenticated } = useUserContext();
  const { mutateAsync: signOut, isPending: isLoading } = useSignoutAccount();

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(INITIAL_USER);
      setIsAuthenticated(false);
      navigate("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <PostLoader />
      </div>
    );
  }

  return (
    <section className="topbar">
      <div className="flex-between py-4 px-5">
        <Link to="/" className="flex gap-3 items-center">
          <img src="/Logo.svg" alt="logo" width={30} height={30} />
          <p className="text-2xl font-semibold">NizzSocial</p>
        </Link>

        <div className="flex gap-4">
          <Button
            variant="ghost"
            className="shad-button_ghost"
            onClick={handleSignOut}
          >
            <img src="/assets/icons/logout.svg" alt="logout" />
          </Button>
          <Link to={`/profile/${user.id}`} className="flex-center gap-3">
            <img
              src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt="profile"
              className="h-8 w-8 rounded-full"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Topbar;
