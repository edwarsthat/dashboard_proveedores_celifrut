import crypto from "crypto";
import config from "../config/environment.js"
import { exchangeCodeForToken, getUserInfo } from "../services/auth.service.js";
const { GOOGLE_REDIRECT_URI, GOOGLE_CLIENT_ID } = config;

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
        res.json({ url: url.toString() });
    } catch (error) {
        console.error('Error en googleAuth:', error);
        res.status(500).json({
            message: "Error interno del servidor",
            status: "error"
        });
    }
}
export async function googleCallback(req, res, next) {
    console.log("🔄 Callback de Google recibido");
    try {
        // 1. Verificar el estado
        const { state, code } = req.query;
        if (!code) return res.status(400).json({ status: "error", message: "Falta code" });
        if (state !== req.session.oauth_state) {
            return res.status(403).json({
                message: "Estado no válido",
                status: "error"
            });
        }
        delete req.session.oauth_state;

        const { access_token, id_token, refresh_token, expires_in } = await exchangeCodeForToken(String(code));

        // 3. Decodificar el ID token para obtener info del usuario
        const userInfo = await getUserInfo(id_token);
        console.log("👤 Información del usuario:", userInfo);

        // 4. Aquí tienes el email del usuario
        const userEmail = userInfo.email;
        console.log("📧 Email del usuario:", userEmail);

        // 5. Guardar información en la sesión
        req.session.user = {
            id: userInfo.sub, // ID único de Google
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
            accessToken: access_token,
            refreshToken: refresh_token, // puede ser undefined si no se otorga
            tokenExpires: Date.now() + (expires_in * 1000)
        };

        // 6. Respuesta exitosa - puedes redirigir o devolver JSON
        res.status(200).json({
            status: "success",
            message: "Autenticación exitosa",
            user: {
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture
            }
        });

    } catch (error) {
        console.error('Error en googleCallback:', error);
        res.status(500).json({
            message: "Error interno del servidor",
            status: "error"
        });
    }
}

