export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  name?: string;
  login?: string;
  password?: string;
  url_img?: string;
  customDisplayName?: string;
}

export interface Course {
  _id: string;
  nameEN: string;
  nameRU: string;
  description: string;
  directions: string[];
  fitting: string[];
  order: number;
  workouts: string[];
  imageUrl?: string;
  difficult?: number;
  totalDuration?: number;
  progress?: number;
}

export interface Workout {
  _id: string;
  name: string;
  video: string;
  exercises?: Exercise[];
}

export interface Exercise {
  name: string;
  quantity: number;
}

export type CachedData<T> = {
  data: T;
  timestamp: number;
};

interface ImportMetaEnv {
  VITE_FIREBASE_API_KEY: string;
  VITE_FIREBASE_AUTH_DOMAIN: string;
  VITE_FIREBASE_PROJECT_ID: string;
  VITE_FIREBASE_STORAGE_BUCKET: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  VITE_FIREBASE_APP_ID: string;
  VITE_FIREBASE_DATABASE_URL: string;
}

export interface ImportMeta {
  readonly env: ImportMetaEnv;
}