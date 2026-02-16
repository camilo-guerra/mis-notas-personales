import React from 'react';

const Loader = ({ message = 'Cargando...' }) => (
    <div className="flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
        <div className="relative">
            <div className="w-12 h-12 border-4 border-slate-700 rounded-full"></div>
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="text-slate-400 font-medium animate-pulse">{message}</p>
    </div>
);

export default Loader;
