// ============================================================
// SHREEAI - NODE.JS BACKEND SERVER
// Complete email + signup system
// ============================================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`);
    next();
});

// ============================================================
// EMAIL CONFIGURATION
// ============================================================
const EMAIL_CONFIG = {
    SENDER_EMAIL: process.env.SENDER_EMAIL || 'rajveersinghjagirdar@gmail.com',
    REPLY_TO_EMAIL: process.env.REPLY_TO_EMAIL || 'shreeai012@gmail.com',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'shreeai012@gmail.com'
};

// ============================================================
// EMAIL TEMPLATES
// ============================================================

const getVerificationEmailTemplate = (code) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-size: 24px; font-weight: bold; color: #000; margin: 0;">ShreeAI</h1>
        </div>
        
        <div style="background: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; padding: 40px;">
            <h2 style="font-size: 20px; font-weight: 600; color: #1a1a1a; margin: 0 0 16px 0;">
                Welcome to ShreeAI!
            </h2>
            
            <p style="font-size: 15px; color: #666; line-height: 1.6; margin: 0 0 24px 0;">
                Your verification code is:
            </p>
            
            <div style="background: #f9f9f9; border: 1px solid #e5e5e5; border-radius: 8px; padding: 24px; text-align: center; margin: 0 0 24px 0;">
                <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #000;">
                    ${code}
                </div>
            </div>
            
            <p style="font-size: 14px; color: #999; line-height: 1.5; margin: 0;">
                This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
            </p>
        </div>
        
        <div style="text-align: center; padding-top: 32px; border-top: 1px solid #e5e5e5; margin-top: 32px;">
            <p style="font-size: 12px; color: #999; margin: 0;">
                © 2025 ShreeAI. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
`;

const getBookingEmailTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-size: 24px; font-weight: bold; color: #000; margin: 0;">ShreeAI</h1>
        </div>
        
        <div style="background: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; padding: 40px;">
            <h2 style="font-size: 20px; font-weight: 600; color: #1a1a1a; margin: 0 0 8px 0;">
                🎯 New Consultation Request
            </h2>
            
            <p style="font-size: 14px; color: #666; margin: 0 0 24px 0;">
                Booking ID: <strong>${data.bookingId}</strong>
            </p>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr style="border-bottom: 1px solid #e5e5e5;">
                    <td style="padding: 12px 0; font-size: 14px; color: #666; font-weight: 500;">Client Name</td>
                    <td style="padding: 12px 0; font-size: 14px; color: #1a1a1a; text-align: right;">${data.name}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e5e5;">
                    <td style="padding: 12px 0; font-size: 14px; color: #666; font-weight: 500;">Email</td>
                    <td style="padding: 12px 0; font-size: 14px; color: #1a1a1a; text-align: right;">
                        <a href="mailto:${data.email}" style="color: #000; text-decoration: none;">${data.email}</a>
                    </td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e5e5;">
                    <td style="padding: 12px 0; font-size: 14px; color: #666; font-weight: 500;">Phone</td>
                    <td style="padding: 12px 0; font-size: 14px; color: #1a1a1a; text-align: right;">
                        <a href="tel:${data.phone}" style="color: #000; text-decoration: none;">${data.phone}</a>
                    </td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e5e5;">
                    <td style="padding: 12px 0; font-size: 14px; color: #666; font-weight: 500;">Gender</td>
                    <td style="padding: 12px 0; font-size: 14px; color: #1a1a1a; text-align: right;">${data.gender}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e5e5;">
                    <td style="padding: 12px 0; font-size: 14px; color: #666; font-weight: 500;">Country</td>
                    <td style="padding: 12px 0; font-size: 14px; color: #1a1a1a; text-align: right;">${data.country}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e5e5;">
                    <td style="padding: 12px 0; font-size: 14px; color: #666; font-weight: 500;">Meeting Date</td>
                    <td style="padding: 12px 0; font-size: 14px; color: #1a1a1a; text-align: right; font-weight: 600;">${data.date}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e5e5;">
                    <td style="padding: 12px 0; font-size: 14px; color: #666; font-weight: 500;">Meeting Time</td>
                    <td style="padding: 12px 0; font-size: 14px; color: #1a1a1a; text-align: right; font-weight: 600;">${data.time}</td>
                </tr>
                <tr>
                    <td style="padding: 12px 0; font-size: 14px; color: #666; font-weight: 500;">Services</td>
                    <td style="padding: 12px 0; font-size: 14px; color: #1a1a1a; text-align: right;">${data.services.join(', ')}</td>
                </tr>
            </table>
            
            <div style="background: #f9f9f9; border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px; margin-top: 24px;">
                <p style="font-size: 14px; color: #666; margin: 0; line-height: 1.5;">
                    <strong style="color: #1a1a1a;">⚡ Action Required:</strong><br>
                    1. Create Google Meet link<br>
                    2. Send DocuSign agreement to client<br>
                    3. Send Razorpay payment link
                </p>
            </div>
        </div>
        
        <div style="text-align: center; padding-top: 32px; border-top: 1px solid #e5e5e5; margin-top: 32px;">
            <p style="font-size: 12px; color: #999; margin: 0;">
                © 2025 ShreeAI. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
`;

// ============================================================
// ROUTES
// ============================================================

// Health check
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🚀 ShreeAI Backend API is running!',
        version: '1.0.0',
        endpoints: {
            health: 'GET /',
            sendEmail: 'POST /api/send-email',
            verification: 'POST /api/send-verification',
            booking: 'POST /api/send-booking'
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        success: true, 
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// ============================================================
// SEND VERIFICATION EMAIL
// ============================================================
app.post('/api/send-verification', async (req, res) => {
    try {
        const { email, code } = req.body;

        // Validation
        if (!email || !code) {
            return res.status(400).json({
                success: false,
                error: 'Email and code are required'
            });
        }

        console.log('📧 Sending verification to:', email);
        console.log('🔢 Code:', code);

        const msg = {
            to: email,
            from: {
                email: EMAIL_CONFIG.SENDER_EMAIL,
                name: 'ShreeAI'
            },
            replyTo: {
                email: EMAIL_CONFIG.REPLY_TO_EMAIL,
                name: 'ShreeAI Support'
            },
            subject: 'ShreeAI - Your Verification Code',
            html: getVerificationEmailTemplate(code)
        };

        await sgMail.send(msg);

        console.log('✅ Verification email sent successfully');

        res.json({
            success: true,
            message: 'Verification email sent successfully'
        });

    } catch (error) {
        console.error('❌ Verification Email Error:', error);
        
        res.status(500).json({
            success: false,
            error: 'Failed to send verification email',
            details: error.message
        });
    }
});

// ============================================================
// SEND BOOKING EMAIL
// ============================================================
app.post('/api/send-booking', async (req, res) => {
    try {
        const bookingData = req.body;

        // Validation
        if (!bookingData || !bookingData.name || !bookingData.email) {
            return res.status(400).json({
                success: false,
                error: 'Invalid booking data'
            });
        }

        console.log('📧 Sending booking email for:', bookingData.name);

        const msg = {
            to: EMAIL_CONFIG.ADMIN_EMAIL,
            from: {
                email: EMAIL_CONFIG.SENDER_EMAIL,
                name: 'ShreeAI Booking System'
            },
            replyTo: {
                email: bookingData.email,
                name: bookingData.name
            },
            subject: `📩 New Consultation Booking - ${bookingData.name}`,
            html: getBookingEmailTemplate(bookingData)
        };

        await sgMail.send(msg);

        console.log('✅ Booking email sent successfully');

        res.json({
            success: true,
            message: 'Booking email sent successfully',
            bookingId: bookingData.bookingId
        });

    } catch (error) {
        console.error('❌ Booking Email Error:', error);
        
        res.status(500).json({
            success: false,
            error: 'Failed to send booking email',
            details: error.message
        });
    }
});

// ============================================================
// COMBINED EMAIL ENDPOINT (for compatibility)
// ============================================================
app.post('/api/send-email', async (req, res) => {
    try {
        const { type, to, code, data } = req.body;

        if (type === 'verification') {
            return req.app._router.handle(
                { ...req, url: '/api/send-verification', body: { email: to, code } },
                res
            );
        } else if (type === 'booking') {
            return req.app._router.handle(
                { ...req, url: '/api/send-booking', body: data },
                res
            );
        } else {
            return res.status(400).json({
                success: false,
                error: 'Invalid email type'
            });
        }
    } catch (error) {
        console.error('❌ Email Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process email request'
        });
    }
});

// ============================================================
// ERROR HANDLING
// ============================================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err);
    
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
    console.log('\n🚀 ============================================');
    console.log('🚀 ShreeAI Backend Server Started!');
    console.log('🚀 ============================================');
    console.log(`🌐 Server running on: http://localhost:${PORT}`);
    console.log(`📧 Email system: ${EMAIL_CONFIG.SENDER_EMAIL}`);
    console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('🚀 ============================================\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n👋 SIGINT received, shutting down gracefully...');
    process.exit(0);
});