const webpush = require('web-push');

/**
 * Push Notification Service
 * Handles sending browser push notifications via Web Push API
 */

// Configure VAPID keys for Web Push
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:admin@rainalert.app',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

class NotificationService {
  /**
   * Send a push notification to a user's subscribed browser
   * @param {Object} subscription - Web Push subscription object
   * @param {Object} payload - Notification payload
   * @param {string} payload.title - Notification title
   * @param {string} payload.body - Notification body
   * @param {string} payload.icon - Notification icon URL
   * @param {string} payload.tag - Notification tag for grouping
   */
  static async sendPushNotification(subscription, payload) {
    if (!subscription) {
      console.warn('No push subscription provided');
      return false;
    }

    try {
      await webpush.sendNotification(
        subscription,
        JSON.stringify({
          title: payload.title || '🌧️ Rain Alert',
          body: payload.body || 'Weather update available',
          icon: payload.icon || '/rain-icon.png',
          tag: payload.tag || 'rain-alert',
          data: payload.data || {}
        })
      );
      return true;
    } catch (error) {
      console.error('Push notification error:', error.message);
      // If subscription is expired or invalid, return false
      if (error.statusCode === 410 || error.statusCode === 404) {
        console.log('Push subscription expired or invalid');
        return false;
      }
      return false;
    }
  }

  /**
   * Send a rain alert notification
   * @param {Object} subscription - Web Push subscription
   * @param {Object} alert - Alert data
   */
  static async sendRainAlert(subscription, alert) {
    const levelEmoji = {
      SAFE: '✅',
      WATCH: '⚠️',
      WARNING: '🟠',
      DANGER: '🔴'
    };

    return this.sendPushNotification(subscription, {
      title: `${levelEmoji[alert.level]} Rain ${alert.level} - ${alert.location}`,
      body: `${alert.message}${alert.peakWindow ? '\n' + alert.peakWindow : ''}`,
      tag: `rain-alert-${alert.level}`,
      data: {
        level: alert.level,
        score: alert.score,
        url: '/'
      }
    });
  }
}

module.exports = NotificationService;
