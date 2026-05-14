const nodemailer = require('nodemailer');

/**
 * Email Notification Service
 * Sends rain alert emails via Gmail SMTP using App Password
 */

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this._init();
  }

  _init() {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_APP_PASSWORD;

    if (!user || !pass) {
      console.warn('⚠️  Email service not configured — set EMAIL_USER and EMAIL_APP_PASSWORD in .env');
      return;
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });

    // Verify connection on startup
    this.transporter.verify()
      .then(() => {
        console.log('📧 Email service ready — sending from', user);
        this.isConfigured = true;
      })
      .catch((err) => {
        console.error('❌ Email service error:', err.message);
        this.isConfigured = false;
      });
  }

  /**
   * Send a rain alert email to a user
   * @param {string} to - Recipient email address
   * @param {Object} alert - Alert data
   * @param {string} alert.level - SAFE | WATCH | WARNING | DANGER
   * @param {number} alert.riskScore - 0-100
   * @param {string} alert.message - Alert description
   * @param {string} alert.locationName - City name
   * @param {string} [alert.peakWindow] - Peak rain window
   */
  async sendRainAlert(to, alert) {
    if (!this.isConfigured) {
      console.warn('Email not sent — service not configured');
      return false;
    }

    const levelConfig = {
      SAFE:    { emoji: '✅', color: '#22c55e', label: 'Safe' },
      WATCH:   { emoji: '⚠️', color: '#eab308', label: 'Watch' },
      WARNING: { emoji: '🟠', color: '#f97316', label: 'Warning' },
      DANGER:  { emoji: '🔴', color: '#ef4444', label: 'Danger' }
    };

    const config = levelConfig[alert.level] || levelConfig.WATCH;
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0; padding:0; background-color:#0f0e1e; font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0e1e; padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" style="max-width:520px; background:linear-gradient(135deg,#1a1a2e,#16213e); border-radius:16px; overflow:hidden; border:1px solid rgba(255,255,255,0.08);">
              
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,${config.color}22,${config.color}11); padding:28px 32px; border-bottom:1px solid rgba(255,255,255,0.06);">
                  <table width="100%">
                    <tr>
                      <td>
                        <span style="font-size:28px;">${config.emoji}</span>
                        <span style="font-size:20px; font-weight:800; color:#fff; margin-left:8px; vertical-align:middle;">Rain ${config.label}</span>
                      </td>
                      <td align="right">
                        <span style="display:inline-block; padding:4px 14px; border-radius:20px; background:${config.color}; color:#fff; font-size:12px; font-weight:700; letter-spacing:0.5px;">
                          SCORE: ${alert.riskScore}/100
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:28px 32px;">
                  <!-- Location -->
                  <p style="margin:0 0 6px; color:#94a3b8; font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:1px;">
                    📍 Location
                  </p>
                  <p style="margin:0 0 24px; color:#fff; font-size:18px; font-weight:700;">
                    ${alert.locationName}
                  </p>

                  <!-- Alert Message -->
                  <div style="padding:16px 20px; background:rgba(255,255,255,0.04); border-radius:12px; border-left:4px solid ${config.color}; margin-bottom:20px;">
                    <p style="margin:0; color:#e2e8f0; font-size:15px; line-height:1.6;">
                      ${alert.message}
                    </p>
                  </div>

                  ${alert.peakWindow ? `
                  <!-- Peak Window -->
                  <div style="padding:12px 20px; background:rgba(59,130,246,0.08); border-radius:10px; margin-bottom:20px;">
                    <p style="margin:0; color:#93c5fd; font-size:13px;">
                      🕐 <strong>Peak Rain Window:</strong> ${alert.peakWindow}
                    </p>
                  </div>
                  ` : ''}

                  <!-- Advice -->
                  <div style="padding:14px 20px; background:rgba(255,255,255,0.03); border-radius:10px;">
                    <p style="margin:0; color:#94a3b8; font-size:13px; line-height:1.5;">
                      💡 <strong>Tip:</strong> ${getAdvice(alert.level)}
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:20px 32px; border-top:1px solid rgba(255,255,255,0.06); text-align:center;">
                  <p style="margin:0 0 4px; color:#64748b; font-size:11px;">
                    🌧️ Rain Alert — Weather Intelligence Platform
                  </p>
                  <p style="margin:0; color:#475569; font-size:10px;">
                    Sent at ${timestamp} • You can disable email alerts in app Settings
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    try {
      await this.transporter.sendMail({
        from: `"🌧️ Rain Alert" <${process.env.EMAIL_USER}>`,
        to,
        subject: `${config.emoji} Rain ${config.label} — ${alert.locationName} (Score: ${alert.riskScore}/100)`,
        html: htmlBody
      });
      console.log(`📧 Alert email sent to ${to} — ${alert.level} for ${alert.locationName}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send alert email:', error.message);
      return false;
    }
  }

  /**
   * Send a test email to verify configuration
   */
  async sendTestEmail(to) {
    if (!this.isConfigured) return false;

    try {
      await this.transporter.sendMail({
        from: `"🌧️ Rain Alert" <${process.env.EMAIL_USER}>`,
        to,
        subject: '✅ Rain Alert — Email Notifications Active!',
        html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif; background:#0f0e1e; padding:40px 20px;">
          <div style="max-width:480px; margin:0 auto; background:linear-gradient(135deg,#1a1a2e,#16213e); border-radius:16px; padding:32px; border:1px solid rgba(255,255,255,0.08); text-align:center;">
            <p style="font-size:48px; margin:0 0 16px;">🌧️</p>
            <h1 style="color:#fff; font-size:22px; margin:0 0 12px;">Email Alerts Activated!</h1>
            <p style="color:#94a3b8; font-size:14px; margin:0 0 24px; line-height:1.6;">
              You will now receive email notifications whenever rain conditions reach your alert threshold.
            </p>
            <div style="padding:12px 20px; background:rgba(34,197,94,0.1); border-radius:10px; display:inline-block;">
              <p style="margin:0; color:#22c55e; font-size:13px; font-weight:600;">✅ Configuration successful</p>
            </div>
          </div>
        </div>
        `
      });
      console.log(`📧 Test email sent to ${to}`);
      return true;
    } catch (error) {
      console.error('❌ Test email failed:', error.message);
      return false;
    }
  }
}

function getAdvice(level) {
  switch (level) {
    case 'DANGER':
      return 'Heavy rain expected. Carry an umbrella, avoid waterlogged areas, and stay indoors if possible.';
    case 'WARNING':
      return 'Moderate rain likely. Keep rain gear handy and plan your outdoor activities accordingly.';
    case 'WATCH':
      return 'Light rain possible. Consider carrying an umbrella just in case.';
    default:
      return 'No significant rain expected. Enjoy your day!';
  }
}

// Singleton instance
module.exports = new EmailService();
