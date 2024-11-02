import express from "express"
import { getAllMenus, updateMenu, deleteMenu, changePicture } from "../controller/menuController"
import { createMenu } from "../controller/menuController"
import { verifyAddMenu, verifyEditMenu } from "../middlewares/verifyMenu"
import { verifyRole, verifyToken } from "../middlewares/authorization"
import uploadFile from "../middlewares/menuUpload"

const app = express()
app.use(express.json())

app.get(`/`, getAllMenus)
app.post(`/`, [verifyToken, verifyRole(["MANAGER"]), verifyAddMenu], createMenu)
app.put(`/:idMenu`, [verifyToken, verifyRole(["MANAGER"]), verifyEditMenu], updateMenu)
app.put(`/pic/:idMenu`, [uploadFile.single("picture")], changePicture)
app.delete(`/:idMenu`, [verifyToken, verifyRole(["MANAGER"])], deleteMenu)

export default app