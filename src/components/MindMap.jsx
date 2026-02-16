import React, { useCallback, useEffect, useState } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Panel,
    ReactFlowProvider,
    useReactFlow,
    Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ImageNode from './ImageNode.jsx';
import EditableNode from './EditableNode.jsx';
import Toolbar from './Toolbar.jsx';
import HelpPanel from './HelpPanel.jsx';
import EdgeEditModal from './EdgeEditModal.jsx';
import GroupNode from './GroupNode.jsx';
import { Save, ArrowLeft, Clock, HelpCircle, Layout } from 'lucide-react';
import dagre from '@dagrejs/dagre';

const DefaultNode = (props) => <EditableNode {...props} type="default" />;
const CircleNode = (props) => <EditableNode {...props} type="circle" />;
const DiamondNode = (props) => <EditableNode {...props} type="diamond" />;
const NoteNode = (props) => <EditableNode {...props} type="note" />;
const CapsuleNode = (props) => <EditableNode {...props} type="capsule" />;
const HexagonNode = (props) => <EditableNode {...props} type="hexagon" />;
const TriangleNode = (props) => <EditableNode {...props} type="triangle" />;

const nodeTypes = {
    image: ImageNode,
    group: GroupNode,
    default: DefaultNode,
    circle: CircleNode,
    diamond: DiamondNode,
    note: NoteNode,
    capsule: CapsuleNode,
    hexagon: HexagonNode,
    triangle: TriangleNode,
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({
        rankdir: direction,
        nodesep: 150, // Más espacio entre nodos del mismo nivel
        ranksep: 200, // Más espacio entre niveles (arriba/abajo)
        marginx: 50,
        marginy: 50
    });

    nodes.forEach((node) => {
        // Obtener tamaño real (manual o automático estimado)
        let width = node.data?.width || 160;
        let height = node.data?.height || 80;

        // Ajustes específicos por tipo si no hay tamaño manual
        if (!node.data?.width || !node.data?.height) {
            switch (node.type) {
                case 'circle': width = 150; height = 150; break;
                case 'diamond': width = 200; height = 200; break;
                case 'triangle': width = 220; height = 180; break;
                case 'image': width = 300; height = 250; break;
                case 'note': width = 200; height = 200; break;
            }
        }

        dagreGraph.setNode(node.id, { width, height });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);

        // Mantener las mismas dimensiones usadas para el cálculo
        let width = node.data?.width || 160;
        let height = node.data?.height || 80;
        if (!node.data?.width || !node.data?.height) {
            switch (node.type) {
                case 'circle': width = 150; height = 150; break;
                case 'diamond': width = 200; height = 200; break;
                case 'triangle': width = 220; height = 180; break;
                case 'image': width = 300; height = 250; break;
                case 'note': width = 200; height = 200; break;
            }
        }

        return {
            ...node,
            targetPosition: isHorizontal ? Position.Left : Position.Top,
            sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
            position: {
                x: nodeWithPosition.x - width / 2,
                y: nodeWithPosition.y - height / 2,
            },
        };
    });

    return { nodes: layoutedNodes, edges };
};

const MindMapContent = ({ initialNodes = [], initialEdges = [], onSave, onBack, topicName }) => {
    const sanitizedEdges = initialEdges.map(edge => ({
        ...edge,
        sourceHandle: edge.sourceHandle || 'b-source',
        targetHandle: edge.targetHandle || 't-target'
    }));

    // Saneamiento de nodos: Los padres (grupos) deben ir antes que los hijos en el array
    const sortedNodes = [...initialNodes].sort((a, b) => {
        if (a.type === 'group' && b.type !== 'group') return -1;
        if (a.type !== 'group' && b.type === 'group') return 1;
        return 0;
    });

    const [nodes, setNodes, onNodesChange] = useNodesState(sortedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(sanitizedEdges);
    const [lastSaved, setLastSaved] = useState(new Date().toLocaleTimeString());
    const [isSaving, setIsSaving] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const { fitView } = useReactFlow();

    const onLayout = useCallback(
        (direction) => {
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                nodes,
                edges,
                direction
            );

            setNodes([...layoutedNodes]);
            setEdges([...layoutedEdges]);

            window.requestAnimationFrame(() => {
                fitView({ duration: 800 });
            });
        },
        [nodes, edges, fitView]
    );

    // Estado para el modal de edición de conexiones
    const [editingEdge, setEditingEdge] = useState(null);
    const [isEdgeModalOpen, setIsEdgeModalOpen] = useState(false);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge({ ...params, label: '', animated: false }, eds)),
        [setEdges]
    );

    const onEdgeDoubleClick = useCallback((event, edge) => {
        setEditingEdge(edge);
        setIsEdgeModalOpen(true);
    }, []);

    const handleEdgeSave = ({ label, color, direction }) => {
        setEdges((eds) =>
            eds.map((e) => {
                if (e.id === editingEdge.id) {
                    const markerEnd = (direction === 'forward' || direction === 'both')
                        ? { type: 'arrowclosed', color }
                        : undefined;
                    const markerStart = (direction === 'backward' || direction === 'both')
                        ? { type: 'arrowclosed', color }
                        : undefined;

                    return {
                        ...e,
                        label,
                        data: { ...e.data, direction }, // Guardar dirección en data para persistencia
                        style: { ...e.style, stroke: color, strokeWidth: 2 },
                        labelStyle: { fill: color, fontWeight: 'bold' },
                        markerEnd,
                        markerStart
                    };
                }
                return e;
            })
        );
        setIsEdgeModalOpen(false);
        setEditingEdge(null);
    };

    const handleSave = async (isSilent = false) => {
        if (isSaving) return;
        setIsSaving(true);
        const success = await onSave({ nodes, edges }, isSilent);
        if (success) {
            setLastSaved(new Date().toLocaleTimeString());
        }
        setIsSaving(false);
    };

    // Autoguardado cada 15 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            handleSave(true);
        }, 15000); // 15 segundos

        return () => clearInterval(interval);
    }, [nodes, edges]); // Se reinicia el timer si cambian los datos para asegurar persistencia fresca

    const handleAddNode = (type, defaultColor) => {
        const id = `node_${Date.now()}`;
        const isGroup = type === 'group';

        if (isGroup) {
            const selectedNodes = nodes.filter(n => n.selected && n.type !== 'group');

            if (selectedNodes.length > 0) {
                // Calcular el área que abarca la selección
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

                selectedNodes.forEach(node => {
                    const { x, y } = node.position;
                    const w = node.style?.width || 150;
                    const h = node.style?.height || 60;
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x + w);
                    maxY = Math.max(maxY, y + h);
                });

                // Añadir margen al grupo
                const padding = 40;
                const groupX = minX - padding;
                const groupY = minY - padding - 40; // Espacio extra arriba para el título
                const groupW = (maxX - minX) + (padding * 2);
                const groupH = (maxY - minY) + (padding * 2) + 40;

                const groupNode = {
                    id,
                    type: 'group',
                    position: { x: groupX, y: groupY },
                    data: { label: 'Nuevo Grupo' },
                    style: { width: groupW, height: groupH },
                    zIndex: -1,
                };

                // Actualizar nodos hijos para que pertenezcan al grupo
                setNodes((nds) => {
                    const updatedNodes = nds.map(n => {
                        if (n.selected && n.type !== 'group') {
                            return {
                                ...n,
                                parentId: id,
                                extent: 'parent',
                                selected: false,
                                position: {
                                    x: n.position.x - groupX,
                                    y: n.position.y - groupY
                                }
                            };
                        }
                        return n;
                    });
                    return [groupNode, ...updatedNodes];
                });
                return;
            }
        }

        // Creación por defecto (si no hay selección o no es grupo)
        const newNode = {
            id,
            type,
            position: { x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 200 },
            data: {
                label: isGroup ? 'Nuevo Grupo' : (type === 'image' ? 'Nueva Imagen' : 'Nuevo Concepto'),
                url: null,
                style: defaultColor ? { backgroundColor: defaultColor } : undefined
            },
            ...(isGroup ? {
                style: { width: 400, height: 300 },
                zIndex: -1,
            } : {})
        };
        setNodes((nds) => isGroup ? [newNode, ...nds] : nds.concat(newNode));
    };

    const onNodeDragStop = useCallback((event, node) => {
        // Solo procesamos nodos normales (no grupos ni notas grandes) si se desea
        if (node.type === 'group') return;

        // Buscar si el nodo cayó dentro de un grupo
        const groupNode = nodes.find(
            (n) =>
                n.type === 'group' &&
                n.id !== node.id &&
                node.position.x >= n.position.x &&
                node.position.x <= n.position.x + (n.style?.width || 400) &&
                node.position.y >= n.position.y &&
                node.position.y <= n.position.y + (n.style?.height || 300)
        );

        if (groupNode && node.parentId !== groupNode.id) {
            setNodes((nds) =>
                nds.map((n) => {
                    if (n.id === node.id) {
                        return {
                            ...n,
                            parentId: groupNode.id,
                            extent: 'parent',
                            position: {
                                x: node.position.x - groupNode.position.x,
                                y: node.position.y - groupNode.position.y,
                            },
                        };
                    }
                    return n;
                })
            );
        } else if (!groupNode && node.parentId) {
            // Si salió del grupo, volver a coordenadas globales
            const parent = nodes.find(n => n.id === node.parentId);
            if (parent) {
                setNodes((nds) =>
                    nds.map((n) => {
                        if (n.id === node.id) {
                            return {
                                ...n,
                                parentId: undefined,
                                extent: undefined,
                                position: {
                                    x: node.position.x + parent.position.x,
                                    y: node.position.y + parent.position.y,
                                },
                            };
                        }
                        return n;
                    })
                );
            }
        }
    }, [nodes, setNodes]);

    return (
        <div className="flex-1 w-full h-full bg-slate-900 border-t border-slate-800 relative animate-in fade-in duration-500">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onEdgeDoubleClick={onEdgeDoubleClick}
                onNodeDragStop={onNodeDragStop}
                nodeTypes={nodeTypes}
                fitView
                className="bg-slate-900"
                colorMode="dark"
                deleteKeyCode={['Backspace', 'Delete']}
            >
                <Background color="#1e293b" gap={25} size={1} className="opacity-40" />
                <Controls className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl" />
                <MiniMap
                    nodeColor={(node) => {
                        switch (node.type) {
                            case 'image': return '#3b82f6';
                            case 'circle': return '#10b981';
                            case 'diamond': return '#f59e0b';
                            case 'note': return '#fbbf24';
                            default: return '#10b981';
                        }
                    }}
                    maskColor="rgb(15, 23, 42, 0.6)"
                    className="bg-slate-800 border-slate-700"
                />

                <Toolbar onAddNode={handleAddNode} />

                <Panel position="top-left" className="flex gap-3 m-6">
                    <button
                        onClick={onBack}
                        className="p-3 bg-slate-800/60 hover:bg-slate-700/80 text-white rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="hidden sm:inline font-bold text-sm tracking-tight">Volver</span>
                    </button>
                    <button
                        onClick={() => onLayout('TB')}
                        className="p-3 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-2xl border border-blue-400/20 backdrop-blur-xl shadow-2xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 group"
                    >
                        <Layout size={20} className="group-hover:rotate-12 transition-transform" />
                        <span className="hidden sm:inline font-bold text-sm tracking-tight text-white/90">Auto Organizar</span>
                    </button>
                    <button
                        onClick={() => setShowHelp(true)}
                        className="p-3 bg-slate-800/60 hover:bg-blue-600/40 text-blue-400 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 group"
                    >
                        <HelpCircle size={20} className="group-hover:rotate-12 transition-transform" />
                        <span className="hidden sm:inline font-bold text-sm tracking-tight text-white/80">Ayuda</span>
                    </button>
                </Panel>

                <Panel position="top-right" className="flex gap-2 m-6">
                    <button
                        onClick={() => handleSave(false)}
                        disabled={isSaving}
                        className="p-3 px-6 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded-2xl shadow-2xl border border-emerald-400/20 backdrop-blur-xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 font-black text-sm tracking-tight disabled:opacity-50"
                    >
                        <Save size={20} className={`${isSaving ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline uppercase">{isSaving ? 'Guardando...' : 'Guardar Mapa'}</span>
                    </button>
                </Panel>

                <Panel position="bottom-center">
                    <div className="flex flex-col items-center gap-2 mb-8 animate-in slide-in-from-bottom-4 duration-700">
                        <div className="px-6 py-2.5 bg-slate-900/60 backdrop-blur-2xl rounded-full border border-white/5 shadow-2xl text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                <span>Mapa: <span className="text-white/80">{topicName}</span></span>
                            </div>
                            <div className="w-px h-3 bg-white/10" />
                            <div className="flex items-center gap-1.5">
                                <Clock size={12} className="opacity-50" />
                                <span className="opacity-70">{isSaving ? 'Actualizando Drive...' : `Último Guardado: ${lastSaved}`}</span>
                            </div>
                        </div>
                    </div>
                </Panel>

                {showHelp && <HelpPanel onClose={() => setShowHelp(false)} />}

                <EdgeEditModal
                    isOpen={isEdgeModalOpen}
                    onClose={() => setIsEdgeModalOpen(false)}
                    initialLabel={editingEdge?.label || ''}
                    initialColor={editingEdge?.style?.stroke || '#3b82f6'}
                    initialDirection={editingEdge?.data?.direction || 'forward'}
                    onSave={handleEdgeSave}
                    onDelete={() => {
                        setEdges((eds) => eds.filter((e) => e.id !== editingEdge.id));
                        setIsEdgeModalOpen(false);
                    }}
                />
            </ReactFlow>
        </div>
    );
};

const MindMap = (props) => (
    <ReactFlowProvider>
        <MindMapContent {...props} />
    </ReactFlowProvider>
);

export default MindMap;
