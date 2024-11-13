import express from "express"
import { getAllMenus, updateMenu, deleteMenu, changePicture } from "../controller/menuController"
import { createMenu } from "../controller/menuController"
import { verifyAddMenu, verifyEditMenu } from "../middlewares/verifyMenu"
import { verifyRole, verifyToken } from "../middlewares/authorization"
import uploadFile from "../middlewares/menuUpload"

const app = express()
app.use(express.json())

app.get(`/`, [verifyToken, verifyRole(["CASHIER", "MANAGER"])], getAllMenus)
app.post(`/`, [verifyToken, verifyRole(["MANAGER"]), uploadFile.single("picture"), verifyAddMenu], createMenu)
app.put(`/:idMenu`, [verifyToken, verifyRole(["MANAGER"]), uploadFile.single("picture"), verifyEditMenu], updateMenu)
//app.put(`/pic/:idMenu`, [verifyToken, verifyRole(["MANAGAER"]), uploadFile.single("picture")], changePicture)
app.delete(`/:idMenu`, [verifyToken, verifyRole(["MANAGER"])], deleteMenu)

export default app