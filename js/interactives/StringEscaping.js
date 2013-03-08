define(['jquery', 'meta/Evil'], function($, Evil) {

  var escaping = $('.interactive.escaping');
  var inputs = escaping.find('input');
  inputs.each(function(index, item) {
    var input = $(item);
    input.addClass('broken');
    input.on('keyup', function() {
      var result = Evil(input.val());
      if (result && !result.error) {
        input.removeClass('broken').addClass('fixed');
      } else {
        input.removeClass('fixed').addClass('broken');
      }
      if (escaping.find('.broken').length == 0) {
        escaping.find('.praise').html('You did it! Congratulations!');
      }
    }).trigger('keyup');
  });

});