import { Request, Response, Router } from "express"
import User from "../entities/User"
import { validate, isEmpty } from 'class-validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'
import user from "../middleware/user"
import auth from "../middleware/auth"

const mapErrors = (errors: Object[]) => {
    //Returns
    return errors.reduce((prev: any, err: any) => {
        prev[err.property] = Object.entries(err.constraints)[0][1]
        return prev
    }, {})
}


const register = async (req: Request, res: Response) => {
    const { email, username, password, 
        name, 
        // phoneNumber, 
        age } = req.body
    let errors: any = {}
    try {
        //Validate
        const emailExists = await User.findOne({ email })
        const usernameExists = await User.findOne({ username })
        // const phoneNumberExists = await User.findOne({ phoneNumber })

        if (emailExists) errors.email = 'Email is already taken'
        if (usernameExists) errors.username = 'Username is already taken'
        // if (phoneNumberExists) errors.phoneNumber = 'Phone number is already taken'
        if (Object.keys(errors).length > 0) {
            return res.status(400).json(errors);
        }
        //Check data base for email and phone number and username
        const user = await new User({ username, email, 
            name, 
            // phoneNumber, 
            password, age })
        errors = await validate(user)
        if (errors.length > 0) {
            return res.status(400).json(mapErrors(errors))
        }
        //Create entry 
        await user.save()

        return res.json(user)
    } catch (err) {
        return res.status(500).json(err)
    }

}
const login = async (req: Request, res: Response) => {
    const { username, password } = req.body
    let errors: any = {}
    try {
        //Validate data
    console.log(isEmpty(username))
        //Check if it's empty
        if (isEmpty(username)) errors.username = 'Username must not be empty'
        if (isEmpty(password)) errors.password = 'Password must not be empty'
        if (Object.keys(errors).length > 0) return res.status(400).json(errors)

        //Checks if username exists
        const user = await User.findOne({ username })
        if (!user) return res.status(404).json({ username: 'User not found' })

        //Check using bcrypt for passowrd 
        const checkPasswordMatches = await bcrypt.compare(password, user.password)
        console.log(checkPasswordMatches)
        if (!checkPasswordMatches) return res.status(401).json({ password: 'Incorrect credentials' })
        const token = jwt.sign({ username }, process.env.JWT_SECRET!)

        //res.set sets the header. Http only sets it so it can't be accessed by javascript
        //means it should only pass through https is true, the path says online 
        res.set('Set-Cookie', cookie.serialize('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600,
            path: '/'
        }))
        return res.json(user)

    } catch (err) {
        return res.json({ error: "Something went wrong" })
    }

}


const me = (_: Request, res: Response) => {
    return res.json(res.locals.user)
}
const logout = (_: Request, res: Response) => {

    res.set('Set-Cookie', cookie.serialize('token', '',
        {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(0),
            path: '/'
        }))

    return res.status(200).json({ success: true })

}



const router = Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', user, auth, me)
router.get('/logout', user, auth, logout)


export default router