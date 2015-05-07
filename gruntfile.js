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
    flip:{
      files:{
        'temp/flip_core.js':['src/flip.js','src/util.js','src/*.js'],
        'temp/flip_basic.js':['temp/flip_core.js','src/animations/*.js'],
        'temp/flip_extra.js':['temp/flip_core.js','src/animations/*.js','src/extra/*.js','src/interpolation/*.js'],
        'temp/flip_gl.js':['temp/flip_core.js','src/webgl/gl.js','src/webgl/base/GLRender.js','src/webgl/**/*.js'],
        'bin/flip.js':'temp/flip_basic.js',
        'bin/flip_extra.js':'temp/flip_extra.js',
        'bin/flip_gl.js':'temp/flip_gl.js'
      },
      options:{
        process:function(src,path){
          if(path.indexOf('temp')==0&&path!=='temp/flip_core.js')
            return '(function(){*})();'.replace('*', src);
          return src;
        },
        stripBanners:true
      }
    },
    ng_test_suit:{
      src:['angular','angular-mocks'].map(function(name){
        return 'bower_components/'+name+'/'+name+'.js';
      }),
      dest:'bin/ng_test_suit.js'
    },
    editor_ng:{
      src: ['main','**/*'].map(concat('plugin/editor/')),
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
    }
  }
};
config.watch = {
  flipBasic: {
    files: 'src/**/*.js',
    tasks: ['concat:flip'],
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
    files: 'plugin/editor/**/*.js',
    tasks: ['concat:editor_ng']
  },
  editro_style:{
    files:'plugin/editor/bss/*.scss',
    tasks:['changess:editor']
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
  },
  editor:{
    files:{
      'min/flip.min.js':'bin/flip.js',
      'min/ng.min.js':'bin/editor-ng.js'
    }
  }
};
config.changess={
  editor:{
    src:'plugin/editor/bss/*.scss',
    dest:'plugin/editor/styles/bss.css'
  }
};
config.jsdoc={
  flip:{
    src:['src/flip.js','src/animation.js','src/mat3.js','src/CssProxy.js','src/clock.js','src/promise.js'],
    dest:'jsdoc',
    options:{
      access:'public'
    }
  }
};
module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('changess-grunt');
  grunt.initConfig(config);
  grunt.registerTask('begin_editor',['concat:editor_test','concat:editor_ng','watch:editor_ng','watch:editor_test']);
  grunt.registerTask('con-ugly', ['concat', 'uglify:flip']);
  //grunt.registerTask('con-flip',['concat:flipCore','concat:flipBasic','concat:flipExtra','concat:flip'])
};