var fs = require('fs');
var gifsicle = require('gifsicle');
var execFile = require('child_process').execFile;
var async = require('async');
var images = require('images');

var tempLocation = "./.tmpGifExplode";

module.exports = function(src, dest, cb) {

  // create or empty temp dir
  if (!fs.existsSync(tempLocation)) {
    fs.mkdirSync(tempLocation);
  } else {
    rmDir(tempLocation, false);
  }
  // copy origin gif to temp dir
  // gifsicle outputs to same dir as input
  copyFile(src, tempLocation + '/' + src, function(err) {

    if (err) {
      console.log("Copyfile err", err);
      cb(err);
      return;
    }


    //console.log("gifsicle path", gifsicle);

    execFile(gifsicle, ['-e', '-U', src], {
      cwd: tempLocation
    }, function(err) {
        if (err) {
      console.log("gifsicle err", err);
      cb(err);
      return;
    }
      //console.log('gif in frames!');
      // frames arde done
      // remove original gif
      fs.unlinkSync(tempLocation + '/' + src);

      // all files
      var files = fs.readdirSync(tempLocation);
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest);
      }
      async.map(files, function(file, callback) {
        var tmpFrame = images(tempLocation + '/' + file);

        tmpFrame.save(dest + '/' + file + ".png", {
          quality: 100
        });
        callback();

      }, function(err) {
        if (!err) {
          rmDir(tempLocation, false);
          var files = fs.readdirSync(dest);
          cb(null, files);
        } else {
          console.log("there was an error", err);
          cb(err);
        }
      })



      //cb();
    });
  });
}



function rmDir(dirPath, removeSelf) {
  if (removeSelf === undefined)
    removeSelf = true;
  try {
    var files = fs.readdirSync(dirPath);
  } catch (e) {
    return;
  }
  if (files.length > 0)
    for (var i = 0; i < files.length; i++) {
      var filePath = dirPath + '/' + files[i];
      if (fs.statSync(filePath).isFile())
        fs.unlinkSync(filePath);
      else
        rmDir(filePath);
    }
  if (removeSelf)
    fs.rmdirSync(dirPath);
};



function copyFile(source, target, cb) {
  var cbCalled = false;

  var rd = fs.createReadStream(source);
  rd.on("error", function(err) {
    done(err);
  });
  var wr = fs.createWriteStream(target);
  wr.on("error", function(err) {
    done(err);
  });
  wr.on("close", function(ex) {
    done();
  });
  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }
}