define(['jquery', 'dom/Delay', 'meta/Evil', 'dom/Stage'], function($, Delay, Evil, Stage) {
  var canvas = document.querySelector('canvas#flowchart');
  var context = canvas.getContext('2d');

  var ifTrue = true;

  var drawWire = function(points, on) {
    context.strokeStyle = "#888";
    context.lineWidth = 4;
    if (on) {
      context.strokeStyle = "#5C5";
    }
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (var i = 1; i < points.length; i++) {
      context.lineTo(points[i].x, points[i].y);
    }
    context.stroke();
  };

  var stage =  new Stage(canvas);
  var Bulb = function() {
    stage.Sprite.call(this);
  };
  Bulb.prototype = new stage.Sprite();
  Bulb.prototype.draw = function() {
    //draw our lightbulb - man, I hate canvas
    var context = this.context;
    context.beginPath();
    context.fillStyle = this.on ? "yellow" : "white";
    context.arc(20, 20, 20, Math.PI, Math.PI * 2);
    context.lineTo(30, 40);
    context.lineTo(10, 40);
    context.lineTo(0, 20);
    context.closePath();
    context.fill();
    context.stroke();
    context.beginPath()
    context.moveTo(10, 20);
    context.lineTo(20, 40);
    context.lineTo(30, 20);
    context.stroke();
    context.beginPath();
    context.moveTo(30, 40);
    context.lineTo(32, 42);
    context.lineTo(32, 50);
    context.lineTo(8, 50);
    context.lineTo(8, 42);
    context.lineTo(10, 40);
    context.closePath();
    context.fillStyle = "#888";
    context.fill();
  }
  var ifBulb = new Bulb();
  var elseBulb = new Bulb();
  stage.addChild(ifBulb);
  stage.addChild(elseBulb);
  ifBulb.x = 60;
  ifBulb.y = 80;
  elseBulb.x = 140
  elseBulb.y = 180;

  stage.draw = function() {
    var start = $('.flowbox.start');
    var end = $('.flowbox.end');
    var middle = $('.flowbox.else');
    var startPos = start.position();
    var endPos = end.position();
    drawWire([
      {x: 140, y: startPos.top + start.outerHeight()},
      {x: 140, y: ifBulb.y + 45},
      {x: ifBulb.x + 20, y: ifBulb.y + 45},
      {x: ifBulb.x + 20, y: ifBulb.y + 55},
      {x: 10, y: ifBulb.y + 55},
      {x: 10, y: endPos.top - 10},
      {x: endPos.left, y: endPos.top}
    ], ifBulb.on);
    var midPos = middle.position();
    drawWire([
      {x: 200, y: startPos.top + start.outerHeight()},
      {x: 200, y: midPos.top - 4},
      {x: midPos.left + 200, y: midPos.top - 4},
      {x: midPos.left + 200, y: elseBulb.y + 45},
      {x: elseBulb.x + 20, y: elseBulb.y + 45},
      {x: elseBulb.x + 20, y: endPos.top}
    ], elseBulb.on);
  }

  stage.render();

  Delay("#flowchart").done(function() {
    $(canvas).hide().fadeIn();
    $('#conditional').on('keyup', function(e) {
      var input = $(this).val();
      var output = Evil(input);
      if (typeof output == 'undefined' || output.error) {
        ifBulb.on = elseBulb.on = false;
      } else {
        if (output) {
          //truthy path
          ifBulb.on = true;
          elseBulb.on = false;
        } else {
          //falsey path
          ifBulb.on = false;
          elseBulb.on = true;
        }
      }
      stage.render();
    }).trigger('keyup');
  });
});