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
  // Import the marquee code from the separate file
  import('../gsap-marquee.js');
});
