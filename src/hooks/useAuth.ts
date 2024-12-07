import { useState, useEffect } from 'react';
import { User } from '../types/interfaces';
import { auth, database } from '../config/firebase';
import { onAuthStateChanged, signOut, updateProfile as updateFirebaseProfile, User as FirebaseUser } from 'firebase/auth';
import { ref, get, set } from "firebase/database";
import { registerUser, loginUser, resetPassword, changePassword } from '../api/auth';

const INACTIVITY_TIMEOUT = 3 * 60 * 1000; // 3 минуты в миллисекундах

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const updateLastActivity = () => {
    localStorage.setItem('lastActivity', Date.now().toString());
  };

  const checkInactivity = () => {
    const lastActivity = localStorage.getItem('lastActivity');
    if (lastActivity) {
      const inactiveTime = Date.now() - parseInt(lastActivity);
      if (inactiveTime > INACTIVITY_TIMEOUT) {
        logout();
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          checkInactivity();
          updateLastActivity();
          const userRef = ref(database, `users/${firebaseUser.uid}`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: userData.displayName || firebaseUser.displayName,
              customDisplayName: userData.customDisplayName,
            });
          } else {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || undefined,
            });
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    window.addEventListener('mousemove', updateLastActivity);
    window.addEventListener('keypress', updateLastActivity);

    return () => {
      unsubscribe();
      window.removeEventListener('mousemove', updateLastActivity);
      window.removeEventListener('keypress', updateLastActivity);
    };
  }, []);

  const register = async (email: string, password: string) => {
    try {
      const user = await registerUser(email, password);
      updateLastActivity();
      setUser({
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || undefined,
      });
    } catch (error) {
      console.error('Error in register:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const user = await loginUser(email, password);
      updateLastActivity();
      setUser({
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || undefined,
      });
    } catch (error) {
      console.error('Error in login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('lastActivity');
      setUser(null);
    } catch (error) {
      console.error('Error in logout:', error);
      throw error;
    }
  };

  const resetUserPassword = async (email: string) => {
    try {
      await resetPassword(email);
    } catch (error) {
      console.error('Error in resetPassword:', error);
      throw error;
    }
  };

  const changeUserPassword = async (newPassword: string) => {
    try {
      await changePassword(newPassword);
    } catch (error) {
      console.error('Error in changePassword:', error);
      throw error;
    }
  };

  const updateUser = async (updatedUser: Partial<User>) => {
    if (auth.currentUser) {
      try {
        const userRef = ref(database, `users/${auth.currentUser.uid}`);
        await updateFirebaseProfile(auth.currentUser, {
          displayName: updatedUser.displayName,
        });
        await set(userRef, updatedUser);
        setUser(currentUser => {
          if (currentUser) {
            return { ...currentUser, ...updatedUser };
          }
          return currentUser;
        });
      } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
      }
    }
  };

  return {
    user,
    loading,
    register,
    login,
    logout,
    resetUserPassword,
    changeUserPassword,
    updateUser,
  };
};