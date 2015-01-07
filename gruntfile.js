/**
 * Created by 柏然 on 2014/12/12.
 */
var config = {
  concat: {
    flipBasic: {
      files: {
        'bin/flip.js': ['src/util.js', 'src/*.js', 'src/animations/*.js', 'src/interpolation/*.js'],
        'bin/Flip.js': ['bin/flip.js']
      }
    },
    flipExtra: {
      files: {
        'bin/flip_extra.js': ['src/util.js', 'src/*.js', 'src/animations/*.js', 'src/interpolation/*.js',
          'plugin/flip/*.js'],
        'bin/Flip_extra.js': ['bin/flip_extra.js']
      }
    },
    ng: {
      src: 'plugin/ng/*.js',
      dest: 'bin/ng.js'
    },
    test: {
      src: 'test/*.js',
      dest: 'bin/test.js'
    },
    options: {
      process: function (src, path) {
        if (path.indexOf('bin/flip') == 0) {
          return '(function(){*})();'.replace('*', src);
        }
        return src;
      },
      stripBanners: true
    }
  }
};
config.watch = {
  flipBasic: {
    files: 'src/**/*.js',
    tasks: ['concat:flipBasic'],
    options: {
      interrupt: true
    }
  },
  flipExtra: {
    files: ['src/**/*.js', 'plugin/flip/*.js'],
    tasks: ['concat:flipExtra'],
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
  },
  ng: {
    files: 'plugin/ng/*.js',
    tasks: ['concat:ng']
  }
};
config.uglify = {
  flip: {
    files: {
      'bin/flip.min.js': 'bin/flip.js',
      'bin/flip_extra.min.js': 'bin/flip_extra.js'
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
  grunt.registerTask('con-ugly', ['concat', 'uglify:flip']);
};