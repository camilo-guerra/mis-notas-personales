import React from 'react';
import { X, MousePointer2, Save, List, Layers, Keyboard, Clock, HelpCircle, Maximize2, Layout, Zap, Type } from 'lucide-react';

const HelpPanel = ({ onClose }) => {
    return (
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400">
                            <HelpCircle size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Guía de Usuario</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
                    {/* Nuevas Funciones de Diseño */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                            <Zap size={16} /> Diseño Inteligente
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <Layout size={16} className="text-blue-400" />
                                    <p className="text-sm font-bold text-white">Auto Organizar</p>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">Ordena jerárquicamente tu mapa con un click.</p>
                            </div>
                            <div className="p-4 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <ExternalLink size={16} className="text-blue-400" />
                                    <p className="text-sm font-bold text-white">Enlaces Externos</p>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">Si pegas una URL, aparecerá un botón para abrirla en una pestaña nueva.</p>
                            </div>
                            <div className="p-4 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <Maximize2 size={16} className="text-blue-400" />
                                    <p className="text-sm font-bold text-white">Redimensionar</p>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">Ajusta el tamaño físico de cualquier nodo o grupo con el botón de expandir.</p>
                            </div>
                        </div>
                    </div>

                    {/* Edición y Formato de Texto */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                            <Type size={16} /> Edición y Formato
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800">
                                <p className="text-sm font-bold text-white mb-2 leading-tight">Saltos de línea y Viñetas</p>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Presiona <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px] text-white">Shift + Enter</kbd> para crear una nueva línea o añadir un punto a tu lista.
                                </p>
                            </div>
                            <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800">
                                <p className="text-sm font-bold text-white mb-2 leading-tight">Crear Listas</p>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Inicia con <code className="text-blue-400">-</code> o <code className="text-blue-400">1.</code> y usa <kbd className="px-1 py-0.5 bg-slate-700 rounded text-[9px] text-emerald-400 font-bold">Shift+Enter</kbd> para añadir viñetas o números automáticamente.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Interacción con el Mouse */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <MousePointer2 size={16} /> Interacción
                        </h3>
                        <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800">
                            <p className="text-sm font-bold text-white mb-1">Doble Click</p>
                            <p className="text-xs text-slate-400 leading-relaxed">Edita texto en nodos o abre ajustes avanzados de color y etiquetas en las flechas.</p>
                        </div>
                    </div>

                    {/* Grupos y Organización */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                            <Layers size={16} /> Grupos
                        </h3>
                        <div className="p-5 bg-slate-800/40 rounded-2xl border border-slate-700/50 space-y-4">
                            <ul className="space-y-3 font-medium">
                                <li className="flex items-start gap-3">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                    <p className="text-xs text-slate-300"><strong>Redimensionar</strong>: Ahora puedes ajustar el tamaño del área de grupo manualmente.</p>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                    <p className="text-xs text-slate-300"><strong>Desagrupar</strong>: Libera los nodos manteniendo su posición global.</p>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                    <p className="text-xs text-slate-300"><strong>Mover</strong>: Al arrastrar el grupo, el contenido se mueve solidariamente.</p>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Comandos de Teclado */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                            <Keyboard size={16} /> Comandos Rápidos
                        </h3>
                        <div className="space-y-3 text-xs">
                            <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-2xl border border-slate-800">
                                <span className="text-slate-300">Borrar Nodos/Conexiones / Selección Múltiple</span>
                                <kbd className="px-3 py-1 bg-slate-700 rounded-md font-mono text-white border-b-2 border-slate-950">Supr / Backspace</kbd>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-2xl border border-slate-800">
                                <span className="text-slate-300">Confirmar Edición</span>
                                <kbd className="px-3 py-1 bg-slate-700 rounded-md font-mono text-white border-b-2 border-slate-950">Enter</kbd>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-2xl border border-slate-800">
                                <span className="text-slate-300">Nuevo Renglón</span>
                                <div className="flex gap-2">
                                    <kbd className="px-3 py-1 bg-slate-700 rounded-md font-mono text-white border-b-2 border-slate-950">Shift</kbd>
                                    <span className="text-slate-500">+</span>
                                    <kbd className="px-3 py-1 bg-slate-700 rounded-md font-mono text-white border-b-2 border-slate-950">Enter</kbd>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Autoguardado */}
                    <div className="p-6 bg-gradient-to-br from-blue-600/10 to-emerald-500/10 rounded-3xl border border-blue-500/20">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400">
                                <Save size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Autoguardado Activo</p>
                                <p className="text-xs text-slate-400">Sincronización automática con Drive cada **15 segundos**.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-800 text-center bg-slate-800/30">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20"
                    >
                        ¡Entendido!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HelpPanel;
