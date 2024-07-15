import { INewUser } from "@/types";
import { ID, Query } from "appwrite";
import { account, appWriteConfig, avatars, databases } from "./config";

// Function to create a new user account
export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );

    if (!newAccount) {
      throw new Error("Failed to create a new account");
    }

    const avatarUrl = avatars.getInitials(user.name).toString();

    const userData = {
      accountId: newAccount.$id,
      name: user.name,
      email: user.email,
      username: user.username,
      imageUrl: avatarUrl,
    };

    const savedUser = await saveUserToDb(userData);
    return savedUser;
  } catch (error) {
    console.error("Error creating user account:", error);
    throw error;
  }
}

// Function to save user data to the database
export async function saveUserToDb(user: {
  accountId: string;
  email: string;
  name: string;
  imageUrl: string;
  username?: string;
}) {
  try {
    const response = await databases.createDocument(
      appWriteConfig.databaseId,
      appWriteConfig.userCollectionId,
      user.accountId,
      user
    );
    return response;
  } catch (error) {
    console.error("Error saving user to database:", error);
    throw error;
  }
}

// Function to sign in a user account
export async function signinAccount(email: string, password: string) {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
}

// Function to get the current authenticated user
export async function getCurrentUser() {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) throw new Error("No authenticated user found");

    const currentUser = await databases.listDocuments(
      appWriteConfig.databaseId,
      appWriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser.documents.length) throw new Error("User document not found");
    return currentUser.documents[0];
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw error;
  }
}