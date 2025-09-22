import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_KEY, CLOUDINARY_NAME, CLOUDINARY_SECRET } from '../config.ts';

cloudinary.config({
  cloud_name: CLOUDINARY_NAME || process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: CLOUDINARY_KEY || process.env.CLOUDINARY_API_KEY!,
  api_secret: CLOUDINARY_SECRET || process.env.CLOUDINARY_API_SECRET!,
});

export default cloudinary;

