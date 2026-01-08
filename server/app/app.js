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

app.use(helmet({
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            "img-src": [
                "'self'",
                "data:",
                "blob:",
                "lh3.googleusercontent.com",
                "*.googleusercontent.com",
                "ui-avatars.com" 
                
            ],
            "connect-src": ["'self'", "graph.microsoft.com"] // si harás fetch de la foto de MS
        }
    }
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
        cookie: { secure: true } // ⚠️ en producción ponlo en true con HTTPS ---------------------------------------------
    })
);

app.use(express.static(distPath, { maxAge: "1d" }));

app.set("views", path.join(__dirname, "..", "views"));
app.set("view engine", "ejs");

app.use('/', indexRoutes);

export default app;