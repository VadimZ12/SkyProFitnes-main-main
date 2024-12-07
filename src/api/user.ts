import { auth, database } from '../config/firebase';
import { ref, set, get } from "firebase/database";
import { updateProfile } from 'firebase/auth';
import { User } from '../types/interfaces';

export const createUserProfile = async (user: User): Promise<void> => {
  try {
    const userRef = ref(database, `users/${user.uid}`);
    await set(userRef, {
      email: user.email,
      displayName: user.displayName || '',
      customDisplayName: user.customDisplayName || '',
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      return { uid: userId, ...snapshot.val() } as User;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, data: Partial<User>): Promise<void> => {
  try {
    const userRef = ref(database, `users/${userId}`);
    await set(userRef, data);
    const currentUser = auth.currentUser;
    if (currentUser) {
      await updateProfile(currentUser, {
        displayName: data.customDisplayName || data.displayName,
      });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};