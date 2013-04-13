define(['jquery'], function($) {

  var interactive = $('.interactive.prototype-canvas');

  var drawChain = function(e) {
    var id = this.getAttribute('id');
    var others = interactive.find('.' + id);
    var offset = $(this).offset();
    var x = e.pageX - offset.left;
    var y = e.pageY - offset.top;
    var color = this.getAttribute('data-color');
    var index = others.toArray().indexOf(this);
    for (var i = 0; i < others.length; i++) {
      var canvas = others[i];
      var context = canvas.getContext('2d');
      if (i <= index) {
        context.globalCompositeOperation = "source-over";
      } else {
        context.globalCompositeOperation = "destination-over";
      }
      context.beginPath();
      context.fillStyle = color;
      context.arc(x, y, 3, 0, Math.PI * 2);
      context.fill();
    }
  }

  $('.prototype-canvas canvas').on('mousedown', drawChain);

})