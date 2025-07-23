import { SmsClient } from '@azure/communication-sms';
import { config } from '@/config';
import { logger } from '@/utils/logger';

export class SmsService {
  private smsClient: SmsClient | null = null;

  constructor() {
    if (config.communication.sms.connectionString) {
      this.smsClient = new SmsClient(config.communication.sms.connectionString);
    }
  }

  /**
   * Send SMS notification for capsule delivery
   */
  async sendCapsuleDeliveryNotification(
    phoneNumber: string,
    capsuleTitle: string,
    senderName: string,
    capsuleUrl: string
  ): Promise<void> {
    const message = `🎉 Time Capsule Alert! "${capsuleTitle}" from ${senderName} has been delivered. Open it now: ${capsuleUrl}`;
    await this.sendSms(phoneNumber, message);
  }

  /**
   * Send SMS reminder for upcoming capsule
   */
  async sendCapsuleReminderNotification(
    phoneNumber: string,
    capsuleTitle: string,
    daysRemaining: number
  ): Promise<void> {
    const message = `⏰ TimeCap Reminder: Your time capsule "${capsuleTitle}" delivers in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}!`;
    await this.sendSms(phoneNumber, message);
  }

  /**
   * Send verification code via SMS
   */
  async sendVerificationCode(phoneNumber: string, code: string): Promise<void> {
    const message = `Your TimeCap verification code is: ${code}. This code expires in 10 minutes.`;
    await this.sendSms(phoneNumber, message);
  }

  /**
   * Send password reset code via SMS
   */
  async sendPasswordResetCode(phoneNumber: string, code: string): Promise<void> {
    const message = `Your TimeCap password reset code is: ${code}. This code expires in 10 minutes.`;
    await this.sendSms(phoneNumber, message);
  }

  /**
   * Send welcome SMS to new user
   */
  async sendWelcomeSms(phoneNumber: string, firstName: string): Promise<void> {
    const message = `Welcome to TimeCap, ${firstName}! 🎉 Start creating your first time capsule and preserve memories for the future.`;
    await this.sendSms(phoneNumber, message);
  }

  /**
   * Send SMS using Azure Communication Services
   */
  private async sendSms(phoneNumber: string, message: string): Promise<void> {
    try {
      if (!this.smsClient || !config.communication.sms.phoneNumber) {
        logger.warn('Azure Communication Services SMS not configured, skipping SMS:', {
          to: phoneNumber,
          message,
        });
        return;
      }

      // Ensure phone number is in E.164 format
      const formattedPhoneNumber = this.formatPhoneNumber(phoneNumber);

      const sendRequest = {
        from: config.communication.sms.phoneNumber,
        to: [formattedPhoneNumber],
        message: message,
      };

      const sendResults = await this.smsClient.send(sendRequest);

      if (sendResults && sendResults.length > 0) {
        const result = sendResults[0];
        if (result.successful) {
          logger.info(`SMS sent successfully to: ${formattedPhoneNumber}`, {
            messageId: result.messageId,
          });
        } else {
          logger.error(`SMS failed to send to: ${formattedPhoneNumber}`, {
            errorMessage: result.errorMessage,
          });
          throw new Error(`SMS sending failed: ${result.errorMessage}`);
        }
      }
    } catch (error) {
      logger.error('SMS sending failed:', error);
      throw new Error('Failed to send SMS');
    }
  }

  /**
   * Format phone number to E.164 format
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    
    // If it doesn't start with +, assume it's a US number and add +1
    if (!phoneNumber.startsWith('+')) {
      if (digitsOnly.length === 10) {
        return `+1${digitsOnly}`;
      } else if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
        return `+${digitsOnly}`;
      }
    }
    
    // If it already starts with +, return as is
    if (phoneNumber.startsWith('+')) {
      return phoneNumber;
    }
    
    // Default: add + if not present
    return `+${digitsOnly}`;
  }

  /**
   * Validate phone number format
   */
  static validatePhoneNumber(phoneNumber: string): boolean {
    // Basic E.164 validation
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phoneNumber);
  }

  /**
   * Check if SMS service is configured
   */
  isConfigured(): boolean {
    return !!(this.smsClient && config.communication.sms.phoneNumber);
  }

  /**
   * Get SMS service status
   */
  getStatus(): { configured: boolean; phoneNumber?: string } {
    return {
      configured: this.isConfigured(),
      phoneNumber: config.communication.sms.phoneNumber,
    };
  }
}