import React, { useState } from 'react';
import { Plus, FolderOpen, Map as MapIcon } from 'lucide-react';

const TopicSelector = ({ topics, onSelect, onCreate, loading }) => {
    const [newTopic, setNewTopic] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newTopic.trim()) {
            onCreate(newTopic.trim());
            setNewTopic('');
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-white">Mis Temas</h2>
                <p className="text-slate-400">Selecciona un mapa mental existente o crea uno nuevo.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Card para crear nuevo */}
                <form
                    onSubmit={handleSubmit}
                    className="p-6 bg-slate-800/40 border-2 border-dashed border-slate-700 rounded-3xl hover:border-blue-500/50 transition-all group"
                >
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 group-hover:scale-110 transition-transform">
                            <Plus size={32} />
                        </div>
                        <div className="space-y-2 w-full">
                            <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Nuevo Mapa</label>
                            <input
                                type="text"
                                placeholder="Ej: Cocina, Viajes..."
                                value={newTopic}
                                onChange={(e) => setNewTopic(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={!newTopic.trim() || loading}
                                className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl font-bold transition-all"
                            >
                                Crear Tema
                            </button>
                        </div>
                    </div>
                </form>

                {/* Lista de temas existentes */}
                {topics.map((topic) => (
                    <button
                        key={topic.id}
                        onClick={() => onSelect(topic)}
                        disabled={loading}
                        className="p-6 bg-slate-800/60 border border-slate-700 rounded-3xl hover:bg-slate-700/60 hover:border-slate-600 transition-all flex items-center gap-4 group"
                    >
                        <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform">
                            <MapIcon size={32} />
                        </div>
                        <div className="text-left">
                            <h3 className="text-lg font-bold text-white">{topic.name}</h3>
                            <p className="text-sm text-slate-500 tracking-tight">Mapa Mental en Drive</p>
                        </div>
                    </button>
                ))}

                {topics.length === 0 && !loading && (
                    <div className="md:col-span-2 py-12 text-center text-slate-500">
                        No tienes temas creados aún. ¡Empieza con el primero!
                    </div>
                )}
            </div>
        </div>
    );
};

export default TopicSelector;
