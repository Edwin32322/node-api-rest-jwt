import { Request, Response } from "express"
import prisma from "../models/user"
import { comparePasswords, hashPassword } from "../services/passwordService"
import { generateToken } from "../services/authService"
import { error } from "console"
export const register = async(req : Request, res: Response): Promise<void> =>{
    const { email, password } = req.body
    try {

        if(!email){
            res.status(400).json({message: "El email es obligatorio"})
            return
        }

        if(!password){
            res.status(400).json({message: "La contraseña es obligatorio"})
            return
        }

        const hashedPassword = await hashPassword(password)
        console.log(hashedPassword)

        const user = await prisma.create({
            data:{
                email,
                password : hashedPassword
            }
        })
        const token = generateToken(user)
        res.status(201).json({token})
    } catch (err: any) {
        if(err?.code === 'P2002' && err?.meta?.target?.includes('email')){
            res.status(400).json({message: "El email ingresado ya existe"})
        }
        console.log(error)
    }
}

export const login = async(req: Request, res: Response): Promise<void> =>{
    const { email, password} = req.body
    try {

        if(!email){
            res.status(400).json({message: "El email es obligatorio"})
            return
        }

        if(!password){
            res.status(400).json({message: "La contraseña es obligatorio"})
            return
        }

        const user = await prisma.findUnique({
            where:{ email: email }
        })
        if(!user){
            res.status(404).json({error : "Usuario no encontrado"})
            return
        }
        const passwordMatch = await comparePasswords(password, user.password)
        if (!passwordMatch) {
            res.status(401).json({message: "Usuario y contraseñas no coinciden"})
        }
        const token = generateToken(user)
        res.status(200).json({token})

    } catch (error) {
        console.log(error)
    }
}