import { createContext, useContext } from 'react';
import { useCourses } from '../hooks/useCourses';

const CoursesContext = createContext<ReturnType<typeof useCourses> | undefined>(undefined);

export const CoursesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const coursesData = useCourses();

  return <CoursesContext.Provider value={coursesData}>{children}</CoursesContext.Provider>;
};

export const useCoursesContext = () => {
  const context = useContext(CoursesContext);
  if (context === undefined) {
    throw new Error('useCoursesContext must be used within a CoursesProvider');
  }
  return context;
}; 