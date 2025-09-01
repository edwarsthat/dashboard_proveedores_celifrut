


export class AuthValidation {
    static validateAuthRequest(GOOGLE_REDIRECT_URI, GOOGLE_CLIENT_ID) {
        console.log("asdsad", GOOGLE_CLIENT_ID)
        console.log(GOOGLE_REDIRECT_URI)
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