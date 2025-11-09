const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function fillBackground(){
  ctx.fillStyle="#ffffff";
  ctx.fillRect(0,0,canvas.width,canvas.height);
}
fillBackground();

function replayHistory(history){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  fillBackground();
  let lastX=0,lastY=0;
  for(const item of history){
    if(item.type==='meta'){
      lastX=0; lastY=0;
    } else if(item.type==='point'){
      ctx.save();
      ctx.lineCap="round";
      ctx.lineJoin="round";
      ctx.lineWidth=item.size;
      ctx.globalCompositeOperation = item.eraser?"destination-out":"source-over";
      ctx.strokeStyle=item.color;
      ctx.beginPath();
      ctx.moveTo(lastX,lastY);
      ctx.lineTo(item.x,item.y);
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
      lastX=item.x;
      lastY=item.y;
    }
  }
}

export { canvas, ctx, replayHistory };
