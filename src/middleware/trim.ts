import { NextFunction, Request, Response } from "express";

//Whitespace Check/Trim
export default (req: Request, _: Response, next: NextFunction) => {
    const exceptions = ['password']
    Object.keys(req.body).forEach(key => {
        if (!exceptions.includes(key) && typeof req.body[key] === 'string') {
            req.body[key] = req.body[key].trim()
        }
    })
    //to the next function
    next()


}