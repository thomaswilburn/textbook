module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');

  var fs = require('fs');
  var path = require('path');
  var http = require('http');
  var exec = require("child_process").exec;

  grunt.initConfig({
    shorts: {
      paths: './src/*.html',
      output: './build'
    },
    less: {
      paths: ['./src/css'],
      output: './build/css/styles.css'
    },
    connect: {
      local: {
        options: {
          base: "build" 
        }
      }
    },
    watch: {
      html: {
        files: ['./src/**/*.html'],
        tasks: ['shorts']
      },
      js: {
        files: ['./src/code/*.js'],
        tasks: ['compileJS']  
      },
      css: {
        files: ['./src/css/*.less'],
        tasks: ['compileCSS']
      },
      options: {
        nospawn: true
      }
    }
  });

  grunt.registerTask('default', 'folders shorts compileCSS compileJS connect watch'.split(' '));

  grunt.registerTask('folders', "Create the /build folder if it doesn't exist", function() {
    if (!grunt.file.exists('./build')) {
      grunt.file.mkdir('build');
    }
  });

  /*
    The JavaScript on the page is kept in the source folder, then compiled into the build directory so that require() can request it. The textbook base library is also compiled using the RequireJS optimizer. Many scripts will do neither--small demos are included inline using the Shorts tempating.
  */
  grunt.registerTask('compileJS', 'Build/copy scripts', function() {
    var c = this.async();
    exec("cp ./js build -r", c);
  });

  /*
    A simple LESS compilation task.
  */
  grunt.registerTask('compileCSS', 'Build the CSS file from seed.less', function() {

    var less = require('less');
    var config = grunt.config('less');
    var compiler = new less.Parser({
      paths: config.paths
    });

    var seed = fs.readFileSync('./src/css/seed.less', 'utf8');

    var callback = this.async();
    
    compiler.parse(seed, function(error, tree) {
      if (error) throw('Error in CSS parsing: ' + error.message);
      var css = tree.toCSS();
      var output = config.output;
      var outputDir = path.dirname(output);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
      }
      fs.writeFileSync(output, css);
      callback();
    });
  });

  /**
    Shorts is a simple templating system based on WordPress shortcodes, supporting basic file includes and substitution based on tag attributes.
  */
  grunt.registerTask('shorts', 'Simple shortcode templating', function() {
    var config = grunt.config('shorts');
    var files = grunt.file.expand(config.paths);
    var outputDir = config.output;

    var parse = function(input, data) {
      data = data || {};
      var file = fs.readFileSync(input, 'utf-8');

      for (var key in data) {
        var replacer = new RegExp("\\[#" + key + "\\]", "g");
        file = file.replace(replacer, data[key]);
      }

      var dir = path.dirname(input);
      var importTest = /\[@import(?: [^\s\]]+)*\]/g;
      var match;
      while (match = importTest.exec(file)) {

        var importCode = match[0];//.replace(/\[@import|\]/g, '');
        //chunker finds the attributes within the shortcode
        var chunker = /\s([\w\/.]+)(?:=\w+|=(['"]{0,1}).*?\2)?/g
        var attributes = importCode.match(chunker);
        if (attributes == null) continue;
        var importPath = attributes.shift().trim();
        var params = {};
        for (var i = 0; i < attributes.length; i++) {
          var split = attributes[i].trim().split('=');
          if (typeof split[1] == 'string' && split[1][0] && split[1][0].search(/['"]/) != -1) {
            split[1] = split[1].substr(1, split[1].length - 2);
          }
          params[split[0]] = split[1] || "";
        }

        var imported = parse(path.join(dir, importPath), params);

        file = file.replace(importCode, imported);
      }

      return file.toString();
    };
    for (var i = 0; i < files.length; i++) {
      var slug = path.basename(files[i]);
      var parsed = parse(files[i]);
      fs.writeFileSync(path.join(outputDir, slug), parsed);
    }

  });
};