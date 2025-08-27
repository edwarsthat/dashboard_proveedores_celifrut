import winston from 'winston'; // ❗ ESTO FALTABA
import fs from 'fs';
import path from 'path';

class CustomErrorLogger {
    constructor() {
        this.loggers = new Map();
        this.ensureLogDirectories();
    }

    // Crear directorios necesarios
    ensureLogDirectories() {
        const baseDir = 'logs/errors';
        const errorTypes = ['database', 'jobs', 'validation', 'authentication', 'api', 'system', 'config'];
        // ...

        if (!fs.existsSync(baseDir)) {
            fs.mkdirSync(baseDir, { recursive: true });
        }

        errorTypes.forEach(type => {
            const typeDir = path.join(baseDir, type);
            if (!fs.existsSync(typeDir)) {
                fs.mkdirSync(typeDir, { recursive: true });
            }
        });
    }

    // Obtener o crear logger para un tipo específico de error
    getLogger(errorType) {
        if (this.loggers.has(errorType)) {
            return this.loggers.get(errorType);
        }

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const logFileName = `${today}.log`;
        const logPath = path.join('logs/errors', errorType, logFileName); // ❗ Agregar 'errors' aquí

        const logger = winston.createLogger({
            level: 'error',
            format: winston.format.combine(
                winston.format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss'
                }),
                winston.format.errors({ stack: true }),
                winston.format.printf(({ timestamp, level, message, ...meta }) => {
                    const errorInfo = {
                        timestamp,
                        level: level.toUpperCase(),
                        message,
                        ...meta
                    };
                    return JSON.stringify(errorInfo, null, 2);
                })
            ),
            transports: [
                new winston.transports.File({
                    filename: logPath,
                    level: 'error'
                }),
                // También log a consola durante desarrollo
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.printf(({ timestamp, level, message, ...meta }) => {
                            return `[${errorType.toUpperCase()}] ${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''
                                }`;
                        })
                    )
                })
            ]
        });

        this.loggers.set(errorType, logger);
        return logger;
    }

    // Método genérico para cualquier tipo de error
    logCustomError(errorType, message, meta = {}) {
        console.log(`🔍 Intentando loggear: ${errorType} - ${message}`); // Debug
        const logger = this.getLogger(errorType);
        logger.error(message, {
            errorType: errorType.toUpperCase(),
            ...meta
        });
        console.log(`✅ Log guardado en: logs/errors/${errorType}/${new Date().toISOString().split('T')[0]}.log`);
    }

    async flushAll() {
        const closers = [];
        for (const logger of this.loggers.values()) {
            closers.push(new Promise((resolve) => {
                logger.on('finish', resolve);
                logger.close(); // dispara 'finish' cuando cierra transports
            }));
        }
        await Promise.all(closers);
    }

}

const errorLogger = new CustomErrorLogger();
export default errorLogger;