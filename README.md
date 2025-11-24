# 📹 You-Me Chat — WebRTC Video Chat App
A simple peer-to-peer video call application built using WebRTC, Socket.io, React, and Node.js.
Two users can join the same room ID and instantly start a real-time audio/video call.
This document covers three repositories you mentioned:

you-me-chat-frontend — React (frontend) deployed on Vercel

you-me-chat-backend — Node + Socket.IO signaling server deployed on Render

YouMeChat — fullstack repo (local development copy that contains frontend + backend folders)

## 🚀 Features
Peer-to-peer video calling (WebRTC)

Create & join rooms

Mute/unmute microphone

Turn camera on/off

Works across devices (mobile/laptop)

Socket.io for signaling

Hosted frontend on Vercel

Hosted backend on Render

## 🧰 Tech Stack
### Frontend

React (TypeScript)

WebRTC APIs

Socket.io-client

Tailwind (optional)

### Backend

Node.js

Express

Socket.io server

## 📁 Project Structure

/frontend

  |— src/
  
  |— public/
  
  |— package.json

/backend

  |— server.js
  
  |— package.json

#### 🛠️ Running the Application Locally
1. Clone repos
   
   git clone https://github.com/custard-apple/you-me-chat-frontend.git
   
   git clone https://github.com/custard-apple/you-me-chat-backend.git
   
   git clone https://github.com/custard-apple/YouMeChat.git

### 1) Repo: you-me-chat-frontend (React)
Purpose

Frontend single-page app — UI for creating/joining rooms, showing local & remote video, media controls, copy room id, connection status.

#### Key files

src/index.jsx / src/App.jsx

src/pages/Home.jsx (create/join room)

src/pages/Call.jsx (video call UI)

src/hooks/useWebRTC.js (WebRTC + Socket.IO logic)

public/index.html (favicon/meta)

#### 🌱 Environment variables

SIGNALING_SERVER_URL — public URL of your signaling server, e.g. https://you-me-chat-backend.onrender.com

Note - Havent created environment variable yet but will update soon

Install & run locally

#### in client/ (you-me-chat-frontend)
npm install

export REACT_APP_SIGNALING_URL=http://localhost:5000   # dev backend URL

npm start

app will run at http://localhost:3000

(Port can be different accourding to your configuration)

Notes before first run

Ensure the backend is running at the URL used in REACT_APP_SIGNALING_URL.

If using Vercel deployed frontend, set the env var in Vercel to the deployed backend URL.

### 2) Repo: you-me-chat-backend (Node + Socket.IO)
Purpose

Signaling server that handles rooms, forwards SDP offers/answers, ICE candidates, and peer join/leave events.

#### Key files

server.js (the main server file)

package.json

Required Node version

Node.js 16+ recommended.

#### Important code notes

Socket.IO needs explicit CORS origin for your frontend domain.

Use io.to(roomId).emit(...) or socket.to(roomId).emit(...) correctly — do not call socket.io(roomId).

Example Socket.IO initialization (production-ready):


  const io = new Server(server, {
  
    cors: {
      origin: 'https://you-me-chat-eight.vercel.app', // replace with your frontend URL
      methods: ['GET','POST'], 
      credentials: true
    }
  }
  );

Install & run locally

#### in server/ (you-me-chat-backend)

npm install

#### start server

node server.js

#### or use nodemon for dev

npx nodemon server.js

#### default port: 5000 -> http://localhost:5000

Typical server.js endpoints & socket events

create-room (roomId, cb)

join-room (roomId, cb)

offer ({roomId, sdp})

answer ({roomId, sdp})

ice-candidate ({roomId, candidate})

leave-room (roomId)

socket disconnect

Deploy notes (Render / Railway)

Ensure package.json has a start script: node server.js.

Add CORS origin exactly matching your frontend Vercel domain (including protocol https://).

### 3) Repo: YouMeChat (Fullstack local copy)

This repo typically contains two folders client/ and server/ for your local development convenience. When deploying, split to two GitHub repos as you already did.

Run locally (both together)

From the project root where both client/ and server/ folders exist:

#### start backend
cd server
npm install
node server.js &


#### start frontend
cd ../client

npm install

export SIGNALING_SERVER_URL=http://localhost:5000

npm start

Note - Havent created environment variable SIGNALING_SERVER_URL yet but will update soon

Now open http://localhost:3000 and test creating/joining rooms.

## 🛠️ Troubleshooting & Common Issues
1) Room does not exist

Ensure the create-room event succeeded (check backend logs for room creation). The backend stores rooms in memory and resets on restart.

Do not generate a new UUID when joining — share the exact room ID shown by creator.

Trim the room ID before emitting join-room.

2) CORS errors (e.g., Access-Control-Allow-Origin missing)

Add Express + Socket.IO CORS with your exact frontend origin (no * in production).

Example:

app.use(cors({ origin: 'https://your-frontend.vercel.app', credentials: true }));

const io = new Server(server, { cors: { origin: 'https://your-frontend.vercel.app', methods: ['GET','POST'], credentials: true } });

3) TypeError: socket.io is not a function or signaling not forwarding

Use correct API: io.to(roomId).emit(...) or socket.to(roomId).emit(...) (not socket.io(...)).

4) Black remote screen (no remote video)

Ensure pc.ontrack sets remoteVideo.srcObject = event.streams[0].

Confirm both peers add tracks with pc.addTrack(...).

5) ICE / STUN / TURN

For initial testing use public STUN: stun:stun.l.google.com:19302.

Production needs TURN server for users behind symmetric NATs/firewalls. Add TURN credentials to iceServers.


## 🚀Deployment checklist (final)

Ensure backend start script exists and server.js is correct.

Push backend to you-me-chat-backend GitHub repo.

Connect that repo to Render (or Railway) — set region to Singapore for better latency in India.

Ensure Render deploy settings use npm install and npm start.

After deploy, copy backend URL and set it as SIGNALING_SERVER_URL in Vercel environment for you-me-chat-frontend and re-deploy frontend.

Test from two separate devices using the deployed frontend URL.

Useful commands summary
