import { useState, useCallback } from 'react';
import { authApi } from '../api/authApi';

/**
 * Custom hook for Web Push Notifications
 * Handles permission request, subscription, and sending to server
 */
export const usePushNotification = () => {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );
  const [subscription, setSubscription] = useState(null);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') {
      console.warn('Push notifications not supported');
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (err) {
      console.error('Notification permission error:', err);
      return 'denied';
    }
  }, []);

  const subscribe = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push messaging not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_PUBLIC_KEY || ''
        )
      });

      setSubscription(sub);

      // Send subscription to server
      await authApi.savePushSubscription(sub.toJSON());

      return sub;
    } catch (err) {
      console.error('Push subscription error:', err);
      return null;
    }
  }, []);

  /**
   * Show a local notification (fallback when server push isn't available)
   */
  const showLocalNotification = useCallback((title, body, options = {}) => {
    if (permission !== 'granted') return;

    try {
      new Notification(title, {
        body,
        icon: '/rain-icon.svg',
        badge: '/rain-icon.svg',
        tag: 'rain-alert',
        ...options
      });
    } catch {
      // Fallback: try service worker notification
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification(title, {
            body,
            icon: '/rain-icon.svg',
            tag: 'rain-alert',
            ...options
          });
        });
      }
    }
  }, [permission]);

  return {
    permission,
    subscription,
    requestPermission,
    subscribe,
    showLocalNotification
  };
};

// Helper: Convert VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String) {
  if (!base64String) return new Uint8Array(0);
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
