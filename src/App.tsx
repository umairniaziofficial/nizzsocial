import "./output.css";
import "./input.css";
import { Routes, Route } from "react-router-dom";
import SignInForm from "./auth/forms/SignInForm";
import { Home } from "./root/pages";
import AuthLayout from "./auth/AuthLayout";
import RootLayout from "./root/RootLayout";
import SignUpForm from "./auth/forms/SignUpForm";

const App = () => {
  return (
    <div className="flex h-screen">
      <Routes>
        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/sign-in" element={<SignInForm />} />
          <Route path="/sign-up" element={<SignUpForm  />} />
        </Route>

        {/* Private Routes */}
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
