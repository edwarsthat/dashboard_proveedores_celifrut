export function safeRedact(obj) {
    const SENSITIVE_KEYS = ['password', 'token', 'secret', 'authorization', 'apikey', 'dburi'];
    const out = {};
    for (const k of Object.keys(obj || {})) {
        out[k] = SENSITIVE_KEYS.includes(k.toLowerCase()) ? '[REDACTED]' : obj[k];
    }
    return out;
}

export function serializeCause(cause) {
    if (!cause) return undefined;
    if (cause instanceof Error) {
        return { name: cause.name, message: cause.message, stack: cause.stack };
    }
    if (typeof cause === 'object') {
        try { return JSON.parse(JSON.stringify(cause)); }
        catch { return String(cause); }
    }
    return String(cause);
}