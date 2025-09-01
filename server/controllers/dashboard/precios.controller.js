import activeUsersCache from "../../cache/activeUsers.js";

export async function getPrecios(req, res, next) {
    try {
        // Obtener datos del usuario desde el middleware de autenticación        
        const user = await activeUsersCache.getUser(req.session.id);

        res.json({ 
            success: true,
            user: {
                email: user.email,
                name: user.name,
                proveedorData: user.proveedorData,
                preciosData: user.preciosData
            } 
        });
    } catch (error) {
        next(error);
    }
}