
export default {
    HOST: process.env.HOST || "localhost",

    //Celifrut app port
    PORT: process.env.PORT || 3001,

    //uri base de datos
    MONGODB_PROCESO: process.env.MONGODB_PROCESO || "mongodb://localhost:27017/proceso",
    MONGODB_SISTEMA: process.env.MONGODB_SISTEMA || "mongodb://localhost:27017/sistema",
    MONGODB_CATALOGOS: process.env.MONGODB_CATALOGOS || "mongodb://localhost:27017/catalogos",

    //Clientes ids
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

    //sesion secret
    SESSION_SECRET: process.env.SESSION_SECRET,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,

    // Lista de correos autorizados (separados por coma en variable de entorno)
    AUTHORIZED_EMAILS: process.env.AUTHORIZED_EMAILS ? 
        process.env.AUTHORIZED_EMAILS.split(',').map(email => email.trim().toLowerCase()) : 
        [
            'admin@celifrut.com',
            'gerencia@celifrut.com',
            'sistemacelifrut@gmail.com',
            "edwarsthat@gmail.com"
            // Agregar más correos según sea necesario
        ]
}