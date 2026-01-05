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

    <style>
        /* =========================
           VARIABLES (del front)
        ========================= */
        :root {
            --color-Celifrut: #7eba27;
            --color-Celifrut-dark: #5f8f1d;
            --color-Celifrut-brigth: #9ad63a;

            --color-card-bg: #ffffff;
            --color-title: #1f2937;
            --color-text: #4b5563;
            --border-Color: #e5e7eb;

            --spacing-sm: 0.5rem;
            --spacing-md: 1rem;
            --spacing-lg: 1.5rem;
            --spacing-xl: 2rem;

            --radius-lg: 12px;
            --radius-xl: 20px;

            --transition-normal: 0.3s ease;
        }

        /* =========================
           BASE
        ========================= */
        body {
            margin: 0;
            min-height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, var(--color-Celifrut) 0%, var(--color-Celifrut-brigth) 100%);
            display: flex;
            justify-content: center;
            align-items: center;
        }

        /* =========================
           CONTENEDOR PRINCIPAL
        ========================= */
        .login-container {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            padding: var(--spacing-xl);
        }

        .login-card {
            background: var(--color-card-bg);
            border-radius: var(--radius-xl);
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
            padding: var(--spacing-xl);
            max-width: 420px;
            width: 100%;
            text-align: center;
        }

        /* =========================
           NOT FOUND / STATUS
        ========================= */
        .not-found-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--spacing-lg);
        }

        .error-number {
            font-size: 4.5rem;
            font-weight: 900;
            background: linear-gradient(
                135deg,
                var(--color-Celifrut),
                var(--color-Celifrut-brigth)
            );
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .error-message h1 {
            margin: 0;
            font-size: 1.5rem;
            color: var(--color-title);
        }

        .error-message p {
            margin: 0;
            color: var(--color-text);
            font-size: 1rem;
        }

        /* =========================
           SPINNER
        ========================= */
        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e5e7eb;
            border-top: 3px solid var(--color-Celifrut);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .hint {
            font-size: 0.85rem;
            color: #9ca3af;
            margin-top: var(--spacing-sm);
        }
    </style>
</head>

<body>
    <main class="login-container">
        <div class="login-card">
            <div class="not-found-content">

                <div class="error-number">
                    ${status === 'success' ? '✔' : '✖'}
                </div>

                <div class="error-message">
                    <h1>
                        ${status === 'success'
                            ? 'Autenticación exitosa'
                            : 'Error de autenticación'}
                    </h1>
                    <p>
                        ${status === 'success'
                            ? 'Cerrando ventana...'
                            : message}
                    </p>
                </div>

                ${status === 'success' ? '<div class="spinner"></div>' : ''}

                <p class="hint">
                    Si esta ventana no se cierra, puedes cerrarla manualmente.
                </p>

            </div>
        </div>
    </main>

    <script nonce="${nonce}">
    (function(){
        'use strict';

        const messageData = {
            type: "OAUTH_SUCCESS", //se cambia oauth_callback, ahora evento claro y unico JP
            status: ${JSON.stringify(status)},
            timestamp: Date.now(),
            ${status === 'success' 
                ? `user: ${JSON.stringify(user)}`
                : `error: { message: ${JSON.stringify(message)} }`
            }
        };

        // //creamos un array de promesas para enviar el mensaje por varios canales. Jp
        // const sendPromises = [];

        // // Intentamos enviar el mensaje por BroadcastChannel.Jp
        // try {
        //     const channel = new BroadcastChannel('oauth_channel');
        //     channel.postMessage(messageData);
        //     channel.close();
        //     sendPromises.push(Promise.resolve());
        // } catch (e) {
        //     console.warn("BroadcastChannel fallo:", e);
        // }

        // // Intentamos enviar el mensaje por localStorage.Jp
        // try {
        //     localStorage.setItem('oauth_result', JSON.stringify(messageData));
        //     sendPromises.push(Promise.resolve());
        // } catch (e) {
        //     console.warn("localStorage fallo:", e);
        // }

            /**
             * - Eliminamos BroadcastChannel
             * - Eliminamos localStorage
             * - Eliminamos promesas
             *
             * OAuth popup NO debe esperar respuestas.
             * Envía el mensaje y se cierra.
             */

        // Intentamos enviar el mensaje al window.opener.Jp
        try {
            if (window.opener && !window.opener.closed) {
        //Canal único, estándar y seguro para OAuth popup. Jp
                window.opener.postMessage(
                    messageData, 
                    ${JSON.stringify(origin)}); //Validacion estricta de origin. Jp
            }
        } catch (e) {
            console.warn("postMessage a opener fallo:", e);}

        // //cerramos el popup cuando todos los envios esten completos.Jp
        // Promise.all(sendPromises).finally(() => {
        //     try { window.close(); } catch(e) {
        //     console.warn("No se puede cerrar el popup automaticamente");
        //     }

    /**
     * CIERRE AGRESIVO
     * No esperamos confirmación.
     * En producción esto evita popups colgados.
     */

        setTimeout(() => {
            try { window.close();
                } catch(e) {
                    console.warn("No se pudo cerrar el popup automaticamente");
                    }
        }, 300); 

    /**
     * BACKUP
     * Algunos navegadores retrasan el cierre.
     */
    setTimeout(() => {
        try { window.close(); } catch (e) {}
    }, 2000) //2 segundos
    })();
    </script>
</body>
</html>`;
}