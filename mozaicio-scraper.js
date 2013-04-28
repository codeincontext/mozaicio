var redis = require('redis')
  , redisClient = redis.createClient()
  , http = require('http')
  , fs = require('fs')
  , magick = require('imagemagick');

// image sizes:
//  - square: 75
//  - thumbnail: 100
//  - large square: 150


function addPages() {
  for (var i = 0; i < 10; i++) {
    addPage("http://api.flickr.com/services/rest/?method=flickr.photos.getRecent", i);
  }
  for (var i = 0; i < 3; i++) {
    addPage("http://api.flickr.com/services/rest/?method=flickr.interestingness.getList", i);
  }
}
setInterval(addPages, 5*60*1000);
addPages();


function addPage(base, page) {
  var flickrURL = base
                +"&per_page=200"
                +"&page="+page
                +"&extras=url_sq"
                +"&api_key=f67a476ced404de3a03ccb161012db59"
                +"&format=json"
                +"&nojsoncallback=1";
                
  http.get(flickrURL, function(res) {
    console.log("Got response: " + res.statusCode);
  
    var str = '';
    res.on('data', function (chunk) {
      str += chunk;
    });
    res.on('end', function () {
      var responseJSON = JSON.parse(str);
      // console.log(responseJSON)
      var photos = responseJSON['photos']['photo'];
      photos.forEach(doTheStuffForThisImageYea);
    });
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
}

function doTheStuffForThisImageYea(imageData) {
  var imageURL = imageData.url_sq;
  
  fetchImageAtURL(imageURL, function(localFileName) {
    processImageAtURL(localFileName, function(averageColour) {
      writeColourResultToDB(averageColour, imageURL, function() {
        cleanupImage(localFileName, function() {
          // process.exit(0);
        });
      });
    });
  });
}

var saveID = 0;
function fetchImageAtURL(url, callback) {
  var saveFileName = (saveID++)+".jpg";
  var file = fs.createWriteStream(saveFileName);
  var request = http.get(url, function(response) {
    response.pipe(file);
    response.on('end', function () {
        callback && callback(saveFileName)
    });
  });
}

function processImageAtURL(localFileName, callback) {
  magick.convert([localFileName, '-resize', '1x1', 'txt:'], function(err, stdout, stderr) {
    if (err) {console.log(err); return;}

    var output = stdout.split('\n')[1];
    var rgb = {
      r: +output.substr(6,3),
      g: +output.substr(10,3),
      b: +output.substr(14,3)
    }

    console.log(rgb)
    callback && callback(rgb)
  });
}

function writeColourResultToDB(colour, url, callback) {
  // 5 levels of accuracy:
  //  - 0.1:  25:25:25 (~15625 colours)
  //  - 0.08: 20:20:20 (~15625 colours)
  //  - 0.06: 15:15:15 (~3375 colours)
  //  - 0.04: 10:10:10 (~1000 colours)
  //  - 0.02: 5:5:5 (~125 colours)
  
  function insertImageWithAccuracy(factor){
    var roundedColour = {
      r: Math.round(colour.r*factor),
      g: Math.round(colour.g*factor),
      b: Math.round(colour.b*factor)
    }
    
    var key = 'mozaicio:images:'+factor+':'+roundedColour.r+':'+roundedColour.g+':'+roundedColour.b;
    redisClient.sadd(key, url);
  }
  
  insertImageWithAccuracy(0.1);
  insertImageWithAccuracy(0.08);
  insertImageWithAccuracy(0.06);
  insertImageWithAccuracy(0.04);
  insertImageWithAccuracy(0.02);
  insertImageWithAccuracy(0.01);

  
  callback && callback()

}
function cleanupImage(localFileName, callback) {
  fs.unlink(localFileName);
  callback && callback();
}