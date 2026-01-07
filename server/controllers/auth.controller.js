import crypto from "crypto";
import config from "../config/environment.js"
import { getUserInfo, getMicrosoftUserInfo, exchangeCodeForTokenMicrosoft, exchangeCodeForToken } from "../services/auth.service.js";
import cacheEmail from "../cache/authorizedEmails.js";
import customLogger from "../config/winston.config.js";
import { AuthValidation } from "../validations/authentication.validation.js";
import { generateCallbackHTML, generateSecureState } from "../utils/authetication.js";
import { AuthenticationError } from "../errors/Auth.error.js";
import activeUsersCache from "../cache/activeUsers.js";
const { GOOGLE_REDIRECT_URI, GOOGLE_CLIENT_ID, MICROSOFT_REDIRECT_URI, MICROSOFT_CLIENT_ID, MICROSOFT_TENANT_ID } = config;


export async function authStatus(req, res, next) {
    try {
        // ✅ Verificar sesión en lugar de token en headers
        if (!req.session?.user) {
            return res.status(401).json({
                message: "No se encontró sesión válida",
                authenticated: false,
                status: "error"
            });
        }
        const user = req.session.user; // Agregar esta línea

        // Verificar si el usuario sigue autorizado
        if (!cacheEmail.isAuthorized(user.email)) {
            // Destruir sesión si ya no está autorizado
            req.session.destroy();
            return res.status(401).json({
                message: "Usuario ya no autorizado",
                authenticated: false,
                status: "error"
            });
        }

        const response = {
            message: "Usuario autenticado correctamente",
            authenticated: true,
            user: {
                email: user.email,
                name: user.name,
                picture: user.picture
            },
            status: "success"
        };

        res.status(200).json(response);
    } catch (err) {
        next(err);
    }
}
export async function authMe(req, res, next) {
    try {
        if (!req.session?.user) return res.json({ authenticated: false });
        const { email, name, picture } = req.session.user;
        res.json({ authenticated: true, user: { email, name, picture } });
    } catch (err) {
        next(err);
    }
}
export function requireAuth(req, res, next) {
    try {
        // Verificar si existe sesión y usuario
        if (!req.session?.user) {
            customLogger.logAuth('warn', 'Intento de acceso sin sesión', {
                event: 'UNAUTHORIZED_ACCESS_ATTEMPT',
                ip: req.ip,
                route: req.originalUrl,
                userAgent: req.headers['user-agent']
            });

            return res.status(401).json({
                message: "Acceso denegado. Debe iniciar sesión.",
                authenticated: false,
                status: "error",
                code: "NO_SESSION"
            });
        }

        const user = req.session.user;

        // Verificar que el email siga autorizado
        if (!cacheEmail.isAuthorized(user.email)) {
            // Destruir sesión si ya no está autorizado
            req.session.destroy();

            customLogger.logSecurity('warn', 'Usuario ya no autorizado intentó acceder', {
                event: 'UNAUTHORIZED_USER_ACCESS',
                email: user.email,
                ip: req.ip,
                route: req.originalUrl,
                severity: 'MEDIUM'
            });

            return res.status(401).json({
                message: "Acceso denegado. Usuario ya no autorizado.",
                authenticated: false,
                status: "error",
                code: "USER_NOT_AUTHORIZED"
            });
        }

        // Agregar información del usuario al request para uso posterior
        req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            picture: user.picture
        };

        // Continuar al siguiente middleware/ruta
        next();

    } catch (error) {
        customLogger.logError('authentication', 'Error en middleware de autenticación', {
            error: error.message,
            stack: error.stack,
            route: req.originalUrl,
            ip: req.ip
        });

        res.status(500).json({
            message: "Error interno de autenticación",
            status: "error",
            code: "AUTH_MIDDLEWARE_ERROR"
        });
    }
}
export async function googleAuth(req, res, next) {
    try {
        const validation = AuthValidation.validateAuthRequest(GOOGLE_REDIRECT_URI, GOOGLE_CLIENT_ID);
        if (!validation.valid) {
            const error = new AuthenticationError(
                'Configuración OAuth inválida',
                'OAUTH_CONFIG_ERROR',
                { errors: validation.errors }
            );
            return next(error);
        }
        // 1. Generar un 'state' aleatorio para seguridad (previene CSRF)
        const state = generateSecureState();
        const stateExpiry = Date.now() + 15 * 60 * 1000; // se deja en 15 minutos para que se cierre el popup. Jp

        // 2. Guardar el state en la sesión del usuario
        req.session.oauth_state = state;
        req.session.oauth_state_expiry = stateExpiry;

        // 3. Crear la URL de autorización de Google
        const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
        url.search = new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            redirect_uri: GOOGLE_REDIRECT_URI,
            response_type: "code",
            scope: "openid email profile",
            state,
            access_type: "offline",
            prompt: "consent",
        }).toString();

        // Asegura que la sesión se escriba antes del 302
        req.session.save((err) => {
            if (err) {
                const error = new AuthenticationError(
                    'Error guardando sesión',
                    'SESSION_SAVE_ERROR',
                    { originalError: err.message }
                );
                return next(error);
            }

            res.redirect(302, url.toString());
        });

    } catch (error) {
        const authError = new AuthenticationError(
            'Error interno en inicio de OAuth',
            'OAUTH_INIT_ERROR',
            { originalError: error.message }
        );

        // customLogger.logError('authentication', 'Error inesperado en googleAuth', authError.toLogObject());
        next(authError);
    }
}
export async function googleCallback(req, res) {
    let sessionCleanupNeeded = true;

    try {
        const { code, state: providedState } = req.query;

        // Validar state antes que nada
        const stateValidation = AuthValidation.validateOAuthState(req, providedState);

        if (!stateValidation.valid) {
            const authError = new AuthenticationError(
                'Validación OAuth fallida',
                `OAUTH_VALIDATION_ERROR_${stateValidation.type}`,
                {
                    errors: stateValidation.errors,
                    sessionId: req.session?.id,
                    ip: req.ip
                }
            );

            // Log de seguridad para intentos maliciosos
            customLogger.logSecurity('warn', 'Validación OAuth fallida', {
                event: 'OAUTH_VALIDATION_FAILED',
                type: stateValidation.type,
                errors: stateValidation.errors,
                severity: stateValidation.type.includes('STATE') ? 'HIGH' : 'MEDIUM',
                ip: req.ip,
                sessionId: req.session?.id
            });

            throw authError;
        }

        // 3. Canjear el código por tokens
        console.log("🔄 Canjeando código por token...");
        const tokenData = await exchangeCodeForToken(code);

        // 4. Obtener información del usuario
        console.log("👤 Obteniendo información del usuario...");
        const userInfo = await getUserInfo(tokenData.id_token);

        // 5. Validar que el correo esté autorizado
        console.log("🔒 Validando autorización:", userInfo.email);
        if (!cacheEmail.isAuthorized(userInfo.email)) {
            const unauthorizedError = new AuthenticationError(
                'Correo no autorizado para acceder al sistema',
                'UNAUTHORIZED_EMAIL',
                {
                    email: userInfo.email,
                    ip: req.ip,
                    sessionId: req.session.id
                }
            );

            customLogger.logSecurity('warn', 'Usuario Google no autorizado intentó acceder', {
                event: 'GOOGLE_UNAUTHORIZED_LOGIN_ATTEMPT',
                email: userInfo.email,
                ip: req.ip,
                severity: 'HIGH'
            });

            throw unauthorizedError;
        }

        // 6. Guardar usuario en la sesión
        req.session.user = {
            id: userInfo.sub,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
            email_verified: userInfo.email_verified
        };

        // 7. Limpiar el state usado
        delete req.session.oauth_state;
        delete req.session.oauth_state_expiry;
        sessionCleanupNeeded = false;

        await activeUsersCache.addUser(req.session.id, req.session.user);

        customLogger.logAuth('info', 'Usuario autenticado exitosamente', {
            event: 'SUCCESSFUL_GOOGLE_LOGIN',
            email: userInfo.email,
            name: userInfo.name,
            ip: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0],
            sessionId: req.session.id
        });

        console.log("✅ Usuario autenticado y autorizado:", userInfo.email);

        // 8. ⚠️ CRÍTICO: Guardar la sesión ANTES de enviar la respuesta Jp
        req.session.save((err) => {
            if (err) {
                console.error("❌ Error guardando sesión:", err);

                const error = new AuthenticationError(
                    'Error guardando sesión después de autenticación',
                    'SESSION_SAVE_ERROR',
                    { originalError: err.message }
                );

                const nonce = crypto.randomBytes(16)
                    .toString("base64")
                    .replace(/\+/g, "-")
                    .replace(/\//g, "_")
                    .replace(/=+$/g, "");

                const csp = [ 
                "default-src 'none'", 
                "base-uri 'none'", 
                "frame-ancestors 'none'", 
                `script-src 'nonce-${nonce}'`, 
                "style-src 'unsafe-inline'",
                `connect-src 'self' ${process.env.FRONT_URL}`, //se agrega el 'self'
                `frame-src ${process.env.FRONT_URL}`
                ].join("; ");
                
                res.setHeader("Content-Security-Policy", csp);
                res.setHeader("Content-Type", "text/html; charset=utf-8");
                res.setHeader("X-Frame-Options", "DENY");
                res.setHeader("X-Content-Type-Options", "nosniff");

                const errorHTML = generateCallbackHTML({
                    status: 'error',
                    message: error.message,
                    origin: process.env.FRONT_URL
                }, nonce);

                return res.status(500).end(errorHTML);
            }

            console.log("💾 Sesión guardada exitosamente - Session ID:", req.session.id);

        // 9. Nonce seguro
        const nonce = crypto.randomBytes(16)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/g, "");

        // 10. CSP
        const csp = [
            "default-src 'none'",
            "base-uri 'none'", 
            "frame-ancestors 'none'",
            `script-src 'nonce-${nonce}'`,
            "style-src 'unsafe-inline'",
            `connect-src 'self' ${process.env.FRONT_URL}`, //se agrega 'self'. Jp
            `frame-src ${process.env.FRONT_URL}`
            ].join("; ");

        res.setHeader("Content-Security-Policy", csp);
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("X-Frame-Options", "DENY");
        res.setHeader("X-Content-Type-Options", "nosniff");

        // 11. HTML con múltiples intentos de envío y cierre rápido
        console.log("📤 Enviando HTML de callback exitoso al popup");
        const callbackHTML = generateCallbackHTML({
            status: 'success',
            user: {
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture
            },
            origin: process.env.FRONT_URL // Cambiar al origen correcto del frontend JP
        }, nonce);

        res.status(200).end(callbackHTML);
        });

    } catch (err) {
        console.error("❌ Error en googleCallback:", err);

        // Log adicional para errores de autenticación usando tu sistema
        if (err.message?.includes('no está autorizado')) {
            customLogger.logCustomError('authentication', 'Error de autorización durante login', {
                event: 'GOOGLE_AUTHORIZATION_ERROR',
                error: err.message,
                stack: err.stack,
                ip: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0],
                userAgent: req.headers['user-agent'],
                sessionId: req.session?.id,
                timestamp: new Date().toISOString(),
                severity: 'HIGH',
                category: 'SECURITY_ERROR'
            });
        }

        // Limpiar state en caso de error
        if (sessionCleanupNeeded && req.session.oauth_state) {
            delete req.session.oauth_state;
            delete req.session.oauth_state_expiry;
        }

        const nonce = crypto.randomBytes(16)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/g, "");

        const csp = [
            "default-src 'none'",
            "base-uri 'none'", 
            "frame-ancestors 'none'", 
            `script-src 'nonce-${nonce}'`, 
            "style-src 'unsafe-inline'",
            `connect-src 'self' ${process.env.FRONT_URL}`, //se agrega 'self'. Jp
            `frame-src ${process.env.FRONT_URL}`
            ].join("; ");

        res.setHeader("Content-Security-Policy", csp);
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("X-Frame-Options", "DENY");
        res.setHeader("X-Content-Type-Options", "nosniff");

        console.log("📤 Notificando error al frontend");
        const errorHTML = generateCallbackHTML({
            status: 'error',
            message: err.message || 'Error interno de autenticación',
            origin: process.env.FRONT_URL
        }, nonce);

        res.status(400).end(errorHTML);
    }
}

export function microsoftAuth(req, res, next) {
    try {

        const validation = AuthValidation.validateMicrosoftAuthRequest(MICROSOFT_REDIRECT_URI, MICROSOFT_CLIENT_ID, MICROSOFT_TENANT_ID);
        if (!validation.valid) {
            const error = new AuthenticationError(
                'Configuración OAuth inválida',
                'OAUTH_CONFIG_ERROR',
                { errors: validation.errors }
            );
            return next(error);
        }

        const state = generateSecureState();
        const stateExpiry = Date.now() + 15 * 60 * 1000; // se dejan en 15 minutos para que se cierre el popup. Jp

        req.session.oauth_state = state;
        req.session.oauth_state_expiry = stateExpiry;

        // 3. Crear la URL de autorización de Google
        const url = new URL(`https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize`);
        url.search = new URLSearchParams({
            client_id: MICROSOFT_CLIENT_ID,
            redirect_uri: MICROSOFT_REDIRECT_URI,
            response_type: "code",
            scope: "openid email profile User.Read",
            state,
            response_mode: "query",
            prompt: "consent" // la deberia cambiar ? Jp
        }).toString();

        // 4. Asegurar que la sesión se escriba antes del redirect
        req.session.save((err) => {
            if (err) {
                const error = new AuthenticationError(
                    'Error guardando sesión',
                    'SESSION_SAVE_ERROR',
                    { originalError: err.message }
                );
                return next(error);
            }

            res.redirect(302, url.toString());
        });


    } catch (error) {
        const authError = new AuthenticationError(
            'Error interno en inicio de OAuth',
            'OAUTH_INIT_ERROR',
            { originalError: error.message }
        );

        // customLogger.logError('authentication', 'Error inesperado en googleAuth', authError.toLogObject());
        next(authError);
    }
}
export async function microsoftCallback(req, res) {
    let sessionCleanupNeeded = true;
    try {
        const { code, state: providedState } = req.query;

        // 1. Validar state antes que nada
        const stateValidation = AuthValidation.validateOAuthState(req, providedState);

        if (!stateValidation.valid) {
            const authError = new AuthenticationError(
                'Validación OAuth fallida',
                `OAUTH_VALIDATION_ERROR_${stateValidation.type}`,
                {
                    errors: stateValidation.errors,
                    sessionId: req.session?.id,
                    ip: req.ip
                }
            );

            // Log de seguridad para intentos maliciosos
            customLogger.logSecurity('warn', 'Validación OAuth Microsoft fallida', {
                event: 'MICROSOFT_OAUTH_VALIDATION_FAILED',
                type: stateValidation.type,
                errors: stateValidation.errors,
                severity: stateValidation.type.includes('STATE') ? 'HIGH' : 'MEDIUM',
                ip: req.ip,
                sessionId: req.session?.id
            });

            throw authError;
        }

        // 2. Canjear el código por tokens (necesitarás una función específica para Microsoft)
        console.log("🔄 Canjeando código Microsoft por token...");
        const tokenData = await exchangeCodeForTokenMicrosoft(code);

        // 3. Obtener información del usuario de Microsoft
        console.log("👤 Obteniendo información del usuario Microsoft...");
        const userInfo = await getMicrosoftUserInfo(tokenData.access_token);

        // 4. Validar que el correo esté autorizado
        console.log("🔒 Validando autorización:", userInfo.mail || userInfo.userPrincipalName);
        const userEmail = userInfo.mail || userInfo.userPrincipalName;

        if (!cacheEmail.isAuthorized(userEmail)) {
            const unauthorizedError = new AuthenticationError(
                'Correo no autorizado para acceder al sistema',
                'UNAUTHORIZED_EMAIL',
                {
                    email: userEmail,
                    ip: req.ip,
                    sessionId: req.session.id
                }
            );

            customLogger.logSecurity('warn', 'Usuario Microsoft no autorizado intentó acceder', {
                event: 'MICROSOFT_UNAUTHORIZED_LOGIN_ATTEMPT',
                email: userEmail,
                ip: req.ip,
                severity: 'HIGH'
            });

            throw unauthorizedError;
        }

        // 5. Guardar usuario en la sesión
        req.session.user = {
            id: userInfo.id,
            email: userEmail,
            name: userInfo.displayName,
            picture: userInfo.photo || null, // Microsoft puede no tener foto
            email_verified: true // Microsoft emails are typically verified
        };

        // 6. Limpiar el state usado
        delete req.session.oauth_state;
        delete req.session.oauth_state_expiry;
        sessionCleanupNeeded = false;

        console.log("🔄 Canjeando código Microsoft por token...", userEmail );
        await activeUsersCache.addUser(req.session.id, req.session.user);

        console.log("✅ Usuario Microsoft autenticado y autorizado:", userEmail);

        // 7. ⚠️ CRÍTICO: Guardar la sesión ANTES de enviar la respuesta Jp
        req.session.save((err) => {
    if (err) {
        console.error("❌ Error guardando sesión:", err);
        const error = new AuthenticationError(
            'Error guardando sesión después de autenticación',
            'SESSION_SAVE_ERROR',
            { originalError: err.message }
        );
        
        // Enviar respuesta de error
        const nonce = crypto.randomBytes(16)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/g, "");

        const csp = [
            "default-src 'none'", 
            "base-uri 'none'", 
            "frame-ancestors 'none'", 
            `script-src 'nonce-${nonce}'`, 
            "style-src 'unsafe-inline'",
            `connect-src 'self' ${process.env.FRONT_URL}`, //se agrega 'self'. Jp
            `frame-src ${process.env.FRONT_URL}`
            ].join("; ");

        res.setHeader("Content-Security-Policy", csp);
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("X-Frame-Options", "DENY");
        res.setHeader("X-Content-Type-Options", "nosniff");

        const errorHTML = generateCallbackHTML({
            status: 'error',
            message: error.message,
            origin: process.env.FRONT_URL
        }, nonce);

        return res.status(500).end(errorHTML);
            }
            
            console.log("💾 Sesión guardada exitosamente - Session ID:", req.session.id);

        // Log de autenticación exitosa
        customLogger.logAuth('info', 'Usuario Microsoft autenticado exitosamente', {
            event: 'SUCCESSFUL_MICROSOFT_LOGIN',
            email: userEmail,
            name: userInfo.displayName,
            ip: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0],
            sessionId: req.session.id
        });

        // 8. Nonce seguro (DENTRO del callback)
        const nonce = crypto.randomBytes(16)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/g, "");

        // 9. CSP headers
        const csp = [
            "default-src 'none'", 
            "base-uri 'none'", 
            "frame-ancestors 'none'", 
            `script-src 'nonce-${nonce}'`, 
            "style-src 'unsafe-inline'",
            `connect-src 'self' ${process.env.FRONT_URL}`, //se agrega 'self'. Jp
            `frame-src ${process.env.FRONT_URL}`
            ].join("; ");

        res.setHeader("Content-Security-Policy", csp);
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("X-Frame-Options", "DENY");
        res.setHeader("X-Content-Type-Options", "nosniff");

        // 10. HTML de respuesta exitosa
        console.log("📤 Enviando HTML de callback exitoso al popup");
        const callbackHTML = generateCallbackHTML({
            status: 'success',
            user: {
                email: userEmail,
                name: userInfo.displayName,
                picture: userInfo.photo || null
            },origin: process.env.FRONT_URL // Cambiar al origen correcto del frontend JP
        }, nonce);

        res.status(200).end(callbackHTML);
        });

    } catch (err) {
        console.error("❌ Error en microsoftCallback:", err);

        // Log adicional para errores de autenticación
        if (err.message.includes('no está autorizado')) {
            customLogger.logCustomError('authentication', 'Error de autorización Microsoft durante login', {
                event: 'MICROSOFT_AUTHORIZATION_ERROR',
                error: err.message,
                stack: err.stack,
                ip: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0],
                userAgent: req.headers['user-agent'],
                sessionId: req.session.id,
                timestamp: new Date().toISOString(),
                severity: 'HIGH',
                category: 'SECURITY_ERROR'
            });
        }

        // Limpiar state en caso de error
        if (sessionCleanupNeeded && req.session.oauth_state) {
            delete req.session.oauth_state;
            delete req.session.oauth_state_expiry;
        }

        const nonce = crypto.randomBytes(16)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/g, "");

        const csp = [
            "default-src 'none'", 
            "base-uri 'none'", 
            "frame-ancestors 'none'", 
            `script-src 'nonce-${nonce}'`, 
            "style-src 'unsafe-inline'",
            `connect-src 'self' ${process.env.FRONT_URL}`, //se agrega 'self'. Jp
            `frame-src ${process.env.FRONT_URL}`
            ].join("; ");

        res.setHeader("Content-Security-Policy", csp);
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("X-Frame-Options", "DENY");
        res.setHeader("X-Content-Type-Options", "nosniff");

        console.log("📤 Notificando error Microsoft al frontend");
        const errorHTML = generateCallbackHTML({
            status: 'error',
            message: err.message || 'Error interno de autenticación Microsoft',
            origin: process.env.FRONT_URL // Cambiar al origen correcto del frontend JP
        }, nonce);

        res.status(400).end(errorHTML);
    }
}
export async function logout(req, res) {
    try {
        console.log("👤 Cierre de sesión para el usuario:", req.session.user.email);
        console.log("Session ID:", req.session.id);
        activeUsersCache.logout(req.session.id);
        req.session.destroy();
        res.json({ message: "Cierre de sesión exitoso" });
    } catch (error) {
        console.error("❌ Error en logout:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
}