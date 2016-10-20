'use strict'

var rd = require('rd');
var fs = require('fs');
var util = require('util');
var path = require('path');
var child_process = require('child_process');


module.exports =  function() {

  //获取当前用户所在路径
  var cwd = process.cwd();

  //获取用户的项目名称
  var args = process.argv.slice(2);
  var name = args[0];

  //生成用户项目路径
  var currentPath = path.join(cwd, name);

  //获取当前模块文件的完整绝对路径
  var templateDir = path.join(path.dirname(__dirname),'template');

  //拷贝模版目录下的文件至用户项目目录
  var cp = util.format('cp -rf %s %s', templateDir, currentPath);

  child_process.exec(cp, function(error) {
    if (error) {
      throw error;
    }
  });

  //遍历用户项目目录，修改部分文件名
  rd.each(currentPath, function(f, s, next) {
    //修改文件名
    
    console.log('f----------:'+f);
    if (f.indexOf('gitignore') >= 0 || f.indexOf('npmignore') >= 0
      || f.indexOf('jshintignore') >= 0 || f.indexOf('jshintrc') >= 0) {

        var newf = "." + path.basename(f);
        console.log('current---------:'+currentPath);
        var mv = util.format('mv %s %s/%s', f, currentPath, newf);
        console.log(mv);
        child_process.exec(mv, function(error) {
          if(error) {
            throw error;
          }
        });
      }

    if(f.indexOf('template') >= 0) {
      if (path.extname(f) === ".js") {
        var mv2 = util.format("mv %s/lib/template.js %s/lib/%s.js",
          currentPath, currentPath, name);

        child_process.exec(mv2, function(error, stdout, srderr) {
          if(error) {
            throw error;
          }
        })
      } else if (path.extname(f) === "") {
        var mv1 = util.format("mv %s/bin/template %s/bin/%s",
          currentPath, currentPath, name);

        child_process.exec(mv1, function(error, stdout, stderr) {
          if(error) {
            throw error;
          }
        })
      }
    }
    next();
  }, function(err) {
    if (err) {
      throw err;
    }
  });

};

