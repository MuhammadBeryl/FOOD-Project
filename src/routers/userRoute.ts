import express from "express"
import { authentication, changePicture, createUser, deleteUser, getAllUser, updateUser } from "../controller/userController"
import { verifyAddUser, verifyEditUser } from "../middlewares/verifyUser"
import { verifyAuthentication } from "../middlewares/userValidation"
import uploadFile from "../middlewares/uploadProfil"

const app = express()
app.use(express.json())

app.get(`/`, getAllUser)
app.post(`/`, [verifyAddUser], createUser)
app.put(`/:idUser`, [verifyEditUser], updateUser)
app.put(`/pic/:idUser`, [uploadFile.single("picture")], changePicture)
app.delete(`/:idUser`, deleteUser)
app.post(`/login`, [verifyAuthentication], authentication)

export default app