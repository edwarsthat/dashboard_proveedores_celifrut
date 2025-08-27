import { BaseError } from "./index.js";

export class ConfigError extends BaseError {
    constructor({ message, meta = {}, errorCode = 'CONFIG.MISSING' } = {}) {
        super(message, 'config', 500, meta, errorCode, true);
        this.logError(); 
    }
}