import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useCourses } from '../../hooks/useCourses';
import { useAuth } from '../../hooks/useAuth';
import { Workout, Exercise } from '../../types/interfaces';
import ProgressModal from '../../components/Modals/ProgressModal';
import InfoModal from '../../components/Modals/infoModal';
import { database } from '../../config/firebase';
import { ref, set, get } from "firebase/database";

function TrainingPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const { getWorkout } = useCourses();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [progress, setProgress] = useState<{ [key: string]: number }>({});
  const videoRef = useRef<HTMLIFrameElement>(null);

  const location = useLocation();
  const { course, workoutNumber } = location.state || {};

  const fetchWorkout = useCallback(async () => {
    if (id && user) {
      try {
        setLoading(true);
        const workoutData = await getWorkout(id);
        setWorkout(workoutData);
        if (user) {
          const progressRef = ref(database, `userProgress/${user.uid}/${id}`);
          const snapshot = await get(progressRef);
          if (snapshot.exists()) {
            setProgress(snapshot.val());
          }
        }
      } catch (error) {
        console.error('Error fetching workout:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [id, user, getWorkout]);

  useEffect(() => {
    if (!authLoading) {
      fetchWorkout();
    }
  }, [authLoading, fetchWorkout]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'videoStarted' && workout && user) {
        handleAutoSaveProgress();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [workout, user]);

  const handleAutoSaveProgress = useCallback(async () => {
    if (!user || !id || !workout) return;
    try {
      const progressRef = ref(database, `userProgress/${user.uid}/${id}`);
      let newProgress: { [key: string]: number };
      if (!workout.exercises || workout.exercises.length === 0) {
        newProgress = { completed: 100 };
      } else {
        newProgress = workout.exercises.reduce((acc, exercise) => {
          acc[exercise.name] = 0;
          return acc;
        }, {} as { [key: string]: number });
      }
      await set(progressRef, newProgress);
      setProgress(newProgress);
      console.log('Progress auto-saved:', newProgress);
    } catch (error) {
      console.error('Error auto-saving progress:', error);
    }
  }, [user, id, workout]);

  const handleOpenProgressModal = () => {
    console.log(workout) //DEV
    setIsProgressModalOpen(true);
  };

  const handleCloseProgressModal = () => {
    setIsProgressModalOpen(false);
  };

  const handleSaveProgress = async (newProgress: { [key: string]: number }) => {
    if (!user || !id) return;
    try {
      const validProgress = Object.entries(newProgress).reduce((acc, [key, value]) => {
        if (!isNaN(value) && isFinite(value)) {
          acc[key] = Math.max(0, Math.min(value, 100));
        }
        return acc;
      }, {} as { [key: string]: number });

      const progressRef = ref(database, `userProgress/${user.uid}/${id}`);
      await set(progressRef, validProgress);
      setProgress(validProgress);
      setIsProgressModalOpen(false);
      setIsInfoModalOpen(true);
      setTimeout(() => {
        setIsInfoModalOpen(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };
  const isProgressZero = () => {
    if (!workout) return true;
    if (!workout.exercises || workout.exercises.length === 0) {
      return !progress.completed;
    }
    return Object.values(progress).every(value => value === 0);
  };

  const renderExercises = () => {
    if (!workout || !workout.exercises) return null;

    return workout.exercises.map((exercise: Exercise) => {
      const exerciseProgress = progress[exercise.name] || 0;
      const progressPercentage = Math.round((exerciseProgress / exercise.quantity) * 100);

      return (
        <div key={exercise.name} className="mt-4 ">
          <p className="text-[18px] font-normal">
            {exercise.name.split('(')[0].trim()} {progressPercentage}%
          </p>
          <div className="w-full bg-[#F7F7F7] rounded-full h-2.5 mt-2">
            <div
              className="bg-[#00C1FF] h-2.5 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      );
    });
  };

  if (authLoading || loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Пожалуйста, авторизуйтесь для просмотра тренировки</div>;
  }

  if (!workout) {
    return <div>Тренировка не найдена</div>;
  }

  return (
		<React.Fragment>
			<main className='mt-[60px]'>
				<h1 className='text-[60px] mobile:text-[32px] font-medium leading-[60px] mobile:leading-[35.2px] text-left font-roboto mb-[24px]'>
					{String(course)}
				</h1>
				<Link
					to='/user'
					className='font-roboto text-2xl font-normal leading-[35.2px] underline text-left'
				>
					{workout.name}
				</Link>
				<iframe
					className='mt-[40px] rounded-[30px]'
					ref={videoRef}
					width='100%'
					height={500}
					src={`https://www.youtube.com/embed/${workout?.video}?enablejsapi=1`}
					title={workout?.name}
					frameBorder='0'
					allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
					allowFullScreen
				></iframe>
				<section className='flex flex-col mobile:items-center w-[100%] p-[40px] mt-[40px] mb-[60px] rounded-[30px] shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)]'>
					<h3 className='text-[24px] font-medium mb-4'>
						Упражнения тренировки {workoutNumber}
					</h3>
					<div className='w-full grid grid-cols-[repeat(auto-fill,minmax(260px,3fr))] gap-y-[20px] gap-x-[60px]'>
						{renderExercises()}
					</div>
					<button
						onClick={handleOpenProgressModal}
						className='w-[320px] h-[52px] mobile:w-[283px] bg-[#BCEC30] text-black rounded-[46px] font-roboto text-[18px] font-normal leading-[19.8px] mt-8'
					>
						{isProgressZero()
							? 'Заполнить свой прогресс'
							: 'Обновить свой прогресс'}
					</button>
				</section>
				<ProgressModal
					isOpen={isProgressModalOpen}
					onClose={handleCloseProgressModal}
					exercises={workout.exercises || []}
					onSave={handleSaveProgress}
					initialProgress={progress}
				/>
				<InfoModal
					isOpen={isInfoModalOpen}
					onClose={() => setIsInfoModalOpen(false)}
					message='Ваш прогресс засчитан!'
					type='progress'
				/>
			</main>
		</React.Fragment>
	)
}

export default TrainingPage;