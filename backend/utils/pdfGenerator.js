const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFGenerator {
  static generateInvoice(orderData, paymentData) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const invoiceNumber = `INV-${orderData.id}-${Date.now()}`;
        const fileName = `invoice-${orderData.id}.pdf`;
        const filePath = path.join(__dirname, '../uploads/invoices', fileName);

        // Ensure invoices directory exists
        const invoicesDir = path.dirname(filePath);
        if (!fs.existsSync(invoicesDir)) {
          fs.mkdirSync(invoicesDir, { recursive: true });
        }

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header
        doc.fontSize(20).text('GRAFENDA INVOICE', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Invoice Number: ${invoiceNumber}`, { align: 'right' });
        doc.text(`Date: ${new Date().toLocaleDateString('id-ID')}`, { align: 'right' });
        doc.moveDown();

        // Company info
        doc.fontSize(14).text('Grafenda - Creative Services Marketplace');
        doc.fontSize(10).text('Jl. Contoh No. 123, Jakarta');
        doc.text('Email: support@grafenda.com');
        doc.text('Phone: +62 123 456 789');
        doc.moveDown();

        // Order details
        doc.fontSize(14).text('Order Details:');
        doc.moveDown(0.5);
        doc.fontSize(10);
        doc.text(`Order ID: ${orderData.id}`);
        doc.text(`Service: ${orderData.service_title}`);
        doc.text(`Package: ${orderData.package_name}`);
        doc.text(`Buyer: ${orderData.buyer_name}`);
        doc.text(`Seller: ${orderData.seller_name}`);
        doc.moveDown();

        // Payment details
        doc.fontSize(14).text('Payment Details:');
        doc.moveDown(0.5);
        doc.fontSize(10);
        doc.text(`Payment Method: ${paymentData.payment_method}`);
        doc.text(`Amount: Rp${orderData.price.toLocaleString('id-ID')}`);
        doc.text(`Status: ${paymentData.status}`);
        if (paymentData.verified_at) {
          doc.text(`Verified At: ${new Date(paymentData.verified_at).toLocaleString('id-ID')}`);
        }
        doc.moveDown();

        // Terms and conditions
        doc.fontSize(12).text('Terms & Conditions:');
        doc.moveDown(0.5);
        doc.fontSize(8);
        doc.text('1. This invoice serves as proof of payment for the service ordered.');
        doc.text('2. Services will be delivered according to the agreed timeline.');
        doc.text('3. Refunds are subject to our refund policy.');
        doc.text('4. For any questions, please contact our support team.');
        doc.moveDown();

        // Footer
        doc.fontSize(10).text('Thank you for using Grafenda!', { align: 'center' });
        doc.text('www.grafenda.com', { align: 'center' });

        doc.end();

        stream.on('finish', () => {
          resolve({
            fileName,
            filePath,
            invoiceNumber
          });
        });

        stream.on('error', (error) => {
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  static generateReceipt(orderData, paymentData) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const receiptNumber = `RCP-${paymentData.id}-${Date.now()}`;
        const fileName = `receipt-${paymentData.id}.pdf`;
        const filePath = path.join(__dirname, '../uploads/receipts', fileName);

        // Ensure receipts directory exists
        const receiptsDir = path.dirname(filePath);
        if (!fs.existsSync(receiptsDir)) {
          fs.mkdirSync(receiptsDir, { recursive: true });
        }

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header
        doc.fontSize(20).text('PAYMENT RECEIPT', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Receipt Number: ${receiptNumber}`, { align: 'right' });
        doc.text(`Date: ${new Date().toLocaleDateString('id-ID')}`, { align: 'right' });
        doc.moveDown();

        // Company info
        doc.fontSize(14).text('Grafenda - Creative Services Marketplace');
        doc.fontSize(10).text('Payment has been received and verified');
        doc.moveDown();

        // Payment details
        doc.fontSize(14).text('Payment Information:');
        doc.moveDown(0.5);
        doc.fontSize(10);
        doc.text(`Order ID: ${orderData.id}`);
        doc.text(`Service: ${orderData.service_title}`);
        doc.text(`Buyer: ${orderData.buyer_name}`);
        doc.text(`Amount Paid: Rp${paymentData.amount.toLocaleString('id-ID')}`);
        doc.text(`Payment Method: ${paymentData.payment_method}`);
        doc.text(`Payment Date: ${new Date(paymentData.created_at).toLocaleString('id-ID')}`);
        if (paymentData.verified_at) {
          doc.text(`Verified Date: ${new Date(paymentData.verified_at).toLocaleString('id-ID')}`);
        }
        doc.moveDown();

        // Footer
        doc.fontSize(10).text('This receipt is computer generated and valid without signature.', { align: 'center' });
        doc.moveDown();
        doc.text('For support: support@grafenda.com', { align: 'center' });

        doc.end();

        stream.on('finish', () => {
          resolve({
            fileName,
            filePath,
            receiptNumber
          });
        });

        stream.on('error', (error) => {
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = PDFGenerator;