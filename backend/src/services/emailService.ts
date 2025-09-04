import nodemailer from 'nodemailer';
import { config } from '../config/config';
import { EmailOptions } from '../types';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: config.EMAIL_HOST,
      port: config.EMAIL_PORT,
      secure: config.EMAIL_PORT === 465,
      auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS
      }
    });
  }

  // Email templates
  private getTemplate(template: string, data: any): { subject: string; html: string; text: string } {
    switch (template) {
      case 'verification':
        return {
          subject: 'Verify Your STAYA Account',
          html: this.getVerificationTemplate(data),
          text: `Hello ${data.name},\n\nPlease verify your email by clicking: ${data.verificationUrl}\n\nBest regards,\nSTAYA Team`
        };

      case 'passwordReset':
        return {
          subject: 'Reset Your STAYA Password',
          html: this.getPasswordResetTemplate(data),
          text: `Hello ${data.name},\n\nReset your password by clicking: ${data.resetUrl}\n\nThis link expires in 10 minutes.\n\nBest regards,\nSTAYA Team`
        };

      case 'bookingConfirmation':
        return {
          subject: `Booking Confirmed - ${data.bookingReference}`,
          html: this.getBookingConfirmationTemplate(data),
          text: `Hello ${data.name},\n\nYour booking ${data.bookingReference} has been confirmed.\n\nTrip: ${data.from} to ${data.to}\nDate: ${data.departureDate}\nPassengers: ${data.passengers}\n\nBest regards,\nSTAYA Team`
        };

      case 'bookingCancellation':
        return {
          subject: `Booking Cancelled - ${data.bookingReference}`,
          html: this.getBookingCancellationTemplate(data),
          text: `Hello ${data.name},\n\nYour booking ${data.bookingReference} has been cancelled.\n\nRefund amount: ₦${data.refundAmount}\n\nBest regards,\nSTAYA Team`
        };

      case 'paymentConfirmation':
        return {
          subject: `Payment Confirmed - ${data.paymentReference}`,
          html: this.getPaymentConfirmationTemplate(data),
          text: `Hello ${data.name},\n\nYour payment of ₦${data.amount} has been confirmed.\n\nPayment Reference: ${data.paymentReference}\n\nBest regards,\nSTAYA Team`
        };

      default:
        throw new Error(`Unknown email template: ${template}`);
    }
  }

  private getVerificationTemplate(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your STAYA Account</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1DBCBC, #16A5A5); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #1DBCBC; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to STAYA!</h1>
            <p>Your journey starts here</p>
          </div>
          <div class="content">
            <h2>Hello ${data.name},</h2>
            <p>Thank you for registering with STAYA! To complete your registration and start booking amazing trips, please verify your email address.</p>
            <p style="text-align: center;">
              <a href="${data.verificationUrl}" class="button">Verify Email Address</a>
            </p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #1DBCBC;">${data.verificationUrl}</p>
            <p>This verification link will expire in 24 hours for security reasons.</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>The STAYA Team</p>
            <p>Connect Taraba State to Nigeria and the world</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getPasswordResetTemplate(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your STAYA Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1DBCBC, #16A5A5); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #1DBCBC; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.name},</h2>
            <p>We received a request to reset your STAYA account password. If you made this request, click the button below to reset your password:</p>
            <p style="text-align: center;">
              <a href="${data.resetUrl}" class="button">Reset Password</a>
            </p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #1DBCBC;">${data.resetUrl}</p>
            <div class="warning">
              <strong>Important:</strong> This link will expire in 10 minutes for security reasons. If you didn't request this password reset, please ignore this email.
            </div>
          </div>
          <div class="footer">
            <p>Best regards,<br>The STAYA Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getBookingConfirmationTemplate(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Booking Confirmed - ${data.bookingReference}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1DBCBC, #16A5A5); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #eee; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Booking Confirmed!</h1>
            <p>Reference: ${data.bookingReference}</p>
          </div>
          <div class="content">
            <h2>Hello ${data.name},</h2>
            <p>Great news! Your booking has been confirmed. Get ready for an amazing journey!</p>
            <div class="booking-details">
              <h3>Trip Details</h3>
              <div class="detail-row">
                <span><strong>From:</strong></span>
                <span>${data.from}</span>
              </div>
              <div class="detail-row">
                <span><strong>To:</strong></span>
                <span>${data.to}</span>
              </div>
              <div class="detail-row">
                <span><strong>Departure:</strong></span>
                <span>${data.departureDate}</span>
              </div>
              <div class="detail-row">
                <span><strong>Passengers:</strong></span>
                <span>${data.passengers}</span>
              </div>
              <div class="detail-row">
                <span><strong>Transport:</strong></span>
                <span>${data.transportType} - ${data.operator}</span>
              </div>
              <div class="detail-row">
                <span><strong>Total Amount:</strong></span>
                <span><strong>₦${data.totalAmount}</strong></span>
              </div>
            </div>
            <p>Please save this email for your records. You may need to show your booking reference during your trip.</p>
          </div>
          <div class="footer">
            <p>Safe travels!<br>The STAYA Team</p>
            <p>For support: 09115915128 | WhatsApp available</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getBookingCancellationTemplate(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Booking Cancelled - ${data.bookingReference}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .refund-info { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Cancelled</h1>
            <p>Reference: ${data.bookingReference}</p>
          </div>
          <div class="content">
            <h2>Hello ${data.name},</h2>
            <p>Your booking has been cancelled as requested.</p>
            <div class="refund-info">
              <h3>Refund Information</h3>
              <p><strong>Refund Amount:</strong> ₦${data.refundAmount}</p>
              <p><strong>Processing Time:</strong> 3-5 business days</p>
              <p>The refund will be processed to your original payment method.</p>
            </div>
            <p>We're sorry to see you go. We hope to serve you again in the future!</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>The STAYA Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getPaymentConfirmationTemplate(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Confirmed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .payment-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Payment Confirmed</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.name},</h2>
            <p>Your payment has been successfully processed!</p>
            <div class="payment-details">
              <h3>Payment Details</h3>
              <p><strong>Amount:</strong> ₦${data.amount}</p>
              <p><strong>Payment Reference:</strong> ${data.paymentReference}</p>
              <p><strong>Date:</strong> ${data.paymentDate}</p>
              <p><strong>Method:</strong> ${data.paymentMethod}</p>
            </div>
            <p>Thank you for choosing STAYA for your travel needs!</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>The STAYA Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send email
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const { subject, html, text } = this.getTemplate(options.template, options.data);

      const mailOptions = {
        from: config.EMAIL_FROM,
        to: options.to,
        subject: options.subject || subject,
        html,
        text
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${options.to}`);
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      throw error;
    }
  }

  // Verify email configuration
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ Email service is ready');
      return true;
    } catch (error) {
      console.error('❌ Email service configuration error:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
export const sendEmail = (options: EmailOptions) => emailService.sendEmail(options);
