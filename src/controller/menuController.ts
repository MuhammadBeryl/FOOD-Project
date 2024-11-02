import { Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import { error } from "console";
const {v4: uuidv4} = require("uuid");
import { BASE_URL } from "../global";
import fs from "fs"
import { json } from "stream/consumers";
require('dotenv').config();

const prisma = new PrismaClient({ errorFormat: "pretty"})

export const getAllMenus = async (request: Request, response: Response) => {
    try {
        const { search } = request.query
        const allMenus = await prisma.menu.findMany({
            where: { name: { contains: search?.toString() || ""}}
        })
        return response.json({
            status: true,
            data: allMenus,
            message: "Menus has retrived"
        }).status(200)
    }catch (error) {
        return response
        .json({
            status: false,
            message: `There is an error. $(error)`
        })
        .status(400)
    }
}

export const createMenu = async (request: Request, response: Response) => {
    try {
        const { name, price, category, description } = request.body
        const uuid = uuidv4()

        const newMenu = await prisma.menu.create({
            data: { uuid, name, price: Number(price), category, description }
        })

        return response.json({
            status: true,
            data: newMenu,
            message: "Menu berhasil ditambahkan"
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

export const updateMenu = async (request: Request, response: Response) => {
    try {
        const { idMenu } = request.params
        const { name, price, category, description } = request.body

        const findMenu = await prisma.menu.findFirst({ where: { id: Number(idMenu) }})
        if (!findMenu) return response
        .status(200)
        .json({ status: false, message: `Menu is not found`})

        const updateMenu = await prisma.menu.update({
            data: {
                name: name || findMenu.name,
                price: price ? Number(price) : findMenu.price,
                category: category || findMenu.category,
                description: description || findMenu.description
            },
            where: { id: Number(idMenu)}
        })

        return response.json({
            status: true,
            data: updateMenu,
            message: `Menu has Updated`
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
    const { idMenu } = request.params

    const findMenu = await prisma.menu.findFirst({ where: { id: Number(idMenu) } })
    if (!findMenu) return response
    .status(200)
    .json({ status: false, message: `Menu is not found`})

    let filename = findMenu.picture
    if (request.file) {
        filename = request.file.filename
        let path = `${BASE_URL}/../public/menu_picture/${findMenu.picture}`
        let exists = fs.existsSync(path)
        if(exists && findMenu.picture !== ``) fs.unlinkSync(path)
    }

    const updatePicture = await prisma.menu.update({
        data: { picture: filename },
        where: { id: Number(idMenu) }
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

export const deleteMenu = async (request: Request, response: Response) => {
    try {
        const { idMenu } = request.params

        const findMenu = await prisma.menu.findFirst({ where: { id: Number(idMenu) } })
        if (!findMenu) return response
        .status(200)
        .json({ status: false, message: `Egg is not found` })

        let path = `${BASE_URL}/../public/menu_picture/${findMenu.picture}`
        let exists = fs.existsSync(path)
        if(exists && findMenu.picture !== ``) fs.unlinkSync(path)

        const deleteMenu = await prisma.menu.delete({
            where: { id: Number(idMenu) }
        })
        return response.json({
            status: true,
            data: deleteMenu,
            message: `Menu has delete`
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