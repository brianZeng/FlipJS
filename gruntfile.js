/**
 * Created by 柏然 on 2014/12/12.
 */
var config = {
  concat: {
    animation: {
      files: {
        'bin/flip.js': ['src/util.js', 'src/*.js', 'src/animations/*.js', 'src/interpolation/*.js'],
        'bin/Flip.js': ['bin/flip.js']
      }
    },
    test: {
      src: 'test/*.js',
      dest: 'bin/test.js'
    },
    options: {
      process: function (src, path) {
        if (path.indexOf('bin/flip.js') == 0)
          return '(function(){*})();'.replace('*', src);
        return src;
      },
      stripBanners: true
    }
  }
};
config.watch = {
  scripts: {
    files: 'src/**/*.js',
    tasks: ['concat:animation'],
    options: {
      interrupt: true
    }
  },
  test: {
    files: 'test/*.js',
    tasks: ['concat:test'],
    options: {
      interrupt: true
    }
  }
};
config.uglify = {
  flip: {
    files: {
      'bin/flip.min.js': 'bin/flip.js'
    }
  },
  atrk: {
    files: {
      "bin/atrk.min.js": "bin/atrk.js"
    }, options: {
      banner: '/* borian@vip.qq.com */'
    }
  }
};
module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.initConfig(config);
  grunt.registerTask('con-ugly', ['concat:animation', 'uglify:flip']);
};