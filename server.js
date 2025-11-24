const { Socket } = require('dgram');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {origin: '*',
        methods: ['GET', 'POST']
    },
});

const PORT = process.env.PORT || 5000;
const rooms = {};

io.on('connection', (socket) => {
    console.log('Socket connected: ', socket.id);
    socket.on('create-room', (roomId, cb) => {
        if(rooms[roomId]) {
            return cb?.({success: false, error: "Room already exists"});
        }

        rooms[roomId] = {creator: socket.id, participants: [socket.id]};
        socket.join(roomId);
        console.log(`Room created: ${roomId} by ${socket.id}`);
        cb?.({success: true});
    });

    socket.on('join-room', (roomId, cb) => {
        const room = rooms[roomId];
        if(!room) {
            return cb?.({success: false, error: 'Room does not exist'});
        }
        if(room.participants.length >= 2) {
            return cb?.({success: false, error: 'Room full' });
        }
        room.participants.push(socket.id);
        socket.join(roomId);
        const createSocket = room.creator;
        io.to(createSocket).emit('peer-joined', {from: socket.id});
        console.log(`${socket.id} joined room ${roomId}`);
        cb?.({success: true});
    });

    socket.on('offer', ({roomId, sdp}) => {
        socket.io(roomId).emit('offer', {sdp, from: socket.id});
    });

    socket.on('answer', ({roomId, sdp}) => {
        socket.io(roomId).emit('answer', {sdp, from:socket.id});
    });

    socket.on('ice-candidate', ({roomId, candidate}) => {
        socket.to(roomId).emit('ice-candidate', {candidate, from: socket.id});
    });

    socket.on('leave-room', (roomId) => {
        const room = rooms[roomId];
        if(!room) return;
        room.participants = room.participants.filter((id)=> id !== socket.id);
        socket.leave(roomId);
        socket.to(roomId).emit('peer-left', {from: socket.id});

        if(room.participants.length === 0) {
            delete rooms[roomId];
            console.log(`Room ${roomId} deleted (empty)`);
        } else {
            if(room.creator === socket.id) {
                room.creator = room.participants[0];
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected', socket.id);
        for( const roomId of Object.keys(rooms)) {
            const room = rooms[roomId];
            if(room.participants.includes(socket.id)) {
                room.participants = room.participants.filter((id) => id !== socket.id);
                socket.to(roomId).emit('peer-left', {from: socket.id});
                if(room.participants.length === 0) {
                    delete rooms[roomId];
                    console.log(`Room ${roomId} deleted (empty)`);
                } else {
                    if(room.creator === socket.id) {
                        room.creator = room.participants[0];
                    }
                }
            }
        }
    })
})

server.listen(PORT, ()=> {
    console.log(`Signaling Server is running on port ${PORT}`);
})