const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const STATIC = path.join(__dirname, '..', 'client');
app.use(express.static(STATIC));

app.get('/', (req, res) => {
  res.sendFile(path.join(STATIC, 'index.html'));
});

// ===== History & Users =====
let users = {};
let drawingHistory = [];
let undoStack = [];

io.on('connection', socket => {
  console.log('connected', socket.id);
  users[socket.id] = { id: socket.id, color: randomColor(), name: `User-${socket.id.slice(0,4)}` };

  socket.emit('init', { users, history: drawingHistory, you: users[socket.id] });
  io.emit('users-update', users);

  socket.on('start-stroke', meta => {
    const item = { type:'meta', meta:{ ...meta, userId: socket.id, ts: Date.now() }};
    drawingHistory.push(item);
    undoStack = [];
    socket.broadcast.emit('start-stroke', item);
  });

  socket.on('draw-point', pt => {
    const item = { type:'point', ...pt, userId: socket.id, ts: Date.now() };
    drawingHistory.push(item);
    socket.broadcast.emit('draw-point', item);
  });

  socket.on('undo', () => {
    for(let i=drawingHistory.length-1;i>=0;i--){
      const it=drawingHistory[i];
      if(it.type==='meta'){
        const strokeId=it.meta.strokeId;
        const removed=[];
        drawingHistory=drawingHistory.filter(it2=>{
          const keep=!((it2.type==='meta' && it2.meta.strokeId===strokeId) || (it2.type==='point' && it2.strokeId===strokeId));
          if(!keep) removed.push(it2);
          return keep;
        });
        undoStack.push(removed);
        io.emit('history', drawingHistory);
        break;
      }
    }
  });

  socket.on('redo', ()=>{
    if(undoStack.length===0) return;
    const stroke=undoStack.pop();
    stroke.forEach(it=>drawingHistory.push(it));
    io.emit('history', drawingHistory);
  });

  socket.on('clear-canvas', ()=>{
    if(drawingHistory.length>0){
      undoStack.push(drawingHistory.splice(0,drawingHistory.length));
    }
    io.emit('clear-canvas');
  });

  socket.on('cursor', c=>{
    socket.broadcast.emit('cursor', { userId: socket.id, x:c.x, y:c.y, color: users[socket.id].color });
  });

  socket.on('disconnect', ()=>{
    delete users[socket.id];
    io.emit('users-update', users);
    console.log('disconnect', socket.id);
  });
});

function randomColor(){
  return '#'+Math.floor(Math.random()*16777215).toString(16).padStart(6,'0');
}

const PORT = process.env.PORT||3000;
server.listen(PORT, ()=> console.log(`Server running at http://localhost:${PORT}`));
