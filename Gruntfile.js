module.exports = function(grunt) {
    'use strict';

    // Config
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        closurecompiler: {
            minify: {
                files: {
                    'build/xsound.min.js': ['build/xsound.js']
                },
                options: {
                    'compilation_level': 'SIMPLE_OPTIMIZATIONS'
                }
            }
        }
    });

    // Plugins
    grunt.loadNpmTasks('grunt-closurecompiler');

    // Task
    grunt.registerTask('default', ['closurecompiler:minify']);
};
