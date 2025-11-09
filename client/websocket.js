// websocket.js
const socket = io();
window.socket=socket;

socket.on('init', payload=>{
  window.app && window.app.onInit && window.app.onInit(payload);
});
socket.on('users-update', users=>{
  window.app && window.app.onUsersUpdate && window.app.onUsersUpdate(users);
});
socket.on('start-stroke', meta=>{
  window.app && window.app.onStartStroke && window.app.onStartStroke(meta);
});
socket.on('draw-point', pt=>{
  window.app && window.app.onDrawPoint && window.app.onDrawPoint(pt.pt);
});
socket.on('history', history=>{
  window.app && window.app.onHistory && window.app.onHistory(history);
});
socket.on('clear-canvas', ()=>{
  window.app && window.app.onClear && window.app.onClear();
});
socket.on('cursor', c=>{
  window.app && window.app.onCursor && window.app.onCursor(c);
});
