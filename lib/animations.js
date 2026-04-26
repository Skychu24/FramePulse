// Dynamic import for animejs to work with Next.js SSR
let anime = null;

const loadAnime = async () => {
  if (!anime) {
    const animeModule = await import('animejs');
    anime = animeModule.default || animeModule;
  }
  return anime;
};

/**
 * Staggered slide-up entrance animation for video cards
 * @param {string|NodeList} selector - CSS selector or NodeList of elements to animate
 * @param {number} delay - Delay between each element animation (default: 100ms)
 * @param {number} duration - Duration of each animation (default: 800ms)
 */
export const staggeredSlideUp = async (selector, delay = 100, duration = 800) => {
  const animeLib = await loadAnime();
  animeLib({
    targets: selector,
    translateY: [30, 0],
    opacity: [0, 1],
    delay: animeLib.stagger(delay),
    duration: duration,
    easing: 'easeOutQuart',
  });
};

/**
 * Subtle glow-pulse effect on hover for video cards
 * @param {string|NodeList} selector - CSS selector or NodeList of elements
 * @param {string} glowColor - CSS color for the glow effect (default: crimson)
 */
export const glowPulseHover = async (selector, glowColor = '#DC143C') => {
  const animeLib = await loadAnime();
  animeLib({
    targets: selector,
    boxShadow: [
      '0 0 5px rgba(220, 20, 60, 0.3)',
      '0 0 20px rgba(220, 20, 60, 0.6)',
      '0 0 5px rgba(220, 20, 60, 0.3)'
    ],
    duration: 2000,
    easing: 'easeInOutSine',
    loop: true,
    direction: 'alternate',
  });
};

/**
 * Initialize video card animations when component mounts
 * @param {string} containerSelector - Container selector for video cards
 */
export const initializeVideoCardAnimations = async (containerSelector = '.video-card') => {
  const animeLib = await loadAnime();
  
  // Initial staggered entrance
  await staggeredSlideUp(containerSelector, 100, 800);
  
  // Add hover effects
  const cards = document.querySelectorAll(containerSelector);
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      animeLib({
        targets: card,
        scale: 1.05,
        duration: 300,
        easing: 'easeOutQuart',
      });
      
      glowPulseHover(card, '#DC143C');
    });
    
    card.addEventListener('mouseleave', () => {
      animeLib({
        targets: card,
        scale: 1,
        duration: 300,
        easing: 'easeOutQuart',
      });
    });
  });
};

/**
 * Animate page background elements for Cyber-Noir effect
 */
export const animateBackgroundElements = async () => {
  const animeLib = await loadAnime();
  
  // Animate gradient orbs
  animeLib({
    targets: '.gradient-orb',
    translateX: () => animeLib.random(-50, 50),
    translateY: () => animeLib.random(-50, 50),
    scale: [1, 1.1, 1],
    duration: () => animeLib.random(8000, 12000),
    easing: 'easeInOutSine',
    loop: true,
    direction: 'alternate',
  });
  
  // Animate scanline effect
  animeLib({
    targets: '.scanline-effect',
    opacity: [0.015, 0.03, 0.015],
    duration: 4000,
    easing: 'easeInOutSine',
    loop: true,
  });
};

/**
 * Animate search bar focus effect
 * @param {string} selector - Search bar selector
 */
export const animateSearchBar = async (selector = '.neon-search') => {
  const animeLib = await loadAnime();
  const searchBars = document.querySelectorAll(selector);
  
  searchBars.forEach(bar => {
    bar.addEventListener('focus', () => {
      animeLib({
        targets: bar,
        boxShadow: [
          '0 0 0 0 rgba(220, 20, 60, 0.4)',
          '0 0 0 10px rgba(220, 20, 60, 0.1)',
          '0 0 0 20px rgba(220, 20, 60, 0)'
        ],
        duration: 600,
        easing: 'easeOutQuart',
      });
    });
  });
};

/**
 * Animate corner decorations
 */
export const animateCornerDecorations = async () => {
  const animeLib = await loadAnime();
  animeLib({
    targets: '.corner-decoration',
    opacity: [0.3, 0.6, 0.3],
    duration: 3000,
    easing: 'easeInOutSine',
    loop: true,
    direction: 'alternate',
  });
};

/**
 * Animate FramePulse logo with rhythmic pulse effect
 */
export const animateFramePulseLogo = async () => {
  const animeLib = await loadAnime();
  animeLib({
    targets: '.framepulse-logo',
    scale: [1, 1.1, 1],
    opacity: [1, 0.8, 1],
    duration: 2000,
    easing: 'easeInOutSine',
    loop: true,
    direction: 'alternate',
  });
};
