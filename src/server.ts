import "reflect-metadata";
import {createConnection} from "typeorm";
import {User} from "./entities/User";
import express from "express";
import morgan from "morgan"

import authRoutes from './routes/auth'

const app = express();
// const server = require('http').Server(app)
// const io = require('socket.io')(server)



app.use(express.json())
app.use(morgan('dev'))

//Routes
app.use('/api/auth', authRoutes)





app.listen(5000, async () =>{
    console.log('Server running at http://localhost:5000');
    try {
        await createConnection();
        console.log('Database')
    } catch (err) {
        console.log(err)
    }
})


