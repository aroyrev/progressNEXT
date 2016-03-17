module.exports = function(grunt) {

  grunt.initConfig({
	  nodemon: {
	    dev: {
	      options: {
	        file: 'app.js',
	        ignoredFiles: ['node_modules/**', 'public/**'],
	        watchedExtensions: ['js']
	      }
	    }
    },
    concurrent: {
  	    dev: {
  	      tasks: ['nodemon'],
  	      options: {
  	        logConcurrentOutput: true
  	      }
  	    }
  	 }
});

 grunt.loadNpmTasks('grunt-contrib-coffee');
 grunt.loadNpmTasks('grunt-concurrent');
 grunt.loadNpmTasks('grunt-contrib-watch');
 grunt.loadNpmTasks('grunt-nodemon');
 grunt.loadNpmTasks('grunt-contrib-uglify');
 grunt.loadNpmTasks('grunt-contrib-copy');

 grunt.registerTask('default', ['concurrent']);
};
