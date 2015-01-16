/**
 * Created by 柏然 on 2014/12/12.
 */
  function concat(prefix,postfix){
  prefix=prefix||'';
  if(postfix==undefined)postfix='.js';
  return function(name){return prefix+name+postfix}
}
var config = {
  concat: {
    flipBasic: {
      files: {
        'bin/flip.js': ['src/util.js', 'src/*.js', 'src/animations/*.js', 'src/interpolation/*.js'],
        'bin/Flip.js': ['bin/flip.js']
      }
    },
    ng: {
      src: 'plugin/ng/*.js',
      dest: 'bin/ng.js'
    },
    ng_test_suit:{
      src:['angular','angular-mocks'].map(function(name){
        return 'bower_components/'+name+'/'+name+'.js';
      }),
      dest:'bin/ng_test_suit.js'
    },
    editor_ng:{
      src: ['main','**/*'].map(concat('plugin/ng/editor/')),
      dest: 'bin/editor-ng.js'
    },
    editor_test:{
      src:'plugin/test/editor/*.js',
      dest:'bin/editor_test.js'
    },
    flip_test: {
      src: 'test/*.js',
      dest: 'bin/test.js'
    },
    jasmine:{
      src:['jasmine','jasmine-html','boot'].map(concat('bower_components/jasmine/lib/jasmine-core/')),
      dest:'bin/jasmine.js'
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
  flip_test: {
    files: 'test/*.js',
    tasks: ['concat:flip_test'],
    options: {
      interrupt: true
    }
  },
  editor_ng: {
    files: 'plugin/ng/editor/**/*.js',
    tasks: ['concat:editor_ng']
  },
  editor_test:{
    files: 'plugin/test/editor/*.js',
    tasks: ['concat:editor_test']
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
  grunt.registerTask('begin_editor',['concat:editor_test','concat:editor_ng','watch:editor_ng','watch:editor_test']);
  grunt.registerTask('con-ugly', ['concat', 'uglify:flip']);
};