import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import { CoursesProvider } from './context/CoursesContext';
import { useAuth } from './hooks/useAuth';
import Modal from './components/Modals/Modal';

const MainPage = React.lazy(() => import('./pages/MainPage/MainPage').then(module => ({ default: module.default })));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage/ProfilePage').then(module => ({ default: module.default })));
const CoursePage = React.lazy(() => import('./pages/CoursePage/CoursePage').then(module => ({ default: module.default })));
const TrainingPage = React.lazy(() => import('./pages/TrainingPage/TrainingPage').then(module => ({ default: module.default })));

function App() {
  const [isModalSigninOpen, setIsModalSigninOpen] = useState(false);
  const [modalType, setModalType] = useState<'login' | 'register' | 'resetPassword' | 'newPassword'>('login');
  const { logout } = useAuth();

  const handleSwitchModalType = useCallback((newType: 'login' | 'register' | 'resetPassword' | 'newPassword') => {
    setModalType(newType);
  }, []);

  const handleLoginClick = useCallback(() => {
    setModalType('login');
    setIsModalSigninOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalSigninOpen(false);
  }, []);

  useEffect(() => {
    const checkInactivity = () => {
      const lastActivity = localStorage.getItem('lastActivity');
      if (lastActivity) {
        const inactiveTime = Date.now() - parseInt(lastActivity);
        if (inactiveTime > 3 * 60 * 1000) { // 3 минуты
          logout();
        }
      }
    };

    // Проверяем неактивность при загрузке приложения
    checkInactivity();

    // Устанавливаем интервал для регулярной проверки
    const intervalId = setInterval(checkInactivity, 60000); // Проверка каждую минуту

    return () => clearInterval(intervalId);
  }, [logout]);

  return (
    <CoursesProvider>
      <div 
        style={{ paddingLeft: 'max(16px, calc(50% - 634px))', paddingRight: 'max(16px, calc(50% - 634px))' }}
        className='bg-background min-h-screen flex flex-col pb-page-padding overflow-x-hidden'>
        <Header onLoginClick={handleLoginClick} />
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path='/' element={<MainPage />} />
            <Route path='/user' element={<ProfilePage />} />
            <Route path='/course/:id' element={<CoursePage />} />
            <Route path='/course' element={<CoursePage />} />
            <Route path='/training/' element={<TrainingPage />} />
            <Route path='/training/:id' element={<TrainingPage />} />
          </Routes>
        </Suspense>
        <Modal isOpen={isModalSigninOpen} onClose={handleCloseModal} type={modalType} onSwitchType={handleSwitchModalType} />
      </div>
    </CoursesProvider>
  );
}
export default App;