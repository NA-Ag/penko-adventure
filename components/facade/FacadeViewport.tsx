/**
 * FacadeViewport Component
 *
 * Main UI viewport for Facade interactive drama mode
 * Coordinates character display, dialogue, and player input
 */

import React, { useState, useEffect } from 'react';
import { FacadeEngine } from '../../services/FacadeEngine';
import { CharacterPair } from './Character';
import { DialogueSequence } from './DialogueBubble';
import { AnimationCue } from '../../types/facade';
import { GameTurnData } from '../../types';

export interface FacadeViewportProps {
  engine: FacadeEngine;
  onStartSession: () => void;
  isSessionActive: boolean;
}

export const FacadeViewport: React.FC<FacadeViewportProps> = ({
  engine,
  onStartSession,
  isSessionActive,
}) => {
  const [currentDialogue, setCurrentDialogue] = useState<AnimationCue[]>([]);
  const [activeCharacter, setActiveCharacter] = useState<'grace' | 'trip' | null>(null);
  const [playerInput, setPlayerInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [turnData, setTurnData] = useState<GameTurnData | null>(null);

  // Get character states from engine
  const worldState = engine.getWorldState();
  const graceState = worldState?.characters?.grace;
  const tripState = worldState?.characters?.trip;

  // Update active character based on dialogue
  useEffect(() => {
    if (currentDialogue.length > 0) {
      const lastSpeaker = currentDialogue[currentDialogue.length - 1];
      if (lastSpeaker.character === 'grace' || lastSpeaker.character === 'trip') {
        setActiveCharacter(lastSpeaker.character);

        // Clear active state after animation
        const timer = setTimeout(() => setActiveCharacter(null), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [currentDialogue]);

  // Handle player input submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerInput.trim() || isProcessing || !isSessionActive) return;

    setIsProcessing(true);

    try {
      // Process turn through engine
      const result = await engine.processTurn(playerInput);

      setTurnData(result);
      setPlayerInput('');

      // Extract dialogue cues from narrative
      // For now, we'll display the narrative as-is
      // In a full implementation, you'd parse AnimationCues from the engine

    } catch (error) {
      console.error('[FacadeViewport] Error processing turn:', error);
      alert('An error occurred. Please check the console.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle quick option click
  const handleOptionClick = async (option: string) => {
    setPlayerInput(option);
    // Auto-submit after a brief delay
    setTimeout(() => {
      const form = document.getElementById('facade-input-form') as HTMLFormElement;
      form?.requestSubmit();
    }, 100);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 shadow-lg">
        <h1 className="text-2xl font-bold">Grace & Trip's Apartment</h1>
        <p className="text-sm opacity-90">
          {isSessionActive
            ? engine.getCurrentBeatName() || 'Interactive Drama'
            : 'Ready to begin'}
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {!isSessionActive ? (
          /* Welcome Screen */
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="max-w-2xl space-y-6">
              <h2 className="text-4xl font-bold text-gray-800 dark:text-white">
                Welcome to Facade
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                You've been invited to dinner at Grace and Trip's apartment.
                What seems like a pleasant evening soon reveals tensions in their relationship.
              </p>
              <p className="text-md text-gray-500 dark:text-gray-400">
                Your words and actions will shape the story. Navigate the complex social dynamics
                as you interact with Grace and Trip in real-time.
              </p>
              <button
                onClick={onStartSession}
                className="mt-8 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xl font-bold rounded-full shadow-lg hover:scale-105 transition-transform"
              >
                Start Session
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 p-6">
            {/* Characters */}
            {graceState && tripState && (
              <CharacterPair
                graceState={graceState}
                tripState={tripState}
                activeCharacter={activeCharacter}
              />
            )}

            {/* Dialogue Display */}
            {turnData && turnData.narrative && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <div className="prose dark:prose-invert max-w-none">
                  {turnData.narrative.split('\n\n').map((line, index) => (
                    <p key={index} className="text-lg leading-relaxed mb-4">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Options */}
            {turnData?.playerOptions && turnData.playerOptions.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4 text-gray-700 dark:text-gray-200">
                  Quick Responses
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {turnData.playerOptions.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleOptionClick(option)}
                      disabled={isProcessing}
                      className="px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed text-left"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      {isSessionActive && (
        <div className="border-t border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-lg">
          <form id="facade-input-form" onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="text"
              value={playerInput}
              onChange={(e) => setPlayerInput(e.target.value)}
              placeholder="Type what you want to say..."
              disabled={isProcessing}
              className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isProcessing || !playerInput.trim()}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isProcessing ? 'Processing...' : 'Send'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
