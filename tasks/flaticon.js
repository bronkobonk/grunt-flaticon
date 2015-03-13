/*
 * grunt-flaticon
 *
 * Copyright (c) 2015 Marcin Bonk, Bronisław Białek
 * Licensed under the MIT license.
 */

module.exports = function (grunt) {
	'use strict';

    var needle = require('needle');
    
	grunt.registerMultiTask(
		'flaticon', 'Grunt task to automatically download flaticon icons collection from config stored in JSON file',
        
		function flaticon() {
			var self = this;
			var files = this.files;
            var done = this.async();

			var options = this.options({
                url: 'http://html.flaticon.com/request/download.php',
                config: null,
                fonts: 'fonts',
                styles: 'css'
			});

			var configJson = grunt.file.readJSON(options.config);
            var flaticonResponse = null;
            
            console.log(JSON.stringify(configJson.icons));

            var data = {data: JSON.stringify(configJson.icons), acc: "font", scode: "4", uId: 0};

            console.log(options.url);
            needle.post(options.url, data, { multipart: true }, function (err, res, body) {
                console.log(body);
                if (err) {
                    grunt.log.error();
                    callback(err);
                } else {
                    grunt.log.ok();
                    grunt.log.debug('sid: ' + body);
                    callback(null, options, body);
                }
                
                done();
            });
		}
	);
};
