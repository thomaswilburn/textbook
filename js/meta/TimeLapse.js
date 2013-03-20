define(['jquery'], function($) {

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
      return loading.promise();
    },
    parse: function(text) {
      //find comments first, because they're multiline
      var isComment = /\r?\n\r?@@c:(\d)+;([^@]*)@@/;
      var comment;
      var comments = [];
      while (comment = isComment.exec(text)) {
        var all = comment[0];
        var rev = comment[1] * 1;
        comments[rev] = comment[2] || "";
        text = text.replace(all, '');
      };

      //then parse remaining text
      var lines = text.split(/\r?\n\r?/);
      var parsed = [];
      var last = 0;

      var tagger = /(?:@)([^@]+)(?:@)/;
      var startEnd = /@?(\d+)?,(\d+)?@?/;

      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var match = tagger.exec(line);
        var metadata = {line: i};
        if (match && match[1]) {
          var tagContents = match[1];
          var duration = startEnd.exec(tagContents);
          metadata.start = duration[1] * 1 || 0;
          metadata.end = duration[2] * 1;
          if (typeof metadata.end != "number" || isNaN(metadata.end)) metadata.end = Infinity;
          metadata.text = line.replace(startEnd, '');
          parsed.push(metadata);
          if (metadata.start > last) last = metadata.start;
          if (metadata.end != Infinity && metadata.end > last) last = metadata.end;
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
        var rev = [];
        for (var j = 0; j < lines.length; j++) {
          var line = lines[j];
          if (line.start <= i && line.end >= i) {
            rev.push(line.text);
          }
        }
        revisions[i] = {
          text: rev.join('\n'),
          comment: comments[i] ? comments[i] : ""
        }
      }
      return revisions;
    },
    serialize: function() {
      var revisions = this.revisions;
      var source = revisions[0].text;
      source = source.split('\n').map(function(line) {
        return {
          text: line,
          start: 0,
          end: Infinity
        }
      });
      //loop over each new revision
      for (var i = 1; i < revisions.length; i++) {
        var integrated = [];
        var target = revisions[i].text.split('\n');
        var start = 0; //don't backtrack in target revision
        //match against each line of source
        for (var j = 0; j < source.length; j++) {
          var sourceLine = source[j];
          if (sourceLine.end < i) {
            integrated.push(sourceLine);
            continue;
          }
          var line = sourceLine.text;
          var found = false;
          for (var k = start; k < target.length; k++) {
            var targetLine = target[k];
            if (targetLine == line) {
              //skipped lines are additions
              while (start < k) {
                integrated.push({
                  start: i,
                  text: target[start],
                  end: Infinity
                });
                start++;
              }
              start++;
              integrated.push(sourceLine);
              found = true;
              break;
            }
          }
          if (!found) {
            sourceLine.end = i - 1;
            integrated.push(sourceLine);
          }
        }
        while (start < target.length) {
          integrated.push({
            start: i,
            text: target[start],
            end: Infinity
          });
          start++;
        }
        source = integrated;
      }
      //build tagged version
      var tagged = source.map(function(item) {
        if (item.start == 0 && item.end == Infinity) return item.text;
        var line = "@";
        if (item.start) {
          line += item.start;
        }
        line += ','
        if (item.end < Infinity) {
          line += item.end
        }
        line += "@" + item.text;
        return line;
      });
      for (var i = 0; i < revisions.length; i++) {
        if (revisions[i].comment) {
          tagged.push('@@c:' + i + ';' + revisions[i].comment + '@@');
        }
      }
      return tagged.join('\n');
    }
  };

  return TimeLapse;

});