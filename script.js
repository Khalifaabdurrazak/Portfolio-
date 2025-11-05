/* =========================
   Small helpers & init
   ========================= */
document.getElementById('year').textContent = new Date().getFullYear();

/* Replace social links with your real profiles */
document.getElementById('github-link').href = "https://github.com/your-username";
document.getElementById('linkedin-link').href = "https://www.linkedin.com/in/your-username";
document.getElementById('twitter-link').href = "https://x.com/your-username";
document.getElementById('resume-link').href = "#"; 
document.getElementById('certs-link').href = "#"; 

/* =========================
   Typing animation (simple)
   ========================= */
const typingEl = document.getElementById('typing');
const phrases = ["Front-End Developer", "Backend Developer", "Cybersecurity Analyst / pentest"];
let ti = 0, pj = 0, direction = 1;

function typeLoop() {
  const current = phrases[ti];
  if (direction === 1) {
    typingEl.textContent = current.slice(0, ++pj);
    if (pj === current.length) { direction = -1; setTimeout(typeLoop, 1000); return; }
  } else {
    typingEl.textContent = current.slice(0, --pj);
    if (pj === 0) { direction = 1; ti = (ti+1)%phrases.length; }
  }
  setTimeout(typeLoop, direction === 1 ? 80 : 30);
}
typeLoop();

/* =======================================
   DYNAMIC WEATHER CYCLE LOGIC (20s Repeat: Storm <-> Sunshine)
   ======================================= */
const body = document.body;
const rainContainer = document.getElementById('rain-container');
const sunElement = document.getElementById('sun-element');
const navbar = document.querySelector('.navbar');

const NUM_DROPS = 70; 
// Total cycle is 60000ms (60 seconds)
const TRANSITION_TIME = 5000; // 3 seconds for the gradual fade
const ACTIVE_STATE_DURATION = 30000 - TRANSITION_TIME; // 27 seconds of active weather
const CYCLE_DURATION = 100000; // Total cycle length

let isStorm = true; // Start in Storm mode

// 1. Raindrop Generation
function createRain() {
    if (rainContainer.children.length === 0) {
        for (let i = 0; i < NUM_DROPS; i++) {
            const drop = document.createElement('div');
            drop.classList.add('rain-drop');
            drop.style.left = `${Math.random() * 100}%`;
            drop.style.animationDuration = `${0.3 + Math.random() * 0.4}s`; 
            drop.style.animationDelay = `${-Math.random() * 12}s`;
            drop.style.opacity = `${0.4 + Math.random() * 0.6}`;
            rainContainer.appendChild(drop);
        }
    }
}
createRain(); // Initial call to create rain

// --- Main Cycle Function ---
function startWeatherCycle() {
    // Clear canvas regardless, for a clean transition
    ctx.clearRect(0, 0, w, h);

    if (isStorm) {
        // --- TRANSITION: STORM to SUNSHINE ---
        
        // 1. Start fading out rain/lightning IMMEDIATELY by adding the 'fading' class.
        rainContainer.classList.add('fading');

        // 2. Wait for the TRANSITION_TIME (3 seconds) before applying the full sunshine theme.
        setTimeout(() => {
            body.classList.add('sunshine');
            navbar.classList.add('sunshine');
            sunElement.classList.add('shining');
            
            // Critical: Ensure the theme change looks smooth by matching the CSS transition time.
        }, TRANSITION_TIME); 

    } else {
        // --- TRANSITION: SUNSHINE to STORM ---
        
        // 1. Remove sunshine classes IMMEDIATELY. This starts the CSS transition back to the dark theme.
        body.classList.remove('sunshine');
        navbar.classList.remove('sunshine');
        sunElement.classList.remove('shining');
        
        // 2. Start fading in rain after the full transition time.
        // The dark theme is now active, so the rain can fade back in (remove 'fading' class).
        setTimeout(() => {
             rainContainer.classList.remove('fading');
        }, TRANSITION_TIME);
    }

    // Toggle the state for the next cycle
    isStorm = !isStorm;
}

// 2. Timed Transition
// Call the function initially to start the first transition (Storm -> Sunshine)
setTimeout(startWeatherCycle, ACTIVE_STATE_DURATION); 

// Then, set an interval to repeat the full cycle (60 seconds)
setInterval(startWeatherCycle, CYCLE_DURATION);


/* ======================================
   Lightning Strike (Canvas) - REALISTIC LINES
   ====================================== */
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let w = canvas.width = innerWidth;
let h = canvas.height = innerHeight;

function resize(){
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
    // Re-generate rain and clear canvas on resize
    rainContainer.innerHTML = '';
    createRain();
}
addEventListener('resize', resize);

// Lightning variables
let flashTime = 0;
const MIN_INTERVAL = 3000; 
const MAX_INTERVAL = 10000;
let nextFlashTime = Date.now() + MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);

// Simple utility function
function rand(min, max){ return Math.random() * (max - min) + min; }

// Recursive function to create a branching line (fractal-like)
function generateLightning(x, y, angle, length, branchChance) {
    if (length < 3 || Math.random() > 0.95) return;

    ctx.lineTo(x, y);

    const nx = x + Math.cos(angle) * length;
    const ny = y + Math.sin(angle) * length;
    
    ctx.lineTo(nx, ny);

    if (Math.random() < branchChance) {
        ctx.moveTo(nx, ny);
        generateLightning(nx, ny, angle + rand(-0.4, 0.4), length * rand(0.6, 0.9), branchChance * 0.8);
    }

    generateLightning(nx, ny, angle + rand(-0.2, 0.2), length * rand(0.7, 0.9), branchChance);
}


function drawLightning() {
    ctx.beginPath();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#FFFFFF';
    ctx.shadowBlur = flashTime / 4; 
    
    ctx.moveTo(w / 2, 0); 
    generateLightning(w / 2, 0, Math.PI / 2, 40, 0.5); 

    ctx.stroke();
}


let lightningRequestId;
function lightningAnimate(){
    ctx.clearRect(0, 0, w, h);

    // Only draw lightning if we are in the storm state
    if (isStorm) {
        if (Date.now() > nextFlashTime) {
            flashTime = 50; 
            nextFlashTime = Date.now() + MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);
        }

        if (flashTime > 0) {
            drawLightning();
            flashTime -= 5;
        }
    }

    lightningRequestId = requestAnimationFrame(lightningAnimate);
}

lightningAnimate();

/* =========================
   Intersection Observer for reveal animations & progress bars
   ========================= */
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('show');
      // progress bars
      const bars = entry.target.querySelectorAll('.progress-bar');
      bars.forEach(bar=>{
        const target = bar.dataset.width;
        if(target){
          bar.style.width = target + '%';
          bar.classList.add('bg-primary');
        }
      });
    }
  });
},{threshold:0.15});
revealEls.forEach(el => observer.observe(el));

/* =========================
   Project filtering
   ========================= */
const filterBtns = document.querySelectorAll('.filter-btn');
const projectItems = document.querySelectorAll('.project-item');

filterBtns.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    filterBtns.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    projectItems.forEach(item=>{
      const cat = item.dataset.category;
      if(filter === 'all' || cat === filter) {
        item.style.display = '';
        item.classList.add('show');
      } else {
        item.style.display = 'none';
      }
    });
  });
});

/* =========================
   Contact form (EmailJS)
   ========================= */
(function(){
  if(window.emailjs) {
    emailjs.init('YOUR_USER_ID'); // <-- replace this
  }
})();

const form = document.getElementById('contact-form');
const statusEl = document.getElementById('form-status');
form.addEventListener('submit', function(e){
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();
  if(!name || !email || !message) return;

  const btn = document.getElementById('send-btn');
  btn.disabled = true;
  statusEl.textContent = "Sending...";

  const SERVICE_ID = 'YOUR_SERVICE_ID';   // <-- replace
  const TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // <-- replace

  if(window.emailjs && SERVICE_ID !== 'YOUR_SERVICE_ID'){
    emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      from_name: name,
      from_email: email,
      message: message
    }).then(function(){
      statusEl.textContent = "Message sent — thanks!";
      btn.disabled = false;
      form.reset();
    }, function(err){
      console.error(err);
      statusEl.textContent = "Oops — could not send. Check console.";
      btn.disabled = false;
    });
  } else {
    console.warn('EmailJS not configured. Replace SERVICE_ID, TEMPLATE_ID and USER_ID in the code.');
    statusEl.textContent = "Email not configured. See console for setup instructions.";
    btn.disabled = false;
  }
});

/* =========================
   Smooth scrolling
   ========================= */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const href = a.getAttribute('href');
    if(href.length>1){
      e.preventDefault();
      const el = document.querySelector(href);
      if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
    }
  });
});

// lol




  function openOverlay() {
    document.getElementById("projectOverlay").style.display = "flex";
  }

  function closeOverlay() {
    document.getElementById("projectOverlay").style.display = "none";
  }

  
  // Initialize popover
const popoverTrigger = document.getElementById('popoverTrigger');
const popover = new bootstrap.Popover(popoverTrigger, {
  trigger: 'click',
  placement: 'top'
});

// Auto-hide after 4.5 seconds
popoverTrigger.addEventListener('click', function () {
  setTimeout(() => {
    popover.hide();
  }, 6000);
});

// Handle close button inside popover
document.addEventListener('click', function (event) {
  if (event.target.id === 'closePopover') {
    popover.hide();
  }
});


/* =========================
   Navbar Auto-Close on Click
   (Mobile Usability Improvement)
   ========================= */

// Get the collapsed menu element (the one that should close)
const navMenu = document.getElementById('navMenu');

// Get all the navigation links inside that menu
const navLinks = document.querySelectorAll('#navMenu .nav-link');

// Check if the menu exists and Bootstrap is loaded
if (navMenu && window.bootstrap) {
    // Create a Bootstrap Collapse object instance
    const bsCollapse = new bootstrap.Collapse(navMenu, {
        toggle: false // Do not toggle on creation
    });

    // Add a click listener to every link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Check if the menu is currently visible (expanded on mobile)
            if (navMenu.classList.contains('show')) {
                // If it's visible, hide it using the Bootstrap Collapse method
                bsCollapse.hide();
            }
        });
    });
}





