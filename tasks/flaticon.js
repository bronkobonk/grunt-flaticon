/*
 * grunt-flaticon
 *
 * Copyright (c) 2015 Marcin Bonk, Bronisław Białek
 * Licensed under the MIT license.
 */

module.exports = function (grunt) {
	'use strict';
    
	grunt.registerMultiTask(
		'flaticon', 'Grunt task to automatically download flaticon icons collection from config stored in JSON file',
        
		function flaticon() {
			var self = this;
			var files = this.files;

			var options = this.options({
                host: 'http://fontello.com',
                config: null,
                fonts: 'fonts',
                styles: 'css'
			});

			var configJson = null;
		}
	);
};
