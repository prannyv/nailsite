import React from 'react';
import { PressOnCard } from './PressOnCard';
import { useStore } from '../../store/useStore';
import type { PressOn } from '../../types/presson';

interface PressOnListProps {
  onEditPressOn: (pressOn: PressOn) => void;
}

export const PressOnList: React.FC<PressOnListProps> = ({ onEditPressOn }) => {
  const pressOns = useStore((state) => state.pressOns);
  const deletePressOn = useStore((state) => state.deletePressOn);
  
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        Press-Ons Inventory
      </h3>
      {pressOns.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {pressOns.map((pressOn) => (
            <PressOnCard
              key={pressOn.id}
              pressOn={pressOn}
              onEdit={onEditPressOn}
              onDelete={deletePressOn}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm italic">No press-ons in inventory</p>
      )}
    </div>
  );
};

