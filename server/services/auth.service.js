import config from "../config/environment"
const { GOOGLE_REDIRECT_URI, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = config;

export async function exchangeCodeForToken(code) {
    const body = new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI, // DEBE ser la misma de la fase de autorización
        grant_type: "authorization_code",
    });

    const resp = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body
    });
    const json = await resp.json();
    if (!resp.ok) {
        console.error("Token error:", json);
        throw new Error("No se pudo canjear el code");
    }
    return json; // { access_token, id_token, refresh_token?, expires_in, ... }
}