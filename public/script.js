function showImage(images, wideCount) {
  var container = document.getElementById('imageContainer');

  var containerWidth= 320;
  container.style.width = (containerWidth)+'px';
  var width = containerWidth / wideCount;
  
  var html = images.reduce(function(soFar, image) {
    return soFar + '<img style="float: left; width: '+width+'px; height: '+width+'px;" src="'+image+'" />'
    // return soFar + '<img style="width: '+width+'px; height: '+width+'px;" src="'+image+'" />'
  }, '');

  container.innerHTML = html;
}