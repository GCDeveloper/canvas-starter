(function(){
  "use strict";
  let canvasA, ctx, w, h, ox = 0, oy = 0, gridOn = true;//offset x,y
  document.addEventListener('DOMContentLoaded', initialize, false);
  window.addEventListener('resize', resize, false);
  function setSize(canvas = canvasA, width = window.innerWidth, height = window.innerHeight){
    w = width;
    h = height;
    canvas.width = w;
    canvas.height = h;
    draw();
  }
  function initialize(){
    //declarations
    canvasA = document.getElementById('canvasA');
    ctx = canvasA.getContext('2d');

    let btnGrid = document.getElementById('btn-grid');
    btnGrid.addEventListener('click', function(){
      gridOn = !gridOn;
      draw();
    }, false);

    //events
    document.body.addEventListener("mousedown", onDown, false);
    document.body.addEventListener("mousemove", onMove, false);
    document.body.addEventListener("mouseup", onUp, false);
    document.body.addEventListener("mouseout", onOut, false);

    document.body.addEventListener("touchstart", onDown, false);
    document.body.addEventListener("touchmove", onMove, false);
    document.body.addEventListener("touchend", onUp, false);
    
    //initial functions to be executed
    setSize();
  }
  function draw(){
    ctx.clearRect(0,0,w,h);
    ctx.save();
    ctx.translate(w/2+ox,h/2+oy);//place 0,0 at the center of the screen
    if(gridOn){
      drawOrigin();
      drawGridlines();
    }
    ctx.restore();
  }
  function drawOrigin(){
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-10,0);
    ctx.lineTo(10,0);
    ctx.moveTo(0,-10);
    ctx.lineTo(0,10);
    ctx.stroke();
    ctx.closePath();
  }
  function drawGridlines(){
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgb(220,220,220)';
    ctx.beginPath();
    let gridSize = 250;//100x100 px per cell
    let i = 0;
    let xLen = (w/gridSize);
    let xStart = Math.floor(-xLen/2);
    let xEnd = Math.ceil(xLen/2)+1;
    let yLen = (h/gridSize);
    let yStart = Math.floor(-yLen/2);
    let yEnd = Math.ceil(yLen/2)+1;
    for(i=xStart;i<xEnd;i++){
      ctx.moveTo(-Math.round(ox/gridSize)*gridSize+(i*gridSize),-h/2-oy);
      ctx.lineTo(-Math.round(ox/gridSize)*gridSize+(i*gridSize),h/2-oy);
    }
    for(i=yStart;i<yEnd;i++){
      ctx.moveTo(-w/2-ox, -Math.round(oy/gridSize)*gridSize+(i*gridSize));
      ctx.lineTo(w/2-ox, -Math.round(oy/gridSize)*gridSize+(i*gridSize));
    }

    ctx.closePath();
    ctx.stroke();
  }
  function resize(){
    setSize();
  }
  let mouse = {
    isDown:false,
    x:0,
    y:0,
    xLast:0,
    yLast:0,
    xDown:0,
    yDown:0,
    downID:-1,//id of timeout for reenabling down mouse events
    lockMouseEvents:false//if touches detected, disallow non touch for a period of 500ms after each touch event - to stop simultaneous mouse and touch events.
  };
  function consistentDrag(x,y){
    ox = x-mouse.xDown;
    oy = y-mouse.yDown;
    draw();
  }
  function consistentDown(x,y){
    mouse.xDown = x-ox;
    mouse.yDown = y-oy;
  }
  function consistentUp(x,y){

  }
  function mouseUpdated(x, y, state){
    let xd = Math.round(Math.abs(x-mouse.xLast));
    let yd = Math.round(Math.abs(y-mouse.yLast));
    let dist = Math.hypot(xd, yd);
    if(state != 'move' || dist > 2 && mouse.isDown){
      mouse.x = x;
      mouse.y = y;
      switch(state){
        case 'move':
        mouse.isDragging = true;
        consistentDrag(mouse.x, mouse.y);
        break;
        case 'down':
        consistentDown(mouse.x, mouse.y);
        break;
        case 'up':
        mouse.isDragging = false;
        consistentUp(mouse.x, mouse.y);
        break;
        default:
        throw new Error('unknown mouse/touch event');
      }
      mouse.xLast = x;
      mouse.yLast = y;
    }
  }
  function onDown(e){
    let x = 0, y = 0;
    mouse.isDown = true;
    if(typeof e.touches !== 'undefined'){
      //use touch
      x = e.touches[0].pageX;
      y = e.touches[0].pageY;
      mouse.xLast = x;//reset x,y last positions so it wont think its dragging
      mouse.yLast = y;
      mouse.lockMouseEvents = true;
      //if there is already a timeout in progress, clear it then start the new timer.
      if(mouse.downID >= 0){
        clearTimeout(mouse.downID);
      }
      //re-enable non-touch events after 500ms
      mouse.downID = setTimeout(function(){
        mouse.lockMouseEvents = false;
      }, 500);
      mouseUpdated(x,y, 'down');
    } else if(!mouse.lockMouseEvents){
      //use mouse
      x = e.pageX;
      y = e.pageY;
      mouseUpdated(x,y, 'down');
    }
    
  }
  function onUp(e){
    let x = 0, y = 0;
    mouse.isDown = false;
    if(typeof e.touches !== 'undefined'){
      //use touch
      x = e.changedTouches[0].pageX;
      y = e.changedTouches[0].pageY;
      mouseUpdated(x,y,'up');
    } else if(!mouse.lockMouseEvents){
      //use mouse
      x = e.pageX;
      y = e.pageY;
      mouseUpdated(x,y,'up');
    }
    
  }
  function onMove(e){
    let x = 0, y = 0;
    if(typeof e.touches !== 'undefined'){
      //use touch
      x = e.touches[0].pageX;
      y = e.touches[0].pageY;
      mouseUpdated(x,y,'move');
    } else if(!mouse.lockMouseEvents){
      //use mouse
      x = e.pageX;
      y = e.pageY;
      if(!mouse.isDown){
        mouse.xLast = x;//reset x,y last positions so it wont think its dragging
        mouse.yLast = y;
      }
      mouseUpdated(x,y,'move');
    }
  }
  function onOut(){
    onUp({pageX:mouse.x,pageY:mouse.y});
  }
})();