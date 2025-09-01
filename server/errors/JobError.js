import { BaseError } from "./index.js";

export class JobError extends BaseError {
    constructor({ message = 'Error en job', meta = {}, cause } = {}) {
        super(
            message,
            'jobs',
            500,
            meta,
            'JOB.FAIL',
            true,
            cause
        );
        this.logError();
    }
}