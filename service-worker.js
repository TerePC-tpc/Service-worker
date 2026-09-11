// Nombre de la cache
const cacheName = 'stitch-cache-v2';

// Archivos que se guardarán en cache
const cacheAssets = [
    'index.html',
    'pagina1.html',
    'pagina2.html',
    'pagina3.html',
    'styles.css',
    'main.js',
    'Logo.jpg',
    'Imagen1.jpg',
    'Imagen2.jpg',
    'Imagen3.jpg'
];

// Instalación del service worker
self.addEventListener('install', (event) => {
    console.log("SW: Instalando");
    event.waitUntil(
        caches.open(cacheName).then((cache) => {
            console.log("SW: Cacheando archivos...");
            return cache.addAll(cacheAssets);
        })
        .then(() => self.skipWaiting())
        .catch((err) => console.log("Error al cachear archivos", err))
    );
});

// Activación del service worker
self.addEventListener('activate', (event) => {
    console.log("SW: Activado");
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== cacheName) {
                        console.log(`SW: Eliminando cache antigua: ${name}`);
                        return caches.delete(name);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Escuchar mensajes desde la página
self.addEventListener('message', (event) => {
    console.log('SW: Recibió mensaje:', event.data);
    if (event.data === 'mostrar-notificacion') {
        self.registration.showNotification('¡Hola! ', {
            body: '¡Ohana significa familia! Y la familia nunca te abandona ni te olvida',
            icon: 'Logo.jpg',
            badge: 'Logo.jpg',
            tag: 'stitch-notification',
            requireInteraction: true,
            actions: [
                {
                    action: 'ohana',
                    title: ' Ohana'
                },
                {
                    action: 'visit',
                    title: ' Visitar'
                }
            ]
        }).catch(error => {
            console.error('Error en notificación del SW:', error);
        });
    }
});

// Manejar peticiones de red con estrategia Network First
self.addEventListener('fetch', (event) => {
    // Ignorar peticiones innecesarias
    if (event.request.url.includes('chrome-extension') || 
        event.request.url.includes('favicon.ico') ||
        event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(cacheName)
                        .then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                }
                return response;
            })
            .catch(() => {
                return caches.match(event.request)
                    .then((response) => {
                        if (response) {
                            console.log("SW: Recurso desde cache:", event.request.url);
                            return response;
                        }
                        return new Response('Sin conexión', {
                            status: 408,
                            statusText: 'Sin conexión'
                        });
                    });
            })
    );
});

// Manejar clics en notificaciones del SW
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'ohana') {
        clients.openWindow('index.html');
    } else if (event.action === 'visit') {
        clients.openWindow('pagina1.html');
    } else {
        clients.matchAll({type: 'window'}).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes('index.html') && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('index.html');
            }
        });
    }
});