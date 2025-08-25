import crypto from "crypto";
import config from "../config/environment.js"
import { exchangeCodeForToken, getUserInfo } from "../services/auth.service.js";
const { GOOGLE_REDIRECT_URI, GOOGLE_CLIENT_ID, AUTHORIZED_EMAILS } = config;

// Función para validar si el correo está autorizado
function isEmailAuthorized(email) {
    const normalizedEmail = email.toLowerCase().trim();
    return AUTHORIZED_EMAILS.includes(normalizedEmail);
}

export async function authStatus(req, res, next) {
    try {
        // Verificar si hay un token en los headers
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({
                message: "No se encontró token de autenticación",
                authenticated: false,
                status: "error"
            });
        }

        // Aquí podrías verificar el token JWT
        // Por ahora simulo que es válido
        const response = {
            message: "Usuario autenticado correctamente",
            authenticated: true,
            user: {
                id: 1,
                username: "usuario_ejemplo",
                role: "admin",
                lastLogin: new Date().toISOString()
            },
            tokenValid: true,
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
        console.log("Usuario autenticado:", email);
        console

        res.json({ authenticated: true, user: { email, name, picture } });
    } catch (err) {
        next(err);
    }
}
export async function googleAuth(req, res, next) {
    try {
        // 1. Generar un 'state' aleatorio para seguridad (previene CSRF)
        const state = crypto.randomBytes(32).toString('hex');

        // 2. Guardar el state en la sesión del usuario
        req.session.oauth_state = state;

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

        console.log("➡️ Redirigiendo a:", url.toString());
        // Asegura que la sesión se escriba antes del 302
        req.session.save(() => {
            res.redirect(302, url.toString());
        });
    } catch (error) {
        console.error('Error en googleAuth:', error);
        res.status(500).json({
            message: "Error interno del servidor",
            status: "error"
        });
    }
}
export async function googleCallback(req, res) {
    try {
        const { code, state } = req.query;

        // 1. Validar que el state coincida (previene CSRF)
        if (!state || state !== req.session.oauth_state) {
            throw new Error("State inválido - posible ataque CSRF");
        }

        // 2. Validar que recibimos el código de autorización
        if (!code) {
            throw new Error("Código de autorización no encontrado");
        }

        // 3. Canjear el código por tokens
        console.log("🔄 Canjeando código por token...");
        const tokenData = await exchangeCodeForToken(code);

        // 4. Obtener información del usuario
        console.log("👤 Obteniendo información del usuario...");
        const userInfo = await getUserInfo(tokenData.id_token);

        // 5. Validar que el correo esté autorizado
        console.log("🔒 Validando correo autorizado:", userInfo.email);
        if (!isEmailAuthorized(userInfo.email)) {
            console.warn("❌ Correo no autorizado:", userInfo.email);
            throw new Error(`El correo ${userInfo.email} no está autorizado para acceder al sistema`);
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

        console.log("✅ Usuario autenticado y autorizado:", userInfo.email);

        // 8. Nonce seguro
        const nonce = crypto.randomBytes(16)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/g, "");

        // 9. CSP
        const csp = `default-src 'none'; base-uri 'none'; frame-ancestors 'none'; script-src 'self' 'nonce-${nonce}';`;

        res.setHeader("Content-Security-Policy", csp);
        res.setHeader("Content-Type", "text/html; charset=utf-8");

        // FRONTEND_ORIGIN debe coincidir con tu frontend
        const FRONTEND_ORIGIN = "http://localhost:5173";

        console.log("📤 Enviando confirmación al frontend:", FRONTEND_ORIGIN);

        // 10. HTML con múltiples intentos de envío y cierre rápido
        res.status(200).end(`<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>Autenticación exitosa</title>
</head>
<body>
    <script nonce="${nonce}">
    (function(){
        const targetOrigin = ${JSON.stringify(FRONTEND_ORIGIN)};
        const userData = {
            type: "oauth_callback",
            status: "success",
            user: {
                email: ${JSON.stringify(userInfo.email)},
                name: ${JSON.stringify(userInfo.name)},
                picture: ${JSON.stringify(userInfo.picture)}
            }
        };
        
        let messageSent = false;
        
        function sendMessage() {
            try {
                if (window.opener && !window.opener.closed && !messageSent) {
                    window.opener.postMessage(userData, targetOrigin);
                    console.log('Mensaje enviado exitosamente');
                    messageSent = true;
                    // Cerrar inmediatamente después del envío exitoso
                    setTimeout(function(){
                        window.close();
                    }, 100);
                } else if (!window.opener || window.opener.closed) {
                    console.error('No se pudo acceder al opener');
                }
            } catch (e) {
                console.error('Error enviando mensaje:', e);
            }
        }
        
        // Intentar enviar inmediatamente
        sendMessage();
        
        // Reintentar cada 100ms por hasta 3 segundos si no se envió
        let attempts = 0;
        const maxAttempts = 30;
        const interval = setInterval(function(){
            if (messageSent || attempts >= maxAttempts) {
                clearInterval(interval);
                if (!messageSent) {
                    console.log('Timeout enviando mensaje, cerrando ventana');
                    window.close();
                }
                return;
            }
            sendMessage();
            attempts++;
        }, 100);
        
    })();
    </script>
    <p>✅ Autenticación exitosa. Cerrando ventana...</p>
</body>
</html>`);

    } catch (err) {
        console.error("❌ Error en googleCallback:", err);

        // Limpiar state en caso de error
        if (req.session.oauth_state) {
            delete req.session.oauth_state;
        }

        const nonce = crypto.randomBytes(16)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/g, "");
        const csp = `default-src 'none'; base-uri 'none'; frame-ancestors 'none'; script-src 'self' 'nonce-${nonce}';`;

        res.setHeader("Content-Security-Policy", csp);
        res.setHeader("Content-Type", "text/html; charset=utf-8");

        const FRONTEND_ORIGIN = "http://localhost:5173";

        console.log("📤 Notificando error al frontend");
        res.status(400).end(`<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>Error de autenticación</title>
</head>
<body>
    <script nonce="${nonce}">
    (function(){
        const targetOrigin = ${JSON.stringify(FRONTEND_ORIGIN)};
        const errorData = {
            type: "oauth_callback",
            status: "error",
            message: ${JSON.stringify(err.message)}
        };
        
        let messageSent = false;
        
        function sendErrorMessage() {
            try {
                if (window.opener && !window.opener.closed && !messageSent) {
                    window.opener.postMessage(errorData, targetOrigin);
                    console.log('Mensaje de error enviado exitosamente');
                    messageSent = true;
                    setTimeout(function(){
                        window.close();
                    }, 100);
                }
            } catch (e) {
                console.error('Error enviando mensaje de error:', e);
            }
        }
        
        // Intentar enviar inmediatamente
        sendErrorMessage();
        
        // Reintentar si no se envió
        let attempts = 0;
        const maxAttempts = 20;
        const interval = setInterval(function(){
            if (messageSent || attempts >= maxAttempts) {
                clearInterval(interval);
                if (!messageSent) {
                    window.close();
                }
                return;
            }
            sendErrorMessage();
            attempts++;
        }, 100);
        
    })();
    </script>
    <p>❌ Error en la autenticación: ${err.message}</p>
</body>
</html>`);
    }
}
