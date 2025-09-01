export class DashboardError extends BaseError {
    constructor({ message = 'Error de dashboard', meta = {}, cause } = {}) {
        super(message, 'service', 500, meta, 'SERVICE.DASHBOARD', false, cause);
        this.logError(); // manda a winston (transporte dashboard)
    }
}