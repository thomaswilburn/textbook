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
    },
    serialize: function() {
      var id = 0;
      var corpus = this.revisions.map(function(item,revision) {
        var split = item.text.split(/\r?\n\r?/);
        for (var i = 0; i < split.length; i++) {
          split[i] = {
            line: i,
            text: split[i],
          }
        }
        return split;
      });
      //create starter array from source, adding revision stamps
      var list = corpus[0].slice();
      list.forEach(function(item) {
        item.start = 0;
        item.end = Infinity;
      });
      /*
      We continually iterate over and recreate the source array. It's not
      efficient, but the linked list I tried earlier was kind of a drag to
      update correctly.
      */
      for (var rev = 1; rev < corpus.length; rev++) {
        var merged = [];
        var revision = corpus[rev];
        var target = 0;
        list.forEach(function(item) {
          //go through the revision looking for matches
          var source = item.text;
          var found = false;
          for (var i = target; i < revision.length; i++) {
            var line = revision[i].text;
            //if we find a match...
            if (line == source) {
              found = true;
              //merge in skipped lines as additions
              while (i > target) {
                var addition = revision[target];
                addition.start = rev;
                addition.end = Infinity;
                merged.push(addition);
                target++;
              }
              target++;
              break;
            }
          }
          //if not found, it was deleted
          if (!found) {
            item.end = rev - 1;
          }
          merged.push(item);
        });
        //if there's still stuff left in the revision, it's added
        while (target < revision.length) {
          var line = revision[target];
          line.start = rev;
          line.end = Infinity;
          //console.log('add', line.text);
          merged.push(line);
          target++;
        }
        list = merged;
      }
      var tagged = merged.map(function(item) {
        var tag = "";
        if (item.start > 0 || item.end < Infinity) {
          tag = "@" + item.start + ',';
          tag += item.end == Infinity ? '' : item.end;
          tag += "@";
        }
        return tag + item.text;
      });
      var output = tagged.join('\n');
      return $.trim(output);
    }
  };

  return TimeLapse;

});