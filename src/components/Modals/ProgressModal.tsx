import React, { useState, useEffect } from 'react';
import { Exercise } from '../../types/interfaces';

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercises: Exercise[];
  onSave: (progress: { [key: string]: number }) => void;
  initialProgress: { [key: string]: number };
}

const ProgressModal: React.FC<ProgressModalProps> = ({ isOpen, onClose, exercises, onSave, initialProgress }) => {
  const [progress, setProgress] = useState<{ [key: string]: number }>(initialProgress);

  useEffect(() => {
    setProgress(initialProgress);
  }, [initialProgress]);

  if (!isOpen) return null;

  const handleInputChange = (exerciseName: string, value: string, maxQuantity: number) => {
    const numValue = Math.max(0, Math.min(parseInt(value) || 0, maxQuantity));
    setProgress(prev => ({ ...prev, [exerciseName]: numValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(progress);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white shadow-lg rounded-[30px] p-10 w-full max-w-[426px]">
        <h2 className="text-[32px] font-normal mb-[48px] text-center">Мой прогресс</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-[20px]">
          {exercises.length > 0 ? (
            exercises.map((exercise) => (
              <div key={exercise.name} className="flex flex-col gap-[10px]">
                <label className="text-[18px]">{`Сколько раз вы сделали ${exercise.name}?`}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="border border-[#D0CECE] rounded-[8px] p-[16px]"
                  placeholder="0"
                  value={progress[exercise.name] || ''}
                  onChange={(e) => handleInputChange(exercise.name, e.target.value, exercise.quantity)}
                />
              </div>
            ))
          ) : (
            <div className="flex flex-col gap-[10px]">
              <label className="text-[18px]">Завершили ли вы тренировку?</label>
              <select
                className="border border-[#D0CECE] rounded-[8px] p-[16px]"
                value={progress.completed ? "100" : "0"}
                onChange={(e) => setProgress({ completed: parseInt(e.target.value) })}
              >
                <option value="0">Нет</option>
                <option value="100">Да</option>
              </select>
            </div>
          )}
          <button type="submit" className="mt-[34px] bg-[#BCEC30] text-black rounded-[46px] py-[16px] px-[26px]">
            Сохранить
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProgressModal;