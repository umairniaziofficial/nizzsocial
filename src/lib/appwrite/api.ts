import { INewPost, INewUser, IUpdatePost, IUpdateUser } from "@/types";
import { ID, ImageGravity, Models, Query } from "appwrite";
import { account, appWriteConfig, avatars, databases, storage } from "./config";

// User Requests

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

// Function to update user
export async function updateUser(user: IUpdateUser) {
  const hasFileToUpdate = user.file.length > 0;
  try {
    let image = {
      imageUrl: user.imageUrl,
      imageId: user.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(user.file[0]);
      if (!uploadedFile) throw Error;

      // Get new file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    // Update user
    const updatedUser = await databases.updateDocument(
      appWriteConfig.databaseId,
      appWriteConfig.userCollectionId,
      user.userId,
      {
        name: user.name,
        bio: user.bio,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
      }
    );

    // Failed to update
    if (!updatedUser) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }
      // If no new file uploaded, just throw error
      throw Error;
    }

    // Safely delete old file after successful update
    if (user.imageId && hasFileToUpdate) {
      await deleteFile(user.imageId);
    }

    return updatedUser;
  } catch (error) {
    console.log(error);
  }
}

// Function to get user by ID
export async function getUserById(userId: string) {
  try {
    const user = await databases.getDocument(
      appWriteConfig.databaseId,
      appWriteConfig.userCollectionId,
      userId
    );

    if (!user) throw Error;

    return user;
  } catch (error) {
    console.log(error);
  }
}

// Function to get users with optional limit
export type UsersResponse = Models.DocumentList<Models.Document>;

export async function getUsers(limit?: number): Promise<UsersResponse> {
  const queries: string[] = [Query.orderDesc("$createdAt")];

  if (limit) {
    queries.push(Query.limit(limit));
  }

  try {
    const users = await databases.listDocuments(
      appWriteConfig.databaseId,
      appWriteConfig.userCollectionId,
      queries
    );

    if (!users) throw new Error("Failed to fetch users");

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

// Post Requests

// Function to create a new post
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

// Function to update post
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

// Function to get recent posts
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

// Function to like or unlike a post
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

// Function to save a post
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

// Function to delete a saved post
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

// Function to get a post by ID
export async function getPostById(postId?: string) {
  if (!postId) throw Error;

  try {
    const post = await databases.getDocument(
      appWriteConfig.databaseId,
      appWriteConfig.postsCollectionId,
      postId
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}

// Function to get posts by user ID
export async function getUserPosts(userId?: string) {
  if (!userId) return;

  try {
    const post = await databases.listDocuments(
      appWriteConfig.databaseId,
      appWriteConfig.postsCollectionId,
      [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}

// Function to delete a post
export async function deletePost(postId?: string, imageId?: string) {
  if (!postId || !imageId) return;

  try {
    const statusCode = await databases.deleteDocument(
      appWriteConfig.databaseId,
      appWriteConfig.postsCollectionId,
      postId
    );

    if (!statusCode) throw Error;

    await deleteFile(imageId);

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

// Search Requests

// Function to search posts by caption
export async function searchPosts(searchTerm: string) {
  try {
    const posts = await databases.listDocuments(
      appWriteConfig.databaseId,
      appWriteConfig.postsCollectionId,
      [Query.search("caption", searchTerm)]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

// Helper Functions

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


export type PostsResponse = Models.DocumentList<Models.Document>;

export async function getInfinitePosts({ pageParam }: { pageParam: string | null }): Promise<PostsResponse> {
  try {
    const queries: string[] = [
      Query.orderDesc('$createdAt'),
      Query.limit(9)
    ];

    if (pageParam) {
      queries.push(Query.cursorAfter(pageParam));
    }

    const response = await databases.listDocuments(
      appWriteConfig.databaseId,
      appWriteConfig.postsCollectionId,
      queries
    );

    if (!response) throw new Error('Failed to fetch posts');

    return response;
  } catch (error) {
    console.error('Error fetching infinite posts:', error);
    throw error;
  }
}