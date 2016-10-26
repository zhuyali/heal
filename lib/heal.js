'use strict'

var rd = require('rd');
var fs = require('fs');
var util = require('util');
var path = require('path');
var render = require('microtemplate').render;
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
  var templateDir = path.join(path.dirname(__dirname), 'template');

  //拷贝模版目录下的文件至用户项目目录
  var cp = util.format('cp -rf %s %s', templateDir, currentPath);

  child_process.exec(cp, function(error) {

    if (error) {
      throw error;
    }
    //遍历用户项目目录，修改部分文件名
    rd.eachSync(currentPath, function(f, s) {
      //修改文件名
      const list = ['gitignore', 'npmignore', 'jshintignore', 'jshintrc'];

      if (!!~list.indexOf(path.basename(f))) {
        fs.renameSync(f, path.resolve(f, '..', `.${path.basename(f)}`));
      }

      if (path.basename(f) === '<#=template#>.js') {
        fs.renameSync(f, path.resolve(f, '..', `${name}.js`));
      }

      if (path.basename(f) === '<#=template#>') {
        fs.renameSync(f, path.resolve(f, '..', `${name}`));
      }
    });

    rd.eachSync(currentPath, function(f, s) {
      if (fs.existsSync(f) && fs.statSync(f).isFile()) {
        var content = fs.readFileSync(f, 'utf8');
        content = render(content, {
          template: name
        }, {
          tagOpen: '<#',
          tagClose: '#>'
        });
        fs.writeFileSync(f, content, 'utf8');
      }
    })
  });
}

