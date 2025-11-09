import { canvas, ctx, replayHistory } from './canvas.js';

const colorPicker=document.getElementById('colorPicker');
const sizeRange=document.getElementById('sizeRange');
const brushBtn=document.getElementById('brushBtn');
const eraserBtn=document.getElementById('eraserBtn');
const undoBtn=document.getElementById('undoBtn');
const redoBtn=document.getElementById('redoBtn');
const clearBtn=document.getElementById('clearBtn');
const usersEl=document.getElementById('users');
const cursorsEl=document.getElementById('cursors');

let tool='brush';
let drawing=false;
let currentStrokeId=null;
let lastX=0,lastY=0;

function setActiveTool(t){
  tool=t;
  brushBtn.classList.toggle('active',t==='brush');
  eraserBtn.classList.toggle('active',t==='eraser');
}
brushBtn.onclick=()=>setActiveTool('brush');
eraserBtn.onclick=()=>setActiveTool('eraser');

const socket=io();
window.socket=socket;

function getRelative(e){
  const rect=canvas.getBoundingClientRect();
  return {x:e.clientX-rect.left, y:e.clientY-rect.top};
}

function drawStroke(x, y, size, color, isEraser){
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = size;
    ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(lastX,lastY);
    ctx.lineTo(x,y);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
    lastX = x;
    lastY = y;
}

function drawRemotePoint(pt){
    drawStroke(pt.x, pt.y, pt.size, pt.color, pt.eraser);
    lastX=pt.x; lastY=pt.y;
}

canvas.addEventListener('pointerdown', e=>{
    drawing=true;
    currentStrokeId=Math.random().toString(36).slice(2,9);
    const meta={strokeId:currentStrokeId,color:colorPicker.value,size:Number(sizeRange.value),eraser:tool==='eraser'};
    socket.emit('start-stroke',meta);

    const p=getRelative(e);
    lastX=p.x; lastY=p.y;
    drawStroke(p.x,p.y,meta.size,meta.color,meta.eraser);
    socket.emit('draw-point',{...meta,x:p.x,y:p.y});
});

canvas.addEventListener('pointerup', ()=>drawing=false);
canvas.addEventListener('pointermove', e=>{
    const p=getRelative(e);
    socket.emit('cursor',{x:p.x,y:p.y});
    if(!drawing) return;
    drawStroke(p.x,p.y,Number(sizeRange.value),colorPicker.value,tool==='eraser');
    socket.emit('draw-point',{strokeId:currentStrokeId,x:p.x,y:p.y,color:colorPicker.value,size:Number(sizeRange.value),eraser:tool==='eraser'});
});

const cursors={};
function showCursor(c){
    let el=cursors[c.userId];
    if(!el){
        el=document.createElement('div');
        el.className='user-cursor';
        el.innerHTML=`<div class="user-dot" style="background:${c.color}"></div><div>${c.userId.slice(0,4)}</div>`;
        cursorsEl.appendChild(el);
        cursors[c.userId]=el;
    }
    el.style.left=c.x+'px';
    el.style.top=c.y+'px';
}

function updateUsers(users){
    usersEl.innerHTML=Object.values(users).map(u=>`<span title="${u.name}"><span style="background:${u.color}"></span>${u.name}</span>`).join('');
}

// Socket events
socket.on('init', payload=>{
    updateUsers(payload.users);
    replayHistory(payload.history);
});
socket.on('users-update', updateUsers);
socket.on('draw-point', drawRemotePoint);
socket.on('history', replayHistory);
socket.on('clear-canvas', ()=>replayHistory([]));
socket.on('cursor', showCursor);

// Toolbar buttons
undoBtn.onclick=()=>socket.emit('undo');
redoBtn.onclick=()=>socket.emit('redo');
clearBtn.onclick=()=>socket.emit('clear-canvas');

setActiveTool('brush');
