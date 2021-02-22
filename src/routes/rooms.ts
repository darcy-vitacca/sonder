import { Request, Response, Router } from "express"
import User from "../entities/User"
import { validate, isEmpty } from 'class-validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'
import user from "../middleware/user"
import auth from "../middleware/auth"


const router = Router()

// router.post('/register', register)
// router.post('/login', login)
// router.get('/me', user, auth, me)
// router.get('/logout', user, auth, logout)


export default router