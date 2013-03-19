define(['jquery', 'meta/TimeLapse', 'google-code/prettify'], function($, TimeLapse) {

  var Player = function(element) {
    this.timelapse = new TimeLapse();
    this.current = 0;
  };
  Player.prototype = {
    load: function(input) {
      var loader = $.Deferred();
      if (typeof input == 'string') {
        this.timelapse.parse(input);
        this.length = this.timelapse.revisions.length;
        loader.resolve();
      } else {
        //other option is that it's a file handle, but probably it's not
        var reader = new FileReader();
        reader.readAsText(input);
        reader.onload = function() {
          this.timelapse.parse(reader.result);
          this.length = this.timelapse.revisions.length;
          loader.resolve();
        }
      }
      return loader.promise();
    },
    connect: function(options) {
      this.ui = {
        code: options.code || $(),
        comments: options.comments || $(),
        next: options.next || $(),
        previous: options.prev || $(),
        first: options.first || $(),
        last: options.last || $()
      };
    },
    switch: function(number) {
      if (number < 0 || number >= this.length) {
        return;
      }
      var spans = [];
      this.current = number;
      var data = this.timelapse.data.lines;
      for (var i = 0; i < data.length; i++) {
        var line = data[i];
        if (line.start > number || line.end < number) continue;
        var span;
        if (line.start == number) {
          span = '<span class="new">';
        } else {
          span = '<span>';
        }
        span += line.text.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span>';
        spans.push(span);
      }
      this.ui.code.html(PR.prettyPrintOne(spans.join('\n')));
      var comment = this.timelapse.data.comments[number];
      if (comment) {
        comment = comment.replace(/\n/g, '<br>');
        this.ui.comments.html(comment);
          
      }
      
    },
    first: function() {
      this.switch(0);
    },
    last: function() {
      this.switch(this.timelapse.revisions.length - 1);
    },
    next: function() {
      this.switch(this.current + 1);
    },
    previous: function() {
      this.switch(this.current - 1);
    }
  };

  return Player;

});