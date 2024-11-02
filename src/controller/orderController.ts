import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const {v4: uuidv4} = require("uuid");

const prisma = new PrismaClient({ errorFormat: "pretty" });
export const getAllOrders = async (request: Request, response: Response) => {
    try {
        const { search, status, start_date, end_date } = request.query;

        const filterConditions: any = {
            OR: [
                { customer: { contains: search?.toString() || "" } },
                { table_number: { contains: search?.toString() || "" } }
            ]
        };

        if (status) {
            filterConditions.status = status.toString();
        }

        if (start_date && end_date) {
            filterConditions.createdAt = {
                gte: new Date(start_date.toString()),
                lte: new Date(end_date.toString())
            };
        }

        const allOrders = await prisma.order.findMany({
            where: filterConditions,
            orderBy: { createdAt: "desc" },
            include: { OrderList: true }
        });

        return response.json({
            status: true,
            data: allOrders,
            message: `Order list has been retrieved`
        }).status(200);
    } catch (error) {
        return response
            .json({
                status: false,
                message: `There is an error. ${error}`
            })
            .status(400);
    }
};


export const createOrder = async (request: Request, response: Response) => {
    try {
        const { customer, table_number, payment_method, status, OrderList } = request.body;
        const user = request.body.user;

        // Cek apakah OrderList ada dan merupakan array dengan elemen
        if (!Array.isArray(OrderList) || OrderList.length === 0) {
            return response.status(400).json({
                status: false,
                message: 'OrderList tidak disediakan atau kosong'
            });
        }

        const uuid = uuidv4();
        let total_price = 0;

        // Perulangan untuk menghitung total harga dan validasi data
        for (let index = 0; index < OrderList.length; index++) {
            const { menuId, quantity } = OrderList[index];

            // Validasi apakah menuId dan quantity valid
            if (!menuId || !quantity || quantity <= 0) {
                return response.status(400).json({
                    status: false,
                    message: `menuId atau quantity tidak valid pada indeks ${index}`
                });
            }

            const detailMenu = await prisma.menu.findFirst({
                where: {
                    id: menuId
                }
            });

            if (!detailMenu) {
                return response.status(404).json({
                    status: false,
                    message: `Menu dengan id ${menuId} tidak ditemukan`
                });
            }

            total_price += (detailMenu.price * quantity);
        }

        // Buat order baru di database
        const newOrder = await prisma.order.create({
            data: {
                uuid,
                customer,
                table_number,
                total_price,
                payment_method,
                status,
                idUser: user.id
            }
        });

        // Perulangan untuk membuat daftar item order
        for (let index = 0; index < OrderList.length; index++) {
            const orderItemUuid = uuidv4();
            const { menuId, quantity, note } = OrderList[index];

            await prisma.orderList.create({
                data: {
                    uuid: orderItemUuid,
                    orderId: newOrder.id,
                    menuId: Number(menuId),
                    quantity: Number(quantity),
                    note: note || '' // Default ke string kosong jika note tidak disediakan
                }
            });
        }

        // Respon sukses
        return response.status(200).json({
            status: true,
            data: newOrder,
            message: 'Order baru berhasil dibuat'
        });
    } catch (error) {
        console.error('Error saat membuat order:', error);
        return response.status(500).json({
            status: false,
            message: `Terjadi kesalahan. ${error instanceof Error ? error.message : String(error)}`
        });
    }
};


export const updateStatusOrder = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { status } = req.body

        const findOrder = await prisma.order.findFirst({ where: { id: Number(id) } })
        if (!findOrder) return res
            .status(200)
            .json({
                status: false,
                message: "order tidak ada"
            })

        const editedUser = await prisma.order.update({
            data: {
                status: status || findOrder.status
            },
            where: { id: Number(id) }
        })

        return res.json({
            status: 'alhamdulillah ga error',
            user: editedUser,
            message: 'user telah diupdate'
        }).status(200)
    } catch (error) {
        return res
            .json({
                status: 'yek error',
                message: `error lee ${error}`
            })
            .status(400)
    }
}

export const deleteOrder = async (request: Request, response: Response) => {
    try {
        const { id } = request.params

        const findOrder = await prisma.order.findFirst({ where: { id: Number(id) } })
        if (!findOrder) return response
            .status(200)
            .json({ status: false, message: `Order is not found` })

        let deleteOrderList = await prisma.orderList.deleteMany({ where: { orderId: Number(id) } })
        let deleteOrder = await prisma.order.delete({ where: { id: Number(id) } })


        return response.json({
            status: true,
            data: deleteOrder,
            message: `Order has deleted`
        }).status(200)
    } catch (error) {
        return response
            .json({
                status: false,
                message: `There is an error. ${error}`
            })
            .status(400)
    }
}