import React, { useEffect } from 'react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  type: 'progress' | 'resetPassword';
  email?: string;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, message, type, email }) => {
  useEffect(() => {
    if (isOpen && type === 'progress') {
      const timer = setTimeout(() => {
        onClose();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, type]);

  if (!isOpen) return null;

  const baseStyles = `
    fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50
  `;

  const modalStyles = `
    bg-white flex flex-col items-center rounded-[30px]
    shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)]
    ${type === 'progress' ? 'w-[444px] h-[360px] p-[33px] gap-[34px]' : 'w-[360px] h-[223px] p-[40px] gap-[48px]'}
`;

  const iconStyles = `
    w-[68px] h-[68px] ${type === 'progress' ? 'text-[#BCEC30]' : 'text-[#271A58]'}
  `;

  const textStyles = `
    font-roboto text-[40px] font-[450] leading-[48px] text-center mb-[30px]
  `;
  return (
    <div className={baseStyles}>
      <div className={modalStyles}>
        {type === 'progress' ? (
          <>
            <p className={textStyles}>{message}</p>
            <svg className={iconStyles} viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M34 0C15.2452 0 0 15.2452 0 34C0 52.7548 15.2452 68 34 68C52.7548 68 68 52.7548 68 34C68 15.2452 52.7548 0 34 0ZM27.2 51L10.2 34L15.1294 29.206L27.2 41.1378L52.8706 15.5668L57.8 20.4L27.2 51Z" fill="currentColor"/>
            </svg>
          </>
        ) : (
          <>
            <img src="/logo.png" alt="SkyFitnessPro" className="w-[220px] h-[35px]" loading="lazy" />
            <p className="text-center font-roboto text-[18px] leading-[22px]">
              Ссылка для восстановления<br />пароля отправлена<br />на {email}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default InfoModal;