import { Databases, Avatars, Client, Account, Storage } from "appwrite";

// Initialize the Appwrite client
const client = new Client();

client
    .setEndpoint(import.meta.env.VITE_APPWRITE_URL) 
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

// Initialize the Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);


