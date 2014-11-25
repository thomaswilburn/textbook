module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');

  var fs = require('fs');
  var path = require('path');
  var http = require('http');
  var exec = require("child_process").exec;

  grunt.initConfig({
    less: {
      paths: ['./src/css'],
      output: './build/css/styles.css'
    },
    connect: {
      local: {
        options: {
          livereload: true,
          base: "build" 
        }
      }
    },
    watch: {
      html: {
        files: ['./src/**/*.html'],
        tasks: ['template']
      },
      js: {
        files: ['./src/code/*.js'],
        tasks: ['compileJS']  
      },
      css: {
        files: ['./src/css/*.less'],
        tasks: ['less']
      },
      options: {
        nospawn: true,
        livereload: true
      }
    }
  });

  grunt.registerTask('default', 'build connect watch'.split(' '));
  grunt.registerTask('build', 'template less compileJS'.split(' '));

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
  grunt.registerTask('less', 'Build the CSS file from seed.less', function() {

    var less = require('less');
    var config = grunt.config('less');

    var seed = grunt.file.read('src/css/seed.less');

    var callback = this.async();
    
    less.render(seed, { paths: config.paths }).then(function(rendered) {
      var css = rendered.css;
      grunt.file.write(config.output, css);
      callback();
    }, function(err) { console.error(err); callback() });
  });

  /**
    Build output pages via Lo-dash templating
  */
  var path = require("path");
  grunt.template.include = function(where, data) {
    var src = grunt.file.read(path.resolve("src", where));
    data = Object.create(data || null);
    data.t = grunt.template;
    return grunt.template.process(src, {data:data})
  };
  grunt.registerTask('template', 'Simple shortcode templating', function() {
    var files = grunt.file.expandMapping("*.html", "build", { cwd: "src" });
    var data = { t: grunt.template };
    
    files.forEach(function(file) {
      var src = file.src[0];
      console.log("building file", src);
      var rendered = grunt.template.process(grunt.file.read(src), { data: data });
      grunt.file.write(file.dest, rendered);
    });

  });
};