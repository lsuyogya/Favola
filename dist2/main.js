// Initialize scroll tracking when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initScrollTracking();
  initAndResize(headerHeightOnBody);
});

// Import and execute marquee code after GSAP is ready
waitForGSAP().then(() => {
  // Import the marquee code from the separate file
  gsap.registerPlugin(Observer);

  const scrollingText1 = gsap.utils.toArray('.rail-1 h4');
  const scrollingText2 = gsap.utils.toArray('.rail-2 h4');

  // Speed settings
  const IDLE_SPEED = 0.5; // Lower number = slower idle speed
  const SCROLL_SPEED_MULTIPLIER = 1.5; // Higher number = faster scroll speed

  const tl1 = horizontalLoop(scrollingText1, {
    repeat: -1,
    paddingRight: 30,
    speed: IDLE_SPEED, // Add initial speed
  });

  const tl2 = horizontalLoop(scrollingText2, {
    repeat: -1,
    paddingRight: 30,
    reversed: true,
    speed: IDLE_SPEED, // Add initial speed
  });

  Observer.create({
    onChangeY(self) {
      let factor = SCROLL_SPEED_MULTIPLIER;
      if (self.deltaY < 0) {
        factor *= -1;
      }
      gsap
        .timeline({
          defaults: {
            ease: 'none',
          },
        })
        .to(tl1, { timeScale: factor * SCROLL_SPEED_MULTIPLIER, duration: 0.2, overwrite: true })
        .to(
          tl2,
          { timeScale: -factor * SCROLL_SPEED_MULTIPLIER, duration: 0.2, overwrite: true },
          '<'
        )
        .to(tl1, { timeScale: factor / SCROLL_SPEED_MULTIPLIER, duration: 1 }, '+=0.3')
        .to(tl2, { timeScale: -factor / SCROLL_SPEED_MULTIPLIER, duration: 1 }, '<');
    },
  });

  /*
This helper function makes a group of elements animate along the x-axis in a seamless, responsive loop.

Features:
 - Uses xPercent so that even if the widths change (like if the window gets resized), it should still work in most cases.
 - When each item animates to the left or right enough, it will loop back to the other side
 - Optionally pass in a config object with values like "speed" (default: 1, which travels at roughly 100 pixels per second), paused (boolean),  repeat, reversed, and paddingRight.
 - The returned timeline will have the following methods added to it:
   - next() - animates to the next element using a timeline.tweenTo() which it returns. You can pass in a vars object to control duration, easing, etc.
   - previous() - animates to the previous element using a timeline.tweenTo() which it returns. You can pass in a vars object to control duration, easing, etc.
   - toIndex() - pass in a zero-based index value of the element that it should animate to, and optionally pass in a vars object to control duration, easing, etc. Always goes in the shortest direction
   - current() - returns the current index (if an animation is in-progress, it reflects the final index)
   - times - an Array of the times on the timeline where each element hits the "starting" spot. There's also a label added accordingly, so "label1" is when the 2nd element reaches the start.
 */
  function horizontalLoop(items, config) {
    items = gsap.utils.toArray(items);
    config = config || {};
    let tl = gsap.timeline({
        repeat: config.repeat,
        paused: config.paused,
        defaults: { ease: 'none' },
        onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100),
      }),
      length = items.length,
      startX = items[0].offsetLeft,
      times = [],
      widths = [],
      xPercents = [],
      curIndex = 0,
      pixelsPerSecond = (config.speed || 1) * 100,
      snap = config.snap === false ? (v) => v : gsap.utils.snap(config.snap || 1), // some browsers shift by a pixel to accommodate flex layouts, so for example if width is 20% the first element's width might be 242px, and the next 243px, alternating back and forth. So we snap to 5 percentage points to make things look more natural
      totalWidth,
      curX,
      distanceToStart,
      distanceToLoop,
      item,
      i;
    gsap.set(items, {
      // convert "x" to "xPercent" to make things responsive, and populate the widths/xPercents Arrays to make lookups faster.
      xPercent: (i, el) => {
        let w = (widths[i] = parseFloat(gsap.getProperty(el, 'width', 'px')));
        xPercents[i] = snap(
          (parseFloat(gsap.getProperty(el, 'x', 'px')) / w) * 100 + gsap.getProperty(el, 'xPercent')
        );
        return xPercents[i];
      },
    });
    gsap.set(items, { x: 0 });
    totalWidth =
      items[length - 1].offsetLeft +
      (xPercents[length - 1] / 100) * widths[length - 1] -
      startX +
      items[length - 1].offsetWidth * gsap.getProperty(items[length - 1], 'scaleX') +
      (parseFloat(config.paddingRight) || 0);
    for (i = 0; i < length; i++) {
      item = items[i];
      curX = (xPercents[i] / 100) * widths[i];
      distanceToStart = item.offsetLeft + curX - startX;
      distanceToLoop = distanceToStart + widths[i] * gsap.getProperty(item, 'scaleX');
      tl.to(
        item,
        {
          xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
          duration: distanceToLoop / pixelsPerSecond,
        },
        0
      )
        .fromTo(
          item,
          { xPercent: snap(((curX - distanceToLoop + totalWidth) / widths[i]) * 100) },
          {
            xPercent: xPercents[i],
            duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
            immediateRender: false,
          },
          distanceToLoop / pixelsPerSecond
        )
        .add('label' + i, distanceToStart / pixelsPerSecond);
      times[i] = distanceToStart / pixelsPerSecond;
    }
    function toIndex(index, vars) {
      vars = vars || {};
      Math.abs(index - curIndex) > length / 2 && (index += index > curIndex ? -length : length); // always go in the shortest direction
      let newIndex = gsap.utils.wrap(0, length, index),
        time = times[newIndex];
      if (time > tl.time() !== index > curIndex) {
        // if we're wrapping the timeline's playhead, make the proper adjustments
        vars.modifiers = { time: gsap.utils.wrap(0, tl.duration()) };
        time += tl.duration() * (index > curIndex ? 1 : -1);
      }
      curIndex = newIndex;
      vars.overwrite = true;
      return tl.tweenTo(time, vars);
    }
    tl.next = (vars) => toIndex(curIndex + 1, vars);
    tl.previous = (vars) => toIndex(curIndex - 1, vars);
    tl.current = () => curIndex;
    tl.toIndex = (index, vars) => toIndex(index, vars);
    tl.times = times;
    tl.progress(1, true).progress(0, true); // pre-render for performance
    if (config.reversed) {
      tl.vars.onReverseComplete();
      tl.reverse();
    }
    return tl;
  }
});
// Wait for SplitType to be available
waitForSplitType().then(() => {
  // Split the .txtContent text into words
  const txtContent = document.querySelector('.txtContent p');
  if (!txtContent) return;
  const split = new window.SplitType(txtContent, { types: 'words' });
  // Set initial color for all words
  split.words.forEach((word) => {
    word.style.transition = 'color 0.4s';
    word.style.color = '';
  });
  // GSAP ScrollTrigger animation
  if (window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    const parentSection = document.querySelector('.revealBannerSection');
    // Pin the section and animate each word individually as you scroll through the section
    window.gsap.to(split.words, {
      color: '#fff',
      stagger: {
        each: 0.05,
        ease: 'power1.inOut',
      },
      scrollTrigger: {
        trigger: parentSection,
        // start: `top top+=${getHeaderHeight()}`,
        // end: `bottom top+=${getHeaderHeight()}`, // extend scroll for more gradual effect
        start: `top bottom-=25%`,
        end: `center center+=${getHeaderHeight()}`, // extend scroll for more gradual effect
        scrub: true,
        // pin: true,
        markers: false,
        anticipatePin: 1,
        // pinSpacing: true,
        // Add padding to avoid abrupt pinning
        // onEnter: () => {
        //   document.body.style.paddingBottom = '200px';
        // },
        // onLeave: () => {
        //   document.body.style.paddingBottom = '';
        // },
        // onLeaveBack: () => {
        //   document.body.style.paddingBottom = '';
        // },
      },
    });
  }
});

// Wait for GSAP libraries to load
function waitForGSAP() {
  return new Promise((resolve) => {
    if (window.gsap && window.Observer) {
      resolve();
    } else {
      const checkInterval = setInterval(() => {
        if (window.gsap && window.Observer) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    }
  });
}

function waitForSplitType() {
  return new Promise((resolve) => {
    if (window.SplitType) {
      resolve();
    } else {
      const checkInterval = setInterval(() => {
        if (window.SplitType) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    }
  });
}

// Scroll tracking functionality
function initScrollTracking() {
  const body = document.body;
  const threshold = 10; // Consider "close to 0" as within 10px

  function updateScrollAttribute() {
    const scrollY = window.scrollY;
    if (scrollY <= threshold) {
      body.setAttribute('data-scroll-top', 'true');
    } else {
      body.removeAttribute('data-scroll-top', 'false');
    }
  }

  // Initial check
  updateScrollAttribute();

  // Add scroll event listener
  window.addEventListener('scroll', updateScrollAttribute, { passive: true });
}

function getHeaderHeight() {
  const header = document.querySelector('header');
  return header.offsetHeight;
}

function headerHeightOnBody() {
  const header = document.querySelector('header');
  const body = document.querySelector('body');
  body.style.setProperty('--header-height', `${header.offsetHeight}px`);
}

function initAndResize(callback) {
  callback();
  window.addEventListener('resize', callback);
}
