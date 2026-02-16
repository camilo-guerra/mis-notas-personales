import { useState, useEffect } from 'react';
import { GoogleDriveService } from './lib/googleDrive';

const CLIENT_ID = '690344537148-gbfkb9mhdf5m7urgv5qs204ut9uvom66.apps.googleusercontent.com';

function App() {
    const [driveService, setDriveService] = useState(null);
    const [status, setStatus] = useState('Esperando inicialización...');
    const [loading, setLoading] = useState(false);

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
                // Reintentar en 100ms si el script aún no carga
                setTimeout(waitForGoogle, 100);
            }
        };

        waitForGoogle();
    }, []);

    const handleConnectAndTest = async () => {
        if (!driveService) return;

        setLoading(true);
        setStatus('Autenticando...');

        try {
            await driveService.getAccessToken();

            setStatus('Buscando carpeta "Mis Notas Personales"...');
            const folderId = await driveService.findOrCreateFolder('Mis Notas Personales');

            setStatus(`Carpeta lista (ID: ${folderId}). Creando archivo.json...`);
            await driveService.createJsonFile(folderId, 'archivo.json', {
                status: 'connected',
                timestamp: new Date().toISOString()
            });

            setStatus('✅ Conexión exitosa y archivo creado en Drive.');
        } catch (error) {
            console.error(error);
            setStatus('❌ Error en la conexión: ' + (error.message || 'Ver consola'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 font-sans">
            <div className="w-full max-w-sm space-y-8 text-center">
                <header className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                        Mis Notas Personales
                    </h1>
                    <p className="text-slate-400 text-lg">Hello World! 👋</p>
                </header>

                <main className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-700 shadow-2xl space-y-6">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Estado</p>
                        <p className="text-md text-slate-200">{status}</p>
                    </div>

                    <button
                        onClick={handleConnectAndTest}
                        disabled={loading}
                        className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all transform active:scale-95 ${loading
                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/20'
                            }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Procesando...
                            </span>
                        ) : (
                            'Probar Conexión Drive'
                        )}
                    </button>
                </main>

                <footer className="text-slate-500 text-xs">
                    Built with React + Vite + Tailwind 🚀
                </footer>
            </div>
        </div>
    );
}

export default App;
