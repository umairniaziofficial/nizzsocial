import "./output.css";
import "./input.css";
import { Routes, Route } from "react-router-dom";
import SignInForm from "./auth/forms/SignInForm";
import { Home } from "./root/pages";
import AuthLayout from "./auth/AuthLayout";
import RootLayout from "./root/RootLayout";
import SignUpForm from "./auth/forms/SignUpForm";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "./components/ui/shared/NotFound";

const App = () => {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/sign-in" element={<SignInForm />} />
          <Route path="/sign-up" element={<SignUpForm />} />
        </Route>

        <Route path="*" element={<NotFound />} />

        {/* Private Routes */}
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
};

export default App;
