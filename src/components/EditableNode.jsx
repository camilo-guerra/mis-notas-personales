import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeToolbar, useReactFlow, NodeResizer } from '@xyflow/react';
import {
    Bold, Underline, Type, Pipette, ChevronUp, ChevronDown, Trash2, Smile, Maximize2,
    Star, Info, AlertTriangle, CheckCircle2, Zap, Heart, Target, Briefcase,
    GraduationCap, Lightbulb, FileText, Layout, Calendar, User, Globe,
    Settings, Flame, Rocket, Coffee, Lock, Check, Search, Flag, Bell, ExternalLink
} from 'lucide-react';

const IconMap = {
    star: Star, info: Info, alert: AlertTriangle, check: CheckCircle2,
    zap: Zap, heart: Heart, target: Target, case: Briefcase,
    grad: GraduationCap, bulb: Lightbulb, file: FileText, layout: Layout,
    cal: Calendar, user: User, globe: Globe, set: Settings,
    flame: Flame, rock: Rocket, coffee: Coffee, lock: Lock,
    done: Check, find: Search, flag: Flag, bell: Bell
};

const EditableNode = ({ id, data, selected, type }) => {
    const { setNodes, setEdges } = useReactFlow();
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data.label || 'Nuevo Concepto');
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const inputRef = useRef(null);

    // Detectar si hay una URL en el texto
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const detectedUrl = label.match(urlRegex)?.[0];

    // Estilos por defecto del objeto data
    const styles = data.style || {
        backgroundColor: '#ffffff',
        color: '#0f172a',
        fontSize: 14,
        fontWeight: 'normal',
        textDecoration: 'none',
        fontFamily: 'sans-serif',
        scale: 1.0
    };

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
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
                            style: { ...styles, ...newStyle },
                        },
                    };
                }
                return node;
            })
        );
    };

    const updateIcon = (iconName) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return {
                        ...node,
                        data: { ...node.data, icon: iconName },
                    };
                }
                return node;
            })
        );
        setShowIconPicker(false);
    };

    const handleDelete = () => {
        setNodes((nds) => nds.filter((node) => node.id !== id));
        setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    };

    const handleDoubleClick = (e) => {
        e.stopPropagation();
        setIsEditing(true);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            data.label = label;
            setIsEditing(false);
            return;
        }

        if (e.key === 'Enter' && e.shiftKey) {
            const cursorPosition = e.target.selectionStart;
            const textBeforeCursor = label.substring(0, cursorPosition);
            const lines = textBeforeCursor.split('\n');
            const lastLine = lines[lines.length - 1];

            const bulletMatch = lastLine.match(/^(\s*)-\s+(.*)/);
            if (bulletMatch) {
                e.preventDefault();
                const newText = label.substring(0, cursorPosition) + '\n- ' + label.substring(cursorPosition);
                setLabel(newText);
                setTimeout(() => {
                    inputRef.current.selectionStart = inputRef.current.selectionEnd = cursorPosition + 3;
                }, 0);
                return;
            }

            const numberMatch = lastLine.match(/^(\s*)(\d+)\.\s+(.*)/);
            if (numberMatch) {
                e.preventDefault();
                const nextNumber = parseInt(numberMatch[2]) + 1;
                const newText = label.substring(0, cursorPosition) + `\n${nextNumber}. ` + label.substring(cursorPosition);
                setLabel(newText);
                setTimeout(() => {
                    inputRef.current.selectionStart = inputRef.current.selectionEnd = cursorPosition + (nextNumber.toString().length + 3);
                }, 0);
                return;
            }
        }

        if (e.key === 'Escape') {
            setLabel(data.label);
            setIsEditing(false);
        }
    };

    const handleBlur = () => {
        data.label = label;
        setIsEditing(false);
    };

    const getContrastColor = (hexcolor) => {
        if (!hexcolor || hexcolor === 'transparent') return '#0f172a';
        // Si es blanco purísimo, devolver slate oscuro
        if (hexcolor.toLowerCase() === '#ffffff') return '#0f172a';

        const r = parseInt(hexcolor.substring(1, 3), 16);
        const g = parseInt(hexcolor.substring(3, 5), 16);
        const b = parseInt(hexcolor.substring(5, 7), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? '#0f172a' : '#ffffff';
    };

    const getShapeInfo = () => {
        const textLen = label.length;
        const fontSize = styles.fontSize || 14;

        // Priorizar dimensiones manuales si existen
        const manualWidth = data.width;
        const manualHeight = data.height;

        // Estimación base para auto-dimensionado
        const avgCharWidth = fontSize * 0.6;
        const lineCount = label.split('\n').length;
        const maxCharsPerLine = Math.max(...label.split('\n').map(l => l.length), 1);

        const estimatedWidth = manualWidth || Math.max(140, maxCharsPerLine * avgCharWidth + 60);
        const estimatedHeight = manualHeight || Math.max(80, (lineCount * fontSize * 1.5) + 60);

        switch (type) {
            case 'circle': {
                const size = Math.max(estimatedWidth, estimatedHeight);
                return { container: { width: size, height: size }, shape: 'rounded-full' };
            }
            case 'diamond': {
                const size = Math.max(estimatedWidth, estimatedHeight) * 1.2;
                return {
                    container: { width: size, height: size },
                    shape: '[clip-path:polygon(50%_0%,100%_50%,50%_100%,0%_50%)]'
                };
            }
            case 'capsule':
                return { container: { width: estimatedWidth + 20, height: estimatedHeight }, shape: 'rounded-full' };
            case 'hexagon':
                return {
                    container: { width: estimatedWidth + 40, height: estimatedHeight + 20 },
                    shape: '[clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]'
                };
            case 'triangle': {
                const width = estimatedWidth * 1.5;
                const height = estimatedHeight * 1.8;
                return {
                    container: { width: width, height: height },
                    shape: '[clip-path:polygon(50%_0%,0%_100%,100%_100%)]'
                };
            }
            case 'note':
                return { container: { width: Math.max(180, estimatedWidth), height: Math.max(180, estimatedHeight) }, shape: 'rounded-sm' };
            default:
                return { container: { width: estimatedWidth, height: estimatedHeight }, shape: 'rounded-[1.5rem]' };
        }
    };

    const getColors = () => {
        const hasCustomBg = styles.backgroundColor && styles.backgroundColor !== '#ffffff' && styles.backgroundColor !== 'transparent';
        const baseClasses = "transition-all duration-300 ease-out border-none opacity-100 shadow-none";

        if (type === 'note') {
            const noteBg = styles.backgroundColor || '#fbbf24';
            return `text-slate-900 ${selected ? 'brightness-110' : 'hover:brightness-105'}`;
        }

        const bgClass = !hasCustomBg ? 'bg-white' : '';
        const stateClass = selected ? 'z-10 brightness-[0.98]' : 'hover:brightness-[0.99]';

        return `${baseClasses} ${bgClass} ${stateClass}`;
    };

    const textColor = getContrastColor(styles.backgroundColor || '#ffffff');

    const textStyle = {
        fontSize: `${styles.fontSize}px`,
        fontWeight: styles.fontWeight,
        textDecoration: styles.textDecoration,
        fontFamily: styles.fontFamily,
        color: textColor
    };

    const { container: containerStyleProps, shape: shapeClasses } = getShapeInfo();
    // const s = styles.scale || 1.0; // No longer needed as scale is removed

    const containerStyle = {
        width: `${containerStyleProps.width}px`,
        height: `${containerStyleProps.height}px`,
        backgroundColor: styles.backgroundColor,
        filter: selected
            ? `drop-shadow(0 0 15px rgba(59, 130, 246, 0.5)) drop-shadow(0 0 2px rgba(59, 130, 246, 0.8))`
            : `drop-shadow(0 10px 15px rgba(0, 0, 0, 0.4))`
    };

    return (
        <div
            onDoubleClick={handleDoubleClick}
            className="group relative flex items-center justify-center"
            style={{ width: containerStyle.width, height: containerStyle.height }}
        >
            {/* Fondo Geométrico Sólido */}
            <div
                className={`absolute inset-0 ${shapeClasses} ${getColors()}`}
                style={containerStyle}
            />
            <NodeResizer
                isVisible={isResizing}
                minWidth={100}
                minHeight={50}
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
                                data: { ...n.data, width: params.width, height: params.height }
                            };
                        }
                        return n;
                    }));
                }}
            />
            <NodeToolbar
                isVisible={selected && !isEditing}
                position={Position.Top}
                className="flex items-center gap-1.5 p-2 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in slide-in-from-bottom-2 duration-300 mb-4"
            >
                <div className="flex items-center gap-1.5 border-r border-slate-700 pr-2 shrink-0">
                    <button
                        onClick={() => setIsResizing(!isResizing)}
                        className={`p-1.5 rounded-lg transition-all ${isResizing ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-blue-400'}`}
                        title={isResizing ? "Finalizar Ajuste" : "Ajustar Tamaño Manualmente"}
                    >
                        {isResizing ? <Check size={14} /> : <Maximize2 size={14} />}
                    </button>
                    <input
                        type="color"
                        value={styles.backgroundColor || '#ffffff'}
                        onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                        className="w-6 h-6 rounded-md cursor-pointer bg-transparent border-none appearance-none"
                        title="Color de Fondo"
                    />
                    {detectedUrl && (
                        <button
                            onClick={() => window.open(detectedUrl, '_blank', 'noopener,noreferrer')}
                            className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all animate-in fade-in zoom-in duration-300 flex items-center gap-1.5 ml-1"
                            title="Abrir Enlace Externo"
                        >
                            <ExternalLink size={12} />
                            <span className="text-[10px] font-bold">Ir a link</span>
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-1.5 border-r border-slate-700 pr-2 shrink-0">
                    {/* Control de Tamaño de Letra */}
                    <div className="flex items-center gap-1 bg-slate-800 rounded-lg px-2 py-0.5 border border-white/5">
                        <Type size={10} className="text-emerald-400" />
                        <input
                            type="number"
                            value={styles.fontSize || 14}
                            onChange={(e) => updateStyle({ fontSize: parseInt(e.target.value) || 12 })}
                            className="w-8 bg-transparent text-center text-[10px] text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-black"
                            title="Tamaño de Letra"
                        />
                        <div className="flex flex-col border-l border-slate-700 pl-0.5 ml-0.5">
                            <button onClick={() => updateStyle({ fontSize: (styles.fontSize || 14) + 1 })} className="p-0 hover:bg-slate-700 rounded-sm text-slate-400 hover:text-white transition-colors" title="Aumentar Letra"><ChevronUp size={10} /></button>
                            <button onClick={() => updateStyle({ fontSize: (styles.fontSize || 14) - 1 })} className="p-0 hover:bg-slate-700 rounded-sm text-slate-400 hover:text-white transition-colors" title="Disminuir Letra"><ChevronDown size={10} /></button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={() => updateStyle({ fontWeight: styles.fontWeight === 'bold' ? 'normal' : 'bold' })}
                        className={`p-1.5 rounded-lg transition-colors ${styles.fontWeight === 'bold' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
                        title="Negrita"
                    >
                        <Bold size={14} />
                    </button>
                    <button
                        onClick={() => updateStyle({ textDecoration: styles.textDecoration === 'underline' ? 'none' : 'underline' })}
                        className={`p-1.5 rounded-lg transition-colors ${styles.textDecoration === 'underline' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
                        title="Subrayado"
                    >
                        <Underline size={14} />
                    </button>
                    <button
                        onClick={() => {
                            const families = ['sans-serif', 'serif', 'monospace'];
                            const next = families[(families.indexOf(styles.fontFamily) + 1) % families.length];
                            updateStyle({ fontFamily: next });
                        }}
                        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                        title="Cambiar Fuente"
                    >
                        <Type size={14} />
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setShowIconPicker(!showIconPicker)}
                            className={`p-1.5 rounded-lg transition-colors ${data.icon ? 'bg-blue-600/30 text-blue-400' : 'hover:bg-slate-800 text-slate-400'}`}
                            title="Añadir Icono"
                        >
                            <Smile size={14} />
                        </button>

                        {showIconPicker && (
                            <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-2xl border border-white/10 p-3 rounded-2xl shadow-[0_25px_50px_rgba(0,0,0,0.6)] z-[500] grid grid-cols-6 gap-1.5 min-w-[210px] animate-in fade-in zoom-in duration-200">
                                <button
                                    onClick={() => updateIcon(null)}
                                    className="p-2 hover:bg-white/10 rounded-xl text-slate-400 text-[10px] font-black uppercase tracking-wider col-span-2 transition-colors"
                                >
                                    Ninguno
                                </button>
                                {Object.entries(IconMap).map(([name, IconComponent]) => (
                                    <button
                                        key={name}
                                        onClick={() => updateIcon(name)}
                                        className="p-2 hover:bg-blue-600 hover:text-white rounded-xl text-slate-400 transition-all hover:scale-110 active:scale-90"
                                    >
                                        <IconComponent size={16} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center pl-1 border-l border-slate-700 shrink-0">
                    <button
                        onClick={handleDelete}
                        className="p-1.5 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-slate-500 transition-colors"
                        title="Eliminar Nodo"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </NodeToolbar >

            {/* Handles de conexión sutiles */}
            <Handle type="target" position={Position.Top} id="t-target" className="!bg-blue-400 !w-2.5 !h-2.5 !border-none !transition-all hover:!bg-blue-600 shadow-sm" />
            <Handle type="source" position={Position.Top} id="t-source" className="!bg-blue-300/40 !w-2.5 !h-2.5 !border-none !opacity-0 group-hover:!opacity-100 !transition-all shadow-sm" />

            <Handle type="target" position={Position.Bottom} id="b-target" className="!bg-blue-400 !w-2.5 !h-2.5 !border-none !transition-all hover:!bg-blue-600 shadow-sm" />
            <Handle type="source" position={Position.Bottom} id="b-source" className="!bg-blue-300/40 !w-2.5 !h-2.5 !border-none !opacity-0 group-hover:!opacity-100 !transition-all shadow-sm" />

            <Handle type="target" position={Position.Left} id="l-target" className="!bg-blue-400 !w-2.5 !h-2.5 !border-none !transition-all hover:!bg-blue-600 shadow-sm" />
            <Handle type="source" position={Position.Left} id="l-source" className="!bg-blue-300/40 !w-2.5 !h-2.5 !border-none !opacity-0 group-hover:!opacity-100 !transition-all shadow-sm" />

            <Handle type="target" position={Position.Right} id="r-target" className="!bg-blue-400 !w-2.5 !h-2.5 !border-none !transition-all hover:!bg-blue-600 shadow-sm" />
            <Handle type="source" position={Position.Right} id="r-source" className="!bg-blue-300/40 !w-2.5 !h-2.5 !border-none !opacity-0 group-hover:!opacity-100 !transition-all shadow-sm" />

            {/* Contenido - Relativo para estar sobre el fondo */}
            <div className={`relative z-10 w-full h-full flex items-center justify-center overflow-visible p-8 ${type === 'triangle' ? 'pt-10' : ''}`}>
                {isEditing ? (
                    <textarea
                        ref={inputRef}
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={handleBlur}
                        style={textStyle}
                        className="w-full bg-transparent text-center focus:outline-none resize-none overflow-hidden"
                        rows={label.split('\n').length || 1}
                    />
                ) : (
                    <div
                        style={textStyle}
                        className="text-center break-words pointer-events-none whitespace-pre-wrap max-w-full flex items-center justify-center gap-2"
                    >
                        {data.icon && IconMap[data.icon] && (
                            <div className="shrink-0 opacity-100" style={{ color: textColor }}>
                                {React.createElement(IconMap[data.icon], { size: styles.fontSize + 4 })}
                            </div>
                        )}
                        <span>{label}</span>
                    </div>
                )}
            </div>
        </div >
    );
};

export default React.memo(EditableNode);
