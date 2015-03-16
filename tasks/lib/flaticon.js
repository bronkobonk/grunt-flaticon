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
    var crypto = require('crypto');

    /**
     * @param options
     */
    function flaticon(options) {
        this.options = options;
        this.config = typeof options.config === "string" ? grunt.file.readJSON(options.config) : options.config;
        this.hash = "";
    }

    /**
     * @param done
     */
    flaticon.prototype.downloadZip = function downloadZip(done) {
        var data = {data: JSON.stringify(this.config.icons), acc: "font", scode: "4", uId: 0};

        var md5sum = crypto.createHash('md5');
        md5sum.update(JSON.stringify(this.config));
        this.hash = md5sum.digest('hex');

        if (this.options.cache_dir !== null) {
            var cacheFile = path.join(this.options.cache_dir, 'flaticon' + this.hash + '.zip');
            
            if (fs.existsSync(cacheFile)) {
                var request = fs.createReadStream(cacheFile);
                this.processRequest(request.pipe(unzip.Parse()), done);
                return;
            }
        }

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

    /**
     * @param id
     * @param done
     */
    flaticon.prototype.handlePackageHash = function handlePackageHash(id, done) {
        grunt.log.write('Fetching archive ' + this.options.url_package + id + '...');

        var needleOptions = {};
        
        if (this.options.cache_dir !== null) {
            needleOptions.output = path.join(this.options.cache_dir, 'flaticon' + this.hash + '.zip');
        }
        
        var request = needle.get(this.options.url_package + id, needleOptions, function (err, res, body) {
            if (err) {
                done();
                grunt.log.err();
            }
        });

        this.processRequest(request.pipe(unzip.Parse()), done);
    };

    /**
     * @returns {*|void}
     */
    flaticon.prototype.processRequest = function processRequest(request, done) {
        request
            .on('entry', function (entry) {
                var ext = path.extname(entry.path);
                if (entry.type === 'File') {
                    switch (ext) {
                        case '.woff':
                        case '.svg':
                        case '.ttf':
                        case '.eot':
                            var fontPath = path.join(this.options.fonts, path.basename(entry.path));
                            return entry.pipe(fs.createWriteStream(fontPath));

                        case '.css':
                            var fontPath = path.join(this.options.styles, path.basename(entry.path));
                            return entry.pipe(fs.createWriteStream(fontPath));

                        default:
                            grunt.verbose.writeln('Ignored ', entry.path);
                            entry.autodrain();
                    }
                }
            }.bind(this))

            .on('close', function () {
                if (!this.options.use_package_css) {
                    var templateContent = this.generateCSS();
                    var templatePath = path.join(this.options.styles, 'flaticon.css');
                    grunt.file.write(templatePath, templateContent);
                }
                
                grunt.log.ok();
                done();
            }.bind(this))
        ;
    };

    /**
     * @returns {*|void}
     */
    flaticon.prototype.generateCSS = function generateCSS() {
        var cssPath = path.join(this.options.styles, 'flaticon.css');
        var currentContent = grunt.file.read(cssPath);
        
        var icons = [];
        
        currentContent.replace(/\.flaticon-(.*?):before {(?:[\s\S]*?)content: "(.*)"/g, function (m, name, content) {
            icons.push({
                name: name,
                content: content
            });
        });
        
        var data = {
            config: this.config,
            icons: icons,
            font_url: this.options.font_url
        };

        var templateFile = grunt.file.read(__dirname + '/../../templates/flaticon.css');
        var template = grunt.template.process(templateFile, {data: data});
        return template;
    };

    return flaticon;
})();