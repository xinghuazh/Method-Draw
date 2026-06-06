MD.Canvas = function(){

  const el = document.getElementById("svgcanvas");
  var workarea = document.getElementById("workarea");
  var mouseX0 = 0;
  var mouseY0 = 0;
  var canvasMoved = 0;
  workarea.addEventListener("mouseup", function(ev){
    const mode = svgCanvas.getMode();
    // todo why?
    console.log("MD.Canvas::mouseup");
    console.log(mode);
    if (mode !== "textedit" && mode !== "pathedit") {
      //state.set("canvasMode", mode);
      svgCanvas.setMode('select');
    }

    workarea.className = mode;
    if (canvasMoved) {
      workarea.style.cursor= "auto";
    }
  });

  workarea.addEventListener("mousedown", function(ev){
    // zhangxh 中键按下移动画板
    if (ev.buttons & 0x4) {
      console.log("mousemove mid1");
      //console.log(ev);
      mouseX0 = ev.clientX;
      mouseY0 = ev.clientY;
      workarea.style.cursor= "move";
      canvasMoved = 1;
    }
  });

  workarea.addEventListener("mousemove", function(ev){
    // zhangxh 中键按下移动画板
    if (ev.buttons & 0x4) {
      console.log("mousemove mid2");
      var dx = ev.clientX - mouseX0;
      var dy = ev.clientY - mouseY0;
      mouseX0 = ev.clientX;
      mouseY0 = ev.clientY;

      moveCanvas(dx, dy);
    }
  });

  $('#resolution').change(function(){
    var w = $('#canvas_width')[0];
    var h = $('#canvas_height')[0];
    if(!this.selectedIndex) {
      $('#resolution_label').html("Custom");
      w.removeAttribute("readonly");
      w.focus();
      w.select();
      if(w.value === 'fit') {
        w.value = 100
        h.value = 100
      }
    } else if(this.value === 'content') {
      $('#resolution_label').html("Custom");
      w.value = 'fit'
      h.value = 'fit'
      changeSize();
      var res = svgCanvas.getResolution()
      w.value = res.w
      h.value = res.h
      
    } else {
      var dims = this.value.split('x');
      dims[0] = parseInt(dims[0]); 
      dims[1] = parseInt(dims[1]);
      var diff_w = dims[0] - w.value;
      var diff_h = dims[1] - h.value;
      //animate
      var start = Date.now();
      var duration = 1000;
      var animateCanvasSize = function(timestamp) {
        var progress = Date.now() - start;
        var tick = progress / duration;
        tick = (Math.pow((tick-1), 3) +1);
        w.value = (dims[0] - diff_w + (tick*diff_w)).toFixed(2);
        h.value = (dims[1] - diff_h + (tick*diff_h)).toFixed(2);
        changeSize();
        if (tick >= 1) {
          var res = svgCanvas.getResolution()
          $('#canvas_width').val(res.w.toFixed(2))
          $('#canvas_height').val(res.h.toFixed(2))
          $('#resolution_label').html("<div class='pull'>" + res.w + "<span>×</span></br>" + res.h + "</div>");
        }
        else {
          requestAnimationFrame(animateCanvasSize)
        }
      }
      animateCanvasSize()

    }
  });

  function resize(w, h){
    const res = svgCanvas.setResolution(w, h);
    if (!res) return $.alert("No content to fit to");
    if (w === 'fit' || h === 'fit') state.set("canvasSize", res);
    $("#canvas_width").val(w);
    $("#canvas_height").val(h);
  }

  function changeSize(attr, val, completed){
    const w = $("#canvas_width").val();
    const h = $("#canvas_height").val();
    state.set("canvasSize", [w,h]);
    if (completed) editor.saveCanvas();
  }

  function update(center, new_ctr) {
    var w = $(workarea).width(), h = $(workarea).height();
    var w_orig = w, h_orig = h;
    var zoom = svgCanvas.getZoom();
    var cnvs = $("#svgcanvas");
      
    var old_ctr = {
      x: workarea.scrollLeft + w_orig/2,
      y: workarea.scrollTop + h_orig/2
    };
    
    var multi = 2;
    w = Math.max(w_orig, svgCanvas.contentW * zoom * multi);
    h = Math.max(h_orig, svgCanvas.contentH * zoom * multi);
    
    workarea.style.overflow = (w == w_orig && h == h_orig) ? "hidden" : "scroll";
  
    var old_can_y = cnvs.height()/2;
    var old_can_x = cnvs.width()/2;
    cnvs.width(w).height(h);
    var new_can_y = h/2;
    var new_can_x = w/2;
    var offset = svgCanvas.updateCanvas(w, h);
    
    var ratio = new_can_x / old_can_x;

    var scroll_x = w/2 - w_orig/2;
    var scroll_y = h/2 - h_orig/2;
    
    if(!new_ctr) {

      var old_dist_x = old_ctr.x - old_can_x;
      var new_x = new_can_x + old_dist_x * ratio;

      var old_dist_y = old_ctr.y - old_can_y;
      var new_y = new_can_y + old_dist_y * ratio;

      new_ctr = {
        x: new_x,
        y: new_y
      };
      
    } else {
      new_ctr.x += offset.x,
      new_ctr.y += offset.y;
    }
    
    if(center) {
      workarea.scrollLeft = scroll_x;
      workarea.scrollTop = scroll_y;

    } else {
      workarea.scrollLeft = new_ctr.x - w_orig/2;
      workarea.scrollTop = new_ctr.y - h_orig/2;
    }

    editor.rulers.update();
    workarea.scroll();
  }
  
  // zhangxh
  function moveCanvas(dx, dy) {
    var x0 = workarea.scrollLeft;
    var y0 = workarea.scrollTop;

    workarea.scrollLeft = workarea.scrollLeft - dx;
    workarea.scrollTop = workarea.scrollTop - dy;
    editor.rulers.update();
    workarea.scroll();
  }

  function rename(str) {
    if (str.length) {
      $('#canvas_title').val(str);
      svgCanvas.setDocumentTitle(str);
    }
  }

  rename(state.get("canvasTitle"));

  this.resize = resize;
  this.update = update;
  this.rename = rename;
  this.changeSize = changeSize;
}