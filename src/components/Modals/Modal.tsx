import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../Button';
import InfoModal from './infoModal';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'login' | 'register' | 'resetPassword' | 'newPassword';
  onSwitchType: (newType: 'login' | 'register' | 'resetPassword') => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, type, onSwitchType }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const { register, login, resetUserPassword, changeUserPassword } = useAuth();

  const resetForm = useCallback(() => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setIsLoading(false);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isResetPasswordModalOpen) {
      timer = setTimeout(() => {
        setIsResetPasswordModalOpen(false);
        setResetEmail('');
      }, 1000); // Закрываем через 1 секунду
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isResetPasswordModalOpen]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.(ru|com)$/i;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 5 && /\d/.test(password);
  };

  const validateForm = () => {
    if (type === 'newPassword') {
      if (!password) {
        setError('Пожалуйста, введите новый пароль');
        return false;
      }
      if (!validatePassword(password)) {
        setError('Пароль должен содержать не менее 5 символов, хотя бы одну цифру');
        return false;
      }
      if (password !== confirmPassword) {
        setError('Пароли не совпадают');
        return false;
      }
    } else {
      if (!email) {
        setError('Пожалуйста, введите логин');
        return false;
      }
      if (!validateEmail(email)) {
        setError('Пожалуйста, введите корректный email с доменом .ru или .com');
        return false;
      }
      if (type !== 'resetPassword') {
        if (!password) {
          setError('Пожалуйста, введите пароль');
          return false;
        }
        if (!validatePassword(password)) {
          setError('Пароль должен содержать не менее 5 символов, хотя бы одну цифру');
          return false;
        }
      }
      if (type === 'register' && password !== confirmPassword) {
        setError('Пароли не совпадают');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (validateForm()) {
      setIsLoading(true);
      try {
        switch (type) {
          case 'login':
            await login(email, password);
            setSuccess('Вход выполнен успешно');
            setTimeout(() => {
              handleClose();
            }, 1000);
            break;
          case 'register':
            try {
              await register(email, password);
              setSuccess('Регистрация прошла успешно');
              setTimeout(() => {
                handleClose();
              }, 1000);
            } catch (err) {
              if (err instanceof Error) {
                if (err.message.includes('email-already-in-use')) {
                  setError('Данная почта уже используется. Попробуйте войти.');
                } else {
                  setError(err.message);
                }
              } else {
                setError('Произошла ошибка при регистрации.');
              }
            }
            break;
          case 'resetPassword':
            try {
              await resetUserPassword(email);
              setResetEmail(email);
              handleClose();
              setIsResetPasswordModalOpen(true);
            } catch (error) {
              console.error('Error in password reset:', error);
              setError('Ошибка при отправке письма для сброса пароля. Пожалуйста, попробуйте еще раз.');
            }
            break;
          case 'newPassword':
            try {
              await changeUserPassword(password);
              setSuccess('Пароль успешно изменен');
              setTimeout(() => {
                handleClose();
              }, 2000);
            } catch (err) {
              if (err instanceof Error) {
                setError(`Ошибка при смене пароля: ${err.message}`);
              } else {
                setError('Произошла неизвестная ошибка при смене пароля.');
              }
            }
            break;
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Произошла ошибка. Попробуйте позже.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSwitchType = (newType: 'login' | 'register' | 'resetPassword') => {
    resetForm();
    onSwitchType(newType);
  };

  const renderErrorMessage = () => {
    if (error) {
      return (
        <p className="w-[280px] font-roboto text-[14px] leading-[110%] text-center text-[#DB0030] flex-none order-2 flex-grow-0">
          {error}{' '}
          {type === 'login' && (
            <span
              className="text-blue-500 cursor-pointer hover:underline"
              onClick={() => handleSwitchType('resetPassword')}
            >
              Восстановить пароль?
            </span>
          )}
        </p>
      );
    }
    return null;
  };

  if (!isOpen && !isResetPasswordModalOpen) return null;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleClose}>
          <div className="bg-white shadow-lg rounded-[30px] p-10 w-full max-w-[360px]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-center mb-12">
              <img src="/logo.png" alt="SkyFitnessPro" className="w-[220px] h-[35px]" loading="lazy"/>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-[34px]">
              <div className="flex flex-col gap-2.5">
                {type !== 'newPassword' && (
                  <input
                    type="email"
                    placeholder="Логин"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-[52px] pt-4 pr-[18px] pb-4 pl-[18px] border border-[#D0CECE] rounded-lg text-[18px] leading-[19.8px] text-black placeholder-[#D0CECE]"
                    required
                  />
                )}
                {type !== 'resetPassword' && (
                  <input
                    type="password"
                    placeholder={type === 'newPassword' ? "Новый пароль" : "Пароль"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-[52px] pt-4 pr-[18px] pb-4 pl-[18px] border border-[#D0CECE] rounded-lg text-[18px] leading-[19.8px] text-black placeholder-[#D0CECE]"
                    required
                  />
                )}
                {(type === 'register' || type === 'newPassword') && (
                  <input
                    type="password"
                    placeholder="Повторите пароль"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-[52px] pt-4 pr-[18px] pb-4 pl-[18px] border border-[#D0CECE] rounded-lg text-[18px] leading-[19.8px] text-black placeholder-[#D0CECE]"
                    required
                  />
                )}
                {renderErrorMessage()}
                {success && (
                  <p className="w-[280px] h-[30px] font-roboto text-[14px] leading-[110%] text-center text-green-500 flex-none order-2 flex-grow-0">
                    {success}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2.5">
                <Button type="submit" variant="primary" className="w-full h-[52px]" disabled={isLoading}>
                  {type === 'login' ? 'Войти' : type === 'register' ? 'Зарегистрироваться' : type === 'resetPassword' ? 'Сбросить пароль' : 'Подтвердить'}
                </Button>
                {type === 'login' && (
                  <Button variant="secondary" className="w-full h-[52px]" onClick={() => handleSwitchType('register')} disabled={isLoading}>
                    Зарегистрироваться
                  </Button>
                )}
                {type === 'register' && (
                  <Button variant="secondary" className="w-full h-[52px]" onClick={() => handleSwitchType('login')} disabled={isLoading}>
                    Войти
                  </Button>
                )}
                {type === 'resetPassword' && (
                  <Button variant="secondary" className="w-full h-[52px]" onClick={() => handleSwitchType('login')} disabled={isLoading}>
                    Вернуться к входу
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
      <InfoModal
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
        message={`Запрос на сброс пароля отправлен на ${resetEmail}`}
        type="resetPassword"
        email={resetEmail}
      />
    </>
  );
};

export default Modal;