import { Outlet,Navigate } from "react-router-dom"

const AuthLayout = () => {
  const isAuthenticated = false;

  return (
    <>
      {isAuthenticated ? (
        <Navigate to="/"/>
      ): (
        <>
        <div className="flex flex-1 justify-center items-center flex-col py-10">
          <Outlet  />
        </div>
        <img src="/src/assets/images/SideImage.png" alt="BannerImage" className="hidden xl:block h-screen w-1/2 object-cover bg-no-repeat" />
        </>
      )}
    </>
  )
}

export default AuthLayout