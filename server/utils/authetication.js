// import crypto from "crypto";

// export function generateSecureState() {
//     const timestamp = Date.now().toString(36);
//     const randomBytes = crypto.randomBytes(16).toString("hex");
//     return `${timestamp}_${randomBytes}`;
// }

// // templates/oauth-callback.js
// export function generateCallbackHTML(data) {
//     const { status, user, message, origin } = data;
    
//     return `<!doctype html>
// <html>
// <head>
//     <meta charset="utf-8">
//     <title>${status === 'success' ? 'Autenticación exitosa' : 'Error de autenticación'}</title>
//     <meta name="viewport" content="width=device-width, initial-scale=1">

//     <style>
//         /* =========================
//            VARIABLES (del front)
//         ========================= */
//         :root {
//             --color-Celifrut: #7eba27;
//             --color-Celifrut-dark: #5f8f1d;
//             --color-Celifrut-brigth: #9ad63a;

//             --color-card-bg: #ffffff;
//             --color-title: #1f2937;
//             --color-text: #4b5563;
//             --border-Color: #e5e7eb;

//             --spacing-sm: 0.5rem;
//             --spacing-md: 1rem;
//             --spacing-lg: 1.5rem;
//             --spacing-xl: 2rem;

//             --radius-lg: 12px;
//             --radius-xl: 20px;

//             --transition-normal: 0.3s ease;
//         }

//         /* =========================
//            BASE
//         ========================= */
//         body {
//             margin: 0;
//             min-height: 100vh;
//             font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
//             background: linear-gradient(135deg, var(--color-Celifrut) 0%, var(--color-Celifrut-brigth) 100%);
//             display: flex;
//             justify-content: center;
//             align-items: center;
//         }

//         /* =========================
//            CONTENEDOR PRINCIPAL
//         ========================= */
//         .login-container {
//             display: flex;
//             justify-content: center;
//             align-items: center;
//             width: 100%;
//             padding: var(--spacing-xl);
//         }

//         .login-card {
//             background: var(--color-card-bg);
//             border-radius: var(--radius-xl);
//             box-shadow: 0 20px 40px rgba(0,0,0,0.2);
//             padding: var(--spacing-xl);
//             max-width: 420px;
//             width: 100%;
//             text-align: center;
//         }

//         /* =========================
//            NOT FOUND / STATUS
//         ========================= */
//         .not-found-content {
//             display: flex;
//             flex-direction: column;
//             align-items: center;
//             gap: var(--spacing-lg);
//         }

//         .error-number {
//             font-size: 4.5rem;
//             font-weight: 900;
//             background: linear-gradient(
//                 135deg,
//                 var(--color-Celifrut),
//                 var(--color-Celifrut-brigth)
//             );
//             -webkit-background-clip: text;
//             -webkit-text-fill-color: transparent;
//         }

//         .error-message h1 {
//             margin: 0;
//             font-size: 1.5rem;
//             color: var(--color-title);
//         }

//         .error-message p {
//             margin: 0;
//             color: var(--color-text);
//             font-size: 1rem;
//         }

//         /* =========================
//            SPINNER
//         ========================= */
//         .spinner {
//             width: 40px;
//             height: 40px;
//             border: 3px solid #e5e7eb;
//             border-top: 3px solid var(--color-Celifrut);
//             border-radius: 50%;
//             animation: spin 1s linear infinite;
//         }

//         @keyframes spin {
//             0% { transform: rotate(0deg); }
//             100% { transform: rotate(360deg); }
//         }

//         .hint {
//             font-size: 0.85rem;
//             color: #9ca3af;
//             margin-top: var(--spacing-sm);
//         }
            
//     </style>
// </head>

// <body>
//     <main class="login-container">
//         <div class="login-card">
//             <div class="not-found-content">

//                 <div class="error-number">
//                     ${status === 'success' ? '✔' : '✖'}
//                 </div>

//                 <div class="error-message">
//                     <h1>
//                         ${status === 'success'
//                             ? 'Autenticación exitosa'
//                             : 'Error de autenticación'}
//                     </h1>
//                     <p>
//                         ${status === 'success'
//                             ? 'Cerrando ventana...'
//                             : message}
//                     </p>
//                 </div>

//                 ${status === 'success' ? '<div class="spinner"></div>' : ''}

//                 <p class="hint">
//                     Si esta ventana no se cierra, puedes cerrarla manualmente.
//                 </p>

//             </div>
//         </div>
//     </main>

//     <!-- Datos para el script externo -->
//     <div id="oauth-data"
//         data-status="${status}"
//         data-origin="${origin}"
//         ${status === 'success'
//             ? `data-email="${user.email}" data-name="${user.name}" data-picture="${user.picture || ''}"`
//             : `data-message="${message || 'Error de autenticación'}"`
//         }
//         style="display:none;">
//     </div>

//     <!-- Script externo para evitar problemas con CSP -->
//     <script src="/js/oauth-callback.js"></script>
// </body>
// </html>`;
// }

//Jp
import crypto from "crypto";

export function generateSecureState() {
    const timestamp = Date.now().toString(36);
    const randomBytes = crypto.randomBytes(16).toString("hex");
    return `${timestamp}_${randomBytes}`;
}

/**
 * Sanitizar valores para prevenir XSS en atributos HTML
 */
function sanitizeForHtmlAttribute(value) {
    if (!value) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

export function generateCallbackHTML(data, nonce) {
    const { status, user, message, origin } = data;
    
    // Sanitizar TODOS los valores que van al HTML
    const safeStatus = sanitizeForHtmlAttribute(status);
    const safeOrigin = sanitizeForHtmlAttribute(origin);
    const safeMessage = status === 'error' ? sanitizeForHtmlAttribute(message) : '';
    
    // Para usuario, sanitizar cada campo
    const safeUser = status === 'success' ? {
        email: sanitizeForHtmlAttribute(user.email),
        name: sanitizeForHtmlAttribute(user.name),
        picture: sanitizeForHtmlAttribute(user.picture || '')
    } : null;
    
    return `<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>${status === 'success' ? 'Autenticación exitosa' : 'Error de autenticación'}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <style>
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

        body {
            margin: 0;
            min-height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, var(--color-Celifrut) 0%, var(--color-Celifrut-brigth) 100%);
            display: flex;
            justify-content: center;
            align-items: center;
        }

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

        .not-found-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--spacing-lg);
        }

        .error-number {
            font-size: 4.5rem;
            font-weight: 900;
            background: linear-gradient(135deg, var(--color-Celifrut), var(--color-Celifrut-brigth));
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
                        ${status === 'success' ? 'Autenticación exitosa' : 'Error de autenticación'}
                    </h1>
                    <p>
                        ${status === 'success' ? 'Cerrando ventana...' : sanitizeForHtmlAttribute(message)}
                    </p>
                </div>

                ${status === 'success' ? '<div class="spinner"></div>' : ''}

                <p class="hint">
                    Si esta ventana no se cierra, puedes cerrarla manualmente.
                </p>
            </div>
        </div>
    </main>

    <!-- Datos sanitizados para el script -->
    <div id="oauth-data"
        data-status="${safeStatus}"
        data-origin="${safeOrigin}"
        ${status === 'success'
            ? `data-email="${safeUser.email}" data-name="${safeUser.name}" data-picture="${safeUser.picture}"`
            : `data-message="${safeMessage}"`
        }
        style="display:none;">
    </div>

    <!-- Script con nonce (SEGURO) -->
    <script nonce="${nonce}">
    (function() {
        'use strict';

        const dataElement = document.getElementById('oauth-data');
        if (!dataElement) {
            console.error('No se encontró oauth-data');
            return;
        }

        const status = dataElement.dataset.status;
        const origin = dataElement.dataset.origin;

        // Validar origin contra whitelist
        const ALLOWED_ORIGINS = ['${origin}'];
        if (!ALLOWED_ORIGINS.includes(origin)) {
            console.error('Origin no autorizado:', origin);
            return;
        }

        const messageData = {
            type: "OAUTH_SUCCESS",
            status: status,
            timestamp: Date.now()
        };

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

        // Enviar mensaje
        try {
            if (window.opener && !window.opener.closed) {
                window.opener.postMessage(messageData, origin);
                console.log('📤 OAuth message enviado');
            }
        } catch (e) {
            console.error('❌ Error en postMessage:', e);
        }

        // Cierre automático
        setTimeout(function() {
            try { window.close(); } catch (e) {}
        }, 300);

        setTimeout(function() {
            try { window.close(); } catch (e) {}
        }, 2000);
    })();
    </script>
</body>
</html>`;
}