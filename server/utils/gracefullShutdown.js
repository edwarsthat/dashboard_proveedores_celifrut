import { DatabaseService } from "../services/database.service.js";

class Shutdown {
    constructor() {
        this.isShuttingDown = false;
        this.shutdownTimeout = 30_000; // 30 segundos 
    }

    async setupShutdownHandlers(server) {
        const shutdown = async (signal) => {
            if (this.isShuttingDown) {
                console.log(`⚠️  Forzando salida - segunda señal ${signal} recibida`);
                process.exit(1);
            }

            this.isShuttingDown = true;
            console.log(`\n🔄 Recibida señal ${signal}. Iniciando cierre...`);

            // Configurar timeout para forzar salida si toma mucho tiempo
            const forceExitTimeout = setTimeout(() => {
                console.log('⏰ Timeout alcanzado, forzando salida...');
                process.exit(1);
            }, this.shutdownTimeout);

            try {
                // 1. Dejar de aceptar nuevas conexiones
                console.log('🚪 Cerrando servidor HTTP...');
                await server.close();

                // 2. Cerrar conexiones de base de datos
                console.log('🔐 Cerrando conexiones de base de datos...');
                await DatabaseService.close();

                // 3. Aquí puedes agregar más cleanup si es necesario
                // await cleanupOtherResources();

                clearTimeout(forceExitTimeout);
                console.log('✅ Servidor cerrado correctamente');
                process.exit(0);

            } catch (error) {
                console.error('❌ Error durante el cierre:', error);
                clearTimeout(forceExitTimeout);
                process.exit(1);
            }
        };

        // Configurar manejadores de señales
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGHUP', () => shutdown('SIGHUP'));

        // Manejar errores no capturados
        process.on('uncaughtException', (error) => {
            console.error('💥 Error no capturado:', error);
            shutdown('uncaughtException');
        });

        process.on('unhandledRejection', (reason) => {
            console.error('💥 Promise rechazada sin manejar:', reason);
            shutdown('unhandledRejection');
        });

        console.log('🛡️  Manejadores de cierre graceful configurados');
    }
}

const shutdown = new Shutdown();
export default shutdown;