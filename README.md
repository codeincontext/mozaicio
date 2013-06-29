mozaicio
========

Upload a photo, and this site generates it as a mosaic of flickr images. For Yahoo!'s hack europe hackday.

I'll deploy it somewhere soon for you to play with.

There are two node processes:

Ingester
---
mozaicio-scraper.js samples the average colour of new images uploaded to flickr, and places them into redis sets depending on their colour.


Server
---
- The web server accepts an image upload (using input type=file, so it works on mobile, too). 
- It then splits the image up into squares and gets the average colour of each square in the grid.
- For each average colour in the grid, it searches out redis sets for a flickr image with the same predominent colour.
- It then returns these images in the response html, so you now have a mozaic of flickr photos that (if you squint a bit) looks like your image


Details
---
Each image processed form flickr is stored in 5 redis sets. This means that over time, as the system has more images, we can return more accurate mosaics
```
  // 5 levels of accuracy:
  //  - 0.1:  25:25:25 (~15625 colours)
  //  - 0.08: 20:20:20 (~15625 colours)
  //  - 0.06: 15:15:15 (~3375 colours)
  //  - 0.04: 10:10:10 (~1000 colours)
  //  - 0.02: 5:5:5 (~125 colours)
```
