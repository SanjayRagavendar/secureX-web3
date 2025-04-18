import React, { createContext, useState, useEffect, useContext } from 'react';
import { Client, Account } from 'react-native-appwrite';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('680093d9001e9166796e')
  .setPlatform('com.testing.secureX');

// Initialize the account service
const account = new Account(client);

// Define the shape of our auth data
interface AuthData {
  userId: string;
  userName: string;
  email: string;
  sessionId?: string;
}

// Define the shape of our context
interface AuthContextData {
  authData: AuthData | null;
  loading: boolean;
  authenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  // Function to sign in using Appwrite
  const signIn = async (email: string, password: string) => {
    try {
      const session = await account.createEmailPasswordSession(email, password);
      
      const user = await account.get();
      
      // Create auth data object
      const userData: AuthData = {
        userId: user.$id,
        userName: user.name || email.split('@')[0],
        email: user.email,
        sessionId: session.$id
      };

      setAuthData(userData);
      setAuthenticated(true);
      
      // No AsyncStorage persistence - session only lasts for current app session
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  // Function to sign up using Appwrite
  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Create the user account
      await account.create('unique()', email, password, name);
      
      await signIn(email, password);
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  // Function to sign out
  const signOut = async () => {
    try {
      if (authData?.sessionId) {
        await account.deleteSession(authData.sessionId);
      }
      setAuthData(null);
      setAuthenticated(false);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Set loading to false on mount since we're not loading from storage
  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ authData, loading, signIn, signOut, signUp, authenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
