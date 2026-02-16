import { useState, useEffect } from 'react';
import { GoogleDriveService } from './lib/googleDrive';
import TopicSelector from './components/TopicSelector';
import MindMap from './components/MindMap';
import Loader from './components/Loader';
import { LogOut, Cloud } from 'lucide-react';

const CLIENT_ID = '690344537148-gbfkb9mhdf5m7urgv5qs204ut9uvom66.apps.googleusercontent.com';

function App() {
    const [driveService, setDriveService] = useState(null);
    const [status, setStatus] = useState('Esperando Google...');
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState('login'); // login, selector, map
    const [topics, setTopics] = useState([]);
    const [activeTopic, setActiveTopic] = useState(null);
    const [mapId, setMapId] = useState(null);
    const [mapData, setMapData] = useState({ nodes: [], edges: [] });
    const [rootFolderId, setRootFolderId] = useState(null);

    useEffect(() => {
        const waitForGoogle = () => {
            if (window.google && window.google.accounts) {
                try {
                    const service = new GoogleDriveService(CLIENT_ID);
                    service.initGsi();
                    setDriveService(service);
                    setStatus('Listo para conectar');
                } catch (err) {
                    console.error('Error inicializando GSI:', err);
                    setStatus('❌ Error al inicializar Google Services');
                }
            } else {
                setTimeout(waitForGoogle, 100);
            }
        };
        waitForGoogle();
    }, []);

    const handleConnect = async () => {
        if (!driveService) return;
        setLoading(true);
        try {
            await driveService.getAccessToken();
            const rootId = await driveService.findOrCreateFolder('Mis Notas Personales');
            setRootFolderId(rootId);
            await loadTopics(rootId);
            setView('selector');
        } catch (error) {
            console.error(error);
            alert('Error de conexión con Google Drive');
        } finally {
            setLoading(false);
        }
    };

    const loadTopics = async (rootId) => {
        if (!driveService) return;
        setLoading(true);
        try {
            const files = await driveService.listFiles(rootId);
            setTopics(files.filter(f => f.mimeType === 'application/vnd.google-apps.folder'));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTopic = async (name) => {
        setLoading(true);
        try {
            const folderId = await driveService.findOrCreateFolder(name, rootFolderId);
            const fileName = `${name}.json`;
            const initialData = { nodes: [], edges: [] };
            const fileRes = await driveService.createJsonFile(folderId, fileName, initialData);

            setTopics(prev => [...prev, { id: folderId, name }]);
            handleSelectTopic({ id: folderId, name });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTopic = async (topic) => {
        setLoading(true);
        setActiveTopic(topic);
        try {
            const files = await driveService.listFiles(topic.id);
            const jsonFile = files.find(f => f.name === `${topic.name}.json`);
            if (jsonFile) {
                setMapId(jsonFile.id);
                const blob = await driveService.getFile(jsonFile.id);
                const text = await blob.text();
                setMapData(JSON.parse(text));
            } else {
                const res = await driveService.createJsonFile(topic.id, `${topic.name}.json`, { nodes: [], edges: [] });
                setMapId(res.id);
                setMapData({ nodes: [], edges: [] });
            }
            setView('map');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveMap = async (data) => {
        setLoading(true);
        try {
            await driveService.updateJsonFile(mapId, data);
            setMapData(data);
            alert('Mapa guardado con éxito');
        } catch (error) {
            console.error(error);
            alert('Error al guardar el mapa');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-slate-900 text-white font-sans flex flex-col">
            <header className="px-6 py-4 flex justify-between items-center border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-lg shadow-lg shadow-blue-500/20">
                        <Cloud size={20} className="text-white" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight hidden sm:block">MindDrive</h1>
                </div>

                <div className="flex items-center gap-4">
                    {view !== 'login' && (
                        <button
                            onClick={() => { setView('login'); window.location.reload(); }}
                            className="p-2 text-slate-400 hover:text-white transition-colors"
                            title="Cerrar Sesión"
                        >
                            <LogOut size={20} />
                        </button>
                    )}
                </div>
            </header>

            <main className="flex-1 flex flex-col relative">
                {loading && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center">
                        <Loader message="Sincronizando con Drive..." />
                    </div>
                )}

                {view === 'login' && (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in fade-in zoom-in duration-500">
                        <div className="space-y-4 max-w-md">
                            <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">
                                Tus ideas, en tu Drive.
                            </h2>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                Crea mapas mentales hermosos y guárdalos automáticamente en carpetas organizadas por temas.
                            </p>
                        </div>
                        <button
                            onClick={handleConnect}
                            disabled={loading}
                            className="px-10 py-4 bg-blue-600 hover:bg-blue-500 rounded-full font-bold text-lg shadow-2xl shadow-blue-500/30 transition-all transform hover:scale-105 active:scale-95"
                        >
                            Empezar ahora
                        </button>
                        <p className="text-slate-600 text-xs italic">Estado: {status}</p>
                    </div>
                )}

                {view === 'selector' && (
                    <TopicSelector
                        topics={topics}
                        onSelect={handleSelectTopic}
                        onCreate={handleCreateTopic}
                        loading={loading}
                    />
                )}

                {view === 'map' && activeTopic && (
                    <MindMap
                        initialNodes={mapData.nodes}
                        initialEdges={mapData.edges}
                        topicName={activeTopic.name}
                        onSave={handleSaveMap}
                        onBack={() => setView('selector')}
                    />
                )}
            </main>
        </div>
    );
}

export default App;
