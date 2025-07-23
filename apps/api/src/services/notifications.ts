import { NotificationHubsClient } from '@azure/notification-hubs';
import { config } from '@/config';
import { logger } from '@/utils/logger';

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
  sound?: string;
  icon?: string;
  clickAction?: string;
}

export interface NotificationTarget {
  userId: string;
  deviceTokens?: string[];
  tags?: string[];
  platform?: 'ios' | 'android' | 'web';
}

export class NotificationService {
  private hubClient: NotificationHubsClient | null = null;

  constructor() {
    if (config.notifications.azure.connectionString && config.notifications.azure.hubName) {
      this.hubClient = new NotificationHubsClient(
        config.notifications.azure.connectionString,
        config.notifications.azure.hubName
      );
    }
  }

  /**
   * Send push notification for capsule delivery
   */
  async sendCapsuleDeliveryNotification(
    target: NotificationTarget,
    capsuleTitle: string,
    senderName: string,
    capsuleId: string
  ): Promise<void> {
    const payload: PushNotificationPayload = {
      title: '🎉 Time Capsule Delivered!',
      body: `"${capsuleTitle}" from ${senderName} is ready to open`,
      data: {
        type: 'capsule_delivery',
        capsuleId,
        senderName,
        action: 'open_capsule',
      },
      badge: 1,
      sound: 'capsule_delivery.wav',
      clickAction: `/capsule/${capsuleId}`,
    };

    await this.sendPushNotification(target, payload);
  }

  /**
   * Send push notification for capsule reminder
   */
  async sendCapsuleReminderNotification(
    target: NotificationTarget,
    capsuleTitle: string,
    daysRemaining: number,
    capsuleId: string
  ): Promise<void> {
    const payload: PushNotificationPayload = {
      title: '⏰ Time Capsule Reminder',
      body: `"${capsuleTitle}" delivers in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`,
      data: {
        type: 'capsule_reminder',
        capsuleId,
        daysRemaining,
        action: 'view_capsule',
      },
      badge: 1,
      sound: 'reminder.wav',
      clickAction: `/dashboard`,
    };

    await this.sendPushNotification(target, payload);
  }

  /**
   * Send push notification for new message received
   */
  async sendNewMessageNotification(
    target: NotificationTarget,
    senderName: string,
    messagePreview: string
  ): Promise<void> {
    const payload: PushNotificationPayload = {
      title: `New message from ${senderName}`,
      body: messagePreview,
      data: {
        type: 'new_message',
        senderName,
        action: 'view_messages',
      },
      badge: 1,
      sound: 'message.wav',
      clickAction: '/messages',
    };

    await this.sendPushNotification(target, payload);
  }

  /**
   * Send push notification for account security
   */
  async sendSecurityNotification(
    target: NotificationTarget,
    title: string,
    message: string
  ): Promise<void> {
    const payload: PushNotificationPayload = {
      title,
      body: message,
      data: {
        type: 'security',
        action: 'view_security',
      },
      badge: 1,
      sound: 'security.wav',
      clickAction: '/settings/security',
    };

    await this.sendPushNotification(target, payload);
  }

  /**
   * Send generic push notification
   */
  async sendPushNotification(
    target: NotificationTarget,
    payload: PushNotificationPayload
  ): Promise<void> {
    try {
      if (!this.hubClient) {
        logger.warn('Azure Notification Hubs not configured, skipping push notification:', {
          target: target.userId,
          payload,
        });
        return;
      }

      // Send to specific devices if device tokens are provided
      if (target.deviceTokens && target.deviceTokens.length > 0) {
        await this.sendToDeviceTokens(target.deviceTokens, payload, target.platform);
      }

      // Send to user tags
      if (target.tags && target.tags.length > 0) {
        await this.sendToTags(target.tags, payload, target.platform);
      } else {
        // Default: send to user ID tag
        await this.sendToTags([`user_${target.userId}`], payload, target.platform);
      }

      logger.info(`Push notification sent to user: ${target.userId}`, {
        title: payload.title,
        platform: target.platform,
      });
    } catch (error) {
      logger.error('Push notification failed:', error);
      throw new Error('Failed to send push notification');
    }
  }

  /**
   * Send notification to specific device tokens
   */
  private async sendToDeviceTokens(
    deviceTokens: string[],
    payload: PushNotificationPayload,
    platform?: string
  ): Promise<void> {
    for (const token of deviceTokens) {
      try {
        if (platform === 'ios') {
          await this.sendApnsNotification([token], payload);
        } else if (platform === 'android') {
          await this.sendFcmNotification([token], payload);
        } else {
          // Try both platforms
          await this.sendFcmNotification([token], payload);
        }
      } catch (error) {
        logger.error(`Failed to send to device token ${token}:`, error);
      }
    }
  }

  /**
   * Send notification to tags
   */
  private async sendToTags(
    tags: string[],
    payload: PushNotificationPayload,
    platform?: string
  ): Promise<void> {
    const tagExpression = tags.join(' || ');

    if (platform === 'ios' || !platform) {
      await this.sendApnsNotification(tagExpression, payload);
    }

    if (platform === 'android' || !platform) {
      await this.sendFcmNotification(tagExpression, payload);
    }
  }

  /**
   * Send APNS (iOS) notification
   */
  private async sendApnsNotification(
    target: string | string[],
    payload: PushNotificationPayload
  ): Promise<void> {
    const apnsPayload = {
      aps: {
        alert: {
          title: payload.title,
          body: payload.body,
        },
        badge: payload.badge || 0,
        sound: payload.sound || 'default',
      },
      data: payload.data || {},
    };

    if (Array.isArray(target)) {
      // Send to specific device tokens
      for (const deviceToken of target) {
        await this.hubClient!.sendDirectNotification(
          { deviceHandle: deviceToken },
          { body: JSON.stringify(apnsPayload), headers: { 'apns-topic': 'com.timecap.app' } }
        );
      }
    } else {
      // Send to tag expression
      await this.hubClient!.sendNotification(
        { body: JSON.stringify(apnsPayload), headers: { 'apns-topic': 'com.timecap.app' } },
        { tagExpression: target }
      );
    }
  }

  /**
   * Send FCM (Android) notification
   */
  private async sendFcmNotification(
    target: string | string[],
    payload: PushNotificationPayload
  ): Promise<void> {
    const fcmPayload = {
      notification: {
        title: payload.title,
        body: payload.body,
        icon: payload.icon || 'ic_notification',
        sound: payload.sound || 'default',
        click_action: payload.clickAction,
      },
      data: payload.data || {},
    };

    if (Array.isArray(target)) {
      // Send to specific device tokens
      for (const deviceToken of target) {
        await this.hubClient!.sendDirectNotification(
          { deviceHandle: deviceToken },
          { body: JSON.stringify(fcmPayload) }
        );
      }
    } else {
      // Send to tag expression
      await this.hubClient!.sendNotification(
        { body: JSON.stringify(fcmPayload) },
        { tagExpression: target }
      );
    }
  }

  /**
   * Register device for push notifications
   */
  async registerDevice(
    userId: string,
    deviceToken: string,
    platform: 'ios' | 'android',
    tags: string[] = []
  ): Promise<void> {
    try {
      if (!this.hubClient) {
        logger.warn('Azure Notification Hubs not configured, skipping device registration');
        return;
      }

      const allTags = [`user_${userId}`, platform, ...tags];
      
      const registration = {
        deviceToken,
        tags: allTags,
      };

      if (platform === 'ios') {
        await this.hubClient.createOrUpdateRegistration({
          registrationId: `${userId}_${deviceToken}`,
          ...registration,
          platform: 'apple',
        } as any);
      } else {
        await this.hubClient.createOrUpdateRegistration({
          registrationId: `${userId}_${deviceToken}`,
          ...registration,
          platform: 'fcm',
        } as any);
      }

      logger.info(`Device registered for user ${userId}:`, {
        platform,
        tags: allTags,
      });
    } catch (error) {
      logger.error('Device registration failed:', error);
      throw new Error('Failed to register device');
    }
  }

  /**
   * Unregister device from push notifications
   */
  async unregisterDevice(userId: string, deviceToken: string): Promise<void> {
    try {
      if (!this.hubClient) {
        return;
      }

      await this.hubClient.deleteRegistration(`${userId}_${deviceToken}`);
      logger.info(`Device unregistered for user ${userId}`);
    } catch (error) {
      logger.error('Device unregistration failed:', error);
    }
  }

  /**
   * Check if notification service is configured
   */
  isConfigured(): boolean {
    return !!(this.hubClient);
  }

  /**
   * Get notification service status
   */
  getStatus(): { configured: boolean; hubName?: string } {
    return {
      configured: this.isConfigured(),
      hubName: config.notifications.azure.hubName,
    };
  }
}