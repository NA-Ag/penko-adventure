/**
 * Character Component
 *
 * Renders an animated character sprite for Grace or Trip
 * Displays character position, mood, and current animation state
 */

import React, { useEffect, useState } from 'react';
import { CharacterState } from '../../types/facade';

export interface CharacterProps {
  name: 'grace' | 'trip';
  state: CharacterState;
  isActive?: boolean; // Currently speaking
  onClick?: () => void;
}

export const Character: React.FC<CharacterProps> = ({
  name,
  state,
  isActive = false,
  onClick,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // Trigger animation when character becomes active
  useEffect(() => {
    if (isActive) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  // Character visual configuration
  const getCharacterVisual = () => {
    if (name === 'grace') {
      return {
        color: 'from-purple-400 to-purple-600',
        activeColor: 'from-purple-500 to-purple-700',
        icon: '👩',
        displayName: 'Grace',
      };
    } else {
      return {
        color: 'from-blue-400 to-blue-600',
        activeColor: 'from-blue-500 to-blue-700',
        icon: '👨',
        displayName: 'Trip',
      };
    }
  };

  const visual = getCharacterVisual();

  // Mood indicator color
  const getMoodColor = (mood: number): string => {
    if (mood > 70) return 'text-green-500';
    if (mood > 40) return 'text-yellow-500';
    if (mood > 20) return 'text-orange-500';
    return 'text-red-500';
  };

  // Affinity indicator
  const getAffinityLabel = (affinity: number): string => {
    if (affinity > 70) return 'Friendly';
    if (affinity > 40) return 'Neutral';
    if (affinity > 10) return 'Cool';
    return 'Distant';
  };

  return (
    <div
      className={`
        relative flex flex-col items-center p-6 rounded-2xl
        bg-gradient-to-br ${isActive ? visual.activeColor : visual.color}
        shadow-xl transition-all duration-300
        ${isActive ? 'scale-110 ring-4 ring-white ring-opacity-50' : 'scale-100'}
        ${isAnimating ? 'animate-bounce' : ''}
        ${onClick ? 'cursor-pointer hover:scale-105' : ''}
      `}
      onClick={onClick}
    >
      {/* Character Icon */}
      <div className="text-6xl mb-3 drop-shadow-lg">{visual.icon}</div>

      {/* Character Name */}
      <div className="text-white font-bold text-xl mb-2">{visual.displayName}</div>

      {/* Position Badge */}
      <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-white text-sm mb-3 backdrop-blur-sm">
        📍 {state.position}
      </div>

      {/* Stats */}
      <div className="w-full space-y-2 text-white text-sm">
        {/* Mood */}
        <div className="flex items-center justify-between">
          <span className="opacity-90">Mood:</span>
          <span className={`font-bold ${getMoodColor(state.mood)}`}>
            {state.mood}%
          </span>
        </div>

        {/* Affinity to Player */}
        <div className="flex items-center justify-between">
          <span className="opacity-90">Affinity:</span>
          <span className="font-bold">
            {getAffinityLabel(state.affinityToPlayer)}
          </span>
        </div>

        {/* Active Goal */}
        {state.activeGoals.length > 0 && (
          <div className="mt-3 pt-2 border-t border-white border-opacity-30">
            <div className="text-xs opacity-75 mb-1">Goal:</div>
            <div className="text-xs font-medium">{state.activeGoals[0]}</div>
          </div>
        )}

        {/* Held Object */}
        {state.heldObject && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white border-opacity-30">
            <span className="text-xs opacity-75">Holding:</span>
            <span className="text-xs font-medium">{state.heldObject}</span>
          </div>
        )}
      </div>

      {/* Active Indicator */}
      {isActive && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full animate-ping" />
      )}
    </div>
  );
};

/**
 * Character Pair Component
 * Shows both Grace and Trip side-by-side
 */
export interface CharacterPairProps {
  graceState: CharacterState;
  tripState: CharacterState;
  activeCharacter?: 'grace' | 'trip' | null;
  onCharacterClick?: (character: 'grace' | 'trip') => void;
}

export const CharacterPair: React.FC<CharacterPairProps> = ({
  graceState,
  tripState,
  activeCharacter = null,
  onCharacterClick,
}) => {
  return (
    <div className="flex gap-8 justify-center items-center p-8">
      <Character
        name="grace"
        state={graceState}
        isActive={activeCharacter === 'grace'}
        onClick={onCharacterClick ? () => onCharacterClick('grace') : undefined}
      />

      <Character
        name="trip"
        state={tripState}
        isActive={activeCharacter === 'trip'}
        onClick={onCharacterClick ? () => onCharacterClick('trip') : undefined}
      />
    </div>
  );
};
