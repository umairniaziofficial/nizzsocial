// src/lib/appwrite/api.ts

import { INewUser } from "@/types";
import { ID, AppwriteException } from "appwrite";
import { account } from "./config";

export async function createUserAccount(user: INewUser) {
    try {
        const newAccount = await account.create(
            ID.unique(),
            user.email,
            user.password,
            user.name
        );
        return newAccount;
    } catch (error) {
        if (error instanceof AppwriteException) {
            console.error("Appwrite error:", error.message);
        } else {
            console.error("Error occurred while creating the user account:", error);
        }
        return null;
    }
}