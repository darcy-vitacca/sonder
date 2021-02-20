import { NextFunction, Request, Response } from 'express'

import User from '../entities/User'
//This returns a user if they exist and if they don't will throw an unauthenticated
export default async (_: Request, res: Response, next: NextFunction) => {
  try {
    const user: User | undefined = res.locals.user

    if (!user) throw new Error('Unauthenticated')

    return next()
  } catch (err) {
    console.log(err)
    return res.status(401).json({ error: 'Unauthenticated' })
  }
}