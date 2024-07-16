import Bottombar from "@/components/ui/shared/Bottombar";
import LeftSidebar from "@/components/ui/shared/LeftSidebar";
import PageLoader from "@/components/ui/shared/PageLoader";
import Topbar from "@/components/ui/shared/Topbar";
import { useUserContext } from "@/context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const RootLayout = () => {
  const { isAuthenticated, isLoading } = useUserContext();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  return (
    <>
      {isAuthenticated ? (
        <>
          <div className="w-full md:flex flex-col">
            <Topbar />
            <LeftSidebar />

            <section className="flex flex-1 h-full">
              <Outlet />
            </section>

            <Bottombar />
          </div>
        </>
      ) : (
        <Navigate to="/sign-in" />
      )}
    </>
  );
};

export default RootLayout;
