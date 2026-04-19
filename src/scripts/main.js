import '../styles/tailwind.css';
import { handlePrivacyPolicyNoticeDismissal } from './privacy-policy.js';
import { handleThemeToggle } from './theme.js';
import { handleInfiniteScroll } from './infinite-scroll.js';
import { initAmbience } from './ambience.js';
import './github-card.js';
import './terminal-block.js';
import './code-block.js';

if (DEV_MODE) console.log('Dev mode is currently enabled.');

handlePrivacyPolicyNoticeDismissal();
handleThemeToggle();
handleInfiniteScroll();
initAmbience();
