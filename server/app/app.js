import express from 'express';
import session from "express-session";
import path from "path";
import cors from 'cors';
import helmet from 'helmet';
import indexRoutes from "../routes/index.routes.js"
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, "..", "..", "..", "front-end-dasboard-clientes-celifrut", "dist");
const app = express();

//Helmet con CSP configurado para producción. Jp
app.use(helmet({
    contentSecurityPolicy: {
        useDefaults: false, //se cambia true para desactivar los defaults restrictivos. Jp
        directives: {
            //Default source
            defaultSrc: ["'self'"],
            
            //Scripts: permitir solo del mismo origen (nonce se agrega en callbacks)
            scriptSrc: ["'self'"],

            //Estilos: permitir inline y Google Fonts. Jp
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com"
            ],
            
            //Fuentes: permitir data URIs y Google Fonts. Jp
            fontSrc: [
                "'self'",
                "data:",
                "https://fonts.gstatic.com"
            ],
            
            //Imágenes: mantener configuración existente. Jp
            "img-src": [
                "'self'",
                "data:",
                "blob:",
                "lh3.googleusercontent.com",
                "*.googleusercontent.com",
                "ui-avatars.com" 
                
            ],
            //Conexiones: permitir mismo origen y Microsoft Graph. Jp
            connectSrc: [
                "'self'",
                "https://graph.microsoft.com"
            ],
            
            //Base URI: solo mismo origen
            baseUri: ["'self'"],
            
            //Frame ancestors: prevenir clickjacking. Jp
            frameAncestors: ["'none'"],
            
            //Object: bloquear plugins antiguos
            objectSrc: ["'none'"]
        }
    },
    //Configuración adicional de seguridad. Jp
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
    origin: process.env.FRONT_URL, // Origen específico en lugar de '*'
    credentials: true, // Permitir cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
    session({
        secret: process.env.SESSION_SECRET || "supersecreto", // clave secreta
        resave: false, // no re-graba si no hubo cambios
        saveUninitialized: false, // no guarda sesiones vacías
        cookie: { 
            secure: process.env.SESSION_SECRET || "supersecreto",  // ⚠️ en producción ponlo en true con HTTPS
            httpOnly: true, // prevenir acceso desde JavaScript. Jp
            sameSite: 'lax' // protección CSRF. Jp
                }
    })
);

app.use(express.static(distPath, { maxAge: "1d" }));

app.set("views", path.join(__dirname, "..", "views"));
app.set("view engine", "ejs");

app.use('/', indexRoutes);

export default app;