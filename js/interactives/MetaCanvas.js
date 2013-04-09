define(['jquery', 'meta/Evil'], function($, Evil) {

  return function(id) {    
    var canvas = document.querySelector("#" + id + " canvas");
    var context = canvas.getContext('2d');
    var code = $('#' + id + ' code');

    var checkTimer = function() {
      var now = Date.now();
      if (now - then > 500) throw "This script takes too long to run.";
    }
    var then = 0;
    var evaluate = function() {
      var source = code.text();
      source = source.replace(/(for|while)\s*\((.*?)\)\s*\{/gmi, "$1 ($2) { checkTimer();");
      then = Date.now();
      window.context = context;
      window.canvas = canvas;
      window.checkTimer = checkTimer;
      context.clearRect(0, 0, canvas.width, canvas.height);
      var result = Evil(source);
      if (result && result.error) console.error(result.error);
      try {
        delete window.context;
        delete window.canvas;
        delete window.checkTimer;
      } catch (e) {};
    };

    var timeout;
    code.on('keyup', function() {
      if (timeout) clearTimeout(timeout);
      setTimeout(evaluate, 250);
    }).trigger('keyup');
  };
});