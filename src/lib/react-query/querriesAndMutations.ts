import { INewUser } from "@/types";
import { useMutation } from "@tanstack/react-query";
import {
  createUserAccount,
  signinAccount,
  signoutAccount,
} from "../appwrite/api";

// Mutation for creating a new user account
export const useCreateUserAccountMutation = () => {
  return useMutation({
    mutationFn: (user: INewUser) => createUserAccount(user),
    onError: (error) => {
      console.error("Error creating user account:", error);
    },
    onSuccess: () => {
      console.log("User account created successfully!");
    },
  });
};

// Mutation for signing in the user
export const useSigninAccount = () => {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signinAccount(email, password),
    onError: (error) => {
      console.error("Error signing in user:", error);
    },
    onSuccess: () => {
      console.log("User signed in successfully!");
    },
  });
};

export const useSignoutAccount = () => {
  return useMutation({
    mutationFn: signoutAccount,
  });
};
