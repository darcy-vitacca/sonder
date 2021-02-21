import 'reflect-metadata';
import { createConnection } from 'typeorm';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import dotenv from 'dotenv';
dotenv.config()

import authRoutes from './routes/auth'

import express from "express";
import morgan from "morgan"
import trim from './middleware/trim'


const app = express();
const PORT = process.env.PORT
// const server = require('http').Server(app)
// const io = require('socket.io')(server)


app.use(express.json())
app.use(morgan('dev'))
app.use(trim)
app.use(cookieParser())
//this allows us to write cookies , 
//origin is where cookies can be written
//options allows to send a request before
// a request
app.use(cors({
    credentials: true,
    origin: process.env.ORIGIN,
    optionsSuccessStatus: 200
}))


//Routes
app.use('/api/auth', authRoutes)





app.listen(PORT, async () => {
    console.log('Server running at http://localhost:5000');
    try {
        await createConnection();
        console.log('Database')
    } catch (err) {
        console.log(err)
    }
})


