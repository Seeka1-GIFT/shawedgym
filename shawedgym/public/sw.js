/**
 * Service Worker for ShawedGym Push Notifications
 * Handles background push notifications and click events
 */

const CACHE_NAME = 'shawedgym-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/icon-192x192.png',
  '/badge-72x72.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Cache installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // Return offline page or default response
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let notificationData = {
    title: 'ShawedGym Notification',
    body: 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'default',
    requireInteraction: false,
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    data: {
      url: '/',
      timestamp: Date.now()
    }
  };

  // Parse notification data if provided
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = { ...notificationData, ...pushData };
    } catch (error) {
      console.error('Failed to parse push data:', error);
    }
  }

  // Show notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      actions: notificationData.actions,
      data: notificationData.data,
      vibrate: [200, 100, 200], // Vibration pattern
      timestamp: notificationData.data.timestamp
    })
  );
});

// Notification click event - handle user interactions
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  // Close notification
  notification.close();

  // Handle different actions
  if (action === 'dismiss') {
    return; // Just close the notification
  }

  // Determine URL to open
  let urlToOpen = data.url || '/';
  
  if (action === 'view') {
    // Use specific URL if provided in data
    urlToOpen = data.viewUrl || data.url || '/';
  }

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin)) {
            // Focus existing window and navigate
            client.focus();
            return client.navigate(urlToOpen);
          }
        }
        
        // Open new window
        return clients.openWindow(urlToOpen);
      })
      .catch((error) => {
        console.error('Failed to handle notification click:', error);
      })
  );
});

// Background sync for offline actions (future enhancement)
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync tasks
      handleBackgroundSync()
    );
  }
});

// Handle background sync tasks
async function handleBackgroundSync() {
  try {
    // Sync offline actions when connection is restored
    console.log('Performing background sync...');
    
    // In a real app, you would:
    // 1. Get offline actions from IndexedDB
    // 2. Send them to the server
    // 3. Update local data
    // 4. Show success notifications
    
    return Promise.resolve();
  } catch (error) {
    console.error('Background sync failed:', error);
    throw error;
  }
}

// Message event - handle messages from main app
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event);
  
  const { type, payload } = event.data || {};
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;
      
    case 'SEND_NOTIFICATION':
      // Send notification from main app
      if (payload) {
        self.registration.showNotification(payload.title, payload.options);
      }
      break;
      
    default:
      console.log('Unknown message type:', type);
  }
});

// Error handling
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event);
});

console.log('Service Worker loaded successfully');
