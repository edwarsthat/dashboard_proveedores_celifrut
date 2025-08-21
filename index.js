import app from "./app/app.js";
import http from 'http';

const server = http.createServer(app);
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const HOST = process.env.HOST || '0.0.0.0';
console.log(`Servidor configurado para escuchar en el puerto ${PORT} y la dirección IP ${HOST}`);

(async () => {
    try {

        server.listen(PORT, HOST, () => {
            console.log(`El servidor está escuchando en el puerto ${PORT} y la dirección IP ${HOST}.`);
        });

    } catch (err) {
        console.error('Error al iniciar el servidor:', err);
        process.exit(1);
    }
})();



