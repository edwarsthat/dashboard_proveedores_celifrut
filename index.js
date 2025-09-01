
import http from 'http';
import app from './server/app/app.js';
import { DatabaseService } from './server/services/database.service.js';
import shutdown from './server/utils/gracefullShutdown.js';
import { initJobs } from './server/jobs/index.js';
import errorLogger from './server/config/winston.config.js';

const server = http.createServer(app);
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const HOST = process.env.HOST || '0.0.0.0';
console.log(`Servidor configurado para escuchar en el puerto ${PORT} y la dirección IP ${HOST}`);

(async () => {
    try {

        await DatabaseService.run();
        await initJobs();

        await shutdown.setupShutdownHandlers(server);

        server.listen(PORT, HOST, () => {
            console.log(`El servidor está escuchando en el puerto ${PORT} y la dirección IP ${HOST}.`);
        });

    } catch (err) {
        console.error('Error al iniciar el servidor:', err);
        await errorLogger.flushAll();
        process.exit(1);
    }
})();



