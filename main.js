// Registrar el Service Worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").then((reg) => {
        console.log("Service Worker registrado con éxito", reg);
    })
    .catch((err) => {
        console.log("Fallo el registro del Service Worker", err);
    });
}

// Botón para verificar el estado del SW
document.getElementById("check").addEventListener("click", () => {
    if (navigator.serviceWorker.controller) {
        alert("El Service Worker está activo y controlando la página.");
    } else {
        alert("El Service Worker no está activo."); 
    }
});

// Pedir permiso para las notificaciones
if (Notification.permission === 'default') {
    Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
            console.log("Permiso para notificaciones concedido");
        } else {
            console.log("Permiso para notificaciones denegado.");
        }
    });
}

// Botón para lanzar notificación local
document.getElementById("btnNotificacion").addEventListener("click", () => {
    if (Notification.permission === 'granted') {
        // Enviar mensaje al Service Worker para que muestre la notificación
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage("mostrar-notificacion");
        } else {
            // Fallback: mostrar notificación directamente desde el navegador
            mostrarNotificacionDirecta();
        }
    } else if (Notification.permission === 'default') {
        Notification.requestPermission().then((perm) => {
            if (perm === 'granted') {
                if (navigator.serviceWorker.controller) {
                    navigator.serviceWorker.controller.postMessage("mostrar-notificacion");
                } else {
                    mostrarNotificacionDirecta();
                }
            } else {
                alert("Permiso para notificaciones denegado.");
            }
        });
    } else {
        alert("Las notificaciones están bloqueadas. Por favor, permite las notificaciones en la configuración de tu navegador.");
    }
});

// Función de fallback para mostrar notificación directamente
function mostrarNotificacionDirecta() {
    const opciones = {
        body: "¡Ohana significa familia! Y la familia nunca te abandona ni te olvida ",
        icon: "Logo.jpg",
        badge: "Logo.jpg",
        tag: "stitch-notification",
        requireInteraction: true
    };

    try {
        const notification = new Notification("¡Hola! ", opciones);
        
        notification.onclick = function() {
            window.focus();
            notification.close();
        };

        // Cerrar automáticamente después de 5 segundos
        setTimeout(() => {
            notification.close();
        }, 5000);
        
    } catch (error) {
        console.error("Error al mostrar notificación:", error);
        alert("Error al mostrar notificación: " + error.message);
    }
}

// Verificar si hay un Service Worker esperando para activarse
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
        console.log('Service Worker listo y activo:', registration.active);
    });
}