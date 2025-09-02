


export class AuthValidation {
    static validateAuthRequest(GOOGLE_REDIRECT_URI, GOOGLE_CLIENT_ID) {
        const errors = [];

        if (!GOOGLE_CLIENT_ID) {
            errors.push('GOOGLE_CLIENT_ID no configurado');
        }

        if (!GOOGLE_REDIRECT_URI) {
            errors.push('GOOGLE_REDIRECT_URI no configurado');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }

    static validateMicrosoftAuthRequest(MICROSOFT_REDIRECT_URI, MICROSOFT_CLIENT_ID, MICROSOFT_TENANT_ID) {
        const errors = [];

        if (!MICROSOFT_CLIENT_ID) {
            errors.push('MICROSOFT_CLIENT_ID no configurado');
        }

        if (!MICROSOFT_REDIRECT_URI) {
            errors.push('MICROSOFT_REDIRECT_URI no configurado');
        }

        if (!MICROSOFT_TENANT_ID) {
            errors.push('MICROSOFT_TENANT_ID no configurado');
        }

        // Validaciones adicionales específicas de Microsoft
        if (MICROSOFT_TENANT_ID && !this.isValidMicrosoftTenantId(MICROSOFT_TENANT_ID)) {
            errors.push('MICROSOFT_TENANT_ID formato inválido');
        }

        if (MICROSOFT_REDIRECT_URI && !this.isValidRedirectUri(MICROSOFT_REDIRECT_URI)) {
            errors.push('MICROSOFT_REDIRECT_URI formato inválido');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }

    static isValidMicrosoftTenantId(tenantId) {
        // Puede ser 'common', 'organizations', 'consumers', o un GUID válido
        const commonTenants = ['common', 'organizations', 'consumers'];
        const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        
        return commonTenants.includes(tenantId) || guidRegex.test(tenantId);
    }

    static isValidRedirectUri(uri) {
        try {
            const url = new URL(uri);
            return url.protocol === 'https:' || (url.protocol === 'http:' && url.hostname === 'localhost');
        } catch {
            return false;
        }
    }
    static validateOAuthState(req, providedState) {
        const sessionState = req.session.oauth_state;
        const sessionExpiry = req.session.oauth_state_expiry;

        // 1. ¿Existe el state en la sesión?
        if (!sessionState || !sessionExpiry) {
            return { valid: false, reason: 'NO_STATE_IN_SESSION' };
        }

        // 2. ¿Ha expirado el state?
        if (Date.now() > sessionExpiry) {
            // ¡Aquí detectamos ataques de replay tardíos!
            return { valid: false, reason: 'STATE_EXPIRED' };
        }

        // 3. ¿Coincide exactamente?
        if (sessionState !== providedState) {
            return { valid: false, reason: 'STATE_MISMATCH' };
        }

        return { valid: true };
    }
}