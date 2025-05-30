function toggleMenu() {
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");
  if (menu && icon) {
      menu.classList.toggle("open");
      icon.classList.toggle("open");
  }
}

// Space Background Animation
const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas.getContext('2d');

function resizeBgCanvas() {
  const zoomScale = window.visualViewport ? window.visualViewport.scale : 1;
  bgCanvas.width = window.innerWidth * window.devicePixelRatio * zoomScale;
  bgCanvas.height = window.innerHeight * window.devicePixelRatio * zoomScale;
  bgCanvas.style.width = `${window.innerWidth}px`;
  bgCanvas.style.height = `${window.innerHeight}px`;
  bgCtx.scale(window.devicePixelRatio * zoomScale, window.devicePixelRatio * zoomScale);
}

resizeBgCanvas();

const shootingStars = [];
const staticStars = [];
const spaceLines = [];
const glowTrails = [];
const hoverParticles = [];
const shootingStarCount = 2;
const staticStarCount = 100;
const spaceLineCount = 5;
let mouseX = 0;
let mouseY = 0;
let lastMouseX = 0;
let lastMouseY = 0;

class ShootingStar {
  constructor(x, y, isClick = false) {
      this.x = x !== undefined ? x : Math.random() * bgCanvas.width / window.devicePixelRatio;
      this.y = y !== undefined ? y : 0;
      this.vx = (Math.random() - 0.5) * 4;
      this.vy = Math.random() * 3 + 2;
      this.size = (Math.random() * 1 + 0.5) / window.devicePixelRatio;
      this.opacity = 1;
      this.isClick = isClick;
      this.lifespan = isClick ? 60 : Infinity;
      this.age = 0;
  }

  draw(rotationX, rotationY) {
      bgCtx.save();
      bgCtx.translate(bgCanvas.width / (2 * window.devicePixelRatio), bgCanvas.height / (2 * window.devicePixelRatio));
      bgCtx.rotate(rotationX);
      bgCtx.rotate(rotationY);
      bgCtx.translate(-bgCanvas.width / (2 * window.devicePixelRatio), -bgCanvas.height / (2 * window.devicePixelRatio));
      bgCtx.beginPath();
      bgCtx.moveTo(this.x, this.y);
      bgCtx.lineTo(this.x - this.vx * 5, this.y - this.vy * 5);
      bgCtx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
      bgCtx.lineWidth = this.size * window.devicePixelRatio;
      bgCtx.stroke();
      bgCtx.restore();
  }

  update() {
      this.x += this.vx / window.devicePixelRatio;
      this.y += this.vy / window.devicePixelRatio;
      if (this.isClick) {
          this.age++;
          this.opacity = 1 - (this.age / this.lifespan);
          if (this.age >= this.lifespan) return true;
      }
      if (this.x < 0 || this.x > bgCanvas.width / window.devicePixelRatio || this.y > bgCanvas.height / window.devicePixelRatio) {
          if (!this.isClick) this.reset();
          return this.isClick;
      }
      return false;
  }

  reset() {
      this.x = Math.random() * bgCanvas.width / window.devicePixelRatio;
      this.y = 0;
      this.vx = (Math.random() - 0.5) * 4;
      this.vy = Math.random() * 3 + 2;
      this.size = (Math.random() * 1 + 0.5) / window.devicePixelRatio;
      this.opacity = 1;
  }
}

class StaticStar {
  constructor() {
      this.x = Math.random() * bgCanvas.width / window.devicePixelRatio;
      this.y = Math.random() * bgCanvas.height / window.devicePixelRatio;
      this.size = (Math.random() * 0.5 + 0.2) / window.devicePixelRatio;
      this.opacity = Math.random() * 0.5 + 0.3;
  }

  draw(parallaxX, parallaxY) {
      bgCtx.beginPath();
      bgCtx.arc(this.x + parallaxX, this.y + parallaxY, this.size, 0, Math.PI * 2);
      bgCtx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
      bgCtx.fill();
  }
}

class SpaceLine {
  constructor() {
      this.x = Math.random() * bgCanvas.width / window.devicePixelRatio;
      this.y = Math.random() * bgCanvas.height / window.devicePixelRatio;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.length = (Math.random() * 50 + 20) / window.devicePixelRatio;
      this.opacity = Math.random() * 0.2 + 0.1;
  }

  draw() {
      bgCtx.beginPath();
      bgCtx.moveTo(this.x, this.y);
      bgCtx.lineTo(this.x + this.length * this.vx / Math.abs(this.vx || 1), this.y + this.length * this.vy / Math.abs(this.vy || 1));
      bgCtx.strokeStyle = `rgba(0, 183, 235, ${this.opacity})`;
      bgCtx.lineWidth = 1 / window.devicePixelRatio;
      bgCtx.stroke();
  }

  update() {
      this.x += this.vx / window.devicePixelRatio;
      this.y += this.vy / window.devicePixelRatio;
      if (this.x < -this.length || this.x > bgCanvas.width / window.devicePixelRatio + this.length ||
          this.y < -this.length || this.y > bgCanvas.height / window.devicePixelRatio + this.length) {
          this.x = Math.random() * bgCanvas.width / window.devicePixelRatio;
          this.y = Math.random() * bgCanvas.height / window.devicePixelRatio;
      }
  }
}

class GlowTrail {
  constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = (Math.random() * 3 + 2) / window.devicePixelRatio;
      this.opacity = 0.8;
      this.lifespan = 30;
      this.age = 0;
  }

  draw() {
      bgCtx.beginPath();
      bgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      bgCtx.fillStyle = `rgba(0, 183, 235, ${this.opacity})`;
      bgCtx.fill();
  }

  update() {
      this.age++;
      this.opacity = 0.8 * (1 - this.age / this.lifespan);
      return this.age >= this.lifespan;
  }
}

class HoverParticle {
  constructor(x, y) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 2;
      this.vy = (Math.random() - 0.5) * 2;
      this.size = (Math.random() * 2 + 1) / window.devicePixelRatio;
      this.opacity = 0.8;
      this.lifespan = 20;
      this.age = 0;
  }

  draw() {
      bgCtx.beginPath();
      bgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      bgCtx.fillStyle = `rgba(0, 183, 235, ${this.opacity})`;
      bgCtx.fill();
  }

  update() {
      this.x += this.vx / window.devicePixelRatio;
      this.y += this.vy / window.devicePixelRatio;
      this.age++;
      this.opacity = 0.8 * (1 - this.age / this.lifespan);
      return this.age >= this.lifespan;
  }
}

for (let i = 0; i < shootingStarCount; i++) {
  shootingStars.push(new ShootingStar());
}

for (let i = 0; i < staticStarCount; i++) {
  staticStars.push(new StaticStar());
}

for (let i = 0; i < spaceLineCount; i++) {
  spaceLines.push(new SpaceLine());
}

bgCanvas.addEventListener('mousemove', (e) => {
  const rect = bgCanvas.getBoundingClientRect();
  mouseX = (e.clientX - rect.left) / (window.devicePixelRatio * (window.visualViewport ? window.visualViewport.scale : 1));
  mouseY = (e.clientY - rect.top) / (window.devicePixelRatio * (window.visualViewport ? window.visualViewport.scale : 1));
  if (Math.hypot(mouseX - lastMouseX, mouseY - lastMouseY) > 5) {
      glowTrails.push(new GlowTrail(mouseX, mouseY));
      lastMouseX = mouseX;
      lastMouseY = mouseY;
  }
});

bgCanvas.addEventListener('click', (e) => {
  const rect = bgCanvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) / (window.devicePixelRatio * (window.visualViewport ? window.visualViewport.scale : 1));
  const y = (e.clientY - rect.top) / (window.devicePixelRatio * (window.visualViewport ? window.visualViewport.scale : 1));
  shootingStars.push(new ShootingStar(x, y, true));
});

function addHoverParticles(element) {
  element.addEventListener('mouseenter', (e) => {
      const rect = element.getBoundingClientRect();
      const centerX = (rect.left + rect.width / 2) / (window.devicePixelRatio * (window.visualViewport ? window.visualViewport.scale : 1));
      const centerY = (rect.top + rect.height / 2) / (window.devicePixelRatio * (window.visualViewport ? window.visualViewport.scale : 1));
      for (let i = 0; i < 5; i++) {
          hoverParticles.push(new HoverParticle(centerX, centerY));
      }
  });
}

document.querySelectorAll('.color-container, .contact-info-container').forEach(addHoverParticles);

function animateBg() {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  const rotationX = (mouseY - 0.5) * Math.PI / 12;
  const rotationY = (mouseX - 0.5) * Math.PI / 12;
  const parallaxX = (mouseX - 0.5) * 10 / window.devicePixelRatio;
  const parallaxY = (mouseY - 0.5) * 10 / window.devicePixelRatio;

  staticStars.forEach(star => star.draw(parallaxX, parallaxY));
  spaceLines.forEach(line => {
      line.update();
      line.draw();
  });
  for (let i = glowTrails.length - 1; i >= 0; i--) {
      glowTrails[i].draw();
      if (glowTrails[i].update()) glowTrails.splice(i, 1);
  }
  for (let i = hoverParticles.length - 1; i >= 0; i--) {
      hoverParticles[i].draw();
      if (hoverParticles[i].update()) hoverParticles.splice(i, 1);
  }
  for (let i = shootingStars.length - 1; i >= 0; i--) {
      shootingStars[i].draw(rotationX, rotationY);
      if (shootingStars[i].update()) shootingStars.splice(i, 1);
  }

  requestAnimationFrame(animateBg);
}

window.addEventListener('resize', resizeBgCanvas);
window.addEventListener('wheel', resizeBgCanvas);

animateBg();

// Scroll Animations
const sections = document.querySelectorAll('section');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
      if (entry.isIntersecting) {
          entry.target.classList.add('visible');
      }
  });
}, { threshold: 0.1 });

sections.forEach(section => observer.observe(section));

// Moonview Animation
const moonview = document.getElementById('moonview');
const footer = document.getElementById('footer');
const moonObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
      if (entry.isIntersecting) {
          moonview.classList.add('visible');
      } else {
          moonview.classList.remove('visible');
      }
  });
}, { threshold: 0.5 });

moonObserver.observe(footer);

// Rocketship Scroll
const rocketship = document.getElementById('rocketship');
let isScrolling = false;
let scrollInterval;

// Initialize warp overlay
document.body.insertAdjacentHTML('beforeend', '<div id="warp-overlay"></div>');

// Initialize rocket sound
const rocketSound = new Audio('./assets/rocket-sound.mp3');

function triggerWarpEffect() {
    const warpOverlay = document.getElementById('warp-overlay');
    warpOverlay.innerHTML = ''; // Clear previous streaks
    for (let i = 0; i < 20; i++) {
        const streak = document.createElement('div');
        streak.className = 'warp-streak';
        streak.style.transform = `rotate(${i * 18}deg)`; // 360/20 = 18 degrees
        warpOverlay.appendChild(streak);
    }
    warpOverlay.classList.add('active');
    setTimeout(() => warpOverlay.classList.remove('active'), 8000); // Active for 1s
}

function showSpeechBubble() {
    const speechBubble = rocketship.querySelector('.speech-bubble');
    if (rocketship.classList.contains('top') && window.scrollY < 100 && !isScrolling) {
        speechBubble.classList.add('visible');
        setTimeout(() => {
            speechBubble.classList.remove('visible');
            if (rocketship.classList.contains('top') && window.scrollY < 100 && !isScrolling) {
                setTimeout(showSpeechBubble, 2000); // Reappear after 2s
            }
        }, 3000); // Visible for 3s
    }
}

rocketship.addEventListener('click', () => {
    if (isScrolling) {
        clearInterval(scrollInterval);
        isScrolling = false;
        return;
    }

    isScrolling = true;
    triggerWarpEffect(); // Trigger background warp effect
    rocketSound.currentTime = 0; // Reset sound
    rocketSound.play().catch(error => console.error('Rocket sound playback failed:', error)); // Play sound
    const atBottom = rocketship.classList.contains('bottom');
    rocketship.classList.toggle('bottom', !atBottom);
    rocketship.classList.toggle('top', atBottom);

    const targetY = atBottom ? 0 : document.documentElement.scrollHeight - window.innerHeight;
    const startY = window.scrollY;
    const distance = targetY - startY;
    const duration = 10000; // 10s
    const startTime = performance.now();

    scrollInterval = setInterval(() => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = progress * (2 - progress); // Ease-in-out
        window.scrollTo(0, startY + distance * ease);

        if (progress >= 1) {
            clearInterval(scrollInterval);
            isScrolling = false;
            // Trigger moonview visibility check
            const footerRect = footer.getBoundingClientRect();
            if (footerRect.top <= window.innerHeight) {
                moonview.classList.add('visible');
            }
            // Show speech bubble if back at top
            if (rocketship.classList.contains('top')) {
                setTimeout(showSpeechBubble, 1000);
            }
        }
    }, 16);
});

// Initialize speech bubble
rocketship.insertAdjacentHTML('beforeend', '<div class="speech-bubble">Click Me to travel down</div>');
setTimeout(showSpeechBubble, 1000); // Initial delay
window.addEventListener('scroll', () => {
    if (rocketship.classList.contains('top') && window.scrollY < 100 && !isScrolling) {
        setTimeout(showSpeechBubble, 1000);
    }
});

// Music Playback
function initializeMusicPlayback() {
    const playButtons = document.querySelectorAll('.play-btn');
    let currentAudio = null;

    console.log('Found play buttons:', playButtons.length);

    playButtons.forEach(button => {
        button.addEventListener('click', () => {
            const trackId = button.getAttribute('data-track');
            const audio = document.getElementById(trackId);

            console.log('Clicked button for track:', trackId, 'Audio element:', audio);

            if (!audio) {
                console.error('Audio element not found for track:', trackId);
                return;
            }

            // Pause any currently playing audio
            if (currentAudio && currentAudio !== audio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
                const otherButton = document.querySelector(`.play-btn.playing[data-track="${currentAudio.id}"]`);
                if (otherButton) {
                    otherButton.classList.remove('playing');
                    otherButton.querySelector('i').classList.remove('fa-pause');
                    otherButton.querySelector('i').classList.add('fa-play');
                }
            }

            // Toggle play/pause for the clicked track
            if (audio.paused) {
                audio.play().then(() => {
                    console.log('Playing track:', trackId);
                    button.classList.add('playing');
                    button.querySelector('i').classList.remove('fa-play');
                    button.querySelector('i').classList.add('fa-pause');
                    currentAudio = audio;
                }).catch(error => {
                    console.error('Audio playback failed for track', trackId, ':', error);
                });
            } else {
                audio.pause();
                audio.currentTime = 0;
                console.log('Paused track:', trackId);
                button.classList.remove('playing');
                button.querySelector('i').classList.remove('fa-pause');
                button.querySelector('i').classList.add('fa-play');
                currentAudio = null;
            }
        });
    });
}

// Initialize music playback after DOM is loaded
document.addEventListener('DOMContentLoaded', initializeMusicPlayback);

// Nav Link Ripple Effect
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.style.setProperty('--ripple-x', `${x}px`);
        this.style.setProperty('--ripple-y', `${y}px`);
        this.classList.add('ripple');
        setTimeout(() => this.classList.remove('ripple'), 600);
    });
});

// Dynamic Footer Year
document.getElementById('copyright-year').textContent = new Date().getFullYear();

// Mini-Game: Catch the Star
const gameCanvas = document.getElementById('gameCanvas');
const gameCtx = gameCanvas.getContext('2d');

function resizeGameCanvas() {
    const zoomScale = window.visualViewport ? window.visualViewport.scale : 1;
    const scale = Math.min(window.innerWidth / 450, 1) * zoomScale;
    gameCanvas.width = 400 * scale * window.devicePixelRatio;
    gameCanvas.height = 300 * scale * window.devicePixelRatio;
    gameCanvas.style.width = `${400 * scale}px`;
    gameCanvas.style.height = `${300 * scale}px`;
    gameCtx.scale(scale * window.devicePixelRatio, scale * window.devicePixelRatio);
}

resizeGameCanvas();

let score = 0;
let gameRunning = false;
let speedMultiplier = 1;
const player = { x: 200, y: 250, size: 20 };
const objects = [];
const spaceshipImg = new Image();
spaceshipImg.src = './assets/spaceship.png';
const starImg = new Image();
starImg.src = './assets/star.png';
const rockImg = new Image();
rockImg.src = './assets/spacerock.png';

class GameObject {
    constructor(isStar) {
        this.isStar = isStar;
        this.x = Math.random() * (gameCanvas.width / window.devicePixelRatio - 20) + 10;
        this.y = -20;
        this.vy = (Math.random() * (isStar ? 1.5 : 2) + 1.5) * speedMultiplier;
        this.size = isStar ? 15 : 20;
    }

    draw() {
        const img = this.isStar ? starImg : rockImg;
        if (img.complete) {
            gameCtx.drawImage(img, this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
        } else {
            gameCtx.fillStyle = this.isStar ? 'yellow' : 'gray';
            gameCtx.beginPath();
            gameCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            gameCtx.fill();
        }
    }

    update() {
        this.y += this.vy;
        if (this.y > gameCanvas.height / window.devicePixelRatio + this.size) {
            return true;
        }
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < this.size + player.size) {
            if (this.isStar) {
                score += 10;
                document.getElementById('score').textContent = `Score: ${score}`;
                if (score % 100 === 0) {
                    speedMultiplier += 0.2;
                }
                return true;
            } else {
                return 'gameover';
            }
        }
        return false;
    }
}

gameCanvas.addEventListener('mousemove', (e) => {
    const rect = gameCanvas.getBoundingClientRect();
    player.x = (e.clientX - rect.left) * (400 / rect.width);
    // Clamp player.x to stay within canvas bounds
    player.x = Math.max(player.size, Math.min(400 - player.size, player.x));
});

function spawnObject() {
    if (gameRunning) {
        const isStar = Math.random() > 0.3;
        objects.push(new GameObject(isStar));
        setTimeout(spawnObject, Math.random() * 1500 + 800);
    }
}

function animateGame() {
    if (!gameRunning) return;
    gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    if (spaceshipImg.complete) {
        gameCtx.drawImage(spaceshipImg, player.x - player.size, player.y - player.size, player.size * 2, player.size * 2);
    } else {
        gameCtx.fillStyle = 'white';
        gameCtx.beginPath();
        gameCtx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
        gameCtx.fill();
    }

    for (let i = objects.length - 1; i >= 0; i--) {
        const result = objects[i].update();
        if (result === true) {
            objects.splice(i, 1);
        } else if (result === 'gameover') {
            gameRunning = false;
            document.getElementById('score').style.display = 'none';
            document.getElementById('gameOver').style.display = 'block';
            document.getElementById('finalScore').textContent = score;
            document.getElementById('startGame').textContent = 'Restart Game';
            objects.length = 0;
            speedMultiplier = 1;
            return;
        } else {
            objects[i].draw();
        }
    }

    requestAnimationFrame(animateGame);
}

document.getElementById('startGame').addEventListener('click', () => {
    if (!gameRunning) {
        gameRunning = true;
        score = 0;
        speedMultiplier = 1;
        document.getElementById('score').textContent = `Score: ${score}`;
        document.getElementById('score').style.display = 'block';
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('startGame').textContent = 'Start Game';
        objects.length = 0;
        spawnObject();
        animateGame();
    }
});

window.addEventListener('resize', resizeGameCanvas);
window.addEventListener('wheel', resizeGameCanvas);