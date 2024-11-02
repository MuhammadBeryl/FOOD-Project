import { Request } from "express";
import multer from 'multer'
import { BASE_URL } from '../global'


const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        cb(null, `${BASE_URL}/public/menu_picture/`)// LOKASI PENYIMPANAN FILE
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        cb(null, `${new Date().getTime().toString()}-${file.originalname}`) //  NAMA FILE
    }
})

const uploadFile = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, //LIMIT UKURAN FILE ()
})

export default uploadFile