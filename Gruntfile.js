module.exports = function(grunt) {
    var banner = [grunt.file.read('LICENSE'), '// @version ' + grunt.file.readJSON('package.json').version, ''].join(grunt.util.linefeed);

    // recursive module builder
    var path = require('path');
    function readManifest(filename, modules) {
        modules = modules || [];
        var lines = grunt.file.readJSON(filename);
        var dir = path.dirname(filename);
        lines.forEach(function(line) {
            var fullpath = path.join(dir, line);
            if (line.slice(-5) == '.json') {
                // recurse
                readManifest(fullpath, modules);
            } else {
                modules.push(fullpath);
            }
        });
        return modules;
    }

    MyScript = readManifest('build.json');

    grunt.initConfig({
        karma: {
            options: {
                configFile: 'conf/karma.conf.js',
                keepalive: true
            },
            buildbot: {
                reporters: ['crbot'],
                logLevel: 'OFF'
            },
            MyScript: {
            }
        },
        concat_sourcemap: {
            MyScript: {
                options: {
                    sourcesContent: true
                },
                files: {
                    'MyScript.concat.js': MyScript
                }
            }
        },
        uglify: {
            options: {
                banner: banner,
                nonull: true
            },
            MyScript: {
                options: {
                    sourceMap: 'MyScript.min.js.map',
                    sourceMapIn: 'MyScript.concat.js.map'
                    //mangle: false, beautify: true, compress: false
                },
                files: {
                    'MyScript.min.js': 'MyScript.concat.js'
                }
            }
        },
        yuidoc: {
            compile: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                options: {
                    exclude: 'third_party',
                    extension: '.js,.html',
                    paths: '.',
                    outdir: 'docs',
                    linkNatives: 'true',
                    tabtospace: 2,
                    themedir: '../tools/doc/themes/bootstrap'
                }
            }
        },
        audit: {
            MyScript: {
                options: {
                    repos: [
                        '.',
                        '../platform',
                        '../ShadowDOM',
                        '../HTMLImports',
                        '../CustomElements',
                        '../PointerEvents',
                        '../PointerGestures',
                        '../MyScript-expressions',
                        '../observe-js',
                        '../NodeBind',
                        '../TemplateBinding'
                    ]
                },
                dest: 'build.log',
                src: [
                    'MyScript.min.js',
                ]
            }
        },
        pkg: grunt.file.readJSON('package.json')
    });

    // plugins
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-concat-sourcemap');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-audit');

    // tasks
    grunt.registerTask('sourcemap_copy', 'Copy sourcesContent between sourcemaps', function(source, dest) {
        var sourceMap = grunt.file.readJSON(source);
        var destMap = grunt.file.readJSON(dest);
        destMap.sourcesContent = sourceMap.sourcesContent;
        grunt.file.write(dest, JSON.stringify(destMap));
    });
    grunt.registerTask('default', ['concat_sourcemap', 'uglify', 'sourcemap_copy:MyScript.concat.js.map:MyScript.min.js.map']);
    grunt.registerTask('minify', ['uglify']);
    grunt.registerTask('docs', ['yuidoc']);
    grunt.registerTask('test', ['karma:MyScript']);
    grunt.registerTask('test-buildbot', ['karma:buildbot']);
};