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

        this.handlePackageHash(done);
    };

    /**
     * @param id
     * @param done
     */
    flaticon.prototype.handlePackageHash = function handlePackage(done) {
        grunt.log.write('Fetching archive ' + this.options.url_package + '...');

        var needleOptions = {multipart: true};
        
        if (this.options.cache_dir !== null) {
            needleOptions.output = path.join(this.options.cache_dir, 'flaticon' + this.hash + '.zip');
        }

        var data = {downC_icons: JSON.stringify(this.config.icons), downC_format: "iconfont", scode: "4", downC_user_id: 0};

        var request = needle.post(this.options.url_package, data, needleOptions, function (err, res, body) {
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
                            var cssPath = this.options.styles;
                            return entry.pipe(fs.createWriteStream(cssPath));

                        default:
                            grunt.verbose.writeln('Ignored ', entry.path);
                            entry.autodrain();
                    }
                }
            }.bind(this))

            .on('close', function () {
                if (!this.options.use_package_css) {
                    var templateContent = this.generateCSS();
                    var templatePath = this.options.styles;
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
        var cssPath = this.options.styles;
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

        var ext = this.options.use_less ? 'less' : 'css';
        var templateFile = grunt.file.read(__dirname + '/../../templates/flaticon.' + ext);
        var template = grunt.template.process(templateFile, {data: data});
        return template;
    };

    return flaticon;
})();
