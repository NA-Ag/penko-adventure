/**
 * DialogueBubble Component
 *
 * Renders character dialogue in Facade mode with visual polish
 * Supports Grace, Trip, and environmental cues
 */

import React from 'react';
import { AnimationCue } from '../../types/facade';

export interface DialogueBubbleProps {
  character: 'grace' | 'trip' | 'player' | 'environment';
  dialogue: string;
  position?: 'left' | 'right' | 'center';
  isTyping?: boolean;
}

export const DialogueBubble: React.FC<DialogueBubbleProps> = ({
  character,
  dialogue,
  position = 'center',
  isTyping = false,
}) => {
  // Determine character color scheme
  const getCharacterTheme = () => {
    switch (character) {
      case 'grace':
        return {
          bg: 'bg-purple-100 dark:bg-purple-900',
          border: 'border-purple-300 dark:border-purple-700',
          text: 'text-purple-900 dark:text-purple-100',
          name: 'Grace',
          nameColor: 'text-purple-700 dark:text-purple-300',
        };
      case 'trip':
        return {
          bg: 'bg-blue-100 dark:bg-blue-900',
          border: 'border-blue-300 dark:border-blue-700',
          text: 'text-blue-900 dark:text-blue-100',
          name: 'Trip',
          nameColor: 'text-blue-700 dark:text-blue-300',
        };
      case 'player':
        return {
          bg: 'bg-green-100 dark:bg-green-900',
          border: 'border-green-300 dark:border-green-700',
          text: 'text-green-900 dark:text-green-100',
          name: 'You',
          nameColor: 'text-green-700 dark:text-green-300',
        };
      case 'environment':
        return {
          bg: 'bg-gray-100 dark:bg-gray-800',
          border: 'border-gray-300 dark:border-gray-600',
          text: 'text-gray-700 dark:text-gray-300',
          name: '',
          nameColor: 'text-gray-600 dark:text-gray-400',
        };
    }
  };

  const theme = getCharacterTheme();

  // Position classes
  const positionClasses = {
    left: 'mr-auto',
    right: 'ml-auto',
    center: 'mx-auto',
  };

  return (
    <div
      className={`
        max-w-2xl mb-4 px-6 py-4 rounded-2xl border-2 shadow-lg
        ${theme.bg} ${theme.border} ${positionClasses[position]}
        transform transition-all duration-300 ease-in-out
        hover:scale-105
      `}
    >
      {/* Character Name */}
      {theme.name && (
        <div className={`text-sm font-bold mb-2 ${theme.nameColor}`}>
          {theme.name}
        </div>
      )}

      {/* Dialogue Text */}
      <div className={`text-lg leading-relaxed ${theme.text}`}>
        {isTyping ? (
          <span className="flex items-center gap-2">
            {dialogue}
            <span className="animate-pulse">...</span>
          </span>
        ) : (
          dialogue
        )}
      </div>
    </div>
  );
};

/**
 * Multi-bubble component for showing multiple dialogue lines at once
 */
export interface DialogueSequenceProps {
  cues: AnimationCue[];
}

export const DialogueSequence: React.FC<DialogueSequenceProps> = ({ cues }) => {
  // Filter only speak cues
  const speakCues = cues.filter((cue) => cue.cueType === 'speak');

  if (speakCues.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 w-full px-4">
      {speakCues.map((cue, index) => {
        const dialogue = cue.data.dialogue || '';
        const position =
          cue.character === 'grace'
            ? 'left'
            : cue.character === 'trip'
            ? 'right'
            : 'center';

        return (
          <DialogueBubble
            key={`${cue.character}-${index}`}
            character={cue.character as 'grace' | 'trip' | 'player' | 'environment'}
            dialogue={dialogue}
            position={position}
          />
        );
      })}
    </div>
  );
};
