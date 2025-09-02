import { DatabaseService } from "../services/database.service.js";
import { EmailCache } from "./authorizedEmails.js";

class ActiveUsersCache {
    constructor() {
        this.users = new Map();
        this.sessions = new Map();
        this.emailToUser = new Map();

    }

    async addUser(sessionId, userData) {
        const userId = userData.id || userData.sub;
        const query = {}
        const authorizedEmails = EmailCache.loadEmailsFromData();
        if (!authorizedEmails.includes(userData.email)) {
            query.correo_informes = userData.email
        }

        const data = await DatabaseService.findElements(
            "proveedors",
            query,
            'proceso',
        )

        const predioIds = Array.isArray(data)
            ? data
                .map(d => d?._id?.toString())
                .filter(Boolean) 
            : [];

        if (predioIds.length === 0) {
            // devuelve vacío o maneja el caso como prefieras
            return [];
        }
        
        const precios = await DatabaseService.findElements(
            "precios",
            { predios: { $in: predioIds } },
            'proceso'
        )

        // Guardar usuario
        this.users.set(sessionId, {
            ...userData,
            loginTime: new Date(),
            lastActivity: new Date(),
            proveedorData: data,
            preciosData: precios
        });

        // Mapeos para búsquedas rápidas
        this.sessions.set(userId, sessionId);
        this.emailToUser.set(userData.email, userId);

        console.log(`👤 Usuario agregado al cache: ${userData.email}`);
    }

    async getAllUsers() {
        return Array.from(this.users.values());
    }

    async getUser(sessionId) {
        return this.users.get(sessionId);
    }

    async logout(sessionId) {
        const user = this.users.get(sessionId);
        if (user) {
            this.users.delete(sessionId);
            this.sessions.delete(user.id);
            this.emailToUser.delete(user.email);
            console.log(`👤 Usuario eliminado del cache: ${user.email}`);
        }
    }

}

const activeUsersCache = new ActiveUsersCache();
export default activeUsersCache;