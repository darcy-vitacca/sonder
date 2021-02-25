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

//
const app = express();
const PORT = process.env.PORT
//this takes our express app and attaches it to our socket.io instance
const http = require("http").Server(app);
// set up socket.io and bind it to our
// http server.
const io = require("socket.io")(http, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});


app.set("port", PORT || 3000);
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


//TODO: change back to const 
let rooms = {};
//TODO: when you send the otherUser id its actually the user id
//socket io server
//When someone connects to our socket.io server this connection even fires
//socket io then generates a socket for an individual person
io.on("connection", socket => {
    //THIS IS ALL JOIN ROOM LOGIN
    //and this is an event listener that gets attached and then the join room 
    // event gets fired from the client side. When it is fired off we pull the roomId
    //out of the url and sends it down to the the server
    socket.on("join room", roomID => {
        console.log(rooms)
        //Here we pul the room id from the url then we check if there is already a
        //room under that id and we add our socket id to an array of id's in the room
        if (rooms[roomID]) {
            rooms[roomID].push(socket.id);
            //Or else we create a new room id and add an array with our id
        } else {
            rooms[roomID] = [socket.id];
        }
        //Here we check for another user in the room so we go to the rooms with the room id 
        // and look if there are any ids that are not our own
        const otherUser = rooms[roomID].find(id => id !== socket.id);
        //If there are ids that are not our own 
        if (otherUser) {
            //this tells us another user is here and this is their id
            socket.emit("other user", otherUser);
            //this tell the other user that I have joined and this is my socket id
            socket.to(otherUser).emit("user joined", socket.id);
        }
    });
    //THIS IS ALL HANDSHAKE LOGIC
    //When the offer gets fired, it accepts payload as an arg
    socket.on("offer", payload => {
        //This sends an invite TO the target payload target is the socket.id
        //The payload includes who am I as the caller and the offer to send the 
        //other user which webrtc needs
        io.to(payload.target).emit("offer", payload);
    });


    //This is fired when user a is calling user b and user b answers and sends back
    //to user A you are recieving an answer. Let user A know b has answered
    socket.on("answer", payload => {
        io.to(payload.target).emit("answer", payload);
    });
    socket.on("user-leaving-room", userDetails => {
        console.log(rooms)
        socket.roomname = userDetails.roomname
        const userIdLeaving = socket.id
        const otherUser = userDetails?.otherUser

        if (otherUser) {
            socket.broadcast.to(otherUser).emit('peer-left', socket.id);
        }
    })
    socket.on("reset-rooms", payload => {
        console.log(rooms)
        rooms= {}
        console.log(rooms)

    })
    socket.on("timer-up", payload => {
        console.log(payload)
        console.log(socket.id)
        // socket.emit("disconnect", payload)
        socket.emit("user-leaving-room", payload)

    })
    socket.on("disconnect", payload => {
        console.log(rooms)
        const roomname = rooms[socket.roomname]
        const disconnectingUserId = socket.id
        //  console.log(rooms)
        //find and delete id from room, then check if there are any,if there aren't delete room
        //TODO: need to cut video on the the other end
        //TODO: video is only being cut when leaving page
        //TODO: creating duplicates of rooms
        if (roomname) {
            const filteredRoomIdArray = roomname.filter(id => {
                return id !== disconnectingUserId

            })
            rooms[socket.roomname] = filteredRoomIdArray
        }
        // console.log(rooms)
    });

    //This is when the two pairs have tried to connect. An ice candiate is when each peer 
    //has come to a mutual agreement about which candiate makes sense for them. Then the 
    //connections is made
    socket.on("ice-candidate", incoming => {
        io.to(incoming.target).emit("ice-candidate", incoming.candidate);
    });
});





http.listen(PORT, async () => {
    console.log('Server running at http://localhost:5000');
    try {
        await createConnection();
        console.log('Database')
    } catch (err) {
        console.log(err)
    }
})



// app.listen(PORT, async () => {
//     console.log('Server running at http://localhost:5000');
//     try {
//         await createConnection();
//         console.log('Database')
//     } catch (err) {
//         console.log(err)
//     }
// })


