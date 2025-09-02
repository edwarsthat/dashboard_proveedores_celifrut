import activeUsersCache from "../../cache/activeUsers.js";
import tipoFrutasCacheInstance from "../../cache/tipoFrutaCache.js";
import { ponerCalidadesPrecios } from "../../services/dashboard/precios.service.js";

export async function getPrecios(req, res, next) {
    try {
        // Obtener datos del usuario desde el middleware de autenticación        
        const user = await activeUsersCache.getUser(req.session.id);
        const newPrecios = await ponerCalidadesPrecios(user.preciosData);
        const tiposFruta = tipoFrutasCacheInstance.getAll();
        res.json({ 
            success: true,
            tiposFruta,
            user: {
                email: user.email,
                name: user.name,
                proveedorData: user.proveedorData,
                preciosData: newPrecios
            } 
        });
    } catch (error) {
        next(error);
    }
}