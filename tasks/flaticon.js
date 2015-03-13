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
                packageRequest: 'http://htm.flaticon.com/request/download.php',
                downloadUrl: 'http://www.flaticon.com/download/?t=524cf755f1fd6f30e8858a171b86b819&n=My%20Icons',
                config: null,
                fonts: 'fonts',
                styles: 'css'
			});

			var configJson = null;
		}
	);
};
