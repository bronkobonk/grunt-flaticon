exports.fontello = {
    setUp: function(done) {
        // setup here if necessary
        done();
    },
    options: function(test) {
        // test.expect(1);
        // test.ok(grunt.task.run('fontello'), 'task failed!');
        test.done();
    },
    output: function(test) {
        test.ok(grunt.file.exists(grunt.config('flaticon.test.options.config')), 'config file not found.');
        test.done();
    },
};