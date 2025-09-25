const lerp = (a, b, n) => (1 - n) * a + n * b;

class ImageItem {
  constructor(el) {
    this.el = el;
    this.rect = this.el.getBoundingClientRect();
  }
}

let mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let lastMousePos = { ...mousePos };
let cacheMousePos = { ...mousePos };

function handlePointerMove(ev) {
  if (ev.touches) {
    mousePos.x = ev.touches[0].clientX;
    mousePos.y = ev.touches[0].clientY;
  } else {
    mousePos.x = ev.clientX;
    mousePos.y = ev.clientY;
  }
}
window.addEventListener("mousemove", handlePointerMove);
window.addEventListener("touchmove", handlePointerMove);

class ImageTrail {
  constructor(container) {
    this.container = container;
    this.images = Array.from(container.querySelectorAll(".content_img")).map(
      (img) => new ImageItem(img)
    );
    this.imagesTotal = this.images.length;
    this.imgPosition = 0;
    this.zIndexVal = 1;
    this.activeImagesCount = 0;
    this.isIdle = true;
    this.threshold = 80;

    this.render = this.render.bind(this);
    requestAnimationFrame(this.render);
  }

  render() {
    // Smoothly interpolate cacheMousePos toward mousePos
    cacheMousePos.x = lerp(cacheMousePos.x, mousePos.x, 0.2);
    cacheMousePos.y = lerp(cacheMousePos.y, mousePos.y, 0.2);

    const dx = mousePos.x - lastMousePos.x;
    const dy = mousePos.y - lastMousePos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > this.threshold) {
      this.showNextImage();
      lastMousePos.x = mousePos.x;
      lastMousePos.y = mousePos.y;
    }

    requestAnimationFrame(this.render);
  }

  showNextImage() {
    this.imgPosition = (this.imgPosition + 1) % this.imagesTotal;
    const img = this.images[this.imgPosition];

    img.rect = img.el.getBoundingClientRect();

    this.zIndexVal++;
    img.el.style.zIndex = this.zIndexVal;
    img.el.style.opacity = 1;

    gsap.killTweensOf(img.el);

    const startX = cacheMousePos.x - img.rect.width / 2;
    const startY = cacheMousePos.y - img.rect.height / 2;
    const endX = mousePos.x - img.rect.width / 2;
    const endY = mousePos.y - img.rect.height / 2;

    gsap.fromTo(
      img.el,
      {
        x: startX,
        y: startY,
        scale: 1,
        opacity: 1,
      },
      {
        x: endX,
        y: endY,
        scale: 0.2,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        onComplete: () => {
          img.el.style.opacity = 0;
        },
      }
    );
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new ImageTrail(document.querySelector(".content"));
});

// const getPointerPos = (ev) => {
//   return {
//     x: ev.clientX,
//     y: ev.clientY,
//   };
// };

// const getMouseDistance = (mousePos, lastMousePos) => {
//   return Math.sqrt(
//     Math.pow(mousePos.x - lastMousePos.x, 2) +
//       Math.pow(mousePos.y - lastMousePos.y, 2)
//   );
// };

// const lerp = (a, b, n) => (1 - n) * a + n * b;

// class Image {
//   //   DOM = (el: null);
//   DOM = el;
//   rect = null;

//   constructor(el) {
//     this.DOM = el;
//     this.rect = this.DOM.el.getBoundingClientRect();
//   }
// }

// let mousePos, lastMousePos, cacheMousePos;
// mousePos = { x: 0, y: 0 };
// cacheMousePos = { ...mousePos };
// lastMousePos = { ...mousePos };

// const handlePointerMove = (ev) => {
//   if (ev.touches) {
//     mousePos = getPointerPos(ev.touches[0]);
//   } else {
//     mousePos = getPointerPos(ev);
//   }
// };

// class ImageTrail {
//   DOM = el;
//   images = [];
//   imagesTotal = 0;
//   imgPosition = 0;
//   zIndexVal = 1;
//   activeImagesCount = 0;
//   isIdle = true;
//   threshold = 80;

//   constructor(DOM_el) {
//     this.DOM = DOM_el;
//     this.images = [...this.DOM.el.querySelectorAll(".content_img")].map(
//       (img) => new Image(img)
//     );
//     this.imagesTotal = this.images.length;

//     const onPointerMoveEv = () => {
//       cacheMousePos = { ...mousePos };
//       requestAnimationFrame(() => this.render());
//       window.removeEventListener("mousemove", onPointerMoveEv);
//       window.removeEventListener("touchmove", onPointerMoveEv);
//     };

//     window.addEventListener("mousemove", onPointerMoveEv);
//     window.addEventListener("touchmove", onPointerMoveEv);
//   }

//   render() {
//     let distance = getMouseDistance(mousePos, lastMousePos);

//     cacheMousePos = lerp(cacheMousePos.x || mousePos.x, mousePos.x, 0.1);
//     cacheMousePos = lerp(cacheMousePos.y || mousePos.y, mousePos.y, 0.1);

//     if (distance > this.threshold) {
//       this.showNextImage();
//       lastMousePos = mousePos;
//     }

//     if (this.isIdle && this.zIndexVal !== 1) {
//       this.zIndexVal = 1;
//     }

//     requestAnimationFrame(() => this.render());
//   }

//   showNextImage() {
//     ++this.zIndexVal;
//     this.imgPosition =
//       this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
//     const img = this.images[this.imgPosition];

//     gsap.killTweensOf(img.DOM.el);

//     img.timeline = gsap
//       .timeline({
//         onStart: () => this.onImageActivated(),
//         onComplete: () => this.onImageDeactivated(),
//       })
//       .fromTo(
//         img.DOM.el,
//         {
//           opacity: 1,
//           scale: 1,
//           zIndex: this.zIndexVal,
//           x: cacheMousePos.x - img.rect.width / 2,
//           y: cacheMousePos.y - img.rect.height / 2,
//         },
//         {
//           duration: 0.4,
//           ease: "power1",
//           x: mousePos.x - img.rect.width / 2,
//           y: mousePos.y - img.rect.height / 2,
//         },
//         0
//       )
//       .to(
//         img.DOM.el,
//         {
//           duration: 0.4,
//           ease: "power3",
//           opacity: 0,
//           scale: 0.2,
//         },
//         0.4
//       );
//   }

//   onImageActivated() {
//     // ++this.activeImagesCount;
//     this.activeImagesCount++;
//     this.isIdle = false;
//   }

//   onImageDeactivated() {
//     // --this.activeImagesCount;
//     this.activeImagesCount--;
//     if (this.activeImagesCount === 0) {
//       this.isIdle = true;
//     }
//   }
// }

// document.addEventListener("DOMContentLoaded", () => {
//   new ImageTrail(document.querySelector(".content"));
//   //   window.addEventListener("mousemove", handlePointerMove);
//   //   window.addEventListener("touchmove", handlePointerMove);
// });
