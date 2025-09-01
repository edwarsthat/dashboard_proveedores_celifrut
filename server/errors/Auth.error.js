import { BaseError } from "./index.js";

export class AuthenticationError extends BaseError {
    constructor({ message = 'Error de autentificacion', meta = {}, cause } = {}) {
        super(message, 'auth', 500, meta, 'AUTH.GENERIC', false, cause);
        this.logError(); // manda a winston (transporte auth)
    }
}