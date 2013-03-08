define(['jquery'], function() {

  var TimeLapse = function() {

  };
  TimeLapse.prototype = {
    load: function(url) {
      var request = $.ajax({
        url: url,
        dataType: 'text',
        context: this
      });
      var loading = $.Deferred();
      request.done(function(data) {
        this.data = this.parse(data);
      }).then(loading.resolve);
      return loading;
    },
    parse: function(text) {
      var lines = text.split(/\r?\n\r?/);
      var parsed = [];
      var comments = [];
      var last = 0;

      var tagger = /(?:@)([^@]+)(?:@)/;
      var isComment = /@?c:(\d)@?/;
      var startEnd = /@?(\d+)?,(\d+)?@?/;

      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var match = tagger.exec(line);
        var metadata = {line: i};
        if (match && match[1]) {
          var tagContents = match[1];
          if (isComment.test(tagContents)) {
            var comment = {
              text: line.replace(isComment, ''),
              revision: isComment.exec(tagContents)[1]
            };
            comments.push(comment);
            if (comment.revision > last) last = comment.revision;
          } else {
            var duration = startEnd.exec(tagContents);
            metadata.start = duration[1] * 1 || 0;
            metadata.end = duration[2] * 1;
            if (typeof metadata.end != "number" || isNaN(metadata.end)) metadata.end = Infinity;
            metadata.text = line.replace(startEnd, '');
            parsed.push(metadata);
            if (metadata.start > last) last = metadata.start;
            if (metadata.end != Infinity && metadata.end > last) last = metadata.end;
          }
        } else {
          var metadata = {
            start: 0,
            end: Infinity,
            text: line
          };
          parsed.push(metadata);
        }
      }
      this.data = {
        lines: parsed,
        comments: comments,
        length: last + 1
      };
      this.revisions = this.buildRevisions();
      return this.data;
    },
    buildRevisions: function() {
      var lines = this.data.lines;
      var comments = this.data.comments;
      var length = this.data.length;
      var revisions = [];
      var current = 0;

      for (var i = 0; i < length; i++) {
        var rev = "";
        for (var j = 0; j < lines.length; j++) {
          var line = lines[j];
          if (line.start <= i && line.end >= i) {
            rev += line.text + "\n";
          }
        }
        revisions[i] = {
          text: rev,
          comment: comments[i] ? comments[i].text : ""
        }
      }
      return revisions;
    }
  };

  return TimeLapse;

});