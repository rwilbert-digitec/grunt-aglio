'use strict';

var path = require('path');
var tmpFile = require('tempfile');
var fs = require('fs');



module.exports = function(grunt) {
    var _ = grunt.util._, aglio = require('aglio');
    grunt.registerMultiTask('aglio', 'Grunt plugin to generate aglio documentation', function() {
        var done = this.async();
        // Merge task-specific and/or target-specific options with these defaults.

        var default_options = {
            seperator: "",
            theme: "default",
            filter: function(src){
                return src;
            }
        };

        var options = _.extend(default_options, this.data);

        // wrap in object so we can update template by reference if custom
        var aglioOptions = {
            template: options.theme
        };

        // Make sure that the given theme exists
        aglio.getTemplates(function (err, names) {
            if(err){
                grunt.log.warn(err);
            }
            if(!_.contains(names, aglioOptions.template)){
                // Is a custom theme file presented
                aglioOptions.template = path.resolve(aglioOptions.template) + '.jade';
                if(!grunt.file.exists(aglioOptions.template)) {
                    grunt.log.warn(aglioOptions.template+" theme does not exist, reverting to the default theme");
                    aglioOptions.template = "default";
                }
            }
        });



        this.files.forEach(function(f){
            var tempfile = tmpFile('asd');
            f.src.filter(function(path){
                if ( grunt.file.exists(path)){
                    fs.appendFileSync(tempfile , grunt.file.read(path) )
                    fs.appendFileSync(tempfile, options.separator);
                }else{
                    grunt.log.warn(path + " does not exist");
                }
            });
            aglio.renderFile(tempfile , f.dest , aglioOptions.template , function(err){
                if ( err){
                    grunt.log.warn(err);
                }
            });
            grunt.log.ok("Written to " + f.dest )
        });
    }); //multitask


};
