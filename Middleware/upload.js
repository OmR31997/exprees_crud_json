import multer from "multer";
import path from 'path';
import fs, { mkdir } from 'fs';

const uploadPath = path.join('public', 'uploads');

if(!fs.existsSync(uploadPath))
{
    fs.mkdirSync(uploadPath, {recursive:true})
}

const storage = multer.diskStorage({
    destination:(req, file, callBack)=>{
        callBack(null, uploadPath)
    },

    filename:(req, file, callBack) =>{
        const exten = path.extname(file.originalname);
        const uniqueName = `${Date.now()}_${path.basename(file.originalname, exten).toUpperCase().replace(/[a-zA-Z0-9]/g, '_')}`;
        callBack(null, `${uniqueName}${exten}`);
    }
});

const fileFilter = (req, file, callBack) =>{
    const allowedFile = /jpeg|jpg|png|pdf/;
    const isAllow = allowedFile.test(path.extname(file.originalname));
    const mimeType = allowedFile.test(file.mimetype);

    if(isAllow && mimeType)
    {
        callBack(null, true);   
    }
    else
    {
        callBack(null, false);
        req.fileValidationError='Only JPEG | JPG | PNG are allowed';
    }
}

export const Upload = multer({storage, fileFilter, limits:{fieldSize:2*1024*1024}})