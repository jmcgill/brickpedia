module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: '<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        },

        jsbeautifier: {
            files: ["**/*.js"],
            options: {}
        },

        requirejs: {
            compile: {
                options: {
                    appDir: ".",
                    dir: "build/optimized",
                    modules: [{
                        name: "config/init"
                    }],
                    baseUrl: "client/js/app",
                    mainConfigFile: "client/js/app/config/init.js",
                    skipDirOptimize: true
                }
            }
        }

    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-jsbeautifier');

    // Default task(s).
    grunt.registerTask('default', ['requirejs', 'uglify']);
    grunt.registerTask('beautify', ['jsbeautifier']);
    grunt.registerTask('require', ['requirejs']);
};
