import { request, Request, response, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { idText } from "typescript";

const prisma = new PrismaClient({errorFormat: "minimal"});

const addAdmin = async (req: Request, res: Response) => {
    try {
        const { admin_name, email, password } = req.body
        const findEmail = await prisma.admin
            .findFirst({ where: { email } })
        if (findEmail) {
            return res.status(400)
                .json({
                    message: "Email already exists"
                })
        }

        const hashPassword = await bcrypt.hash(password, 12)
        const newAdmin = await prisma.admin.create({
            data: {
                email,
                admin_name,
                password: hashPassword
            }
        })
        return res.status(200).json({
            message: `New admin has been created`,
            data: newAdmin
        })
    } catch (error) {
        return res.status(500).json(error)
    }
}

const readAdmin = async(req: Request, res: Response) => {
    try {
        const allAdmin = await prisma.admin.findMany()
        return res.status(200).json({
            message: "All admins",
            data: allAdmin
        })
    } catch (error) {
        return res.status(500).json(error)
    }
}

const findAdmin = async(req: Request, res: Response) =>{
    try {
        const search = req.query.search
        const admin = await prisma.admin.findMany({ where: {
            OR: [{
                admin_name : { contains: search?.toString()  ||  " " }
                }]
            } 
        })
        res.status(200).json({
            message: "admin has been retrived",
            data: admin
        })
    } catch (error) {
        return res.status(500).json(error)
    }
}

const updateAdmin = async(req: Request, res: Response) => {
    try {
        const id = req.params.id

        const findAdmin = await prisma.admin.findFirst({where: {id: Number(id)}})

        if(!findAdmin) {
            return res.status(404).json({
                message: "Admin not found"
            })
        }

        const {admin_name, email, password} = req.body

        const updatedAdmin = await prisma.admin.update({
            where: { id: Number(id) },
            data: {
                admin_name: admin_name ? admin_name: findAdmin.admin_name,
                email: email? email: findAdmin.email,
                password: password ?
                await bcrypt.hash(password, 12)
                : findAdmin.password,
            },
        })
        if(!updatedAdmin) {
            return res.status(404).json({
                message: "Admin not found"
            })
        }
        return res.status(200).json({
            message: "Admin updated",
            data: updatedAdmin
        })
    } catch (error) {
        return res.status(500).json(error)
    }
}

const deleteAdmin = async(req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)
        const admin = await prisma.admin.findUnique({where: {id}})
        if(!admin) {
            return res.status(404).json({
                message: "Admin not found"
            })
        }
        await prisma.admin.delete({where: {id}})
        return res.status(200).json({
            message: "Admin deleted"
        })
        
    } catch (error) {
        return res.status(500).json(error)
    }
}

/** function for login (authentication) */
const authentication = async (
    req: Request,
    res: Response
) => {
    try {
        const { email, password } = req.body
        
        /**check existing email */
        const findAdmin = await prisma
            .admin.findUnique({
            where: {email}
            })
        if (!findAdmin) {
            return res.status(200)
                .json({
                message: `Email is mnot registered`
            })
        }
        const isMatchPassword = await bcrypt
            .compare(password, findAdmin.password)
        if (!isMatchPassword) {
            return res.status(200).json({
                message: `Invalid Password`
            })
        }

        /**prepare to generate token
         * using JWT
         */
        const payload = {
            name: findAdmin.admin_name,
            email: findAdmin.email
        }
        const signature = process.env.SECRET || ``

        const token = jwt.sign(payload, signature)

        return res.status(200)
            .json({
                logged: true,
                token,
                id: findAdmin.id,
                name: findAdmin.admin_name,
                email: findAdmin.email
        })

    } catch (error) {
        return res.status(500)
        .json(error)
    }
}

export {addAdmin, findAdmin, readAdmin, deleteAdmin, updateAdmin, authentication}