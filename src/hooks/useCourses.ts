import { useState, useEffect, useCallback } from 'react';
import { Course, Workout, User } from '../types/interfaces';
import { getAllCourses, addCourseToUser, getUserCourses as getUserCoursesAPI, getCourseById, getWorkoutById } from '../api/courses';
import { getUserProfile as getUserProfileFromAPI, updateUserProfile } from '../api/user';
import { useAuth } from './useAuth';
import { database } from '../config/firebase';
import { ref, get, remove } from "firebase/database";

const CACHE_EXPIRATION_TIME = 8 * 60 * 60 * 1000; // 8 часов в миллисекундах
interface CachedData<T> {
  data: T;
  timestamp: number;
}

const getCachedData = <T>(key: string): T | null => {
  try {
    const cachedItem = localStorage.getItem(key);
    if (cachedItem) {
      const { data, timestamp }: CachedData<T> = JSON.parse(cachedItem);
      if (Date.now() - timestamp < CACHE_EXPIRATION_TIME) {
        return data;
      }
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  return null;
};

const setCachedData = <T>(key: string, data: T) => {
  try {
    const cacheItem: CachedData<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(cacheItem));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
};

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [userCourses, setUserCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: authUser } = useAuth();

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const cachedCourses = getCachedData<Course[]>('allCourses');
      if (cachedCourses) {
        setCourses(cachedCourses);
      } else {
        const allCourses = await getAllCourses();
        setCourses(allCourses);
        setCachedData('allCourses', allCourses);
      }

      if (authUser) {
        const cachedUserCourses = getCachedData<Course[]>(`userCourses_${authUser.uid}`);
        if (cachedUserCourses) {
          setUserCourses(cachedUserCourses);
        } else {
          const userCoursesData = await getUserCoursesAPI(authUser.uid);
          setUserCourses(userCoursesData);
          setCachedData(`userCourses_${authUser.uid}`, userCoursesData);
        }
      } else {
        setUserCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const addCourse = async (courseId: string) => {
    if (!authUser) return;
    try {
      await addCourseToUser(authUser.uid, courseId);
      const updatedUserCourses = await getUserCoursesAPI(authUser.uid);
      setUserCourses(updatedUserCourses);
    } catch (error) {
      console.error('Error adding course:', error);
      throw error;
    }
  };

  const getCourse = async (courseId: string): Promise<Course | null> => {
    try {
      return await getCourseById(courseId);
    } catch (error) {
      console.error('Error fetching course:', error);
      return null;
    }
  };

  const getWorkout = useCallback(async (workoutId: string): Promise<Workout | null> => {
    try {
      return await getWorkoutById(workoutId);
    } catch (error) {
      console.error('Error fetching workout:', error);
      return null;
    }
  }, []);

  const getUserProfile = async (): Promise<User | null> => {
    if (!authUser) return null;
    try {
      return await getUserProfileFromAPI(authUser.uid);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    if (!authUser) return;
    try {
      await updateUserProfile(authUser.uid, data);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };
  
  const getUserCourses = useCallback(async (userId: string): Promise<Course[]> => {
    try {
      return await getUserCoursesAPI(userId);
    } catch (error) {
      console.error('Error fetching user courses:', error);
      return [];
    }
  }, []);

  const resetCourseProgress = async (userId: string, courseId: string) => {
    if (!userId || !courseId) return;
    try {
      const courseRef = ref(database, `courses/courses/${courseId}`);
      const courseSnapshot = await get(courseRef);
      if (courseSnapshot.exists()) {
        const courseData = courseSnapshot.val();
        const workoutIds = courseData.workouts || [];
        const progressRef = ref(database, `userProgress/${userId}`);
        const progressSnapshot = await get(progressRef);
        if (progressSnapshot.exists()) {
          const progressData = progressSnapshot.val();
          for (const workoutId of workoutIds) {
            if (progressData[workoutId]) {
              await remove(ref(database, `userProgress/${userId}/${workoutId}`));
            }
          }
        }
      }
    } catch (error) {
      console.error('Error resetting course progress:', error);
    }
  };

  return {
    courses,
    userCourses,
    loading,
    addCourse,
    getCourse,
    getWorkout,
    getUserProfile,
    updateProfile,
    getUserCourses,
    resetCourseProgress,
  };
};