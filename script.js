const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const leftScoreElement = document.getElementById('left-score');
const rightScoreElement = document.getElementById('right-score');

// Detect if device is mobile
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || window.innerWidth <= 768;
};

const IS_MOBILE = isMobile();

// Responsive paddle and ball sizes
const getPaddleSize = () => {
  return IS_MOBILE ? { width: 20, height: 140 } : { width: 14, height: 100 };
};

let paddleSize = getPaddleSize();
let paddleWidth = paddleSize.width;
let paddleHeight = paddleSize.height;

const paddleSpeed = 8;
const ballRadius = 10;

let canvasWidth = 800;
let canvasHeight = 500;

function resizeCanvas() {
  const maxWidth = Math.min(window.innerWidth * 0.9, 600);
  const ratio = 800 / 500;
  
  canvasWidth = maxWidth;
  canvasHeight = maxWidth / ratio;
  
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
}

const leftPaddle = {
  x: 0,
  y: 0,
  width: paddleWidth,
  height: paddleHeight,
};

const rightPaddle = {
  x: 0,
  y: 0,
  width: paddleWidth,
  height: paddleHeight,
};

const ball = {
  x: canvasWidth / 2,
  y: canvasHeight / 2,
  radius: ballRadius,
  vx: 5,
  vy: 4,
};

const scores = {
  left: 0,
  right: 0,
};

const keys = {
  ArrowUp: false,
  ArrowDown: false,
};

const touch = {
  active: false,
  y: 0,
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
};

function updateScoreboard() {
  leftScoreElement.textContent = scores.left;
  rightScoreElement.textContent = scores.right;
}

function resetBall(direction) {
  ball.x = canvasWidth / 2;
  ball.y = canvasHeight / 2;
  const angle = (Math.random() * 1.1 - 0.55);
  const speed = 5.5;

  ball.vx = direction * speed * Math.cos(angle);
  ball.vy = speed * Math.sin(angle);
}

function initializePaddles() {
  leftPaddle.x = 22;
  leftPaddle.y = canvasHeight / 2 - paddleHeight / 2;
  leftPaddle.width = paddleWidth;
  leftPaddle.height = paddleHeight;

  rightPaddle.x = canvasWidth - (22 + paddleWidth);
  rightPaddle.y = canvasHeight / 2 - paddleHeight / 2;
  rightPaddle.width = paddleWidth;
  rightPaddle.height = paddleHeight;
}

function handleInput() {
  // Keyboard input (desktop)
  if (keys.ArrowUp) {
    leftPaddle.y -= paddleSpeed;
  }

  if (keys.ArrowDown) {
    leftPaddle.y += paddleSpeed;
  }

  // Touch input (mobile)
  if (touch.active) {
    leftPaddle.y = clamp(touch.y - paddleHeight / 2, 0, canvasHeight - paddleHeight);
  }

  // Mouse input (desktop)
  if (!touch.active && !keys.ArrowUp && !keys.ArrowDown) {
    // Mouse control is handled by mousemove event
  }

  leftPaddle.y = clamp(leftPaddle.y, 0, canvasHeight - leftPaddle.height);

  // Computer AI for right paddle
  const targetY = ball.y - rightPaddle.height / 2;
  const aiSpeed = IS_MOBILE ? 0.12 : 0.14;
  rightPaddle.y += (targetY - rightPaddle.y) * aiSpeed;
  rightPaddle.y = clamp(rightPaddle.y, 0, canvasHeight - rightPaddle.height);
}

function handleBallWallCollision() {
  if (ball.y - ball.radius <= 0) {
    ball.y = ball.radius;
    ball.vy *= -1;
  }

  if (ball.y + ball.radius >= canvasHeight) {
    ball.y = canvasHeight - ball.radius;
    ball.vy *= -1;
  }
}

function handlePaddleCollision() {
  const leftHit =
    ball.x - ball.radius <= leftPaddle.x + leftPaddle.width &&
    ball.x + ball.radius >= leftPaddle.x &&
    ball.y >= leftPaddle.y &&
    ball.y <= leftPaddle.y + leftPaddle.height &&
    ball.vx < 0;

  if (leftHit) {
    ball.x = leftPaddle.x + leftPaddle.width + ball.radius;
    ball.vx = Math.abs(ball.vx) + 0.25;
    ball.vy += (ball.y - (leftPaddle.y + leftPaddle.height / 2)) * 0.12;
  }

  const rightHit =
    ball.x + ball.radius >= rightPaddle.x &&
    ball.x - ball.radius <= rightPaddle.x + rightPaddle.width &&
    ball.y >= rightPaddle.y &&
    ball.y <= rightPaddle.y + rightPaddle.height &&
    ball.vx > 0;

  if (rightHit) {
    ball.x = rightPaddle.x - ball.radius;
    ball.vx = -Math.abs(ball.vx) - 0.25;
    ball.vy += (ball.y - (rightPaddle.y + rightPaddle.height / 2)) * 0.12;
  }
}

function scoreCheck() {
  if (ball.x - ball.radius < 0) {
    scores.right += 1;
    updateScoreboard();
    resetBall(1);
  }

  if (ball.x + ball.radius > canvasWidth) {
    scores.left += 1;
    updateScoreboard();
    resetBall(-1);
  }
}

function update() {
  handleInput();

  ball.x += ball.vx;
  ball.y += ball.vy;

  handleBallWallCollision();
  handlePaddleCollision();
  scoreCheck();
}

function drawNet() {
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 12]);
  ctx.beginPath();
  ctx.moveTo(canvasWidth / 2, 0);
  ctx.lineTo(canvasWidth / 2, canvasHeight);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawPaddle(x, y, width, height) {
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(x, y, width, height);
}

function drawBall(x, y, radius) {
  ctx.beginPath();
  ctx.fillStyle = '#38bdf8';
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function draw() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.fillStyle = '#020817';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  drawNet();
  drawPaddle(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
  drawPaddle(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);
  drawBall(ball.x, ball.y, ball.radius);
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Keyboard events (desktop)
window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault();
    keys[event.key] = true;
  }
});

window.addEventListener('keyup', (event) => {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    keys[event.key] = false;
  }
});

// Mouse events (desktop)
canvas.addEventListener('mousemove', (event) => {
  if (IS_MOBILE) return; // Don't use mouse on mobile
  
  const rect = canvas.getBoundingClientRect();
  const pointerY = event.clientY - rect.top;
  leftPaddle.y = clamp(pointerY - leftPaddle.height / 2, 0, canvasHeight - leftPaddle.height);
});

// Touch events (mobile)
canvas.addEventListener('touchstart', (event) => {
  event.preventDefault();
  touch.active = true;
  const touch_event = event.touches[0];
  const rect = canvas.getBoundingClientRect();
  touch.y = touch_event.clientY - rect.top;
}, { passive: false });

canvas.addEventListener('touchmove', (event) => {
  event.preventDefault();
  if (!touch.active) return;
  
  const touch_event = event.touches[0];
  const rect = canvas.getBoundingClientRect();
  touch.y = touch_event.clientY - rect.top;
}, { passive: false });

canvas.addEventListener('touchend', (event) => {
  event.preventDefault();
  touch.active = false;
}, { passive: false });

canvas.addEventListener('touchcancel', (event) => {
  event.preventDefault();
  touch.active = false;
}, { passive: false });

// Handle window resize
window.addEventListener('resize', () => {
  resizeCanvas();
  const newPaddleSize = getPaddleSize();
  paddleWidth = newPaddleSize.width;
  paddleHeight = newPaddleSize.height;
  initializePaddles();
});

// Initialize
resizeCanvas();
initializePaddles();
updateScoreboard();
resetBall(1);
requestAnimationFrame(gameLoop);