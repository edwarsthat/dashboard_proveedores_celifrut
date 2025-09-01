import fs from 'fs';
import path from 'path';

export class EmailCache {
    constructor() {
        this.constructEmails();
        this.lastUpdate = null;
        this.isUpdating = false;

    }

    // Validación de email
    isValidEmail(email) {
        if (!email || typeof email !== 'string') return false;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    }

    // Métodos principales
    setEmails(emailList) {
        // this.authorizedEmails.clear();
        emailList.forEach(email => {
            if (email && this.isValidEmail(email)) {
                this.authorizedEmails.add(email.toLowerCase().trim());
            }
        });
        this.lastUpdate = new Date();
        console.log(`✅ Cache actualizado: ${this.authorizedEmails.size} emails autorizados`);
    }

    isAuthorized(email) {
        if (!email || typeof email !== 'string') return false;
        return this.authorizedEmails.has(email.toLowerCase().trim());
    }

    getInfo() {
        return {
            totalEmails: this.authorizedEmails.size,
            lastUpdate: this.lastUpdate,
            isUpdating: this.isUpdating,
            timeSinceUpdate: this.lastUpdate ?
                Math.floor((Date.now() - this.lastUpdate.getTime()) / 1000 / 60) + ' minutos' :
                'Nunca'
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

    // Estado interno
    setUpdating(status) {
        this.isUpdating = status;
    }

    constructEmails() {
        try {
            this.loadEmailsFromData
            this.authorizedEmails = new Set(configData.privilegedEmails || []);
        } catch (error) {
            console.warn('⚠️  No se pudo cargar configuración, usando emails por defecto');
            this.authorizedEmails = new Set([
                'admin@celifrut.com',
                'gerencia@celifrut.com',
                'sistemacelifrut@gmail.com'
            ]);
            this.fallbackEmails = ['admin@celifrut.com'];
        }
    }
    loadEmailsFromData() {
        try {
            const configPath = path.join(process.cwd(), 'server', 'data', 'authorizedEmails.json');
            const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));


        } catch (error) {
            console.warn('⚠️  No se pudo cargar configuración, usando emails por defecto');
            this.authorizedEmails = new Set([
                'admin@celifrut.com',
                'gerencia@celifrut.com',
                'sistemacelifrut@gmail.com'
            ]);
        }
    }
    static loadEmailsFromData() {
        try {
            const configPath = path.join(process.cwd(), 'server', 'data', 'authorizedEmails.json');
            const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            return configData || []
        } catch (error) {
            return [
                'admin@celifrut.com',
                'gerencia@celifrut.com',
                'sistemacelifrut@gmail.com'
            ]
        }
    }
}

const cacheEmail = new EmailCache();
export default cacheEmail;
