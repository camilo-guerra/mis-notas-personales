import React, { useState, useEffect, useRef, memo } from 'react';
import { NodeToolbar, Position, useReactFlow, NodeResizer } from '@xyflow/react';
import {
    Type, Maximize2, Layers, Trash2, Smile,
    Star, Info, AlertTriangle, CheckCircle2, Zap, Heart, Target, Briefcase,
    GraduationCap, Lightbulb, FileText, Layout, Calendar, User, Globe,
    Settings, Flame, Rocket, Coffee, Lock, Check, Search, Flag, Bell
} from 'lucide-react';

const IconMap = {
    star: Star, info: Info, alert: AlertTriangle, check: CheckCircle2,
    zap: Zap, heart: Heart, target: Target, case: Briefcase,
    grad: GraduationCap, bulb: Lightbulb, file: FileText, layout: Layout,
    cal: Calendar, user: User, globe: Globe, set: Settings,
    flame: Flame, rock: Rocket, coffee: Coffee, lock: Lock,
    done: Check, find: Search, flag: Flag, bell: Bell
};

const GroupNode = ({ id, data, selected }) => {
    const { setNodes, setEdges, getNodes } = useReactFlow();
    const [isEditing, setIsEditing] = useState(false);
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [title, setTitle] = useState(data.label || 'Título del Grupo');
    const [isResizing, setIsResizing] = useState(false);
    const inputRef = useRef(null);

    const styles = data.style || {};
    const bgColor = styles.backgroundColor || 'rgba(30, 41, 59, 0.2)';

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const updateStyle = (newStyle) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            style: { ...styles, ...newStyle }
                        }
                    };
                }
                return node;
            })
        );
    };

    const updateIcon = (newIcon) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            icon: newIcon
                        }
                    };
                }
                return node;
            })
        );
        setShowIconPicker(false);
    };

    const handleUngroup = () => {
        const allNodes = getNodes();
        const children = allNodes.filter(n => n.parentId === id);
        const parentNode = allNodes.find(n => n.id === id);

        if (!parentNode) return;

        setNodes((nds) => {
            // 1. Desvincular hijos y recalcular sus posiciones globales
            const updatedNodes = nds.map(node => {
                if (node.parentId === id) {
                    return {
                        ...node,
                        parentId: undefined,
                        extent: undefined,
                        position: {
                            x: node.position.x + parentNode.position.x,
                            y: node.position.y + parentNode.position.y
                        }
                    };
                }
                return node;
            });
            // 2. Eliminar el nodo de grupo
            return updatedNodes.filter(node => node.id !== id);
        });
    };

    const updateLabel = (newLabel) => {
        setTitle(newLabel);
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return { ...node, data: { ...node.data, label: newLabel } };
                }
                return node;
            })
        );
    };

    const handleDoubleClick = (e) => {
        e.stopPropagation();
        setIsEditing(true);
    };

    return (
        <div
            onDoubleClick={handleDoubleClick}
            className={`w-full h-full min-w-[240px] min-h-[180px] rounded-[2.5rem] border-none transition-all duration-700 ease-out group ${selected
                ? 'shadow-2xl'
                : 'shadow-xl shadow-black/20'
                }`}
            style={{
                backgroundColor: bgColor,
                filter: selected
                    ? `drop-shadow(0 0 20px rgba(255, 255, 255, 0.15)) drop-shadow(0 0 5px rgba(59, 130, 246, 0.5))`
                    : 'none'
            }}
        >
            <NodeResizer
                isVisible={isResizing}
                minWidth={200}
                minHeight={150}
                handleStyle={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: '#3b82f6',
                    border: '2px solid white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    margin: -5
                }}
                lineStyle={{ border: '1.5px solid #3b82f6', opacity: 0.4 }}
                onResize={(event, params) => {
                    setNodes((nds) => nds.map((n) => {
                        if (n.id === id) {
                            return {
                                ...n,
                                style: { ...n.style, width: params.width, height: params.height }
                            };
                        }
                        return n;
                    }));
                }}
            />
            <NodeToolbar
                isVisible={selected && !isEditing}
                position={Position.Top}
                className="flex items-center gap-1.5 p-2 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in slide-in-from-bottom-2 duration-300 mb-6"
            >
                <div className="flex items-center gap-1 pr-1 border-r border-slate-700 shrink-0">
                    <input
                        type="color"
                        value={bgColor.startsWith('rgba') ? '#1e293b' : bgColor}
                        onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none appearance-none"
                        title="Color del Grupo"
                    />
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors flex items-center"
                        title="Editar Título"
                    >
                        <Type size={14} />
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setShowIconPicker(!showIconPicker)}
                            className={`p-1.5 rounded-lg transition-colors ${data.icon ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-600'}`}
                            title="Añadir Icono al Grupo"
                        >
                            <Smile size={14} />
                        </button>

                        {showIconPicker && (
                            <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 p-2 rounded-xl shadow-2xl z-[500] grid grid-cols-6 gap-1 min-w-[180px]">
                                <button
                                    onClick={() => updateIcon(null)}
                                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 text-[10px] font-bold col-span-2"
                                >
                                    Sin Icono
                                </button>
                                {Object.entries(IconMap).map(([name, IconComponent]) => (
                                    <button
                                        key={name}
                                        onClick={() => updateIcon(name)}
                                        className="p-1.5 hover:bg-blue-600 hover:text-white rounded-lg text-slate-400 transition-colors"
                                    >
                                        <IconComponent size={14} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1.5 border-r border-slate-700 pr-2 shrink-0">
                    <button
                        onClick={() => setIsResizing(!isResizing)}
                        className={`p-1.5 rounded-lg transition-all ${isResizing ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-blue-400'}`}
                        title={isResizing ? "Finalizar Ajuste" : "Ajustar Tamaño de Grupo"}
                    >
                        {isResizing ? <Check size={14} /> : <Maximize2 size={14} />}
                    </button>
                </div>

                <button
                    onClick={handleUngroup}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors flex items-center gap-2 text-xs font-bold px-3"
                    title="Disolver grupo y liberar nodos"
                >
                    <Layers size={14} className="rotate-180" /> Desagrupar
                </button>

                <button
                    onClick={() => {
                        const allNodes = getNodes();
                        const childrenIds = allNodes.filter(n => n.parentId === id).map(n => n.id);
                        const idsToRemove = [id, ...childrenIds];

                        setNodes((nds) => nds.filter(n => !idsToRemove.includes(n.id)));
                        setEdges((eds) => eds.filter(e => !idsToRemove.includes(e.source) && !idsToRemove.includes(e.target)));
                    }}
                    className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-slate-500 transition-colors"
                    title="Eliminar Grupo y Contenido"
                >
                    <Trash2 size={16} />
                </button>
            </NodeToolbar>

            <div className="absolute top-0 left-0 right-0 p-5 flex items-center gap-4 bg-white rounded-t-[2.5rem] pointer-events-none transition-colors border-none">
                {data.icon && IconMap[data.icon] && (
                    <div className="shrink-0 text-blue-600 group-hover:scale-110 transition-transform">
                        {React.createElement(IconMap[data.icon], { size: 20 })}
                    </div>
                )}

                <div className="flex-1">
                    {isEditing ? (
                        <input
                            ref={inputRef}
                            value={title}
                            onChange={(e) => updateLabel(e.target.value)}
                            onBlur={() => setIsEditing(false)}
                            onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
                            className="bg-white/10 text-white font-bold text-sm px-3 py-1 rounded-xl border border-blue-500/50 outline-none pointer-events-auto w-full transition-all focus:bg-white/20"
                        />
                    ) : (
                        <h3 className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                            {title}
                        </h3>
                    )}
                </div>
                <Maximize2 size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
            </div>

            {/* Area de contenido del grupo - Marca de agua sutil */}
            <div className="w-full h-full pt-16 p-6 pointer-events-none flex items-center justify-center">
                <span className="text-[9px] uppercase tracking-[0.4em] font-black text-white/5 select-none transition-opacity group-hover:opacity-40">
                    Contenedor de Conceptos
                </span>
            </div>
        </div>
    );
};

export default memo(GroupNode);
