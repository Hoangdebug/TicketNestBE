const QRCode = require('qrcode');
const cloudinary = require('cloudinary').v2;

const generalQRCode = async (qrData: object) => {
  try {
    // Chuyển đổi `qrData` thành chuỗi JSON
    const qrString = JSON.stringify(qrData);

    // Tạo QR Code tạm thời và lưu vào file
    const tempFilePath = './qrcode.png';
    await QRCode.toFile(tempFilePath, qrString, {
      type: 'png',
      width: 300,
    });

    // Upload file QR code lên Cloudinary
    const uploadResult = await cloudinary.uploader.upload(tempFilePath, {
      folder: 'qrcodes', // Thư mục lưu trữ trên Cloudinary
    });

    // Trả về URL của QR Code trên Cloudinary
    return uploadResult.secure_url;
  } catch (error) {
    console.error('Error generating or uploading QR Code:', error);
    throw new Error('Failed to generate or upload QR code');
  }
};


module.exports = {
    generalQRCode
}