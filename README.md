# Collaborative Canvas

## Project Overview
A **real-time collaborative drawing application** that allows multiple users to draw on the same canvas simultaneously. The project supports brush and eraser tools, dynamic colors and sizes, undo/redo functionality, and displays connected users with live cursor positions.


---

## Features

### Frontend
- Brush and Eraser tools
- Dynamic color selection
- Adjustable stroke size
- Undo / Redo for all users
- Clear canvas
- Real-time user cursors and online user list
- Light theme

### Backend
- Node.js server with **Socket.io** for real-time communication
- Broadcast strokes to all connected clients
- Maintain global drawing history and undo/redo stack
- User management with color assignment

---

## Technical Stack

- **Frontend:** HTML5 Canvas, Vanilla JavaScript, CSS  
- **Backend:** Node.js, Express, Socket.io  
- **No external canvas libraries** — all drawing handled via native Canvas API

---

## Installation & Setup

1. **Clone the repository**
git clone https://github.com/Akshay413910/collaborative-canvas.git
cd collaborative-canvas
2. **Install dependencies**
npm install
3. **Run the server**
cd server
node server.js
4. **Open the app**
Visit http://localhost:3000 in your browser

**How to Test Multi-User Functionality**

Open multiple browser tabs or different devices on the same network.

Each user will have a unique color and username.

Drawing actions, cursors, undo/redo, and clear canvas are synchronized in real time.

**Undo/Redo**

Global history is maintained across all users.

Undo removes the last stroke made by any user.

Redo restores the most recently undone stroke.

**Known Limitations**

No authentication — all users are anonymous.

Undo is global, so it affects strokes by all users.

Large canvases may have slight performance issues on very low-end devices.

No persistence — canvas state is lost on server restart.
