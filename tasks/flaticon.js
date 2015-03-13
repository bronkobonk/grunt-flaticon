/*
 * grunt-flaticon
 *
 * Copyright (c) 2015 Marcin Bonk, Bronisław Białek
 * Licensed under the MIT license.
 */
/**
 * @param grunt
 */
module.exports = function (grunt) {
    'use strict';

    var needle = require('needle');
    var unzip = require('unzip');
    var fs = require('fs');
    var path = require('path');

    grunt.registerMultiTask(
        'flaticon', 'Grunt task to automatically download flaticon icons collection from config stored in JSON file',

        function flaticon() {
            var self = this;
            var files = this.files;
            var done = this.async();

            var options = this.options({
                url: 'http://html.flaticon.com/request/download.php',
                url_package: 'http://www.flaticon.com/download/?t=',
                config: null,
                fonts: 'fonts',
                styles: 'css'
            });

            var configJson = typeof options.config === "string" ? grunt.file.readJSON(options.config) : options.config;
            var data = {data: JSON.stringify(configJson.icons), acc: "font", scode: "4", uId: 0};

            needle.post(options.url, data, {multipart: true}, function (err, res, body) {
                if (err) {
                    grunt.log.error();
                    done();
                } else {
                    grunt.log.ok();
                    grunt.log.debug('sid: ' + body);
                    handlePackageHash(body);
                }
            });
            /**
             * @param templateName
             * @param config
             */
            function generateCSS(config) {
                var file = grunt.file.read('templates/flaticon.css');
                console.log(typeof file);

                console.log(typeof config);
                grunt.template.process(file, config);
            }

            /**
             * @param id
             */
            function handlePackageHash(id) {
                grunt.log.write('Fetching archive ' + options.url_package + id + '...');

                var request = needle.get(options.url_package + id, function (err, res, body) {
                    if (err) {
                        done();
                        grunt.log.err();
                    }
                });

                request.pipe(unzip.Parse())

                    .on('entry', function (entry) {
                        var ext = path.extname(entry.path);

                        if (entry.type === 'File') {
                            switch (ext) {
                                case '.woff':
                                case '.svg':
                                case '.ttf':
                                case '.eot':
                                    var fontPath = path.join(options.fonts, path.basename(entry.path));
                                    return entry.pipe(fs.createWriteStream(fontPath));

                                case '.css':
                                    var fontPath = path.join(options.styles, path.basename(entry.path));
                                    generateCSS(configJson);
                                    return entry.pipe(fs.createWriteStream(fontPath));

                                default:
                                    grunt.verbose.writeln('Ignored ', entry.path);
                                    entry.autodrain();
                            }
                        }
                    })

                    .on('finish', function () {
                        grunt.log.ok();
                        done();
                    });
            }
        }
    );
};
