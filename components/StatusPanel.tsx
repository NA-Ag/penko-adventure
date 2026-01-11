import React from 'react';
import { InventoryItem } from '../types';

interface StatusPanelProps {
    health: number;
    inventory: InventoryItem[];
    T: any;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({ health, inventory, T }) => {
    return (
        <>
            <div className="bg-gray-800 p-2 shrink-0 select-none">
                 <div className="flex justify-between mb-1 font-pixel">
                     <span className="text-red-500 tracking-widest text-lg">{T.hp}</span>
                     <span className="text-gray-300">{health}/100</span>
                 </div>
                 <div className="w-full h-6 bg-gray-900 border-2 border-gray-600 relative p-0.5">
                     <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,#000,#000_5px,#222_5px,#222_10px)]"></div>
                     <div 
                        className="h-full bg-red-600 transition-all duration-500 relative" 
                        style={{ width: `${Math.max(0, Math.min(100, health))}%` }}
                     >
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-white/30"></div>
                     </div>
                 </div>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 shadow-lg grow flex flex-col overflow-hidden">
                <h3 className="text-green-400 font-pixel text-lg mb-3 border-b border-gray-700 pb-2 tracking-wider shrink-0">{T.inventory}</h3>
                <div className="overflow-y-auto flex-1 pr-1">
                    {inventory.length === 0 ? (
                        <p className="text-gray-500 text-sm italic py-4 text-center">{T.empty_pockets}</p>
                    ) : (
                        <ul className="space-y-2">
                        {inventory.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-3 bg-gray-700/50 p-2 rounded border border-gray-600 hover:bg-gray-700 transition-colors animate-fade-in">
                            <span className="text-2xl select-none filter drop-shadow-md">{item.icon}</span>
                            <div>
                                <p className="text-sm font-bold text-gray-200">{item.name}</p>
                                <p className="text-[10px] text-gray-400">{item.description.substring(0, 30)}...</p>
                            </div>
                            </li>
                        ))}
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
};
