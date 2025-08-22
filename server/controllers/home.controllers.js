import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function home(req, res, next) {
    try {
        const htmlFilePath = path.join(
            __dirname, "..", "..", "..", "front-end-dasboard-clientes-celifrut", "dist", "index.html"
        );
        res.sendFile(htmlFilePath);
    } catch (err) { next(err); }
}