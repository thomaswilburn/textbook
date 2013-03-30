define(['jquery'], function() {

  var interactive = $('.interactive.regex-tester');
  var input = interactive.find('.pattern');
  var sample = interactive.find('.matched');
  var status = interactive.find('.status');
  status.html('Ready');

  input.on('keyup', function() {
    try {
      var extract = /^\/(.+?)\/([gmix]+)?$/;
      var extracted = input.val().match(extract);
      if (!extracted) {
        sample.html(sample.text());
        if (input.val() == "") {
          status.html("Ready");
        } else {
          status.html("Doesn't look valid--did you forget the slashes?");
        }
        return;
      }
      var pattern = extracted[1];
      var flags = extracted[2] ? extracted[2].replace('g', '') : '';
      var re = new RegExp(pattern, flags + 'g');
      status.html("Searching for: " + extracted[1]);

      var match;
      var text = sample.text();
      var output = ""
      var last = 0;
      var limit = 0;
      while (match = re.exec(text)) {
        limit++;
        if (limit > 100) return;
        if (last < match.index) output += text.substr(last, match.index - last);
        last = match.index;
        match = match[0];
        output += "<span class=match>" + match + "</span>";
        last += match.length;
      }
      if (last < text.length) {
        output += text.substr(last);
      }
      sample.html(output);
    } catch (e) {
      console.log(e);
      status.html("Not a valid regular expression");
      sample.html(sample.text());
    }
  }).trigger('keyup');

});