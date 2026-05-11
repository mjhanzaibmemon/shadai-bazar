import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Email template types
type EmailType = 'new_message' | 'new_review' | 'listing_featured' | 'listing_sold' | 'welcome';

interface EmailPayload {
  to: string;
  type: EmailType;
  data: Record<string, any>;
}

// Nodemailer-like interface for email sending
// In production, replace with actual email service (SendGrid, Mailgun, AWS SES, etc.)
const emailTemplates: Record<EmailType, (data: Record<string, any>) => { subject: string; html: string }> = {
  new_message: (data) => ({
    subject: `New Message from ${data.senderName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #800020 0%, #e11d48 100%); padding: 20px; color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">📬 New Message</h1>
        </div>
        <div style="padding: 20px; background: #f9fafb;">
          <p>Hi ${data.recipientName},</p>
          <p><strong>${data.senderName}</strong> sent you a message about listing:</p>
          <p style="background: white; padding: 15px; border-left: 4px solid #800020; margin: 15px 0;">
            <strong>${data.listingTitle}</strong>
          </p>
          <p style="background: white; padding: 15px; border-radius: 4px; color: #666;">
            "${data.message}"
          </p>
          <p style="margin-top: 20px;">
            <a href="${data.chatUrl}" style="background: #800020; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
              View Message
            </a>
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            Shaadi Bazaar &copy; 2024. All rights reserved.
          </p>
        </div>
      </div>
    `,
  }),

  new_review: (data) => ({
    subject: `⭐ New Review from ${data.reviewerName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #800020 0%, #e11d48 100%); padding: 20px; color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">⭐ New Review</h1>
        </div>
        <div style="padding: 20px; background: #f9fafb;">
          <p>Hi ${data.sellerName},</p>
          <p><strong>${data.reviewerName}</strong> left you a ${data.rating}-star review!</p>
          <div style="background: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
            <div style="margin-bottom: 10px;">
              ${[...Array(5)].map((_, i) => `<span style="color: ${i < data.rating ? '#FFD700' : '#CCC'};">★</span>`).join('')}
            </div>
            <p style="margin: 0; color: #666;">"${data.comment}"</p>
          </div>
          <p style="margin-top: 20px;">
            <a href="${data.profileUrl}" style="background: #800020; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
              View Your Profile
            </a>
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            Shaadi Bazaar &copy; 2024. All rights reserved.
          </p>
        </div>
      </div>
    `,
  }),

  listing_featured: (data) => ({
    subject: '🌟 Your Listing is Now Featured!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #800020 0%, #e11d48 100%); padding: 20px; color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">🌟 Featured Listing Active</h1>
        </div>
        <div style="padding: 20px; background: #f9fafb;">
          <p>Hi ${data.sellerName},</p>
          <p>Congratulations! Your listing has been featured and will appear at the top of search results.</p>
          <p style="background: white; padding: 15px; border-left: 4px solid #d4a853; margin: 15px 0;">
            <strong>${data.listingTitle}</strong><br>
            Featured for 7 days
          </p>
          <p>Your listing will get more visibility and attract more potential buyers!</p>
          <p style="margin-top: 20px;">
            <a href="${data.listingUrl}" style="background: #800020; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
              View Your Listing
            </a>
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            Shaadi Bazaar &copy; 2024. All rights reserved.
          </p>
        </div>
      </div>
    `,
  }),

  listing_sold: (data) => ({
    subject: '✅ Congrats! Your Listing is Sold',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #800020 0%, #e11d48 100%); padding: 20px; color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">✅ Listing Sold</h1>
        </div>
        <div style="padding: 20px; background: #f9fafb;">
          <p>Hi ${data.sellerName},</p>
          <p>Great news! You marked your listing as sold:</p>
          <p style="background: white; padding: 15px; border-left: 4px solid #22c55e; margin: 15px 0;">
            <strong>${data.listingTitle}</strong><br>
            Price: Rs. ${data.price}
          </p>
          <p>Thank you for using Shaadi Bazaar! Please don't forget to leave feedback about your experience.</p>
          <p style="margin-top: 20px;">
            <a href="${data.dashboardUrl}" style="background: #800020; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Go to Dashboard
            </a>
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            Shaadi Bazaar &copy; 2024. All rights reserved.
          </p>
        </div>
      </div>
    `,
  }),

  welcome: (data) => ({
    subject: '🎉 Welcome to Shaadi Bazaar!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #800020 0%, #e11d48 100%); padding: 20px; color: white; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">👰 Shaadi Bazaar</h1>
          <p style="margin: 5px 0 0 0;">Pakistan's Wedding Marketplace</p>
        </div>
        <div style="padding: 20px; background: #f9fafb;">
          <p>Hi ${data.name},</p>
          <p>Welcome to <strong>Shaadi Bazaar</strong>! We're excited to have you on board.</p>
          <p>Whether you're buying or selling wedding wear, you've come to the right place. Get started:</p>
          <ul style="background: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
            <li><strong>Browse</strong> thousands of listings from sellers across Pakistan</li>
            <li><strong>Post</strong> your own listings and reach buyers easily</li>
            <li><strong>Chat</strong> directly with buyers/sellers</li>
            <li><strong>Rate & Review</strong> to build trust in the community</li>
          </ul>
          <p style="margin-top: 20px;">
            <a href="${data.browseUrl}" style="background: #800020; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin-right: 10px;">
              Browse Listings
            </a>
            <a href="${data.sellUrl}" style="background: #d4a853; color: #800020; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Start Selling
            </a>
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            Shaadi Bazaar &copy; 2024. All rights reserved.
          </p>
        </div>
      </div>
    `,
  }),
};

// Send email function (skeleton - implement with actual email service)
async function sendEmail(email: string, subject: string, html: string): Promise<boolean> {
  try {
    // TODO: Implement with actual email service
    // Options:
    // 1. SendGrid: npm install @sendgrid/mail
    // 2. Mailgun: npm install mailgun.js
    // 3. AWS SES: npm install aws-sdk
    // 4. Nodemailer: npm install nodemailer

    // Example with SendGrid:
    // import sgMail from '@sendgrid/mail';
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
    // await sgMail.send({
    //   to: email,
    //   from: process.env.SENDER_EMAIL!,
    //   subject,
    //   html,
    // });

    console.log(`[EMAIL] Sent to ${email}: ${subject}`);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

const emailSchema = z.object({
  to: z.string().email(),
  type: z.enum(['new_message', 'new_review', 'listing_featured', 'listing_sold', 'welcome']),
  data: z.record(z.string(), z.any()),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, type, data } = emailSchema.parse(body);

    // Get email template
    const template = emailTemplates[type];
    const { subject, html } = template(data);

    // Send email
    const success = await sendEmail(to, subject, html);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Email sent successfully',
        email: to,
        type,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
