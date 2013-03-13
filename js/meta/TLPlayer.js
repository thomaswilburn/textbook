define(['jquery', 'meta/TimeLapse', 'google-code/prettify'], function($, TimeLapse) {

  var Player = function() {
    this.timelapse = new TimeLapse();
  };
  Player.prototype = {
    load: function(input) {
      var loader;
      if (typeof input == 'string') {
        loader = this.timelapse.load(input)
      } else {
        //other option is that it's a file handle, but probably it's not
        loader = $.Deferred();
        var reader = new FileReader();
        reader.readAsFile(input);
        reader.onload = function() {
          this.timelapse.parse(reader.result);
          loader.resolve();
        }
      }
      return loader.promise();
    },
    connect: function(options) {
      //options variable contains wiring for next, previous, and text/comment div
    },
    switch: function(e) {
      //check for next/previous or for data-revision
      //insert code
      //figure out IDs of newly-added/deleted sections
      //prettify it
      //add classes to list items that are added/deleted
      //swap existing <code> for replacement revision
      //update commentary zone
    }
  };

});