import React, { useState } from 'react';
import { X, Palette, Type, ArrowRight, ArrowLeft, ArrowRightLeft, MoveHorizontal, Trash2 } from 'lucide-react';

const EdgeEditModal = ({ isOpen, onClose, onSave, onDelete, initialLabel = '', initialColor = '#3b82f6', initialDirection = 'forward' }) => {
    const [label, setLabel] = useState(initialLabel);
    const [color, setColor] = useState(initialColor);
    const [direction, setDirection] = useState(initialDirection);

    if (!isOpen) return null;

    const colors = [
        { name: 'Blue', value: '#3b82f6' },
        { name: 'Emerald', value: '#10b981' },
        { name: 'Rose', value: '#f43f5e' },
        { name: 'Amber', value: '#f59e0b' },
        { name: 'Purple', value: '#8b5cf6' },
        { name: 'Slate', value: '#64748b' }
    ];

    const directions = [
        { id: 'forward', label: 'Normal', icon: ArrowRight },
        { id: 'backward', label: 'Inversa', icon: ArrowLeft },
        { id: 'both', label: 'Doble', icon: ArrowRightLeft },
    ];

    return (
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm z-[300] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Type size={18} className="text-blue-400" />
                        Editar Conexión
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                if (confirm('¿Eliminar esta conexión?')) {
                                    onDelete();
                                    onClose();
                                }
                            }}
                            className="p-1.5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
                            title="Eliminar Conexión"
                        >
                            <Trash2 size={18} />
                        </button>
                        <button onClick={onClose} className="p-1.5 hover:bg-slate-700 rounded-full text-slate-400 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Etiqueta</label>
                        <input
                            type="text"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="Ej: Relacionado con..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block flex items-center gap-2">
                            <MoveHorizontal size={14} /> Dirección del Flujo
                        </label>
                        <div className="flex gap-2 p-1 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                            {directions.map((d) => (
                                <button
                                    key={d.id}
                                    onClick={() => setDirection(d.id)}
                                    className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl transition-all ${direction === d.id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/50'
                                        }`}
                                >
                                    <d.icon size={18} />
                                    <span className="text-[10px] uppercase font-bold tracking-tighter">{d.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block flex items-center gap-2">
                            <Palette size={14} /> Color de la Flecha
                        </label>
                        <div className="grid grid-cols-6 gap-2 mb-4">
                            {colors.map((c) => (
                                <button
                                    key={c.value}
                                    onClick={() => setColor(c.value)}
                                    className={`w-8 h-8 rounded-full border-2 transition-all ${color === c.value ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                                    style={{ backgroundColor: c.value }}
                                    title={c.name}
                                />
                            ))}
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none appearance-none"
                            />
                            <span className="text-sm font-mono text-slate-400 uppercase">{color}</span>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-800/30 border-t border-slate-800 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 text-slate-400 hover:text-white font-medium transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onSave({ label, color, direction })}
                        className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold py-2.5 shadow-lg shadow-blue-500/20 transition-all"
                    >
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EdgeEditModal;
