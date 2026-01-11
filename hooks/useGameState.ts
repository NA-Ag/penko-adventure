
import { useState, useEffect, useRef, useMemo } from 'react';
import { EngineFactory, GameEngineInstance } from '../services/EngineFactory';
import { GameState, UserProfile, ChatMessage, GameTurnData, GameMode } from '../types';
import { saveGame, SaveData } from '../services/saveSystem';
import { Cartridge } from '../components/setup/CartridgeManager';

// Debounce utility with cancel support
function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    const debounced = (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
    debounced.cancel = () => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
    };
    return debounced;
}

export default function useGameState(
    userProfile: UserProfile,
    gameMode: GameMode,
    apiKey: string | null,
    initialState: SaveData | null,
    onSFX: (type: 'send' | 'receive') => void,
    onProgress?: (progress: number, text: string) => void,
    customData?: any,
    cartridge?: Cartridge | null
) {
    // Engine State
    const [engine, setEngine] = useState<GameEngineInstance | null>(null);
    
    const [input, setInput] = useState('');
    const [gameState, setGameState] = useState<GameState>({
        history: [],
        currentInventory: [],
        health: 100,
        location: 'Unknown',
        isLoading: true
    });

    const [correctionEngine, setCorrectionEngine] = useState<'rules' | 'hunspell'>('rules');

    // Create debounced save function (2s delay)
    const saveGameDebounced = useRef(debounce((data: SaveData) => {
        saveGame(data);
    }, 2000)).current;

    // 1. Initialize Engine via Factory
    useEffect(() => {
        let isMounted = true;

        const initEngine = async () => {
            // Get cloud provider from sessionStorage
            const storedProvider = sessionStorage.getItem('penko_cloud_provider');
            const cloudProvider = storedProvider as 'gemini' | 'groq' | 'openrouter' | 'together' | 'deepinfra' | 'deepseek' | null;

            const newEngine = await EngineFactory.createEngine(
                gameMode,
                userProfile,
                apiKey,
                onProgress,
                customData,
                cartridge || undefined,
                cloudProvider || 'groq' // Default to Groq if not specified
            );

            if (isMounted) {
                setEngine(newEngine);
            }
        };

        initEngine();

        return () => { isMounted = false; };
    }, [
        gameMode,
        apiKey,
        userProfile.targetLanguage,
        userProfile.nativeLanguage,
        userProfile.theme,
        userProfile.ollamaModel,
        userProfile.openaiBaseUrl,
        userProfile.openaiModel,
        onProgress,
        customData
    ]); 

    // Update Offline Engine Correction Mode
    // NOTE: OfflineEngine moved to legacy - this feature is disabled for now
    // useEffect(() => {
    //     if (engine instanceof OfflineEngine) {
    //         engine.setCorrectionMode(correctionEngine);
    //     }
    // }, [correctionEngine, engine]);

    // 2. Start Game once Engine is Ready
    useEffect(() => {
        if (!engine) return;

        let isMounted = true;

        const initGameLogic = async () => {
            try {
                if (!isMounted) return; // Prevent double-mount in React Strict Mode

                if (initialState) {
                    // Restore World State if Offline Engine
                    // NOTE: OfflineEngine moved to legacy - skipping world state restore
                    // if (engine instanceof OfflineEngine && initialState.worldState) {
                    //     engine.world.load(initialState.worldState);
                    // }

                    const restoredHistory: ChatMessage[] = initialState.turnHistory.flatMap((turn, idx) => {
                        const sysMsg: ChatMessage = {
                            id: `hist_${idx}_sys`,
                            role: 'model',
                            content: turn.narrative,
                            meta: turn,
                            timestamp: Date.now() 
                        };
                        return [sysMsg];
                    });

                    setGameState({
                        history: restoredHistory,
                        currentInventory: initialState.inventory,
                        health: initialState.currentHealth,
                        location: initialState.location,
                        isLoading: false
                    });
                    onSFX('receive');
                } else {
                    setGameState(prev => ({ ...prev, isLoading: true }));
                    const initialTurn = await engine.initGame();
                    addTurnToState(initialTurn, 'system');
                    onSFX('receive');
                    setGameState(prev => ({ ...prev, isLoading: false }));
                }
            } catch (e) {
                console.error("Game Start Error", e);
                setGameState(prev => ({ ...prev, isLoading: false }));
            }
        };
        initGameLogic();

        return () => { isMounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [engine]);

    // Memoize turn data history extraction to avoid recalculating on every render
    const turnDataHistory = useMemo(() =>
        gameState.history
            .filter(m => m.meta)
            .map(m => m.meta as GameTurnData),
        [gameState.history]
    );

    // Auto-Save Logic (Debounced)
    useEffect(() => {
        if (!gameState.isLoading && gameState.history.length > 0) {

            // Extract World State if in Offline Mode
            // NOTE: OfflineEngine moved to legacy - no world state to save
            let worldState = null;
            // if (engine instanceof OfflineEngine) {
            //     worldState = engine.world.serialize();
            // }

            saveGameDebounced({
                version: '1.3.0',
                timestamp: Date.now(),
                profile: userProfile,
                turnHistory: turnDataHistory,
                currentHealth: gameState.health,
                inventory: gameState.currentInventory,
                location: gameState.location,
                customData: customData,
                worldState: worldState
            });
        }
    }, [gameState, userProfile, saveGameDebounced, customData, engine, turnDataHistory]);

    // Cleanup debounced save on unmount to prevent memory leaks
    useEffect(() => {
        return () => {
            if (saveGameDebounced.cancel) {
                saveGameDebounced.cancel();
            }
        };
    }, [saveGameDebounced]);

    const addTurnToState = (data: GameTurnData, role: 'model' | 'system') => {
        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            role: role,
            content: data.narrative,
            meta: data,
            timestamp: Date.now()
        };

        setGameState(prev => ({
            ...prev,
            history: [...prev.history, newMessage],
            currentInventory: data.inventory || [],
            health: data.health,
            location: data.locationName
        }));
    };

    const handleSend = async () => {
        if (!input.trim() || gameState.isLoading) return;

        onSFX('send');
        const userInput = input;
        setInput('');
        
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: userInput,
            timestamp: Date.now()
        };

        setGameState(prev => ({
            ...prev,
            history: [...prev.history, userMsg],
            isLoading: true
        }));

        try {
            if (engine) {
                const turnData = await engine.processTurn(userInput);
                addTurnToState(turnData, 'model');
                onSFX('receive');
            }
        } catch (e: any) {
            console.error(e);
            const errorMsg: ChatMessage = {
                id: Date.now().toString(),
                role: 'system',
                content: e.message || "System error. Rebooting engine...",
                timestamp: Date.now()
            };
            setGameState(prev => ({...prev, history: [...prev.history, errorMsg]}));
        } finally {
            setGameState(prev => ({ ...prev, isLoading: false }));
        }
    };

    return {
        gameState,
        input,
        setInput,
        handleSend,
        correctionEngine,
        setCorrectionEngine,
        engine
    };
}
