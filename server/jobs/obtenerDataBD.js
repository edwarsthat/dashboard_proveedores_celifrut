import cacheEmail from "../cache/authorizedEmails.js";
import tipoFrutasCacheInstance from "../cache/tipoFrutaCache.js";
import { JobError } from "../errors/JobError.js";
import { DatabaseService } from "../services/database.service.js";

export async function getAuthorizedEmails() {
    try {
        // Lógica para obtener correos autorizados
        console.log('🔍 Iniciando obtención de correos autorizados...');

        // Lógica para obtener correos autorizados
        const status = DatabaseService.getStatus();
        console.log('📊 Status de conexiones:', status);

        if (!status.proceso) {
            console.log('🔄 Reconectando a base de datos proceso...');
            await DatabaseService.runProceso(); // Usar runProceso() para conectar solo proceso
        }

        // Verificar conexión nuevamente
        const newStatus = DatabaseService.getStatus();
        if (!newStatus.proceso) {
            throw new Error('No se pudo establecer conexión con la base de datos proceso');
        }

        const data = await DatabaseService.findElements(
            "proveedors",
            {
                activo: true,
                correo_informes: { $exists: true }
            },
            'proceso',
            { projection: { correo_informes: 1 } }
        )
        cacheEmail.setEmails(data.map(item => item.correo_informes).filter(email => email));
    } catch (err) {
        console.error('❌ Error en getAuthorizedEmails:', err);

        // Crear el error personalizado
        const jobError = new JobError({
            message: 'Error obteniendo correos autorizados',
            meta: { col: 'proveedors', task: 'getAuthorizedEmails' },
            cause: err
        });

        // Loggear el error correctamente
        errorLogger.logCustomError('jobs', jobError.message, {
            collection: 'proveedors',
            task: 'getAuthorizedEmails',
            originalError: err.message,
            stack: err.stack,
            timestamp: new Date().toISOString()
        });

        // Flush logs antes de salir
        await errorLogger.flushAll();

        // Re-lanzar el error o manejarlo según tu lógica de negocio
        throw jobError;

    }
}

export async function getTiposFruta() {
    await tipoFrutasCacheInstance.run();
}