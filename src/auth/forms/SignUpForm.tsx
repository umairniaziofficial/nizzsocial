import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SignUpValidationSchema } from "@/lib/validation";
import Loader from "@/components/ui/shared/Loader";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  useCreateUserAccountMutation,
  useSigninAccount,
} from "@/lib/react-query/querriesAndMutations";
import { useUserContext } from "@/context/AuthContext";

const SignUpForm = () => {
  const { checkAuthUser, isAuthenticated } = useUserContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const { mutateAsync: createUserAccount, isPending: isCreatingUser } =
    useCreateUserAccountMutation();

  const { mutateAsync: signinAccount, isPending: isSigningIn } =
    useSigninAccount();

  const form = useForm<z.infer<typeof SignUpValidationSchema>>({
    resolver: zodResolver(SignUpValidationSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated && location.pathname === "/sign-up") {
      navigate("/");
    }
  }, [isAuthenticated, navigate, location]);

  async function onSubmit(values: z.infer<typeof SignUpValidationSchema>) {
    try {
      const newUser = await createUserAccount({
        name: values.name,
        email: values.email,
        password: values.password,
        username: values.username,
      });

      if (!newUser) {
        throw new Error("Signup Failed");
      }

      const session = await signinAccount({
        email: values.email,
        password: values.password,
      });

      if (!session) {
        throw new Error("Login Failed");
      }

      const isLoggedIn = await checkAuthUser();
      if (isLoggedIn) {
        form.reset();
        navigate("/");
      } else {
        throw new Error("Login Failed");
      }

      toast({ title: "Account created and logged in successfully!" });
    } catch (error) {
      toast({ title: "An error occurred. Please try again." });
    }
  }

  return (
    <Form {...form}>
      <div className="sm:w-420 flex-center flex-col text-white">
        <div className="flex items-center">
          <img src="/src/assets/Logo.svg" alt="logo" className="w-8" />
          <p className="text-2xl pl-3 font-semibold">NizzSocial</p>
        </div>
        <h1 className="h3-bold md:h2-bold pt-5 sm:pt-8">
          Create a new Account
        </h1>
        <p className="text-light-3 small-medium md:base-regular mt-2">
          Enter your details to use NizzSocial
        </p>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5 w-full mt-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    className="shad-input"
                    placeholder="Enter your name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    className="shad-input"
                    placeholder="Enter your username"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    className="shad-input"
                    placeholder="Enter your email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    className="shad-input"
                    placeholder="Enter your password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="shad-button_primary">
            {isCreatingUser || isSigningIn ? (
              <div className="flex-center gap-2">
                <Loader />
              </div>
            ) : (
              "Sign up"
            )}
          </Button>
          <p className="text-sm-regular text-light-2 text-center mt-2">
            Already have an account?{" "}
            <Link
              to="/sign-in"
              className="text-primary-500 text-small-semibold ml-1"
            >
              Log in
            </Link>
          </p>
        </form>
      </div>
    </Form>
  );
};

export default SignUpForm;