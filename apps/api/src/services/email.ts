import sgMail from '@sendgrid/mail';
import { config } from '@/config';
import { logger } from '@/utils/logger';

export class EmailService {
  constructor() {
    if (config.email.sendgridApiKey) {
      sgMail.setApiKey(config.email.sendgridApiKey);
    }
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${config.web.url}/verify-email?token=${token}`;
    
    const msg = {
      to: email,
      from: {
        email: config.email.fromEmail,
        name: config.email.fromName,
      },
      subject: 'Verify Your TimeCap Account',
      html: this.getVerificationEmailTemplate(verificationUrl),
      text: `Please verify your email by clicking this link: ${verificationUrl}`,
    };

    await this.sendEmail(msg);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${config.web.url}/reset-password?token=${token}`;
    
    const msg = {
      to: email,
      from: {
        email: config.email.fromEmail,
        name: config.email.fromName,
      },
      subject: 'Reset Your TimeCap Password',
      html: this.getPasswordResetEmailTemplate(resetUrl),
      text: `Reset your password by clicking this link: ${resetUrl}`,
    };

    await this.sendEmail(msg);
  }

  /**
   * Send capsule delivery notification
   */
  async sendCapsuleDeliveryEmail(
    email: string,
    capsuleTitle: string,
    capsuleUrl: string,
    senderName: string
  ): Promise<void> {
    const msg = {
      to: email,
      from: {
        email: config.email.fromEmail,
        name: config.email.fromName,
      },
      subject: `Time Capsule: "${capsuleTitle}" has been delivered!`,
      html: this.getCapsuleDeliveryEmailTemplate(capsuleTitle, capsuleUrl, senderName),
      text: `Your time capsule "${capsuleTitle}" from ${senderName} has been delivered! View it at: ${capsuleUrl}`,
    };

    await this.sendEmail(msg);
  }

  /**
   * Send capsule reminder email
   */
  async sendCapsuleReminderEmail(
    email: string,
    capsuleTitle: string,
    deliveryDate: Date,
    daysRemaining: number
  ): Promise<void> {
    const msg = {
      to: email,
      from: {
        email: config.email.fromEmail,
        name: config.email.fromName,
      },
      subject: `Reminder: Your time capsule "${capsuleTitle}" delivers in ${daysRemaining} days`,
      html: this.getCapsuleReminderEmailTemplate(capsuleTitle, deliveryDate, daysRemaining),
      text: `Reminder: Your time capsule "${capsuleTitle}" will be delivered on ${deliveryDate.toLocaleDateString()} (${daysRemaining} days remaining).`,
    };

    await this.sendEmail(msg);
  }

  /**
   * Send email using SendGrid or fallback
   */
  private async sendEmail(msg: any): Promise<void> {
    try {
      if (config.email.sendgridApiKey) {
        await sgMail.send(msg);
        logger.info(`Email sent via SendGrid to: ${msg.to}`);
      } else {
        // In development, just log the email
        logger.info('Email would be sent:', {
          to: msg.to,
          subject: msg.subject,
          content: msg.text,
        });
      }
    } catch (error) {
      logger.error('Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }

  /**
   * Email verification template
   */
  private getVerificationEmailTemplate(verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to TimeCap!</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Verify Your Email Address</h2>
          
          <p>Thank you for joining TimeCap! To complete your registration and start creating time capsules, please verify your email address.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Verify Email Address</a>
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #e9e9e9; padding: 10px; border-radius: 5px;">${verificationUrl}</p>
          
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            This verification link will expire in 24 hours. If you didn't create a TimeCap account, you can safely ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
          <p>© 2024 TimeCap. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Password reset email template
   */
  private getPasswordResetEmailTemplate(resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
          
          <p>We received a request to reset your TimeCap account password. Click the button below to create a new password.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #e9e9e9; padding: 10px; border-radius: 5px;">${resetUrl}</p>
          
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            This reset link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
          <p>© 2024 TimeCap. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Capsule delivery email template
   */
  private getCapsuleDeliveryEmailTemplate(capsuleTitle: string, capsuleUrl: string, senderName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Time Capsule Delivered!</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Time Capsule Delivered!</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">"${capsuleTitle}"</h2>
          
          <p>Great news! A time capsule from <strong>${senderName}</strong> has been delivered and is now ready to open.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${capsuleUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Open Time Capsule</a>
          </div>
          
          <p>This special moment has been waiting for you. Click the button above to experience the message that was carefully preserved for this moment in time.</p>
          
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            Time capsules are precious memories. Take a moment to appreciate this thoughtful gift from the past.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
          <p>© 2024 TimeCap. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Capsule reminder email template
   */
  private getCapsuleReminderEmailTemplate(capsuleTitle: string, deliveryDate: Date, daysRemaining: number): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Time Capsule Reminder</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Time Capsule Reminder</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">"${capsuleTitle}"</h2>
          
          <p>Your time capsule is scheduled to be delivered in <strong>${daysRemaining} day${daysRemaining === 1 ? '' : 's'}</strong>!</p>
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea;">
            <p style="margin: 0;"><strong>Delivery Date:</strong> ${deliveryDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
          
          <p>The anticipation is building! Soon, your carefully crafted message from the past will be delivered to its intended recipients.</p>
          
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            You can manage your time capsules anytime by logging into your TimeCap account.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
          <p>© 2024 TimeCap. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }
}