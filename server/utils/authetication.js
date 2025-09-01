import crypto from "crypto";

export function generateSecureState() {
    const timestamp = Date.now().toString(36);
    const randomBytes = crypto.randomBytes(16).toString("hex");
    return `${timestamp}_${randomBytes}`;
}

// templates/oauth-callback.js
export function generateCallbackHTML(data, nonce) {
    const { status, user, message, origin } = data;
    
    return `<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>${status === 'success' ? 'Autenticación exitosa' : 'Error de autenticación'}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
    <script nonce="${nonce}">
    (function(){
        'use strict';
        
        const config = {
            targetOrigin: ${JSON.stringify(origin)},
            maxAttempts: 30,
            retryInterval: 100,
            closeDelay: 100
        };
        
        const messageData = {
            type: "oauth_callback",
            status: ${JSON.stringify(status)},
            timestamp: Date.now(),
            ${status === 'success' 
                ? `user: ${JSON.stringify(user)}` 
                : `error: { message: ${JSON.stringify(message)} }`
            }
        };
        
        let messageSent = false;
        let attempts = 0;
        
        function sendMessage() {
            try {
                if (!window.opener || window.opener.closed) {
                    console.error('Ventana padre no disponible');
                    return false;
                }
                
                if (messageSent) {
                    return true;
                }
                
                window.opener.postMessage(messageData, config.targetOrigin);
                messageSent = true;
                console.log('Mensaje OAuth enviado exitosamente');
                
                setTimeout(() => {
                    try { window.close(); } catch(e) { console.log('No se pudo cerrar la ventana'); }
                }, config.closeDelay);
                
                return true;
            } catch (error) {
                console.error('Error enviando mensaje OAuth:', error);
                return false;
            }
        }
        
        // Intentar envío inmediato
        if (sendMessage()) return;
        
        // Reintentos con timeout
        const retryInterval = setInterval(() => {
            attempts++;
            
            if (sendMessage() || attempts >= config.maxAttempts) {
                clearInterval(retryInterval);
                
                if (!messageSent) {
                    console.warn('Timeout enviando mensaje OAuth, cerrando ventana');
                    try { window.close(); } catch(e) {}
                }
            }
        }, config.retryInterval);
        
        // Cleanup en caso de que la ventana no se cierre
        setTimeout(() => {
            clearInterval(retryInterval);
            if (!messageSent) {
                try { window.close(); } catch(e) {}
            }
        }, 10000); // 10 segundos máximo
        
    })();
    </script>
    <div style="text-align: center; font-family: Arial, sans-serif; margin-top: 50px;">
        <h2>${status === 'success' ? '✅ Autenticación exitosa' : '❌ Error de autenticación'}</h2>
        <p>${status === 'success' ? 'Cerrando ventana...' : message}</p>
        <p><small>Si esta ventana no se cierra automáticamente, puedes cerrarla manualmente.</small></p>
    </div>
</body>
</html>`;
}
