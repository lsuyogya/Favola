import '../styles/tw-input.css';
import '../styles/marquee.css';

// Initialize scroll tracking when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initScrollTracking();
  initAndResize(headerHeightOnBody);
});

// Import and execute marquee code after GSAP is ready
waitForGSAP().then(() => {
  // Import the marquee code from the separate file
  import('../gsap-marquee.js');
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
        markers: true,
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
      body.removeAttribute('data-scroll-top');
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
