import config from "../config/environment.js"
const { GOOGLE_REDIRECT_URI, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = config;

export async function exchangeCodeForToken(code) {
    const body = new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI, // DEBE ser la misma de la fase de autorización
        grant_type: "authorization_code",
    });

    const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Token exchange failed: ${errorData.error || response.statusText}`);
    }

    return await response.json();
}
export async function getUserInfo(idToken) {
    try {
        // Decodificar el JWT sin verificar (Google ya lo firmó)
        const payload = JSON.parse(
            Buffer.from(idToken.split('.')[1], 'base64').toString()
        );

        // Verificar que el token no haya expirado
        if (payload.exp * 1000 < Date.now()) {
            throw new Error('Token expirado');
        }

        return {
            sub: payload.sub,      // ID único del usuario
            email: payload.email,  // Email del usuario
            name: payload.name,    // Nombre completo
            picture: payload.picture, // URL de la foto de perfil
            email_verified: payload.email_verified
        };
    } catch (error) {
        console.error('Error decodificando ID token:', error);
        throw new Error('Token inválido');
    }
}