// server/cache/authorizedEmails.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class EmailCache {
    constructor() {
        this.authorizedEmails = new Set();
        this.lastUpdate = null;
        this.isUpdating = false;

        // Bootstrap: carga inicial desde disco
        const privileged = EmailCache.loadEmailsFromData();
        this.#addList(privileged);
        this.lastUpdate = new Date();
        console.log(`🚀 Cache inicializado con ${this.authorizedEmails.size} correos.`);
    }

    // Mantén setEmails como arrow para no perder el this si lo pasas como callback
    setEmails = (emailList = []) => {
        // Si quieres reemplazar completamente el cache, descomenta:
        // this.authorizedEmails.clear();

        // Mezcla: primero los privilegiados del JSON, luego los que vengan de BD
        const privileged = EmailCache.loadEmailsFromData();
        this.#addList(privileged);
        this.#addList(emailList);

        this.lastUpdate = new Date();
        console.log(`✅ Cache actualizado: ${this.authorizedEmails.size} emails autorizados`);
    };

    isAuthorized(email) {
        console.log(email)
        console.log(this.authorizedEmails)
        if (!email || typeof email !== 'string') return false;
        return this.authorizedEmails.has(email.toLowerCase().trim());
    }

    getInfo() {
        return {
            totalEmails: this.authorizedEmails.size,
            lastUpdate: this.lastUpdate,
            isUpdating: this.isUpdating,
            timeSinceUpdate: this.lastUpdate
                ? Math.floor((Date.now() - this.lastUpdate.getTime()) / 1000 / 60) + ' minutos'
                : 'Nunca',
        };
    }

    getAllEmails() {
        return [...this.authorizedEmails];
    }

    clear() {
        this.authorizedEmails.clear();
        this.lastUpdate = null;
        console.log('🗑️  Cache de emails limpiado');
    }

    setUpdating(status) {
        this.isUpdating = status;
    }

    // --- Helpers privados ---
    #addList(list = []) {
        for (const email of list) {
            if (this.isValidEmail(email)) {
                this.authorizedEmails.add(String(email).toLowerCase().trim());
            }
        }
        console.log(this.authorizedEmails)
    }

    isValidEmail(email) {
        if (!email || typeof email !== 'string') return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    }

    static loadEmailsFromData() {
        try {
            // Ruta robusta: relative al archivo actual
            const configPath = path.resolve(__dirname, '../data/authorizedEmails.json');
            const raw = fs.readFileSync(configPath, 'utf8');
            const parsed = JSON.parse(raw);

            // Soporta formatos: ["a@b.com"] o { "emails": [...] }
            if (Array.isArray(parsed)) return parsed;
            if (parsed && Array.isArray(parsed.emails)) return parsed.emails;

            return [];
        } catch (error) {
            // Fallback sensato
            return [
                'admin@celifrut.com',
                'gerencia@celifrut.com',
                'sistemacelifrut@gmail.com',
            ];
        }
    }
}

const cacheEmail = new EmailCache();
export default cacheEmail;
