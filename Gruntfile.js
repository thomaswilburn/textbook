module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib-watch');

    var fs = require('fs');
    var path = require('path');
    var http = require('http');

    grunt.initConfig({
        shorts: {
            paths: './src/*.html',
            output: './build'
        },
        less: {
            paths: ['./src/css'],
            output: './build/css/styles.css'
        },
        js: {
            src: './src',
            directories: ['', 'code'],
            build: './build'
        },
        watch: {
            html: {
                files: ['./src/*.html', './src/snippets/*.html'],
                tasks: ['shorts']
            },
            /*js: {
                files: ['./src/code/*.js'],
                tasks: ['compileJS']    
            },*/
            css: {
                files: ['./src/css/*.less'],
                tasks: ['compileCSS']
            }            
        }
    });

    grunt.registerTask('default', 'shorts compileCSS watch'.split(' '));

    grunt.registerTask('serve', 'Serve using PHP simple server', function() {
        require('child_process').spawn('php', ['-S', 'localhost:80']);
    });

    /*
        The JavaScript on the page is kept in the source folder, then compiled into the build directory so that require() can request it. The textbook base library is also compiled using the RequireJS optimizer. Many scripts will do neither--small demos are included inline using the Shorts tempating.
    */
    grunt.registerTask('compileJS', 'Build/copy scripts', function() {
      var config = grunt.config('js');
      var directories = config.directories;
      for (var i = 0; i < directories.length; i++) {
        var dir = directories[i];
        var filter = path.join(config.src, dir, '*.js');
        var files = grunt.file.expand(filter);//findFiles(filter);
        var outputDir = path.join(config.build, dir);

        for (var j = 0; j < files.length; j++) {
            var slug = path.basename(files[j]);
            grunt.file.copy(files[j], path.join(outputDir, slug));
        }
      }
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

        var parse = function(input) {
            var file = fs.readFileSync(input, 'utf-8');
            var dir = path.dirname(input);
            var importTest = /\[@import(?: [^\s\]]+)*\]/g;
            var match;
            while (match = importTest.exec(file)) {

                var importCode = match[0];
                //chunker finds the attributes within the shortcode
                var chunker = /(?:\s)[^=\s\]]+(?:=?([^'"\s\]]+|(['"])[^\2\]]+\2)?)/g;;
                var attributes = importCode.match(chunker);
                var importPath = attributes.shift().trim();
                var params = {};
                for (var i = 0; i < attributes.length; i++) {
                    var split = attributes[i].trim().split('=');
                    if (typeof split[1] == 'string' && split[1][0].search(/['"]/) != -1) {
                        split[1] = split[1].substr(1, split[1].length - 2);
                    }
                    params[split[0]] = split[1] || "";
                }
                var imported = parse(path.join(dir, importPath));

                for (var key in params) {
                    imported = imported.replace('[#' + key + ']', params[key]);
                }

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