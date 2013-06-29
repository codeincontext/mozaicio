mozaicio (Yahoo! hack-europe hack)
========

Upload a photo, and this site generates it as a mosaic of smaller flickr images. I'll deploy it somewhere soon for you to play with.

There are two parts:

Ingester
---
mozaicio-scraper.js samples the average colour of new images uploaded to flickr, and places them into redis sets depending on their colour.


Server
---
- The web server accepts an image upload (using input type=file, so it works on mobile, too). 
- It then splits the image up into squares and gets the average colour of each square in the grid.
- For each average colour in the grid, it searches our redis sets for a flickr image with the same predominent colour (or as close as possible).
- It then puts these image urls back into a grid, so that the average colours match the average colours in your image
- It returns the result as HTML, and you get your photo back made out of smaller flickr images. It helps if you squint a bit


Details
---
The URL of each image processed from flickr is stored in 5 redis sets. The key of each set is derived from the RGB value of the colour, rounded to different amounts (giving multiple accuracy elvels).  This means that over time, as the system has more images, we can return more accurate mosaics.
```
  // 5 levels of accuracy:
  //          R  G  B
  //  - 0.1:  25:25:25 (~15625 colours)
  //  - 0.08: 20:20:20 (~15625 colours)
  //  - 0.06: 15:15:15 (~3375 colours)
  //  - 0.04: 10:10:10 (~1000 colours)
  //  - 0.02: 5:5:5 (~125 colours)
```
