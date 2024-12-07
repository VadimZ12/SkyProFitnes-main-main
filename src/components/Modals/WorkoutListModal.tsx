import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Workout, Exercise } from '../../types/interfaces';
import { useCourses } from '../../hooks/useCourses';
import Modal from './Modal';
import { Link } from 'react-router-dom';
//import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { database } from '../../config/firebase';
import { ref, get } from "firebase/database";
//import Button from '../Button';

interface WorkoutListModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutIds: string[];
  course: string;
  action: 'start' | 'continue' | 'restart';
  courseId: string;
}

const WorkoutListModal: React.FC<WorkoutListModalProps> = ({
  isOpen,
  onClose,
  workoutIds,
  course,
  action,
  courseId
}) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const { getWorkout, resetCourseProgress } = useCourses();
  const modalRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [showScroll, setShowScroll] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user } = useAuth();
  const [workoutProgress, setWorkoutProgress] = useState<{ [key: string]: boolean }>({});
  //const navigate = useNavigate();

  const fetchWorkouts = useCallback(async () => {
    if (workoutIds && workoutIds.length > 0 && user) {
      const workoutPromises = workoutIds.map(id => getWorkout(id));
      const fetchedWorkouts = await Promise.all(workoutPromises);
      setWorkouts(fetchedWorkouts.filter((w): w is Workout => w !== null));

      if (action === 'restart') {
        await resetCourseProgress(user.uid, courseId);
      }

      const progressPromises = workoutIds.map(async (id) => {
        const progressRef = ref(database, `userProgress/${user.uid}/${id}`);
        const snapshot = await get(progressRef);
        const progressData = snapshot.val();
        const workout = fetchedWorkouts.find(w => w?._id === id);
        if (!workout) return { id, completed: false };
        if (workout.exercises && workout.exercises.length > 0) {
          const allExercisesCompleted = workout.exercises.every((exercise: Exercise) => {
            const exerciseProgress = progressData?.[exercise.name] || 0;
            return exerciseProgress >= exercise.quantity;
          });
          return { id, completed: allExercisesCompleted };
        } else {
          return { id, completed: progressData?.completed === 100 };
        }
      });

      const progressResults = await Promise.all(progressPromises);
      const progressObject = progressResults.reduce((acc, { id, completed }) => {
        acc[id] = completed;
        return acc;
      }, {} as { [key: string]: boolean });
      setWorkoutProgress(progressObject);
    } else {
      setWorkouts([]);
    }
  }, [workoutIds, getWorkout, user, action, courseId, resetCourseProgress]);

  useEffect(() => {
    if (isOpen) {
      fetchWorkouts();
    }
  }, [isOpen, fetchWorkouts]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const checkScroll = () => {
      if (listRef.current) {
        setShowScroll(listRef.current.scrollHeight > listRef.current.clientHeight);
      }
    };
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => {
      window.removeEventListener('resize', checkScroll);
    };
  }, [workouts]);

  if (!isOpen) return null;

  // function startWorkout() {
  //   let workoutNumber = 0;    
  //   for (const key in workoutProgress) {
  //     workoutNumber++;      
  //     if (!workoutProgress[key]) {
  //       navigate(`/training/${key}`, { 
  //         state: { course, workoutNumber } 
  //       });
  //       return;
  //     }
  //   }
  //   navigate('/user');
  // }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div ref={modalRef} className="bg-white shadow-lg rounded-[30px] p-10 w-full max-w-[460px] h-[609px] flex flex-col">
          <h2 className="text-[32px] font-[450] mb-12 text-center font-roboto leading-[110%]">Выберите тренировку</h2>
          <div ref={listRef} className={`flex-grow overflow-y-auto pr-4 ${showScroll ? 'scrollbar' : ''}`}>
            {workouts.length > 0 ? (
              <div className="flex flex-col gap-[10px]">
                {workouts.map((workout, index) => (
                  <div key={workout._id} className="flex flex-col">
                    <label className="flex items-center cursor-pointer group">
                      <span className={`w-6 h-6 border-2 rounded-full mr-2.5 flex items-center justify-center transition-colors ${workoutProgress[workout._id] ? 'bg-[#BCEC30] border-[#BCEC30]' : 'border-black'}`}>
                        <span className={`w-4 h-4 rounded-full ${workoutProgress[workout._id] ? 'bg-[#BCEC30]' : ''} transition-colors`}>
                          {workoutProgress[workout._id] && (
                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                        </span>
                      </span>
                      <Link to={`/training/${workout._id}`} state={{ course: course,  workoutNumber: index + 1 }} className="max-w-[320px]">
                        <p className="text-[24px] font-normal font-roboto leading-[110%]">{workout.name}</p>
                        {/*<p className="text-[14px] text-black font-roboto leading-[110%] mt-[10px]">Тренировка {index + 1}</p>*/}
                      </Link>
                    </label>
                    {index < workouts.length - 1 && <hr className="border-[#C4C4C4] w-full mt-4" />}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center">Нет доступных тренировок</p>
            )}
          </div>
          {/*<Button
            variant="primary"
            className="mt-8 w-full py-4 px-6.5 bg-[#BCEC30] rounded-[46px] text-[18px] font-roboto leading-[110%] text-black"
            onClick={startWorkout}
          >
            Начать
          </Button>*/}
        </div>
      </div>
      <Modal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} type="login" onSwitchType={() => {}} />
    </>
  );
};

export default WorkoutListModal;