import tipoFrutasCacheInstance from "../../cache/tipoFrutaCache";
import { DashboardError } from "../../errors/Services.error";

export async function ponerCalidadesPrecios(precios) {
    // try {
    //     const out = []
    //     const tiposFrutas = tipoFrutasCacheInstance.getAll();

    //     for (const precio in precios) {
    //         const tipoFruta = tiposFrutas.get(precio.tipoFruta)
    //         if (tipoFruta) {
    //             for(const calidad of tipoFruta.exportacion) {
    //                 const calidadName = tipoFruta.calidades.find(c => c._id.toString() === calidad.toString());
    //                 if (calidadName) {
                        
    //                     };
    //                 }
    //             }
    //         }
            
    //     }

       

    // } catch (error) {
    //     console.error('❌ Error en ponerCalidadesPrecios:', error);

    //     const serviceError = new DashboardError({
    //         message: 'Error obteniendo poniendo calidades a los precios',
    //         meta: { col: 'services precios', task: 'ponerCalidadesPrecios' },
    //         cause: error
    //     });

    //     // Loggear el error correctamente
    //     errorLogger.logCustomError('database', serviceError.message, {
    //         collection: 'services precios',
    //         task: 'ponerCalidadesPrecios',
    //         originalError: error.message,
    //         stack: error.stack,
    //         timestamp: new Date().toISOString()
    //     });

    //     // Flush logs antes de salir
    //     await errorLogger.flushAll();

    //     // Re-lanzar el error o manejarlo según tu lógica de negocio
    //     throw serviceError;
    // }
}