import winston from 'winston'; // ❗ ESTO FALTABA
import fs from 'fs';
import path from 'path';

class CustomLogger {
    constructor() {
        this.loggers = new Map();
        this.ensureLogDirectories();
    }

    // Crear directorios necesarios
    ensureLogDirectories() {
        const baseDir = 'logs';
        const categories = ['errors', 'system', 'security', 'auth']; // Expandido
        const errorTypes = ['database', 'jobs', 'validation', 'authentication', 'api', 'system', 'config', 'service'];


        if (!fs.existsSync(baseDir)) {
            fs.mkdirSync(baseDir, { recursive: true });
        }

        categories.forEach(category => {
            const categoryDir = path.join(baseDir, category);
            if (!fs.existsSync(categoryDir)) {
                fs.mkdirSync(categoryDir, { recursive: true });
            }

            // Para errors, crear subdirectorios por tipo
            if (category === 'errors') {
                errorTypes.forEach(type => {
                    const typeDir = path.join(categoryDir, type);
                    if (!fs.existsSync(typeDir)) {
                        fs.mkdirSync(typeDir, { recursive: true });
                    }
                });
            }
        });
    }

    // Obtener o crear logger para un tipo específico de error
    getLogger(category, logType = 'general') {
        const loggerKey = `${category}_${logType}`;

        if (this.loggers.has(loggerKey)) {
            return this.loggers.get(loggerKey);
        }

        const logFileName = `${new Date().toISOString().split('T')[0]}.log`;

        let logPath;
        if (category === 'errors') {
            logPath = path.join('logs/errors', logType, logFileName);
        } else {
            logPath = path.join(`logs/${category}`, logFileName);
        }


        const logger = winston.createLogger({
            level: 'debug',
            format: winston.format.combine(
                winston.format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss'
                }),
                winston.format.errors({ stack: true }),
                winston.format.printf(({ timestamp, level, message, ...meta }) => {
                    const errorInfo = {
                        timestamp,
                        level: level.toUpperCase(),
                        category: category.toUpperCase(),
                        type: logType.toUpperCase(),
                        message,
                        ...meta
                    };
                    return JSON.stringify(errorInfo, null, 2);
                })
            ),
            transports: [
                new winston.transports.File({
                    filename: logPath,
                    level: 'debug'
                }),
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.printf(({ timestamp, level, message, ...meta }) => {
                            const prefix = `[${category.toUpperCase()}${logType !== 'general' ? `::${logType.toUpperCase()}` : ''}]`;
                            return `${prefix} ${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
                        })
                    )
                })
            ]
        });

        this.loggers.set(loggerKey, logger);
        return logger;
    }

    // Método genérico para cualquier tipo de error
    // Método para errores (mantiene compatibilidad)
    logError(errorType, message, meta = {}) {
        const logger = this.getLogger('errors', errorType);
        logger.error(message, {
            errorType: errorType.toUpperCase(),
            ...meta
        });
    }

    // Método para logs del sistema/autenticación
    logAuth(level, message, meta = {}) {
        const logger = this.getLogger('auth');

        switch (level.toLowerCase()) {
            case 'error':
                logger.error(message, meta);
                break;
            case 'warn':
                logger.warn(message, meta);
                break;
            case 'info':
                logger.info(message, meta);
                break;
            default:
                logger.info(message, meta);
        }
    }

    // Mantener compatibilidad con el método anterior
    logCustomError(errorType, message, meta = {}) {
        this.logError(errorType, message, meta);
    }

    async flushAll() {
        const closers = [];
        for (const logger of this.loggers.values()) {
            closers.push(new Promise((resolve) => {
                logger.on('finish', resolve);
                logger.close();
            }));
        }
        await Promise.all(closers);
    }

}

const customLogger = new CustomLogger();
export default customLogger;