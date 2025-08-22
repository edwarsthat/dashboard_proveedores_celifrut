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
        const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth' +
            new URLSearchParams({
                client_id: process.env.GOOGLE_CLIENT_ID,
                redirect_uri: 'http://localhost:3000/auth/google/callback',
                response_type: 'code',
                scope: 'openid email profile',
                state: state,
                access_type: 'offline',
                prompt: 'consent'
            });

        // 4. Redirigir al usuario a Google
        console.log('📱 Redirigiendo a Google:', googleAuthUrl);
        res.redirect(googleAuthUrl);
    } catch (error) {
        console.error('Error en googleAuth:', error);
        res.status(500).json({
            message: "Error interno del servidor",
            status: "error"
        });
    }
}