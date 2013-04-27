var redis = require('redis')
  , redisClient = redis.createClient()

getFlickrImageForColour({r: 150, g: 150, b: 130});
  
function getFlickrImageForColour(colour, callback) {
  // 5 levels of accuracy:
  //  - 0.1:  25:25:25 (~15625 colours)
  //  - 0.08: 20:20:20 (~8000 colours)
  //  - 0.06: 15:15:15 (~3375 colours)
  //  - 0.04: 10:10:10 (~1000 colours)
  //  - 0.02: 5:5:5 (~125 colours)
  
  function findImageWithAccuracy(factor, callback){
    var roundedColour = {
      r: Math.round(colour.r*factor),
      g: Math.round(colour.g*factor),
      b: Math.round(colour.b*factor)
    }
    
    var key = 'mozaicio:images:'+factor+':'+roundedColour.r+':'+roundedColour.g+':'+roundedColour.b;
    redisClient.srandmember(key, function(err, member) {
      
      if (member) {
        callback && callback(member)
      } else {
        var newFactor = factor-0.2;
        
        if (newFactor > 0) {
          findImageWithAccuracy(newFactor, callback);
        } else {
          console.log('nope. Couldn\'t find');
          callback && callback()
        }
      }
    });
  }
  
  findImageWithAccuracy(0.1, function(imageURL) {
    console.log(imageURL);
  });
}