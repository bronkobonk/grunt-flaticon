# grunt-flaticon

Grunt task to automatically download flaticon icons collection from config stored in JSON file

## Getting Started
This plugin requires Grunt.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

## Options

- config - path to flaticon.json configuration file
- fonts - path to directory where fonts will be downloaded
- styles - css or less file where icons classes will be stored
- cache_dir - directory for caching zip
- use_less - disable or enable generating style in less

## Example

Example configuration

	flaticon: {
		dist: {
			options: {
				config: 'flaticon.json',
				fonts: 'web/fonts/',
				styles: 'web/css/flaticon.less',
				cache_dir: 'app/cache/',
				template: 'css' // 'css', 'less' and 'scss' possible
			}
		}
	}

Example flaticon.json

	{
		"css_prefix_text": "flaticon-",
		"icons": {
		        {
		            "id": "128",
		            "team": 1,
		            "color": "#000000",
		            "name": "gear"
		        },
		        {
		            "id": "1981",
		            "team": 1,
		            "color": "#000000",
		            "name": "close"
		        }
		}
	}
