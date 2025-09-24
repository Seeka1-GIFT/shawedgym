/**
 * Push Notifications Service for ShawedGym
 * Handles browser push notifications and service worker registration
 */

class PushNotificationService {
  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    this.permission = Notification.permission;
    this.subscription = null;
    this.serviceWorkerRegistration = null;
  }

  /**
   * Initialize push notification service
   */
  async init() {
    if (!this.isSupported) {
      console.warn('Push notifications are not supported in this browser');
      return false;
    }

    try {
      // Register service worker
      this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', this.serviceWorkerRegistration);
      
      // Check if already subscribed
      this.subscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }

  /**
   * Request notification permission from user
   */
  async requestPermission() {
    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'denied') {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe() {
    if (!this.serviceWorkerRegistration) {
      throw new Error('Service worker not registered');
    }

    if (this.subscription) {
      return this.subscription;
    }

    try {
      // VAPID public key (in production, this would be from your server)
      const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI0DLLat3eAALZ-4_aqBSWRJi_s0Yr_Dz7k_pJ1oUaG9b8ygJ8fHJ_z2Ks';
      
      this.subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      });

      // In production, send subscription to your server
      await this.sendSubscriptionToServer(this.subscription);
      
      return this.subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe() {
    if (!this.subscription) {
      return true;
    }

    try {
      await this.subscription.unsubscribe();
      this.subscription = null;
      
      // In production, remove subscription from your server
      await this.removeSubscriptionFromServer();
      
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  /**
   * Send local notification (for testing/demo purposes)
   */
  async sendLocalNotification(title, options = {}) {
    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return false;
    }

    try {
      const notification = new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: 'shawedgym-notification',
        renotify: true,
        ...options
      });

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);
      
      return true;
    } catch (error) {
      console.error('Failed to send local notification:', error);
      return false;
    }
  }

  /**
   * Send activity-based notifications
   */
  async sendActivityNotification(activity) {
    const notificationConfig = this.getNotificationConfig(activity);
    
    if (!notificationConfig) {
      return false;
    }

    return await this.sendLocalNotification(notificationConfig.title, notificationConfig.options);
  }

  /**
   * Get notification configuration based on activity type
   */
  getNotificationConfig(activity) {
    const configs = {
      'checkin': {
        title: '✅ Member Check-in',
        options: {
          body: `${activity.user} just checked in`,
          icon: '/icons/checkin.png',
          tag: 'checkin',
          actions: [
            { action: 'view', title: 'View Member' },
            { action: 'dismiss', title: 'Dismiss' }
          ]
        }
      },
      'payment': {
        title: '💰 Payment Received',
        options: {
          body: `New payment of $${activity.amount || '75'} received`,
          icon: '/icons/payment.png',
          tag: 'payment',
          actions: [
            { action: 'view', title: 'View Payment' },
            { action: 'dismiss', title: 'Dismiss' }
          ]
        }
      },
      'class_booking': {
        title: '📅 New Class Booking',
        options: {
          body: `${activity.user} booked a class`,
          icon: '/icons/class.png',
          tag: 'booking',
          actions: [
            { action: 'view', title: 'View Class' },
            { action: 'dismiss', title: 'Dismiss' }
          ]
        }
      },
      'equipment': {
        title: '🔧 Equipment Alert',
        options: {
          body: 'Equipment maintenance required',
          icon: '/icons/equipment.png',
          tag: 'equipment',
          actions: [
            { action: 'view', title: 'View Equipment' },
            { action: 'dismiss', title: 'Dismiss' }
          ]
        }
      },
      'new_member': {
        title: '🎉 New Member!',
        options: {
          body: `Welcome ${activity.user} to ShawedGym!`,
          icon: '/icons/member.png',
          tag: 'new_member',
          actions: [
            { action: 'view', title: 'View Profile' },
            { action: 'dismiss', title: 'Dismiss' }
          ]
        }
      },
      'emergency': {
        title: '🚨 Emergency Alert',
        options: {
          body: 'Immediate attention required',
          icon: '/icons/emergency.png',
          tag: 'emergency',
          requireInteraction: true,
          actions: [
            { action: 'respond', title: 'Respond Now' },
            { action: 'dismiss', title: 'Dismiss' }
          ]
        }
      }
    };

    return configs[activity.type] || null;
  }

  /**
   * Batch send notifications for multiple activities
   */
  async sendBatchNotifications(activities) {
    const results = [];
    
    for (const activity of activities) {
      if (activity.priority === 'high' || activity.type === 'emergency') {
        const result = await this.sendActivityNotification(activity);
        results.push({ activity: activity.id, sent: result });
      }
    }
    
    return results;
  }

  /**
   * Schedule notification for future delivery
   */
  scheduleNotification(title, options, delay) {
    setTimeout(async () => {
      await this.sendLocalNotification(title, options);
    }, delay);
  }

  /**
   * Send subscription to server (mock implementation)
   */
  async sendSubscriptionToServer(subscription) {
    // In production, send to your backend API
    console.log('Subscription sent to server:', subscription);
    
    // Mock API call
    return new Promise(resolve => {
      setTimeout(() => {
        localStorage.setItem('pushSubscription', JSON.stringify(subscription));
        resolve();
      }, 100);
    });
  }

  /**
   * Remove subscription from server (mock implementation)
   */
  async removeSubscriptionFromServer() {
    // In production, remove from your backend API
    console.log('Subscription removed from server');
    
    // Mock API call
    return new Promise(resolve => {
      setTimeout(() => {
        localStorage.removeItem('pushSubscription');
        resolve();
      }, 100);
    });
  }

  /**
   * Convert VAPID key to Uint8Array
   */
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Get subscription status
   */
  getStatus() {
    return {
      isSupported: this.isSupported,
      permission: this.permission,
      isSubscribed: !!this.subscription,
      subscription: this.subscription
    };
  }

  /**
   * Test notifications with sample data
   */
  async testNotifications() {
    const testActivities = [
      {
        id: 1,
        type: 'checkin',
        user: 'Ahmed Hassan',
        priority: 'high'
      },
      {
        id: 2,
        type: 'payment',
        user: 'Fatima Ali',
        amount: 75,
        priority: 'medium'
      },
      {
        id: 3,
        type: 'emergency',
        user: 'System',
        priority: 'high'
      }
    ];

    for (let i = 0; i < testActivities.length; i++) {
      setTimeout(async () => {
        await this.sendActivityNotification(testActivities[i]);
      }, i * 2000); // 2 second intervals
    }
  }
}

// Create singleton instance
const pushNotificationService = new PushNotificationService();

export default pushNotificationService;
