// src/auth/AuthLayout.tsx
import { Outlet, Navigate } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import PageLoader from "@/components/ui/shared/PageLoader";

const AuthLayout = () => {
  const { isAuthenticated, isLoading } = useUserContext();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <PageLoader/>
      </div>
    );
  }
  

  return ( 
    <>
      {isAuthenticated ? (
        <Navigate to="/" />
      ) : (
        <div className="flex">
          <div className="flex flex-1 justify-center items-center flex-col py-10 max-sm:p-0">
            <Outlet />
          </div>
          <img src="/assets/images/SideImage.png" alt="BannerImage" className="hidden xl:block h-screen w-1/2 object-cover bg-no-repeat" />
        </div>
      )}
    </>
  );
};

export default AuthLayout;
