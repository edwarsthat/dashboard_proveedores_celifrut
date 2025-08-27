import { BaseError } from "./index.js";

export class JobError extends BaseError {
    constructor(jobName, message, originalError = null) {
        super(`Error en job ${jobName}: ${message}`, 500, 'JOB_ERROR');
        this.jobName = jobName;
        this.originalError = originalError;
    }
}