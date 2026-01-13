import crypto from "crypto";

export function generateSecureState() {
    const timestamp = Date.now().toString(36);
    const randomBytes = crypto.randomBytes(16).toString("hex");
    return `${timestamp}_${randomBytes}`;
}

// templates/oauth-callback.js
export function generateCallbackHTML(data) {
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

    <!-- Datos para el script externo -->
    <div id="oauth-data"
        data-status="${status}"
        data-origin="${origin}"
        ${status === 'success'
            ? `data-email="${user.email}" data-name="${user.name}" data-picture="${user.picture || ''}"`
            : `data-message="${message || 'Error de autenticación'}"`
        }
        style="display:none;">
    </div>

    <!-- Script externo para evitar problemas con CSP -->
    <script src="/js/oauth-callback.js"></script>
</body>
</html>`;
}

// import crypto from "crypto";

// export function generateSecureState() {
//     const timestamp = Date.now().toString(36);
//     const randomBytes = crypto.randomBytes(16).toString("hex");
//     return `${timestamp}_${randomBytes}`;
// }

// export function generateCallbackHTML(data, nonce) {
//     const { status, user, message, origin } = data;
    
//     return `<!doctype html>
// <html>
// <head>
//     <meta charset="utf-8">
//     <title>${status === 'success' ? 'Autenticación exitosa' : 'Error de autenticación'}</title>
//     <meta name="viewport" content="width=device-width, initial-scale=1">

//     <style>
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

//         body {
//             margin: 0;
//             min-height: 100vh;
//             font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
//             background: linear-gradient(135deg, var(--color-Celifrut) 0%, var(--color-Celifrut-brigth) 100%);
//             display: flex;
//             justify-content: center;
//             align-items: center;
//         }

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

//         .not-found-content {
//             display: flex;
//             flex-direction: column;
//             align-items: center;
//             gap: var(--spacing-lg);
//         }

//         .error-number {
//             font-size: 4.5rem;
//             font-weight: 900;
//             background: linear-gradient(135deg, var(--color-Celifrut), var(--color-Celifrut-brigth));
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

//         .spinner {
//             width: 40px;
//             height: 40px;
//             border: 3px solid #e5e7eb;
//             border-top: 3px solid var(--color-Celifrut);
//             border-radius: 50%;
//             animation: spin 1s linear infinite;
//             margin: var(--spacing-md) 0;
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

//         /* =========================
//            BOTÓN DE CIERRE (JP - Nuevo)
//         ========================= */
//         .close-button {
//             background: linear-gradient(135deg, var(--color-Celifrut), var(--color-Celifrut-brigth));
//             color: white;
//             border: none;
//             padding: 12px 32px;
//             border-radius: var(--radius-lg);
//             font-size: 1rem;
//             font-weight: 600;
//             cursor: pointer;
//             transition: all 0.3s ease;
//             margin-top: var(--spacing-md);
//             box-shadow: 0 4px 12px rgba(126, 186, 39, 0.3);
//         }

//         .close-button:hover {
//             transform: translateY(-2px);
//             box-shadow: 0 6px 16px rgba(126, 186, 39, 0.4);
//         }

//         .close-button:active {
//             transform: translateY(0);
//         }

//         .error-button {
//             background: linear-gradient(135deg, #ef4444, #dc2626);
//             box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
//         }

//         .error-button:hover {
//             box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
//         }

//         .status-text {
//             font-size: 0.9rem;
//             color: #6b7280;
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
//                             ? 'Has iniciado sesión correctamente.'
//                             : message}
//                     </p>
//                 </div>

//                 ${status === 'success' ? '<div class="spinner"></div>' : ''}

//                 <p class="status-text" id="statusText">
//                     ${status === 'success'
//                         ? 'Notificando a la aplicación...'
//                         : 'Puedes cerrar esta ventana'}
//                 </p>

//                 <button
//                     class="close-button ${status === 'error' ? 'error-button' : ''}"
//                     onclick="safeClose()"
//                 >
//                     Cerrar ventana
//                 </button>

//                 <p class="hint">
//                     ${status === 'success'
//                         ? 'La ventana se cerrará automáticamente.'
//                         : 'Si el error persiste, contacta al administrador.'}
//                 </p>

//             </div>
//         </div>
//     </main>

// <script nonce="${nonce}">
// (function () {
//     'use strict';

//     const messageData = {
//         type: "OAUTH_SUCCESS",
//         status: ${JSON.stringify(status)},
//         timestamp: Date.now(),
//         ${status === 'success'
//             ? `user: ${JSON.stringify(user)}`
//             : `error: { message: ${JSON.stringify(message)} }`
//         }
//     };

//     const targetOrigin = ${JSON.stringify(origin)};
//     let messageSent = false;

//     /**
//      * JP: El popup solo NOTIFICA, no responde promesas
//      * FIX: Enviar UNA SOLA VEZ (evita bloqueo de cierre)
//      */
//     function sendMessageOnce() {
//         if (messageSent) return;
//         messageSent = true;

//         try {
//             if (window.opener && !window.opener.closed) {
//                 window.opener.postMessage(messageData, targetOrigin);
//                 console.log('📤 OAuth message enviado');
//             } else {
//                 console.warn('⚠️ window.opener no disponible');
//             }
//         } catch (e) {
//             console.error('❌ Error enviando postMessage:', e);
//         }
//     }

//     /**
//      * JP: Función global para cerrar la ventana
//      * FIX: Cierre limpio (sin JS activo)
//      */
//     window.safeClose = function () {
//         console.log('🔒 Cerrando popup OAuth');

//         sendMessageOnce();

//         // FIX: dejar el popup idle antes del close
//         setTimeout(() => {
//             try {
//                 window.close();
//             } catch (e) {
//                 console.warn('⚠️ Cierre automático bloqueado');
//             }
//         }, 50);
//     };

//     /**
//      * JP: Envío inmediato al cargar
//      */
//     sendMessageOnce();

//     /**
//      * JP: CIERRE AUTOMÁTICO (solo éxito)
//      * FIX: ahora sí funciona
//      */
//     if (messageData.status === 'success') {
//         setTimeout(() => {
//             console.log('🔒 Cierre automático OAuth');
//             safeClose();
//         }, 2500);
//     }

// })();
// </script>
// </body>
// </html>`;
// }