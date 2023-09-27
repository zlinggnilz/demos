export default function (selectorName, params) {
  //assigning params
  const selector = document.querySelector(selectorName);
  const imagePath = params.imagePath;
  const totalImages = params.totalImages;
  const imageExtension = params.imageExtension || 'jpg';
  let isMoving = false;
  let currentX = 0;
  let currentImage = 1;

  function mouseDownFn(target) {
    isMoving = true;
    currentX = target.pageX - selector.offsetLeft;
  }

  function mouseupFn() {
    isMoving = false;
  }

  function mousemoveFn(target) {
    if (isMoving == true) {
      loadAppropriateImage(target.pageX - selector.offsetLeft);
    }
  }

  function touchstartFn(target) {
    // console.log("🚀 ~ file: 3dEye.ts:27 ~ touchstartFn ~ target:", target)
    console.log('touchstart : isMoving=' + isMoving);
    isMoving = true;

    //store the start position
    const actualTouch = target.touches[0] || target.changedTouches[0];
    currentX = actualTouch.clientX;
  }

  function touchendFn() {
    console.log('touchend : isMoving=' + isMoving);
    isMoving = false;
  }

  function touchmoveFn(target) {
    // console.log("🚀 ~ file: 3dEye.ts:42 ~ touchmoveFn ~ target:", target)
    console.log('touchmove : isMoving=' + isMoving);
    target.preventDefault();
    const actualTouch = target.touches[0] || target.changedTouches[0];
    if (isMoving == true) {
      loadAppropriateImage(actualTouch.pageX - selector.offsetLeft);
    } else {
      currentX = actualTouch.pageX - selector.offsetLeft;
    }
  }

  function assignOperations() {
    selector.addEventListener('mousedown', mouseDownFn, false);
    selector.addEventListener('mousemove', mousemoveFn, false);
    selector.addEventListener('touchstart', touchstartFn, false);
    selector.addEventListener('touchmove', touchmoveFn, false);

    document.addEventListener('mouseup', mouseupFn, false);
    document.addEventListener('touchend', touchendFn, false);
  }

  function loadAppropriateImage(newX) {
    if (currentX - newX > 25) {
      console.log('currentX =' + currentX + ' newX =' + newX);
      console.log('currentX-newX=' + (currentX - newX));
      currentX = newX;
      currentImage = ++currentImage > totalImages ? 1 : currentImage;
      // currentImage = --currentImage < 1 ? totalImages : currentImage;
      console.log('currentImage=' + currentImage);
      selector.style.backgroundImage = 'url(' + imagePath + currentImage + '.' + imageExtension + ')';
    } else if (currentX - newX < -25) {
      console.log('currentX =' + currentX + ' newX =' + newX);
      console.log('currentX-newX=' + (currentX - newX));
      currentX = newX;
      currentImage = --currentImage < 1 ? totalImages : currentImage;
      // currentImage = ++currentImage > totalImages ? 1 : currentImage;
      console.log('currentImage=' + currentImage);
      selector.style.backgroundImage = 'url(' + imagePath + currentImage + '.' + imageExtension + ')';
    }
  }

  function forceLoadAllImages() {
    //load the first image
    let loadedImages = 1;
    let appropriateImageUrl = imagePath + '1.' + imageExtension;
    selector.style.backgroundImage = 'url(' + appropriateImageUrl + ')';

    //load all other images by force
    for (let n = 1; n <= totalImages; n++) {
      appropriateImageUrl = imagePath + n + '.' + imageExtension;
      // console.log("🚀 ~ file: 3dEye.ts:102 ~ forceLoadAllImages ~ appropriateImageUrl:", appropriateImageUrl)
      // const img = document.createElement('img');
      // img.src = appropriateImageUrl;
      // img.style.display = 'none';

      const _img = new Image();
      _img.onload = function () {
        loadedImages++;
        if (loadedImages >= totalImages) {
          const VCc = document.querySelector('#VCc');
          VCc.removeAttribute('class');
          VCc.innerHTML = '';
        }
      };
      _img.src = appropriateImageUrl;
    }
  }

  function initializeOverlayDiv() {
    selector.innerHTML =
      "<div id='VCc' style='height:100%;width:100%;transition: background 0.3s;' class='d-flex align-center justify-center bg-white'>加载中</div>";
  }

  function destroy() {
    selector.removeEventListener('mousedown', mouseDownFn);
    selector.removeEventListener('mousemove', mousemoveFn);
    selector.removeEventListener('touchstart', touchstartFn);
    selector.removeEventListener('touchmove', touchmoveFn);

    document.removeEventListener('mouseup', mouseupFn);
    document.removeEventListener('touchend', touchendFn);
  }

  initializeOverlayDiv();
  forceLoadAllImages();
  //loadAppropriateImage();
  assignOperations();

  return { destroy };
}
