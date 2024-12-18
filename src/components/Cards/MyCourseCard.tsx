import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from "../Button";
import Level from "./Level";
import WorkoutListModal from '../Modals/WorkoutListModal';
import { Course, Workout } from '../../types/interfaces';
import { database } from '../../config/firebase';
import { ref, get, set} from "firebase/database";
import { useAuth } from '../../hooks/useAuth';

interface MyCourseCardProps {
  course: Course;
  onCourseRemoved?: () => void;
}

const MyCourseCard: React.FC<MyCourseCardProps> = ({ course, onCourseRemoved }) => {
  const [isWorkoutListModalOpen, setIsWorkoutListModalOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [modalAction, setModalAction] = useState<'start' | 'continue' | 'restart'>('start');


  useEffect(() => {
    const fetchProgress = async () => {
      if (user && course._id && course.workouts) {
        let totalProgress = 0;
        const totalWorkouts = course.workouts.length;

        for (const workoutId of course.workouts) {
          const workoutRef = ref(database, `courses/workouts/${workoutId}`);
          const workoutSnapshot = await get(workoutRef);
          const workoutData = workoutSnapshot.val() as Workout;
          const progressRef = ref(database, `userProgress/${user.uid}/${workoutId}`);
          const progressSnapshot = await get(progressRef);
          const progressData = progressSnapshot.val() || {};
          console.log('progressData', progressData, workoutData);

          const progressUserRef = ref(database, `userCourses/${user.uid}`);
          const progressUserData = (await get(progressUserRef)).val();
          console.log('удаление', progressUserData);

          

          if (workoutData && workoutData.exercises) {
            let workoutCompleted = true;
            for (const exercise of workoutData.exercises) {
              const exerciseProgress = progressData[exercise.name] || 0;
              if (exerciseProgress < exercise.quantity) {
                workoutCompleted = false;
                break;
              }
            }
            if (workoutCompleted) {
              totalProgress += 1;
            }
          }
        }

        const averageProgress = (totalProgress / totalWorkouts) * 100;
        setProgress(Math.round(averageProgress));
      }
    };
    fetchProgress();
  }, [user, course._id, course.workouts]);

  const handleOpenModal = (action: 'start' | 'continue' | 'restart') => {
    setModalAction(action);
    setIsWorkoutListModalOpen(true);
  };

  const getButtonText = () => {
    if (progress === 0) return "Начать тренировку";
    if (progress === 100) return "Начать заново";
    return "Продолжить";
  };

  const handleRemoveCourse = async (e: React.MouseEvent) => {
    if (e && e.stopPropagation) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (user && course._id) {
      try {
        const userCoursesRef = ref(database, `userCourses/${user.uid}`);
        const snapshot = await get(userCoursesRef);
        if (snapshot.exists()) {
          const courses = snapshot.val();
          const updatedCourses = courses.filter((id: string) => id !== course._id);
          await set(userCoursesRef, updatedCourses);
          const progressPromises = course.workouts.map(async(workoutId) => {
           const workoutProgressRef = ref(database, `userProgress/${user.uid}/${workoutId}`)
           await set(workoutProgressRef, null)
          })
          await Promise.all(progressPromises)
          
          if (onCourseRemoved) {
            onCourseRemoved();
          }
        }
      } catch (error) {
        console.error('Error removing course:', error);
      }
    }
  };

  const courseToImage : Record <string, string>  = {
    'Yoga' : 'YogaCard.png', 
    'Stretching' : 'StretchingCard.png',
    'DanceFitness' : 'DanceFitnessCard.png',
    'StepAirobic' : 'StepAirobicCard.png',
    'BodyFlex' : 'BodyFlexCard.png',
  }

  const cardImg = (courseName: string) : string => courseToImage[courseName]

  return (
    <div className="w-full pb-[15px] rounded-[30px] shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)]">
      <div className="relative" onClick={() => navigate(`/course/${course._id}`)}>
        <img 
          src={`/images/${cardImg(course.nameEN)}`}
          alt={course.nameRU} 
          className="w-full h-[325px] rounded-[30px] object-cover"
          loading="lazy"
        />
        <button className="absolute top-5 right-5 w-[32px] h-[32px]" onClick={handleRemoveCourse}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M16 29.3333C23.3638 29.3333 29.3333 23.3638 29.3333 16C29.3333 8.63616 23.3638 2.66663 16 2.66663C8.63619 2.66663 2.66666 8.63616 2.66666 16C2.66666 23.3638 8.63619 29.3333 16 29.3333ZM9.33332 14.6666H22.6667V17.3333H9.33332V14.6666Z" fill="white"/>
          </svg>
        </button>
      </div>
      <div className="mt-[24px] ml-[30px] mr-[30px]">
        <h2 className="text-[32px] font-medium leading-[35.2px] text-left font-roboto flex items-center">{course.nameRU}</h2>
        <div className="flex flex-wrap gap-[6px] mt-[20px]">
          <div className="flex rounded-[30px] bg-gray-super-light items-center p-[10px] gap-[6px]">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.5 2.625C7.5 1.79657 6.82843 1.125 6 1.125C5.17157 1.125 4.5 1.79657 4.5 2.625C2.84315 2.625 1.5 3.96815 1.5 5.625H16.5C16.5 3.96815 15.1569 2.625 13.5 2.625C13.5 1.79657 12.8284 1.125 12 1.125C11.1716 1.125 10.5 1.79657 10.5 2.625H7.5Z" fill="#202020" />
              <path fillRule="evenodd" clipRule="evenodd" d="M1.5 7.125H16.5V11.325C16.5 13.0052 16.5 13.8452 16.173 14.487C15.8854 15.0515 15.4265 15.5104 14.862 15.798C14.2202 16.125 13.3802 16.125 11.7 16.125H6.3C4.61984 16.125 3.77976 16.125 3.13803 15.798C2.57354 15.5104 2.1146 15.0515 1.82698 14.487C1.5 13.8452 1.5 13.0052 1.5 11.325V7.125ZM10.5 11.325C10.5 10.905 10.5 10.6949 10.5817 10.5345C10.6537 10.3934 10.7684 10.2787 10.9095 10.2067C11.0699 10.125 11.28 10.125 11.7 10.125H12.3C12.72 10.125 12.9301 10.125 13.0905 10.2067C13.2316 10.2787 13.3463 10.3934 13.4183 10.5345C13.5 10.6949 13.5 10.905 13.5 11.325V11.925C13.5 12.345 13.5 12.5551 13.4183 12.7155C13.3463 12.8566 13.2316 12.9713 13.0905 13.0433C12.9301 13.125 12.72 13.125 12.3 13.125H11.7C11.28 13.125 11.0699 13.125 10.9095 13.0433C10.7684 12.9713 10.6537 12.8566 10.5817 12.7155C10.5 12.5551 10.5 12.345 10.5 11.925V11.325Z" fill="#202020" />
            </svg>
            <p>{course.workouts?.length || 0} {course.workouts?.length === 1 ? 'тренировка' : 'тренировок'}</p>
          </div>
          <div className="flex rounded-[30px] bg-gray-super-light items-center p-[10px] gap-[6px]">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 16.5C13.1421 16.5 16.5 13.1421 16.5 9C16.5 4.85786 13.1421 1.5 9 1.5C4.85786 1.5 1.5 4.85786 1.5 9C1.5 13.1421 4.85786 16.5 9 16.5Z" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 4.5V9L12 10.5" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p>20-50 мин/день</p>
          </div>
          {course.difficult !== undefined && (
            <div className="flex rounded-[30px] bg-gray-super-light items-center p-[10px] gap-[6px]">
              <Level value={course.difficult} />
              <p className="font-roboto text-[16px] leading-[110%] text-[#202020]">Сложность</p>
            </div>
          )}
        </div>
        <div className="mt-[20px]">
          <p>Прогресс {progress}%</p>
          <div className="w-full bg-[#F7F7F7] rounded-full h-2.5 mt-2">
            <div className="bg-[#00C1FF] h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        <Button 
          variant='primary' 
          className='w-full h-[52px] mt-[40px]' 
          onClick={() => handleOpenModal(progress === 0 ? 'start' : progress === 100 ? 'restart' : 'continue')}
        >
          {getButtonText()}
        </Button>
      </div>
      <WorkoutListModal 
        isOpen={isWorkoutListModalOpen} 
        onClose={() => setIsWorkoutListModalOpen(false)} 
        workoutIds={course.workouts || []} 
        course={course.nameRU}
        action={modalAction}
        courseId={course._id}
      />
    </div>
  );
};

export default MyCourseCard;
