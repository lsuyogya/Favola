import '../styles/tw-input.css';
import '../styles/marquee.css';

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

// Import and execute marquee code after GSAP is ready
waitForGSAP().then(() => {
  // Import the marquee code directly
  const marqueeCode = `
    gsap.registerPlugin(Observer);
    alert('script loaded');
    
    const scrollingText1 = gsap.utils.toArray('.rail-1 h4');
    const scrollingText2 = gsap.utils.toArray('.rail-2 h4');
    
    // Speed settings
    const IDLE_SPEED = 0.5;
    const SCROLL_SPEED_MULTIPLIER = 1.5;
    
    const tl1 = horizontalLoop(scrollingText1, {
      repeat: -1,
      paddingRight: 30,
      speed: IDLE_SPEED,
    });
    
    const tl2 = horizontalLoop(scrollingText2, {
      repeat: -1,
      paddingRight: 30,
      reversed: true,
      speed: IDLE_SPEED,
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
        snap = config.snap === false ? (v) => v : gsap.utils.snap(config.snap || 1),
        totalWidth,
        curX,
        distanceToStart,
        distanceToLoop,
        item,
        i;
      gsap.set(items, {
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
        Math.abs(index - curIndex) > length / 2 && (index += index > curIndex ? -length : length);
        let newIndex = gsap.utils.wrap(0, length, index),
          time = times[newIndex];
        if (time > tl.time() !== index > curIndex) {
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
      tl.progress(1, true).progress(0, true);
      if (config.reversed) {
        tl.vars.onReverseComplete();
        tl.reverse();
      }
      return tl;
    }
  `;

  // Execute the marquee code
  eval(marqueeCode);
});
