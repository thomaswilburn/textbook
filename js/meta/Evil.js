/*

Evil is a safe eval function. It should only be used on small chunks of code--
ideally single lines--since it's still not THAT safe.

*/

define([], function() {

  return function(source, context) {
    context = context || {};
    source = source.split(/\r?\n/);
    var empty = /^\s*$/;
    source = source.filter(function(line) {
      return !empty.test(line);
    });
    source[source.length - 1] = 'return ' + source[source.length - 1];
    var code = source.join(';\n');
    try {
      var f = new Function(code);
      var result = f.call(context);
      return result;
    } catch (e) {
      return {error: e};
    }
  }

});