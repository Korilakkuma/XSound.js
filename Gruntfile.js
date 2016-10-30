module.exports = function(grunt) {
    'use strict';

    // Config
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: ['build/xsound.js', 'build/xsound-server-session-websocket.js', 'xsound-server-session-ws.js'],
            options: {
                jshintrc: true
            }
        },
        uglify: {
            target: {
                options: {
                    sourceMap: true,
                    sourceMapName: 'build/xsound.js.map'
                },
                files: {
                    'build/xsound.min.js': ['build/xsound.js']
                }
            }
        },
        watch: {
            files: ['build/xsound.js'],
            tasks: ['uglify']
            /*
            options: {
                livereload: true
            }
            */
        },
        clean: ['build/*.min.js', 'build/*.map']
    });

    // Plugins
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Tasks
    grunt.registerTask('hint',  ['jshint']);
    grunt.registerTask('build', ['clean', 'uglify']);
    grunt.registerTask('observe', ['watch']);
    grunt.registerTask('default', ['hint', 'build']);
};
