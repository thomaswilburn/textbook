Working Title: JavaScript for the Web Savvy
===========================================

There aren't a lot of good JavaScript textbooks out there, so I'm writing one. HTML/CSS source starts in the /src folder, and gets output after templating and LESS compilation to the /build folder. It's a work in progress, so mind the dust.

You can view a recent (but not cutting edge) version of the output by visiting: http://thomaswilburn.github.com/textbook

This project no longer includes built files in the repo. In order to build, you'll need to install the following NPM modules, and then run the "grunt" command:

- grunt (0.4 or greater)
- grunt-cli (should be installed globally)
- grunt-contrib-watch
- less
- require (not currently used, but probably will be soon)