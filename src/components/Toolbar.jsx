import React from 'react';
import { Box, Circle, Diamond, StickyNote, Image as ImageIcon, MousePointer2, Layers, Triangle, Hexagon, Pill } from 'lucide-react';

const Toolbar = ({ onAddNode }) => {
    const tools = [
        { id: 'concept', icon: Box, label: 'Concepto', type: 'default', color: '#ffffff' },
        { id: 'circle', icon: Circle, label: 'Proceso', type: 'circle', color: '#10b981' },
        { id: 'diamond', icon: Diamond, label: 'Decisión', type: 'diamond', color: '#f59e0b' },
        { id: 'capsule', icon: Pill, label: 'Categoría', type: 'capsule', color: '#3b82f6' },
        { id: 'hexagon', icon: Hexagon, label: 'Estructura', type: 'hexagon', color: '#8b5cf6' },
        { id: 'triangle', icon: Triangle, label: 'Alerta/Jerarquía', type: 'triangle', color: '#f43f5e' },
        { id: 'note', icon: StickyNote, label: 'Nota', type: 'note', color: '#fbbf24' },
        { id: 'image', icon: ImageIcon, label: 'Imagen', type: 'image' },
        { id: 'group', icon: Layers, label: 'Agrupar', type: 'group' },
    ];

    return (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 p-2 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl z-50 animate-in slide-in-from-left-4 duration-500">
            <div className="p-2 mb-2 border-b border-slate-700/50 flex justify-center">
                <MousePointer2 size={18} className="text-slate-500" />
            </div>
            {tools.map((tool) => (
                <button
                    key={tool.id}
                    onClick={() => onAddNode(tool.type, tool.color)}
                    className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all group relative"
                    title={tool.label}
                >
                    <tool.icon size={22} />
                    <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-slate-700">
                        {tool.label}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default Toolbar;
