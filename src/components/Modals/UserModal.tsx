import React, { useRef, useEffect, RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRef: RefObject<HTMLDivElement>;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, userRef }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        userRef.current &&
        !userRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, userRef]);

  if (!isOpen || !user) return null;

  const handleProfileClick = () => {
    navigate('/user');
    onClose();
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div ref={modalRef} className="absolute z-10 right-0 top-full mt-[50px] w-[266px] h-[266px] bg-white shadow-modal rounded-[30px] flex flex-col items-center p-[30px] gap-[34px] sm:right-0 md:right-0 lg:right-0 sm:w-[260px] md:w-[260px] lg:w-[266px]">
      <div className="flex flex-col items-center gap-2 w-full">
        <span className="font-roboto text-[18px] leading-[110%] text-black">
          {user.displayName || user.email?.split('@')[0]}
        </span>
        <span className="font-roboto text-[16px] leading-[110%] text-gray">
          {user.email}
        </span>
      </div>
      <div className="flex flex-col gap-2 w-full">
        <button onClick={handleProfileClick} className="w-full h-[52px] bg-primary rounded-[46px] font-roboto text-[18px] leading-[110%] text-black">
          Мой профиль
        </button>
        <button onClick={handleLogout} className="w-full h-[52px] border border-black rounded-[46px] font-roboto text-[18px] leading-[110%] text-black">
          Выйти
        </button>
      </div>
    </div>
  );
};

export default UserModal;