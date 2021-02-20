import { Request, Response, Router } from "express"
import { User } from "../entities/User"

const register = async (req: Request, res: Response) =>{
    const { email, username, password , name, phoneNumber} = req.body
    try {
        //Validate
        //Check data base for email and phone number and username
        const user  = await new User({ username, email, name, phoneNumber, password})
        await user.save()
        //Create entry 
        return res.json(user)
    } catch (err) {
        return res.status(500).json(err)
    }

}
// const login = async  (req: Request, res: Response) =>{
//     const {username , password} = req.body
//     try {
//         //Validate data
//         //Check using bcrypt for passowrd 
        
//     } catch (err) {
        
//     }

// }

const router = Router()

// router.get('/login', login)
router.post('/register', register)

export default router