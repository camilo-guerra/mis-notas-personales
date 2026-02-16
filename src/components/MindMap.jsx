import React, { useCallback, useMemo } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ImageNode from './ImageNode.jsx';
import { Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';

const nodeTypes = {
    image: ImageNode,
};

const MindMap = ({ initialNodes = [], initialEdges = [], onSave, onBack, topicName }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const handleSave = () => {
        onSave({ nodes, edges });
    };

    const addImageNode = () => {
        const id = `node_${Date.now()}`;
        const newNode = {
            id,
            type: 'image',
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            data: { label: 'Nueva Imagen', url: null },
        };
        setNodes((nds) => nds.concat(newNode));
    };

    return (
        <div className="flex-1 w-full h-full bg-slate-900 border-t border-slate-800 relative animate-in fade-in duration-500">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                className="bg-slate-900"
                colorMode="dark"
            >
                <Background color="#334155" gap={20} />
                <Controls />
                <MiniMap
                    nodeColor={(node) => {
                        switch (node.type) {
                            case 'image': return '#3b82f6';
                            default: return '#10b981';
                        }
                    }}
                    maskColor="rgb(15, 23, 42, 0.6)"
                    className="bg-slate-800 border-slate-700"
                />

                <Panel position="top-left" className="flex gap-2">
                    <button
                        onClick={onBack}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 shadow-lg flex items-center gap-2 transition-all"
                    >
                        <ArrowLeft size={20} />
                        <span className="hidden sm:inline">Volver</span>
                    </button>
                </Panel>

                <Panel position="top-right" className="flex gap-2">
                    <button
                        onClick={addImageNode}
                        className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg border border-blue-400/30 flex items-center gap-2 transition-all"
                    >
                        <ImageIcon size={20} />
                        <span className="hidden sm:inline">Agregar Imagen</span>
                    </button>
                    <button
                        onClick={handleSave}
                        className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg border border-emerald-400/30 flex items-center gap-2 transition-all"
                    >
                        <Save size={20} />
                        <span className="hidden sm:inline">Guardar Mapa</span>
                    </button>
                </Panel>

                <Panel position="bottom-center">
                    <div className="px-4 py-2 bg-slate-800/80 backdrop-blur-md rounded-full border border-slate-700 shadow-xl text-slate-300 text-sm font-medium">
                        Editando: <span className="text-blue-400">{topicName}</span>
                    </div>
                </Panel>
            </ReactFlow>
        </div>
    );
};

export default MindMap;
