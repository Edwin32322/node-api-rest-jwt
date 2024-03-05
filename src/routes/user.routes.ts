import express, { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { createUser, deleteUser, getAllUsers, getUserById, updateUser } from "../controllers/users.controller"
const router  = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret'
const authenticatedToken = (req: Request, res: Response, next: NextFunction)=>{
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if(!token){
        return res.status(401).json({error : "No autorizado"})
    }
    jwt.verify(token,JWT_SECRET, (err, decoded)=>{
        if(err){
            console.error("Error en la autenticación", err)
            return res.status(403).json({error : "No tienes acceso a este recurso"})
        }
        next()
    })
}
router.get("/", authenticatedToken, getAllUsers)
router.get("/:id", authenticatedToken, getUserById)
router.post("/", authenticatedToken, createUser)
router.put("/:id", authenticatedToken, updateUser)
router.delete("/:id", authenticatedToken, deleteUser)
export default router