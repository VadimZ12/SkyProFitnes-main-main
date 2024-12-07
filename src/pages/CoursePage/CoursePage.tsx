import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Button from '../../components/Button';
import { useCoursesContext } from '../../context/CoursesContext';
import { useAuth } from '../../hooks/useAuth';
import { Course } from '../../types/interfaces';
import InfoModal from '../../components/Modals/infoModal';
import Modal from '../../components/Modals/Modal';
import Footer from '../../components/Footer';
import { database } from '../../config/firebase';
import { ref, get } from "firebase/database";

function CoursePage() {
	const { id } = useParams<{ id: string }>();
	const { user } = useAuth();
	const { getCourse, addCourse } = useCoursesContext();
	const [course, setCourse] = useState<Course | null>(null);
	const [loading, setLoading] = useState(true);
	const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
	const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
	const [infoMessage, setInfoMessage] = useState('');
	const previousId = useRef<string | null>(null);
	const [modalType, setModalType] = useState<'login' | 'register' | 'resetPassword'>('login');

	const handleSwitchModalType = useCallback((newType: 'login' | 'register' | 'resetPassword') => {
		setModalType(newType);
	}, []);

	useEffect(() => {
		const fetchCourse = async () => {
			if (id && id !== previousId.current) {
				setLoading(true);
				try {
					const courseData = await getCourse(id);
					setCourse(courseData);
				} catch (error) {
					console.error('Ошибка получения курса:', error);
				} finally {
					setLoading(false);
				}
				previousId.current = id;
			}
		};
		fetchCourse();
	}, [id, getCourse]);

	const handleAddCourse = async () => {
		if (user && id) {
			try {
				const userCoursesRef = ref(database, `userCourses/${user.uid}`);
				const snapshot = await get(userCoursesRef);
				if (snapshot.exists()) {
					const userCourses = snapshot.val();
					if (userCourses.includes(id)) {
						setInfoMessage('Этот курс уже добавлен');
						setIsInfoModalOpen(true);
						return;
					}
				}
				await addCourse(id);
				setInfoMessage('Курс успешно добавлен!');
				setIsInfoModalOpen(true);
			} catch (error) {
				console.error('Error adding course:', error);
				setInfoMessage('Не удалось добавить курс. Попробуйте еще раз.');
				setIsInfoModalOpen(true);
			}
		} else {
			setIsLoginModalOpen(true);
		}
	};

	if (loading) {
		return <div>Загрузка...</div>;
	}

	if (!course) {
		return <div>Курс не найден</div>;
	}

	return (
		<main className='relative mt-[60px]'>
			<div className='mb-[60px] w-full h-[310px] rounded-[30px] bg-[#FFC700] relative overflow-hidden mobile:h-[557px] mobile:mb-[30px]'>
				<h2 className='pt-[40px] ml-[40px] leading-[66px] text-[60px] font-medium text-white flex items-center text-center relative z-10 mobile:hidden'>
					{course.nameRU}
				</h2>
				<img
					src={`/images/${course.nameEN}.png`}
					alt={course.nameRU}
					className='absolute right-0 top-0 w-full h-full object-cover z-0'
					loading='lazy'
				/>
				<img
					src={`/images/${course.nameEN}.png`}
					srcSet={`/images/${course.nameEN}_small.png 300w, /images/${course.nameEN}_medium.png 600w, /images/${course.nameEN}.png 900w`}
					sizes='(max-width: 600px) 300px, (max-width: 1200px) 600px, 900px'
					alt={course.nameRU}
					className='hidden mobile:block absolute w-full h-full object-cover '
					loading='lazy'
				/>
			</div>
			<section>
				<div className='text-left mb-[60px] mobile:mb-[30px]'>
					<h3 className='text-[40px] font-semibold leading-[44px] text-left mb-[40px] mobile:text-[24px] mobile:mb-[24px]'>
						Подойдет для вас, если:
					</h3>
					<div className='flex justify-between gap-[17px] tablet:flex-wrap tablet:gap-[12px] mobile:flex-col mobile:gap-[10px] max-w-full'>
						{course.fitting &&
							course.fitting.map((fit, index) => (
								<div
									key={index}
									className='flex-grow-[1] flex-shrink-0 basis-0 flex items-center p-[20px] text-white rounded-[28px] text-center gap-[25px] bg-gradient-to-r from-[#151720] to-[#1E212E] relative overflow-hidden min-h-[160px]'
								>
									<span className='w-[43px] h-[101px] font-roboto text-[75px] font-medium leading-[101.25px] text-left text-[#BCEC30]'>
										{index + 1}
									</span>
									<p className='text-left font-roboto text-[24px] font-normal leading-[26.4px] mobile:text-[20px] mobile:leading-[24px]'>
										{fit}
									</p>
								</div>
							))}
					</div>
				</div>
			</section>

			<section className='text-left mb-[102px] mobile:mb-[156px]'>
				<h3 className='text-[40px] font-semibold leading-[44px] mb-[40px] mobile:text-[24px] mobile:mb-[24px]'>
					Направления
				</h3>
				<ul className='bg-[#BCEC30] grid grid-cols-3 rounded-[28px] h-[146px] p-[30px] gap-x-[85px] gap-y-[30px] tablet:grid-cols-2 tablet:pr-[200px] mobile:grid-cols-1 mobile:h-auto mobile:gap-y-[20px]'>
					{course.directions &&
						course.directions.map((direction, index) => (
							<li key={index} className='flex items-center gap-[8px]'>
								<img
									src='/images/sparcle.png'
									alt='Icon'
									className='w-[26px] h-[26px]'
									loading='lazy'
								/>
								<p className='m-0 font-roboto text-[24px] leading-[26.4px] mobile:text-[18px]'>
									{direction}
								</p>
							</li>
						))}
				</ul>
			</section>

			<section className='relative rounded-[30px] mb-[50px] overflow-hidden bg-white mobile:overflow-visible mobile:flex mobile:justify-center mobile:z-[5]'>
				<div className='relative pl-[40px] pt-[40px] pb-[40px] flex flex-col gap-[28px] z-[2] w-[477px] tablet:w-[477px] mobile:w-[343px]'>
					<h3 className='font-roboto text-[60px] font-medium leading-[60px] text-left mobile:text-[32px] mobile:leading-[35.2px] tablet:text-[50px] tablet:leading-[50px]'>
						Начните путь <br />к новому телу
					</h3>
					<ul className='list-disc flex flex-col gap-[10px] pl-[33px] marker:text-[16px]'>
						<li className='font-roboto text-[24px] font-normal leading-[26.4px] text-left text-[#777777] mobile:text-[18px] tablet:text-[24px]'>
							проработка всех групп мышц
						</li>
						<li className='font-roboto text-[24px] font-normal leading-[26.4px] text-left text-[#777777] mobile:text-[18px] tablet:text-[24px]'>
							тренировка суставов
						</li>
						<li className='font-roboto text-[24px] font-normal leading-[26.4px] text-left text-[#777777] mobile:text-[18px] tablet:text-[24px]'>
							улучшение циркуляции крови
						</li>
						<li className='font-roboto text-[24px] font-normal leading-[26.4px] text-left text-[#777777] mobile:text-[18px] tablet:text-[24px]'>
							упражнения заряжают бодростью
						</li>
						<li className='font-roboto text-[24px] font-normal leading-[26.4px] text-left text-[#777777] mobile:text-[18px] tablet:text-[24px]'>
							помогают противостоять стрессам
						</li>
					</ul>
					<Button
						variant='primary'
						className='w-[437px] h-[52px] tablet:w-[437px] mobile:w-[283px] mobile:h-[50px]'
						onClick={handleAddCourse}
					>
						{user ? 'Добавить курс' : 'Войти и добавить курс'}
					</Button>{' '}
				</div>
				<img
					src='/images/6094.png'
					alt='Черный'
					className='absolute bottom-[410px] right-[385px] mobile:w-[32.16px] mobile:h-[27.33px] mobile:top-[-183px] mobile:right-[154px] mobile:z-[3]'
					loading='lazy'
				/>
				<img
					src='/images/6084.png'
					alt='Салатовый'
					className='absolute top-[105px] right-[15px] w-[670.18px] h-[440.98px] order-3 mobile:hidden'
					loading='lazy'
				/>
			</section>

			<img
				src='/images/runner.png'
				alt='Бегун'
				className='absolute bottom-[160px] right-[40px] z-[3] mobile:w-[313.22px] mobile:h-[348.91px] mobile:bottom-[520px] mobile:right-[-69px] mobile:z-[1]'
				loading='lazy'
			/>
			<img
				src='/images/6084.png'
				alt='Салатовый_2'
				className='hidden mobile:block absolute mobile:w-[750.93px] mobile:h-[300px] mobile:bottom-[450px] mobile:right-[27px]'
				loading='lazy'
			/>
			<InfoModal
				isOpen={isInfoModalOpen}
				onClose={() => setIsInfoModalOpen(false)}
				message={infoMessage}
				type='progress'
			/>
			<Modal
				isOpen={isLoginModalOpen}
				onClose={() => setIsLoginModalOpen(false)}
				type={modalType}
				onSwitchType={handleSwitchModalType}
			/>
			<Footer />
		</main>
	)
}

export default CoursePage;