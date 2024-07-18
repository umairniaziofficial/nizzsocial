import { INewPost, INewUser, IUpdatePost } from "@/types";
import { ID, ImageGravity, Query } from "appwrite";
import { account, appWriteConfig, avatars, databases, storage } from "./config";

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

    if (!currentUser.documents.length)
      throw new Error("User document not found");
    return currentUser.documents[0];
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw error;
  }
}

// Function to signout user
export async function signoutAccount() {
  try {
    const session = await account.deleteSession("current");
    localStorage.removeItem("cookieFallback");
    return session;
  } catch (error) {
    console.error("Error deleting current user session:", error);
    throw error;
  }
}

export async function createPost(post: INewPost) {
  try {
    // Upload image to storage
    const uploadedFile = await uploadFile(post.file[0]);

    if (!uploadedFile) throw Error("Failed to upload image");

    // Get file url
    const fileUrl = getFilePreview(uploadedFile.$id);
    if (!fileUrl) {
      await deleteFile(uploadedFile.$id);
      throw Error("Failed to get file url");
    }

    // Convert tags from string to array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // Create post
    const newPost = await databases.createDocument(
      appWriteConfig.databaseId,
      appWriteConfig.postsCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
        location: post.location,
        tags: tags,
      }
    );

    if (!newPost) {
      await deleteFile(uploadedFile.$id);
      throw Error("Failed to create post");
    }

    return newPost;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
}

// Helper function to upload file
async function uploadFile(file: File) {
  try {
    const uploadedFile = await storage.createFile(
      appWriteConfig.storageId,
      ID.unique(),
      file
    );

    return uploadedFile;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

// Helper function to get file url
function getFilePreview(fileId: string) {
  try {
    const fileUrl = storage.getFilePreview(
      appWriteConfig.storageId,
      fileId,
      2000,
      2000,
      ImageGravity.Center,
      100
    );

    return fileUrl;
  } catch (error) {
    console.error("Error getting file preview:", error);
    throw error;
  }
}

// Helper function to delete file
async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appWriteConfig.storageId, fileId);
    return { status: "ok" };
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}

export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.file.length > 0;

  try {
    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file
      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw Error("Failed to upload image");

      // Get new file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error("Failed to get file url");
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    // Convert tags from string to array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // Update post
    const updatedPost = await databases.updateDocument(
      appWriteConfig.databaseId,
      appWriteConfig.postsCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        location: post.location,
        tags: tags,
      }
    );

    if (!updatedPost) {
      // If post update fails, delete the new file that was uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }
      throw Error("Failed to update post");
    }

    // Delete old file if it was updated
    if (hasFileToUpdate) {
      await deleteFile(post.imageId);
    }

    return updatedPost;
  } catch (error) {
    console.error("Error updating post:", error);
    throw error;
  }
}

export async function getRecentPosts() {
  try {
    const posts = await databases.listDocuments(
      appWriteConfig.databaseId,
      appWriteConfig.postsCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(20)]
    );

    if (!posts) {
      throw new Error("Failed to fetch recent posts");
    }

    return posts;
  } catch (error) {
    console.error("Error fetching recent posts:", error);
    throw error;
  }
}

export async function likePost(postId: string, likesArray: string[]) {
  try {
    const updatePost = await databases.updateDocument(
      appWriteConfig.databaseId,
      appWriteConfig.postsCollectionId,
      postId,
      {
        likes: likesArray,
      }
    );

    if (!updatePost) {
      throw new Error("Failed to update post likes");
    }
    return updatePost;
  } catch (error) {
    console.error("Error liking/unliking post:", error);
    throw error;
  }
}

export async function savePost(userId: string, postId: string) {
  try {
    const updatedPost = await databases.createDocument(
      appWriteConfig.databaseId,
      appWriteConfig.savesCollectionId,
      ID.unique(),
      {
        user: userId,
        post: postId,
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteSavedPost(savedRecordId: string) {
  try {
    const statusCode = await databases.deleteDocument(
      appWriteConfig.databaseId,
      appWriteConfig.savesCollectionId,
      savedRecordId
    );

    if (!statusCode) {
      throw new Error("Failed to delete saved post");
    }
    return { status: "ok" };
  } catch (error) {
    console.error("Error deleting saved post:", error);
    throw error;
  }
}
