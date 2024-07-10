import { Request } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

const folderStorage = (req: Request) => {
  return req.body.type === 'USER' ? 'Users' : 'Event';
};

// Cấu hình Multer để sử dụng CloudinaryStorage
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req: Request, file: Express.Multer.File) => {
    const folderName = folderStorage(req);
    const fileFormat = file.mimetype.split('/')[1]; // Định dạng file
    const publicId = `${Date.now()}-${file.originalname.split('.')[0]}`; // Tạo public_id với timestamp và tên file
    return {
      folder: folderName,
      format: ['jpg', 'png'].includes(fileFormat) ? fileFormat : 'jpg',
      public_id: publicId,
    };
  },
});

// Khởi tạo Multer với cấu hình CloudinaryStorage
const uploadCloud = multer({ storage });

module.exports = uploadCloud;
