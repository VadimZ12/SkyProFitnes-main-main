import React from 'react'
import Modal from '../../components/Modals/Modal'
import { useAuth } from '../../hooks/useAuth'

function Profile() {
  const { user, logout, updateUser } = useAuth()
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [modalType, setModalType] = React.useState<'newPassword'>('newPassword')
  const [isEditing, setIsEditing] = React.useState(false)
  const [editedName, setEditedName] = React.useState(user?.customDisplayName || user?.displayName || user?.email?.split('@')[0] || '')
  const [saveMessage, setSaveMessage] = React.useState('')

  const handleChangePassword = () => {
    setModalType('newPassword')
    setIsModalOpen(true)
  }

	const handleLogout = async () => {
		try {
			await logout()
			window.location.href = '/'
		} catch (error) {
			console.error('Error logging out:', error)
		}
	}

  const handleSaveName = async () => {
    if (user) {
      try {
        await updateUser({ displayName: editedName });
        setIsEditing(false);
        setSaveMessage('Имя успешно сохранено');
        setTimeout(() => setSaveMessage(''), 3000);
      } catch (error) {
        console.error('Error updating display name:', error);
        setSaveMessage('Ошибка при сохранении имени');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    }
  };

  return (
    <section className='flex mobile:flex-col mobile:items-center gap-[33px] w-[100%] p-[30px] mt-[40px] mb-[60px] rounded-[30px] shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)]'>
      <img src={user?.photoURL || '/images/profile_no-img.png'} className='w-[197px] h-[197px] rounded-[30px] mobile:w-[141px] mobile:h-[141px]' loading="lazy"/>
      <div className='flex flex-col gap-[30px] mobile:w-full'>
        {isEditing ? (
          <div className='flex items-center'>
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className='text-left font-roboto text-[32px] font-medium leading-[35.2px] border-b-2 border-black focus:outline-none'
            />
            <button onClick={handleSaveName} className='ml-2 text-green'>
              Сохранить
            </button>
          </div>
        ) : (
          <h2 className='text-left font-roboto text-[32px] font-medium leading-[35.2px] flex items-center'>
            {user?.displayName || user?.email?.split('@')[0]}
            <button onClick={() => setIsEditing(true)} className='ml-2 text-gray'>
              ✎
            </button>
          </h2>
        )}
        {saveMessage && <p className="text-green">{saveMessage}</p>}
        <div className='flex flex-col gap-[10px] text-left font-roboto text-[18px] font-normal leading-[19.8px]'>
          <p>Логин: {user?.email || user?.login}</p>
          <p>Пароль: ********</p>
        </div>
        <div className='flex flex-wrap gap-[10px] mobile:flex-col'>
          <button onClick={handleChangePassword} className='w-[192px] mobile:w-full h-[52px] rounded-btnRad bg-green'>
            <p className='text-black font-roboto text-[18px] font-normal leading-[19.8px]'>
              Изменить пароль
            </p>
          </button>
          <button onClick={handleLogout} className='w-[192px] mobile:w-full h-[52px] rounded-btnRad bg-white border border-black'>
            <p className='text-black font-roboto text-[18px] font-normal leading-[19.8px]'>
              Выйти
            </p>
          </button>
        </div>
        </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} type={modalType} onSwitchType={() => {}} />
    </section>
  )
}

export default Profile