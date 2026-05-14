const nodemailer = require('nodemailer');

const getMailConfig = () => {
  const host = process.env.MAIL_HOST || process.env.EMAIL_HOST;
  const port = Number(process.env.MAIL_PORT || process.env.EMAIL_PORT || 587);
  const secure = (process.env.MAIL_SECURE || process.env.EMAIL_SECURE) === 'true';
  const user = process.env.MAIL_USER || process.env.EMAIL_USER;
  const pass = process.env.MAIL_PASS || process.env.EMAIL_PASS;
  const from = process.env.MAIL_FROM || process.env.EMAIL_FROM || user;

  const auth = user && pass ? { user, pass } : null;
  return { host, port, secure, auth, from };
};

const isValidSmtpAuth = (config) => {
  if (!config.host || !config.auth) return false;
  const { user, pass } = config.auth;
  if (!user || !pass) return false;

  const invalidPatterns = [
    'your_email',
    'your_app_password',
    'your_password',
    'example.com',
    'your_email@gmail.com',
  ];
  const lowerUser = user.toLowerCase();
  const lowerPass = pass.toLowerCase();

  return !invalidPatterns.some((pattern) => lowerUser.includes(pattern) || lowerPass.includes(pattern));
};

let transporterPromise;

const getTransporter = async () => {
  if (transporterPromise) return transporterPromise;

  const config = getMailConfig();

  if (isValidSmtpAuth(config)) {
    transporterPromise = Promise.resolve(
      nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: config.auth,
      })
    );
  } else {
    transporterPromise = nodemailer.createTestAccount().then((testAccount) => {
      console.warn('SMTP credentials are missing or invalid. Using Ethereal test account for email delivery.');
      console.warn('Preview URL will be logged to console.');
      return nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    });
  }

  return transporterPromise;
};

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = await getTransporter();
  const config = getMailConfig();

  const mailOptions = {
    from: config.from || 'no-reply@grafenda.com',
    to,
    subject,
    text,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  const previewUrl = nodemailer.getTestMessageUrl(info);

  console.log('Email sent:', info.messageId);
  if (previewUrl) {
    console.log('Preview email URL:', previewUrl);
  }

  return { info, previewUrl };
};

module.exports = {
  sendEmail,
};
