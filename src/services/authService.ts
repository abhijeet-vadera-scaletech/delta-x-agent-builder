import {
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  AuthError,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { auth } from "../config/firebase";

// Initialize providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

/**
 * Get user-friendly error message from Firebase error
 */
const getAuthErrorMessage = (error: AuthError): string => {
  switch (error.code) {
    case "auth/unauthorized-domain":
      return "This domain is not authorized. Please add it to Firebase Console > Authentication > Settings > Authorized domains.";
    case "auth/popup-blocked":
      return "Popup was blocked by your browser. Please allow popups for this site.";
    case "auth/popup-closed-by-user":
      return "Authentication cancelled. Please try again.";
    case "auth/cancelled-popup-request":
      return "Authentication cancelled. Please try again.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/operation-not-allowed":
      return "This sign-in method is not enabled. Please contact support.";
    case "auth/invalid-api-key":
      return "Invalid Firebase configuration. Please contact support.";
    case "auth/app-deleted":
      return "Firebase app configuration error. Please contact support.";
    case "auth/invalid-user-token":
      return "Your session has expired. Please sign in again.";
    case "auth/user-token-expired":
      return "Your session has expired. Please sign in again.";
    case "auth/web-storage-unsupported":
      return "Your browser doesn't support web storage. Please enable cookies.";
    case "auth/account-exists-with-different-credential":
      return "This email is already registered with a different sign-in method. Please sign in with your original method first, then you can link additional providers in your profile settings.";
    default:
      return error.message || "Authentication failed. Please try again.";
  }
};

/**
 * Sign in anonymously
 */
export const signInAnonymous = async (): Promise<User> => {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(getAuthErrorMessage(authError));
  }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    const authError = error as AuthError;

    // Handle account exists with different credential
    if (authError.code === "auth/account-exists-with-different-credential") {
      const email = authError.customData?.email as string | undefined;
      if (email) {
        try {
          const methods = await fetchSignInMethodsForEmail(auth, email);
          if (methods && methods.length > 0) {
            const providerName = methods[0].includes("google")
              ? "Google"
              : methods[0].includes("github")
              ? "GitHub"
              : "another provider";
            throw new Error(
              `This email is already registered with ${providerName}. Please sign in with ${providerName} first.`
            );
          }
        } catch (fetchError) {
          // If fetchError is already our custom error, re-throw it
          if (
            fetchError instanceof Error &&
            fetchError.message.includes("already registered")
          ) {
            throw fetchError;
          }
          // Otherwise use generic message
          throw new Error(getAuthErrorMessage(authError));
        }
      }
    }

    throw new Error(getAuthErrorMessage(authError));
  }
};

/**
 * Sign in with GitHub
 */
export const signInWithGithub = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    return result.user;
  } catch (error) {
    const authError = error as AuthError;

    // Handle account exists with different credential
    if (authError.code === "auth/account-exists-with-different-credential") {
      const email = authError.customData?.email as string | undefined;
      if (email) {
        try {
          const methods = await fetchSignInMethodsForEmail(auth, email);
          if (methods && methods.length > 0) {
            const providerName = methods[0].includes("google")
              ? "Google"
              : methods[0].includes("github")
              ? "GitHub"
              : "another provider";
            throw new Error(
              `This email is already registered with ${providerName}. Please sign in with ${providerName} first.`
            );
          }
        } catch (fetchError) {
          // If fetchError is already our custom error, re-throw it
          if (
            fetchError instanceof Error &&
            fetchError.message.includes("already registered")
          ) {
            throw fetchError;
          }
          // Otherwise use generic message
          throw new Error(getAuthErrorMessage(authError));
        }
      }
    }

    throw new Error(getAuthErrorMessage(authError));
  }
};

/**
 * Sign out
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(getAuthErrorMessage(authError));
  }
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Listen to auth state changes
 */
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get user display name or fallback
 */
export const getUserDisplayName = (user: User | null): string => {
  if (!user) return "Guest";
  if (user.isAnonymous) return "Guest";
  return user.displayName || user.email || "User";
};

/**
 * Check if user is authenticated (not anonymous)
 */
export const isAuthenticated = (user: User | null): boolean => {
  return !!user && !user.isAnonymous;
};

/**
 * Get Firebase ID token for the current user
 * This token is used to authenticate API requests
 */
export const getIdToken = async (): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return null;
    }
    // Get the ID token, force refresh if needed
    const idToken = await user.getIdToken(false);
    return idToken;
  } catch (error) {
    console.error("Error getting ID token:", error);
    return null;
  }
};

/**
 * Get Firebase ID token with force refresh
 * Use this when you need to ensure the token is fresh
 */
export const getIdTokenRefresh = async (): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return null;
    }
    // Force refresh the ID token
    const idToken = await user.getIdToken(true);
    return idToken;
  } catch (error) {
    console.error("Error refreshing ID token:", error);
    return null;
  }
};
