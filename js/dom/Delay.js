/* 

Delay is a module for running scripts only when a given element scrolls into
view. You can run it by passing in an element to Delay(), which will return a
promise that's fulfilled when it enters the viewport.


*/

define(['jquery'], function($) {

  var offsets = [];
  $(window).on('scroll', function() {
    var boundary = window.scrollY + window.innerHeight;
    offsets = offsets.filter(function(item) {
      if (item.top < boundary) {
        item.callback();
        return false;
      }
      return true;
    });
  });

  setTimeout(function() {
    $(window).trigger('scroll');
  })

  return function(element) {
    element = typeof element == "string" ? $(element) : element;
    var deferred = $.Deferred();
    var offset = element.offset();
    offset.callback = deferred.resolve;
    offsets.push(offset);
    return deferred;
  }

});