
export default {
    HOST: process.env.HOST || "localhost",

    //Celifrut app port
    PORT: process.env.PORT || 3001,

    //Clientes ids
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

    //sesion secret
    SESSION_SECRET: process.env.SESSION_SECRET,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI
}