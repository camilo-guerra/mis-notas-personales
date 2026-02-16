import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const ImageNode = ({ data }) => {
    return (
        <div className="px-1 py-1 shadow-xl rounded-xl bg-slate-800 border-2 border-blue-500/50 min-w-[150px]">
            <Handle type="target" position={Position.Top} className="!bg-blue-500" />

            <div className="flex flex-col gap-2">
                {data.url ? (
                    <img
                        src={data.url}
                        alt="Node resource"
                        className="w-full h-auto rounded-lg object-cover max-h-[200px]"
                    />
                ) : (
                    <div className="w-full h-32 bg-slate-700 animate-pulse rounded-lg flex items-center justify-center">
                        <span className="text-slate-500 text-xs">Cargando imagen...</span>
                    </div>
                )}
                {data.label && (
                    <div className="px-2 py-1 text-center">
                        <span className="text-xs font-medium text-slate-200">{data.label}</span>
                    </div>
                )}
            </div>

            <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
        </div>
    );
};

export default memo(ImageNode);
