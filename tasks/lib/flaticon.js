/*
 * grunt-flaticon
 *
 * Copyright (c) 2015 Marcin Bonk, Bronisław Białek
 * Licensed under the MIT license.
 */

module.exports = (function () {
    'use strict';

    var needle = require('needle');
    var unzip = require('unzip');
    var fs = require('fs');
    var path = require('path');
    var grunt = require('grunt');

    function flaticon(options) {
        this.options = options;
        this.config = typeof options.config === "string" ? grunt.file.readJSON(options.config) : options.config;
    }

    flaticon.prototype.downloadZip = function downloadZip(done) {
        var data = {data: JSON.stringify(this.config.icons), acc: "font", scode: "4", uId: 0};

        needle.post(this.options.url, data, {multipart: true}, function (err, res, body) {
            if (err) {
                grunt.verbose.writeln('fetching error: ' + err);
                done();
            } else {
                grunt.verbose.writeln('sid: ' + body);
                this.handlePackageHash(body, done);
            }
        }.bind(this));
    };

    flaticon.prototype.handlePackageHash = function handlePackageHash(id, done) {
        grunt.log.write('Fetching archive ' + this.options.url_package + id + '...');

        var request = needle.get(this.options.url_package + id, function (err, res, body) {
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
                    case '.woff':case '.svg': case '.ttf': case '.eot':
                        var fontPath = path.join(this.options.fonts, path.basename(entry.path));
                        return entry.pipe(fs.createWriteStream(fontPath));

                    case '.css':
                        if (!this.options.use_package_css) {
                            var fontPath = path.join(this.options.styles, path.basename(entry.path));
                            return entry.pipe(fs.createWriteStream(fontPath));
                        }

                        default:
                            grunt.verbose.writeln('Ignored ', entry.path);
                            entry.autodrain();
                    }
                }
            }.bind(this))
        .on('finish', function() {
            if (!this.options.use_package_css) {
                this.generateCSS();
            }
                
            grunt.log.ok();
            done();
        }.bind(this));

    };

    flaticon.prototype.generateCSS = function generateCSS() {
        var file = grunt.file.read(__dirname + '/../../templates/flaticon.css');
        var template = grunt.template.process(file, {data: this.config});
        return template;
    };

    return flaticon;
})();