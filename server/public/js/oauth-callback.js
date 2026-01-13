(function() {
    'use strict';

    // Leer datos del elemento con id="oauth-data"
    const dataElement = document.getElementById('oauth-data');
    if (!dataElement) {
        console.error('No se encontró el elemento oauth-data');
        return;
    }

    const status = dataElement.dataset.status;
    const origin = dataElement.dataset.origin;

    const messageData = {
        type: "OAUTH_SUCCESS",
        status: status,
        timestamp: Date.now()
    };

    // Agregar datos según el status
    if (status === 'success') {
        messageData.user = {
            email: dataElement.dataset.email,
            name: dataElement.dataset.name,
            picture: dataElement.dataset.picture
        };
    } else {
        messageData.error = {
            message: dataElement.dataset.message
        };
    }

    // Enviar mensaje al opener
    try {
        if (window.opener && !window.opener.closed) {
            window.opener.postMessage(messageData, origin);
            console.log('OAuth message enviado');
        } else {
            console.warn('window.opener no disponible');
        }
    } catch (e) {
        console.warn('postMessage a opener fallo:', e);
    }

    // Cerrar popup
    setTimeout(function() {
        try {
            window.close();
        } catch (e) {
            console.warn('No se pudo cerrar el popup automaticamente');
        }
    }, 300);

    // Backup de cierre
    setTimeout(function() {
        try {
            window.close();
        } catch (e) {}
    }, 2000);
})();
