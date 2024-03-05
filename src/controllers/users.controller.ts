import { Request, Response } from "express";
import { hashPassword } from "../services/passwordService";
import prisma from "../models/user"
export const createUser = async(req:Request, res:Response) =>{
    try {
        const { email, password } = req.body

        if(!email){
            res.status(400).json({message: "El email es obligatorio"})
            return
        }

        if(!password){
            res.status(400).json({message: "La contraseña es obligatorio"})
            return
        }
        const hashedPassword = await hashPassword(password)
        const user = await prisma.create({
            data:{
                email,
                password: hashedPassword
            }
        })
        res.status(201).json(user)
    } catch (err: any) {
        if(err?.code === 'P2002' && err?.meta?.target?.includes('email')){
            res.status(400).json({message: "El email ingresado ya existe"})
        }
    }
}

export const getAllUsers = async(req:Request, res:Response) =>{
    try {
        const users = await prisma.findMany()
        res.status(200).json(users)
    } catch (err: any) {
        console.log(err)
        res.status(500).json({error: "Hubo un error, prueba más tarde"})
    }
}
export const getUserById = async(req:Request, res:Response) =>{
    const  userId  = parseInt(req.params.id)
    try {
        const user = await prisma.findUnique({
            where: {
                id: userId
            }
        })
        if(!user){
            res.status(404).json({error: "El usuario no fue encontrado"})
            return
        }
        res.status(200).json(user)
    } catch (err: any) {
        console.log(err)
        res.status(500).json({error: "Hubo un error, prueba más tarde"})
    }
}

export const updateUser = async(req:Request, res:Response) =>{
    const  userId  = parseInt(req.params.id)
    const { email, password } = req.body
    try {
        let dataToUpdate: any = {
            email,
            password
        }
        if (password) {
            const hashedPassword = await hashPassword(password)
            dataToUpdate.password = hashedPassword
        }
        if (email) {
            dataToUpdate.email = email
        }
        const user = await prisma.update({
            where: {
                id : userId
            },
            data : dataToUpdate
        })
        res.status(200).json(user)
    } catch (err: any) {
        if(err?.code === 'P2002' && err?.meta?.target?.includes('email')){
            res.status(400).json({message: "El email ingresado ya existe"})
        }else if(err?.code === "P2025"){
            res.status(404).json({message : "Usuario no encontrado"})
        }
        console.log(err)
    }
}
export const deleteUser = async(req: Request, res: Response):Promise<void> =>{
    const userId = parseInt(req.params.id)
    try {
        await prisma.delete({
            where: {
                id: userId
            }
        })
        res.status(200).json({
            message: `El usuario ${userId} ha sido eliminado`
        }).end()
    } catch (err: any) {
        if(err?.code === 'P2002' && err?.meta?.target?.includes('email')){
            res.status(400).json({message: "El email ingresado ya existe"})
        }else{
            console.log(err)
            res.status(500).json({message : "Hubo un error, pruebe más tarde"})
        }
        console.log(err)
    }
}