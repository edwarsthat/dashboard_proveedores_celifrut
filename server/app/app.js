import express from 'express';
import path, { dirname } from "path";
import cors from 'cors';
import helmet from 'helmet';
import indexRoutes from "../routes/index.routes.js"
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, "..", "..", "..", "front-end-dasboard-clientes-celifrut", "dist");
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 

app.use(express.static(distPath, { maxAge: "1d" }));

app.set("views", path.join(__dirname, "..", "views"));
app.set("view engine", "ejs");

app.use('/', indexRoutes);

export default app;