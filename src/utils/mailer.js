const nodemailer = require('nodemailer');

// Configuración del transporte usando variables de entorno
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

/**
 * Envía un correo electrónico
 * @param {string} to - Destinatario
 * @param {string} subject - Asunto del correo
 * @param {string} text - Contenido en texto plano
 * @param {string} html - (Opcional) Contenido en HTML
 */
async function sendMail(to, subject, text, html = '') {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn('Advertencia: Variables de entorno SMTP no configuradas. Simulando envío de correo a:', to);
            return false;
        }

        const info = await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || 'SIFMO Sistema de Incidencias'}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
            to,
            subject,
            text,
            html: html || text // Usa el texto plano si no se proporciona HTML
        });

        console.log('Correo enviado exitosamente: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error al enviar correo:', error);
        return false;
    }
}

module.exports = {
    sendMail
};
