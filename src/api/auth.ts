import { auth } from '../config/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  AuthError, 
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  User as FirebaseUser
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

export const registerUser = async (email: string, password: string): Promise<FirebaseUser> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    if (error instanceof FirebaseError) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Данная почта уже используется. Попробуйте войти.');
      }
    }
    console.error('Error registering user:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    const authError = error as AuthError;
    switch (authError.code) {
      case 'auth/invalid-credential':
        throw new Error('Неверный логин или пароль. Попробуйте еще раз.');
      case 'auth/user-not-found':
        throw new Error('Пользователь с таким email не найден.');
      case 'auth/wrong-password':
        throw new Error('Неверный пароль. Попробуйте еще раз.');
      default:
        console.error('Error logging in:', error);
        throw new Error('Произошла ошибка при входе. Попробуйте позже.');
    }
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    console.log('Attempting to send password reset email to:', email);
    await sendPasswordResetEmail(auth, email);
    console.log('Password reset email sent successfully to:', email);
  } catch (error) {
    console.error('Error resetting password:', error);
    if (error instanceof FirebaseError) {
      console.error('Firebase error code:', error.code);
      console.error('Firebase error message:', error.message);
    }
    throw error;
  }
};

export const changePassword = async (newPassword: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (user) {
      await updatePassword(user, newPassword);
    } else {
      throw new Error('No user is currently signed in');
    }
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};