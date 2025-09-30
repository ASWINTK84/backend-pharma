import multer from 'multer';
const storage = multer.memoryStorage();
export const uploadSingle = multer({ storage });
