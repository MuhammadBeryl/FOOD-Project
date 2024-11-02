import { Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import { error } from "console";
const {v4: uuidv4} = require("uuid");
import { BASE_URL, SECRET } from "../global";
import fs from "fs"
import { json } from "stream/consumers";
import md5 from "md5";
import { sign } from "jsonwebtoken";
require('dotenv').config();

const prisma = new PrismaClient({ errorFormat: "pretty"})

export const getAllUser = async (request: Request, response: Response) => {
    try {
        const { search } = request.query
        const allUser = await prisma.user.findMany({
            where: { name: { contains: search?.toString() || ""}}
        })
        return response.json({
            status: true,
            data: allUser,
            message: "User has retrived"
        }).status(200)
    }catch (error) {
        return response
        .json({
            status: false,
            message: `There is an error. ${error}`
        })
        .status(400)
    }
}

export const createUser = async (request: Request, response: Response) => {
    try {
        const { name, email, password, profile_picture, role } = request.body
        const uuid = uuidv4()

        const newUser = await prisma.user.create({
            data: { uuid, name, email, password: md5(password), profile_picture, role }
        })

        return response.json({
            status: true,
            data: newUser,
            message: "User berhasil ditambahkan"
        })
        .status(200)
    } catch (error) {
        return response
        .json({
            status: false,
            message: `There is an error. ${error}`
        })
        .status(400)
    }
}

export const updateUser = async (request: Request, response: Response) => {
    try {
        const { idUser } = request.params
        const { name, email, password, profile_picture, role } = request.body

        const findUser = await prisma.user.findFirst({ where: { id: Number(idUser) }})
        if (!findUser) return response
        .status(200)
        .json({ status: false, message: `User is not found`})

        const updateUser = await prisma.user.update({
            data: {
                name: name || findUser.name,
                email: email || findUser.email,
                password: password || findUser.password,
                profile_picture: profile_picture || findUser.profile_picture,
                role: role || findUser.role
            },
            where: { id: Number(idUser)}
        })

        return response.json({
            status: true,
            data: updateUser,
            message: `User has Updated`
        }).status(4000)
    }catch (error) {
        return response
        .json({
            status: false,
            message: `There is an error. ${error}`
        })
        .status(400)
    }
}

export const changePicture = async (request: Request, response: Response) => {
    try{
    const { idUser } = request.params

    const findUser = await prisma.user.findFirst({ where: { id: Number(idUser) } })
    if (!findUser) return response
    .status(200)
    .json({ status: false, message: `User is not found`})

    let filename = findUser.profile_picture
    if (request.file) {
        filename = request.file.filename
        let path = `${BASE_URL}/../public/menu_picture/${findUser.profile_picture}`
        let exists = fs.existsSync(path)
        if(exists && findUser.profile_picture !== ``) fs.unlinkSync(path)
    }

    const updatePicture = await prisma.user.update({
        data: { profile_picture: filename },
        where: { id: Number(idUser) }
    })

    return response.json({
        status: true,
        data: updatePicture,
        message: `picture has changed`
    })
    }catch (error) {
        return response
        .json({
            status: false,
            message: `There is an error. ${error}`
        })
        .status(400)
    }
}

export const deleteUser = async (request: Request, response: Response) => {
    try {
        const { idUser } = request.params

        const findUser = await prisma.user.findFirst({ where: { id: Number(idUser) } })
        if (!findUser) return response
        .status(200)
        .json({ status: false, message: `Egg is not found` })

        let path = `${BASE_URL}/../public/menu_picture/${findUser.profile_picture}`
        let exists = fs.existsSync(path)
        if(exists && findUser.profile_picture !== ``) fs.unlinkSync(path)

        const deleteUser = await prisma.user.delete({
            where: { id: Number(idUser) }
        })
        return response.json({
            status: true,
            data: deleteUser,
            message: `User has delete`
        }).status(200)
    }catch (error) {
        return response
        .json({
            status: false,
            message: `There is an error. ${error}`
        })
        .status(400)
    }
}

export const authentication = async (request: Request, response: Response) => {
    try {
        const { email, password } = request.body

        const findUser = await prisma.user.findFirst({
            where: { email, password: md5(password) },
        })

        if(!findUser)
            return response
        .status(200)
        .json({
            status: false,
            logged: false,
            message: `Email or password is invalid`
        })

        let data = {
            id: findUser.id,
            name: findUser.name,
            email: findUser.email,
            role: findUser.role
        }

        let payload = JSON.stringify(data)

        let token = sign(payload, SECRET || "token")

        return response
        .status(200)
        .json({ status: true, logged: true, message: `Login Success`, token })
    } catch (error) {
        return response
        .json ({
            status: false,
            message: `There is an error. ${error}`
        })
        .status(400)
    }
}