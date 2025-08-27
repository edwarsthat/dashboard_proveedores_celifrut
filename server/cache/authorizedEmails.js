
class EmailCache {
    constructor() {
        this.authorizedEmails = new Set();
        this.lastUpdate = null;
        this.isUpdating = false;
        this.fallbackEmails = [
            'admin@celifrut.com',
            'gerencia@celifrut.com',
            'sistemacelifrut@gmail.com'
        ];
    }

    // Métodos principales
    setEmails(emailList) {
        this.authorizedEmails.clear();
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
}