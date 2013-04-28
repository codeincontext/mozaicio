var redis = require('redis')
  , redisClient = redis.createClient()
  , path = require('path')
  , http = require('http')
  , express = require('express');

var app = exports.app = express();

app.configure(function(){
  app.set('port', 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.logger('dev'));
});

// app.get('/', routes.index);
app.get('/image_for_colour', function(req, res) {
  var rgb = {r: +req.param('r'), g: +req.param('g'), b: +req.param('b')};
  getFlickrImageForColour(rgb, function(imageURL) {
    if (imageURL)
      res.redirect(imageURL);
    else
      res.send(' ')
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
  
function getFlickrImageForColour(colour, callback) {
  // 5 levels of accuracy:
  //  - 0.1:  25:25:25 (~15625 colours)
  //  - 0.08: 20:20:20 (~8000 colours)
  //  - 0.06: 15:15:15 (~3375 colours)         me too. what you up to?
  //  - 0.04: 10:10:10 (~1000 colours)
  //  - 0.02: 5:5:5 (~125 colours)
  
  var factors = [0.1, 0.08, 0.06, 0.04, 0.02, 0.01];
  function findImageWithAccuracy(factor, callback){
    var roundedColour = {
      r: Math.round(colour.r*factors[factor]),
      g: Math.round(colour.g*factors[factor]),
      b: Math.round(colour.b*factors[factor])
    }
    
    var key = 'mozaicio:images:'+factors[factor]+':'+roundedColour.r+':'+roundedColour.g+':'+roundedColour.b;
    redisClient.srandmember(key, function(err, member) {
      if (member) {
        callback && callback(member)
      } else {
        var newFactor = factor+1;
        console.log(newFactor)
        if (newFactor < factors.length) {
          findImageWithAccuracy(newFactor, callback);
        } else {
          console.log('nope. Couldn\'t find');
          callback && callback()
        }
      }
    });
  }
  
  findImageWithAccuracy(0, callback);
}