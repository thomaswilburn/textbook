/*

Stage provides a simple, minimal version of the AS3 display tree as a thin
wrapper for the Canvas APIs. It's meant to make complex display heirarchies
somewhat less painful to code. It does not, at this time, provide any kind of
event handling. What you get is pretty terse:

* Stage(canvas) provides a stage object that spawns other display objects,
  including

* Sprite, which has can host smaller Sprites and draw on a transformed
  context, and

* TextBox, which provides very basic text handling

If it gets much bigger than this, we'll have to break it into multiple
modules. Let's not.

*/

define([], function() {

  var SpriteProto = {
    render: function(parentTransform) {
      var context = this.context;
      context.save();
      context.fillStyle = "black";
      context.strokeStyle = "black";
      context.lineWidth = 1;
      var transform = {
        x: this.x || 0,
        y: this.y || 0,
        rot: this.rotation || 0,
        scaleX: this.scaleX || 1,
        scaleY: this.scaleY || 1
      }
      if (parentTransform) {
        transform.x += parentTransform.x;
        transform.y += parentTransform.y;
        transform.scaleX *= parentTransform.scaleX;
        transform.scaleY *= parentTransform.scaleY;
        transform.rot += parentTransform.rot;
      }
      context.translate(transform.x, transform.y);
      context.rotate(transform.rot);
      context.scale(transform.scaleX, transform.scaleY);
      this.draw();
      if (this.children) for (var i = 0; i < this.children.length; i++) {
        this.children[i].render(transform);
      }
      context.restore();
    },
    draw: function() { /* OVERRIDE ME */},
    addChild: function(child) {
      this.removeChild(child);
      this.children.push(child);
    },
    removeChild: function(child) {
      this.children = this.children.filter(function(item) {
        return item != child;
      });
    }
  };

  var TextProto = {
    x: 0,
    y: 0,
    width: 150,
    height: 100,
    font: 'sans-serif',
    size: 16,
    lineSpacing: 2,
    color: 'black',
    text: '',
    render: SpriteProto.render,
    draw: function() {
      var context = this.context;
      var split = this.text.split(' ');
      context.fillStyle = this.color;
      context.font = this.size + "px " + this.font;
      var x = 0;
      var y = this.size;
      for (var i = 0; i < split.length; i++) {
        var word = split[i] + " ";
        var measure = context.measureText(word);
        if (x + measure.width > this.width) {
          x = 0;
          y += this.size + this.lineSpacing;
        }
        context.fillText(word, x, y);
        x += measure.width;
      }
    }
  }

  var Stage = function(canvas) {
    this.canvas = canvas.jquery ? canvas[0] : canvas;
    this.context = this.canvas.getContext('2d');
    this.children = [];
    var stage = this;

    var Sprite = function() {
      this.context = stage.context;
      this.children = [];
      this.x = this.y = 0;
      this.scaleX = this.scaleY = 1;
      this.rotation = 0;
    };

    var Text = function() {
      this.context = stage.context;
      this.x = this.y = 0;
      this.scaleX = this.scaleY = 1;
      this.rotation = 0;
    }

    Sprite.prototype = SpriteProto;
    Text.prototype = TextProto;
    this.Sprite = Sprite;
    this.TextBox = Text;
    this.draw = function() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
  Stage.prototype = SpriteProto;

  return Stage;

});