// ecosystem.config.js
module.exports = {
    apps: [
        {
            name: "dashboard-proveedores",   // 👈 Nombre del proceso en PM2
            script: "index.js",              // Archivo principal
            node_args: "--env-file=.env",    // Para cargar las variables de entorno
            watch: false,                    // Opcional: no reiniciar al guardar archivos
            autorestart: true,               // Reinicio automático si falla
            max_memory_restart: "500M",      // Reinicio si excede la memoria
            env: {
                NODE_ENV: "production"         // Puedes forzar el entorno aquí
            }
        }
    ]
}
