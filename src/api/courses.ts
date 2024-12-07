import { auth, database } from '../config/firebase';
import { ref, get, set } from "firebase/database";
import { Course, Workout } from '../types/interfaces';
// Получение всех курсов
export const getAllCourses = async (): Promise<Course[]> => {
  try {
    const coursesRef = ref(database, 'courses/courses');
    const snapshot = await get(coursesRef);
    if (snapshot.exists()) {
      const coursesData = snapshot.val();
      const formattedCourses = Object.entries(coursesData)
        .map(([id, data]) => ({
          _id: id,
          ...(data as Omit<Course, '_id'>),
          difficult: (data as { difficult?: number }).difficult ?? 0 // Убедимся, что difficult всегда определено
        }));
      return formattedCourses;
    } else {
      console.log("No courses available");
      return [];
    }
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

// Добавление курса пользователю
export const addCourseToUser = async (userId: string, courseId: string): Promise<void> => {
  if (!userId) throw new Error("User ID must be provided");
  try {
    const userCoursesRef = ref(database, `userCourses/${userId}`);
    const snapshot = await get(userCoursesRef);
    if (snapshot.exists()) {
      const courses = snapshot.val();
      if (!courses.includes(courseId)) {
        await set(userCoursesRef, [...courses, courseId]);
      }
    } else {
      await set(userCoursesRef, [courseId]);
    }
  } catch (error) {
    console.error('Error adding course to user:', error);
    throw error;
  }
};

// Получение курсов пользователя
export const getUserCourses = async (userId: string): Promise<Course[]> => {
  if (!userId) throw new Error("User ID must be provided");
  try {
    const userCoursesRef = ref(database, `userCourses/${userId}`);
    const snapshot = await get(userCoursesRef);
    if (snapshot.exists()) {
      const courseIds = snapshot.val();
      const coursesPromises = courseIds.map((id: string) => getCourseById(id));
      const courses = await Promise.all(coursesPromises);
      return courses.filter((course): course is Course => course !== null);
    }
    return [];
  } catch (error) {
    console.error('Error fetching user courses:', error);
    throw error;
  }
};

// Получение конкретного курса по ID
export const getCourseById = async (courseId: string): Promise<Course | null> => {
  try {
    const courseRef = ref(database, `courses/courses/${courseId}`);
    const snapshot = await get(courseRef);
    if (snapshot.exists()) {
      return { id: courseId, ...snapshot.val() } as Course;
    }
    return null;
  } catch (error) {
    console.error('Error fetching course:', error);
    throw error;
  }
};

// Получение конкретной тренировки по ID
export const getWorkoutById = async (workoutId: string): Promise<Workout | null> => {
  if (!auth.currentUser) {
    throw new Error("User not authenticated");
  }
  try {
    const workoutRef = ref(database, `courses/workouts/${workoutId}`);
    const snapshot = await get(workoutRef);

    if (snapshot.exists()) {
      const workoutData = snapshot.val();

      return { id: workoutId, ...workoutData } as Workout;
    }
    return null;
  } catch (error) {
    console.error('Error fetching workout:', error);
    throw error;
  }
};
