module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      main: ['src/**/*.js']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
};