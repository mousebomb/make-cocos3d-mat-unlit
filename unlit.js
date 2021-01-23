var fs = require('fs');//引用文件系统模块
const path = require('path');

function readFileList(path, filesList) {
  var files = fs.readdirSync(path);
  files.forEach(function (itm, index) {
    var stat = fs.statSync(path + itm);
    if (stat.isDirectory()) {
      //递归读取文件
      readFileList(path + itm + "/", filesList)
    } else {

      var obj = {};//定义一个对象存放文件的路径和名字
      obj.path = path;//路径
      obj.filename = itm//名字
      filesList.push(obj);
    }

  })

}
var getFiles = {
  //获取文件夹下的所有文件
  getFileList: function (path) {
    var filesList = [];
    readFileList(path, filesList);
    return filesList;
  },
};
//获取文件夹下的所有文件
let fileLists = getFiles.getFileList('./');

console.log("readFileList/",fileLists.length);

fileLists.forEach(item => {
  if (path.extname(item.filename) === '.mtl') {
    fs.readFile(`./${item.filename}`, 'utf8', function (err, data) {
      if (err) throw err;
      let matVO = JSON.parse(data);

      const keys = Object.keys(matVO);
      const filename = item.filename.replace(path.extname(item.filename), '');
      let target = { code: filename };
      let newData = Object.assign(target, matVO[keys]);
      newData.code = filename;
      // 修改文件为unlit

      matVO._effectAsset.__uuid__ = "a3cd009f-0ab0-420d-9278-b9fdab939bbc";
      matVO._techIdx = 1;//透明1 opaque0
      matVO._defines= [
        {
          "USE_TEXTURE": true,
          "USE_ALPHA_TEST": true
        }];
      matVO._states=[
        {
          "blendState": {
            "targets": [
              {}
            ]
          },
          "depthStencilState": {
            "depthWrite": true
          },
          "rasterizerState": {}
        }
      ];

      if ( matVO._props.length == 1)
      {
        let props=matVO._props [0];

        delete props.albedoScale;
        delete props.metallic;
        delete props.roughness;

        props.alphaThreshold =  0.5;

        matVO._props = [props];
      }

      // console.log(item.filename,matVO);

      // 将内容写入文件
      fs.writeFile(`./${item.filename}`, JSON.stringify(matVO,null,4), 'utf8', (err) => {
        if (err) throw err;
        // console.log('success done');
      });
    })
  }
});

