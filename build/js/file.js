/* 
File load plugin for RequireJS.
I'm not wild about how text! works, so we're going to use this instead.
NOTE: doesn't work on local files, start a server first.
*/

define(['jquery'], function() {

  var cache = {};

  var plugin = {
    load: function(name, parentRequire, onload, config) {
      var file = config.baseUrl + '/' + name;
      file = file.replace(/\/\/+/g, '/');
      var request = $.ajax({
        url: file,
        dataType: 'text',
        isLocal: true
      });
      request.done(function(data) { onload(data) });
      request.fail(function(xhr) { onload.error(xhr.statusText) });
    }
  };

  return plugin;

})