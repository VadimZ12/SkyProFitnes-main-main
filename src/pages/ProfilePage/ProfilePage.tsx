import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MyCourseCard from "../../components/Cards/MyCourseCard";
import { useAuth } from '../../hooks/useAuth';
import { useCourses } from '../../hooks/useCourses';
import Profile from "./Profile";
import { Course } from '../../types/interfaces';
import Footer from '../../components/Footer';

function ProfilePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { getUserCourses } = useCourses();
  const [userCourses, setUserCourses] = useState<Course[]>([]);

  const fetchUserCourses = React.useCallback(async () => {
    if (user) {
      const courses = await getUserCourses(user.uid);
      setUserCourses(courses);
    }
  }, [user, getUserCourses]);


  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    } else {
      fetchUserCourses();
    }
  }, [user, fetchUserCourses, navigate, loading]);

  const handleCourseRemoved = React.useCallback(() => {
    fetchUserCourses();
  }, [fetchUserCourses]);

  return (
    <>
      <main className='mt-[60px] mb-[60px]'>
        <h1 className='text-[40px] font-medium leading-[44px] text-left font-roboto mobile:text-[24px] mobile:leading-[26.4px]'>
          Профиль
        </h1>
        {user && <Profile />}
        <h1 className='text-[40px] font-medium leading-[44px] text-left font-roboto mobile:text-[24px] mobile:leading-[26.4px] mt-[60px]'>
          Мои курсы
        </h1>
        <article className='grid grid-cols-3 gap-[40px] mt-[50px] tablet:grid tablet:grid-cols-2 mobile:flex mobile:flex-wrap mobile:justify-center'>
          {userCourses
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((course) => (
              <MyCourseCard
                key={course._id}
                course={course}
                onCourseRemoved={handleCourseRemoved}
              />
            ))}
        </article>
      </main>
      <Footer showScrollToTop={userCourses.length > 0} />
    </>
  );
}

export default ProfilePage;
