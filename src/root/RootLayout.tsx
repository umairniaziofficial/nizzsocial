import PageLoader from "@/components/ui/shared/PageLoader";
import { useUserContext } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

const RootLayout = () => {
  const { isAuthenticated, isLoading } = useUserContext();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <PageLoader/>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated ? (
        <>
          <div className="h-screen items-center w-screen justify-center">Hello, authenticated user</div>{" "}
        </>
      ) : (
        <Navigate to="/sign-in" />
      )}
    </>
  );
};

export default RootLayout;
