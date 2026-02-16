import React, { memo, useRef } from 'react';
import { Handle, Position, useReactFlow, NodeResizer } from '@xyflow/react';
import { Upload, ImageIcon, Trash2, Maximize2, Check } from 'lucide-react';

const ImageNode = ({ id, data, selected }) => {
    const { setNodes } = useReactFlow();
    const fileInputRef = useRef(null);
    const [isResizing, setIsResizing] = React.useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64Url = event.target.result;
                setNodes((nds) =>
                    nds.map((node) => {
                        if (node.id === id) {
                            return {
                                ...node,
                                data: { ...node.data, url: base64Url },
                            };
                        }
                        return node;
                    })
                );
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteNode = () => {
        setNodes((nds) => nds.filter((node) => node.id !== id));
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div
            className={`relative rounded-[2.5rem] border-none bg-white transition-all duration-300 ease-out group p-4 ${selected
                ? 'shadow-2xl'
                : 'shadow-xl shadow-black/20'
                }`}
            style={{
                width: '100%',
                height: '100%',
                filter: selected
                    ? `drop-shadow(0 0 15px rgba(59, 130, 246, 0.4))`
                    : 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.3))'
            }}
        >
            <NodeResizer
                isVisible={selected}
                minWidth={200}
                minHeight={150}
                handleStyle={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: '#3b82f6',
                    border: '3px solid white',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                    margin: -6
                }}
                lineStyle={{ border: '2px solid #3b82f6', opacity: 0.5 }}
            />
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />

            {selected && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 shadow-2xl z-50 flex gap-1 animate-in fade-in zoom-in duration-300">
                    <button
                        onClick={() => setIsResizing(!isResizing)}
                        className={`p-2 rounded-xl transition-colors ${isResizing ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-blue-400'}`}
                        title={isResizing ? "Finalizar Ajuste" : "Ajustar Tamaño"}
                    >
                        {isResizing ? <Check size={16} /> : <Maximize2 size={16} />}
                    </button>
                    <button
                        onClick={triggerFileInput}
                        className="p-2 hover:bg-slate-800 rounded-xl text-emerald-400 transition-colors"
                        title="Cambiar Imagen"
                    >
                        <Upload size={16} />
                    </button>
                    <button
                        onClick={handleDeleteNode}
                        className="p-2 hover:bg-red-500/10 text-red-400 rounded-xl transition-colors"
                        title="Eliminar Imagen"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )}

            {/* Handles de conexión sutiles */}
            <Handle type="target" position={Position.Top} id="t-target" className="!bg-blue-400 !w-2.5 !h-2.5 !border-none !transition-all hover:!bg-blue-600 shadow-sm" />
            <Handle type="source" position={Position.Top} id="t-source" className="!bg-blue-300/40 !w-2.5 !h-2.5 !border-none !opacity-0 group-hover:!opacity-100 !transition-all shadow-sm" />

            <Handle type="target" position={Position.Bottom} id="b-target" className="!bg-blue-400 !w-2.5 !h-2.5 !border-none !transition-all hover:!bg-blue-600 shadow-sm" />
            <Handle type="source" position={Position.Bottom} id="b-source" className="!bg-blue-300/40 !w-2.5 !h-2.5 !border-none !opacity-0 group-hover:!opacity-100 !transition-all shadow-sm" />

            <Handle type="target" position={Position.Left} id="l-target" className="!bg-blue-400 !w-2.5 !h-2.5 !border-none !transition-all hover:!bg-blue-600 shadow-sm" />
            <Handle type="source" position={Position.Left} id="l-source" className="!bg-blue-300/40 !w-2.5 !h-2.5 !border-none !opacity-0 group-hover:!opacity-100 !transition-all shadow-sm" />

            <Handle type="target" position={Position.Right} id="r-target" className="!bg-blue-400 !w-2.5 !h-2.5 !border-none !transition-all hover:!bg-blue-600 shadow-sm" />
            <Handle type="source" position={Position.Right} id="r-source" className="!bg-blue-300/40 !w-2.5 !h-2.5 !border-none !opacity-0 group-hover:!opacity-100 !transition-all shadow-sm" />

            <div className="flex flex-col gap-3 w-full h-full">
                {data.url ? (
                    <div className="relative flex-1 overflow-hidden rounded-[2rem] shadow-inner group/img h-full w-full">
                        <img
                            src={data.url}
                            alt="Node resource"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                        />
                    </div>
                ) : (
                    <button
                        onClick={triggerFileInput}
                        className="w-full flex-1 min-h-[160px] bg-slate-50 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all rounded-[2rem] flex flex-col items-center justify-center gap-4 group/upload"
                    >
                        <div className="p-4 bg-white rounded-2xl shadow-sm text-slate-400 group-hover/upload:text-blue-500 group-hover/upload:scale-110 transition-all duration-300">
                            <Upload size={32} />
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-slate-900 font-black text-sm uppercase tracking-wider">Subir Imagen</span>
                            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Click para seleccionar archivo</span>
                        </div>
                    </button>
                )}
                {data.label && !data.url && (
                    <div className="px-2 py-1 text-center">
                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 leading-tight block">{data.label}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default memo(ImageNode);
