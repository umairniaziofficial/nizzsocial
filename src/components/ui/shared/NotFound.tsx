import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-1 justify-center items-center flex-col py-10 text-white">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="text-lg mt-4">The page you are looking for does not exist.</p>
      <Link to="/" className="text-primary-500 text-lg mt-4 hover:underline">
        Go back to Home
      </Link>
    </div>
  );
};

export default NotFound;
