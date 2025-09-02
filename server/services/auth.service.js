import config from "../config/environment.js"
const { 
    GOOGLE_REDIRECT_URI, 
    GOOGLE_CLIENT_ID, 
    GOOGLE_CLIENT_SECRET, 
    MICROSOFT_CLIENT_ID, 
    MICROSOFT_CLIENT_SECRET, 
    MICROSOFT_REDIRECT_URI ,
    MICROSOFT_TENANT_ID
} = config;

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
export async function exchangeCodeForTokenMicrosoft(code) {
    
    const tokenUrl = `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/oauth2/v2.0/token`;
    
    const body = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: MICROSOFT_CLIENT_ID,
        client_secret: MICROSOFT_CLIENT_SECRET,
        code: code,
        redirect_uri: MICROSOFT_REDIRECT_URI,
        scope: 'openid email profile User.Read'
    });

    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response from Microsoft:', errorText);
        throw new Error(`Error intercambiando código por token: ${response.status} - ${errorText}`);
    }

    return await response.json();
}
export async function getMicrosoftUserInfo(accessToken) {
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error getting Microsoft user info:', errorText);
        throw new Error(`Error obteniendo información del usuario: ${response.status}`);
    }

    return await response.json();
}