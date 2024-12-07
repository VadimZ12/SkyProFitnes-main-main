import React from 'react'
        
interface LevelProps {
  value: number;
}

const Level: React.FC<LevelProps> = ({ value }) => {
  const maxLevel = 5;
  const filledBars = Math.min(Math.max(value, 0), maxLevel);

  return (
    <div className="flex gap-[0.75px] items-end h-[18px] w-[18px] p-[2px]">
      {[...Array(maxLevel)].map((_, index) => {
        const height = 3 + (index * 2.75); // Рассчитываем высоту для каждой полоски
        return (
          <div
            key={index}
            className={`w-[2.25px] rounded-[50px] ${
              index < filledBars ? 'bg-[#00C1FF]' : 'bg-[#D9D9D9]'
            }`}
            style={{ height: `${height}px` }}
          />
        );
      })}
    </div>
  );
};

export default Level;
