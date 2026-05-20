const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;

const ship = {
  x: GAME_WIDTH * 0.2,
  y: GAME_HEIGHT * 0.5,
  width: 250,
  height: 90,
  speed: 280,
  targetY: GAME_HEIGHT * 0.5,
};

const input = {
  up: false,
  down: false,
  fire: false,
};

const scoreLabel = document.getElementById('scoreLabel');

const stars = [];
const clouds = [];
let missiles = [];
let enemies = [];
let explosions = [];
let score = 0;
let fireTimer = 0;
const fireCooldown = 0.22;
let enemySpawnTimer = 0;
const enemySpawnRate = 1.4;
let gameOver = false;

const sea = {
  offset: 0,
  speed: 90,
};

const seaVixenSprite = createSeaVixenSprite();

function createSeaVixenSprite() {
  const sprite = document.createElement('canvas');
  sprite.width = 120;
  sprite.height = 48;
  const sctx = sprite.getContext('2d');

  sctx.fillStyle = 'transparent';
  sctx.fillRect(0, 0, sprite.width, sprite.height);

  sctx.fillStyle = '#d9dde1';
  sctx.strokeStyle = '#1b2f45';
  sctx.lineWidth = 2;

  sctx.beginPath();
  sctx.moveTo(10, 28);
  sctx.lineTo(20, 20);
  sctx.lineTo(60, 16);
  sctx.lineTo(88, 20);
  sctx.lineTo(106, 40);
  sctx.lineTo(104, 46);
  sctx.lineTo(95, 48);
  sctx.lineTo(78, 48);
  sctx.lineTo(76, 42);
  sctx.lineTo(60, 40);
  sctx.lineTo(57, 54);
  sctx.lineTo(32, 54);
  sctx.closePath();
  sctx.fill();
  sctx.stroke();

  sctx.fillStyle = 'rgba(42, 82, 122, 0.92)';
  sctx.beginPath();
  sctx.moveTo(44, 24);
  sctx.quadraticCurveTo(66, 10, 106, 16);
  sctx.lineTo(108, 24);
  sctx.quadraticCurveTo(86, 28, 62, 30);
  sctx.closePath();
  sctx.fill();
  sctx.stroke();

  sctx.fillStyle = '#b8c2c8';
  sctx.beginPath();
  sctx.moveTo(64, 36);
  sctx.lineTo(20, 68);
  sctx.lineTo(64, 70);
  sctx.lineTo(88, 56);
  sctx.closePath();
  sctx.fill();
  sctx.stroke();

  sctx.beginPath();
  sctx.moveTo(92, 34);
  sctx.lineTo(118, 54);
  sctx.lineTo(118, 66);
  sctx.lineTo(92, 60);
  sctx.closePath();
  sctx.fill();
  sctx.stroke();

  sctx.fillStyle = '#d9dde1';
  sctx.fillRect(72, 40, 8, 34);
  sctx.strokeRect(72, 40, 8, 34);
  sctx.fillRect(96, 42, 8, 32);
  sctx.strokeRect(96, 42, 8, 32);

  sctx.fillStyle = '#b5bcc3';
  sctx.beginPath();
  sctx.moveTo(70, 58);
  sctx.lineTo(118, 54);
  sctx.lineTo(120, 60);
  sctx.lineTo(72, 66);
  sctx.closePath();
  sctx.fill();
  sctx.stroke();

  sctx.beginPath();
  sctx.moveTo(70, 70);
  sctx.lineTo(118, 74);
  sctx.lineTo(116, 78);
  sctx.lineTo(70, 74);
  sctx.closePath();
  sctx.fill();
  sctx.stroke();

  sctx.fillStyle = '#152f53';
  sctx.beginPath();
  sctx.arc(52, 38, 10, 0, Math.PI * 2);
  sctx.fill();
  sctx.fillStyle = '#ffffff';
  sctx.beginPath();
  sctx.arc(52, 38, 6, 0, Math.PI * 2);
  sctx.fill();
  sctx.fillStyle = '#c0001c';
  sctx.beginPath();
  sctx.arc(52, 38, 3, 0, Math.PI * 2);
  sctx.fill();

  return sprite;
}

let lastTime = 0;

for (let i = 0; i < 120; i += 1) {
  stars.push({ x: Math.random() * GAME_WIDTH, y: Math.random() * GAME_HEIGHT * 0.55, radius: Math.random() * 1.2 + 0.4, alpha: Math.random() * 0.5 + 0.25 });
}

for (let i = 0; i < 12; i += 1) {
  clouds.push({ x: Math.random() * GAME_WIDTH, y: Math.random() * 160 + 30, width: 110 + Math.random() * 120, speed: 20 + Math.random() * 16, alpha: 0.35 + Math.random() * 0.35 });
}

window.addEventListener('keydown', (event) => {
  if (event.code === 'ArrowUp' || event.key.toLowerCase() === 'w') input.up = true;
  if (event.code === 'ArrowDown' || event.key.toLowerCase() === 's') input.down = true;
  if (event.code === 'Space') {
    event.preventDefault();
    input.fire = true;
  }
});

window.addEventListener('keyup', (event) => {
  if (event.code === 'ArrowUp' || event.key.toLowerCase() === 'w') input.up = false;
  if (event.code === 'ArrowDown' || event.key.toLowerCase() === 's') input.down = false;
  if (event.code === 'Space') input.fire = false;
});

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function spawnEnemy() {
  enemies.push({
    x: GAME_WIDTH + 90,
    y: 80 + Math.random() * (GAME_HEIGHT * 0.57),
    width: 76,
    height: 34,
    speed: 130 + Math.random() * 52,
    color: '#b83f3f',
  });
}

function drawSeaVixen(x, y) {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(seaVixenSprite, x - ship.width * 0.5, y - ship.height * 0.5, ship.width, ship.height);
  ctx.restore();
}

function drawMissile(missile) {
  ctx.save();
  ctx.fillStyle = '#ffeb7d';
  ctx.fillRect(missile.x, missile.y - missile.height * 0.5, missile.width, missile.height);
  ctx.fillStyle = '#ff6c49';
  ctx.fillRect(missile.x + missile.width - 6, missile.y - missile.height * 0.4, 6, missile.height * 0.8);
  ctx.restore();
}

function shipHit(enemy) {
  const shipLeft = ship.x - ship.width * 0.5;
  const shipRight = ship.x + ship.width * 0.5;
  const shipTop = ship.y - ship.height * 0.5;
  const shipBottom = ship.y + ship.height * 0.5;
  const enemyLeft = enemy.x;
  const enemyRight = enemy.x + enemy.width;
  const enemyTop = enemy.y - enemy.height * 0.45;
  const enemyBottom = enemy.y + enemy.height * 0.45;

  return shipRight > enemyLeft && shipLeft < enemyRight && shipBottom > enemyTop && shipTop < enemyBottom;
}

function drawEnemy(enemy) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.fillStyle = enemy.color;
  ctx.strokeStyle = '#3c1a1a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(22, -12);
  ctx.lineTo(46, -10);
  ctx.lineTo(70, -18);
  ctx.lineTo(74, -4);
  ctx.lineTo(68, 6);
  ctx.lineTo(46, 4);
  ctx.lineTo(22, 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#e4e4e4';
  ctx.beginPath();
  ctx.moveTo(24, -6);
  ctx.lineTo(30, -3);
  ctx.lineTo(20, 3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawExplosion(explosion) {
  ctx.save();
  ctx.fillStyle = `rgba(255, ${Math.floor(120 + explosion.life * 115)}, 20, ${explosion.life})`;
  ctx.beginPath();
  ctx.arc(explosion.x, explosion.y, 18 * explosion.life, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBackground() {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  ctx.fillStyle = '#8dc8f2';
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  ctx.fillStyle = '#f8dc7a';
  ctx.beginPath();
  ctx.arc(GAME_WIDTH * 0.82, GAME_HEIGHT * 0.18, 48, 0, Math.PI * 2);
  ctx.fill();
  stars.forEach((star) => {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;
    ctx.fill();
  });
  clouds.forEach((cloud) => {
    ctx.fillStyle = `rgba(255, 255, 255, ${cloud.alpha})`;
    ctx.beginPath();
    ctx.ellipse(cloud.x, cloud.y, cloud.width * 0.32, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cloud.x + cloud.width * 0.22, cloud.y - 12, cloud.width * 0.24, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cloud.x - cloud.width * 0.2, cloud.y - 10, cloud.width * 0.2, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    cloud.x -= cloud.speed * 0.4;
    if (cloud.x + cloud.width < 0) cloud.x = GAME_WIDTH + cloud.width;
  });
  const seaY = GAME_HEIGHT * 0.78;
  ctx.fillStyle = '#1f6ea4';
  ctx.fillRect(0, seaY, GAME_WIDTH, GAME_HEIGHT - seaY);
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 2;
  for (let x = -sea.offset; x < GAME_WIDTH + 120; x += 88) {
    ctx.beginPath();
    ctx.moveTo(x, seaY + 10);
    ctx.quadraticCurveTo(x + 22, seaY + 2, x + 44, seaY + 16);
    ctx.stroke();
  }
}

function update(deltaTime) {
  if (gameOver) {
    return;
  }

  if (input.up) ship.targetY -= ship.speed * deltaTime;
  if (input.down) ship.targetY += ship.speed * deltaTime;
  fireTimer += deltaTime;
  if (input.fire && fireTimer >= fireCooldown) {
    missiles.push({ x: ship.x + ship.width * 0.45, y: ship.y, width: 18, height: 6, speed: 540 });
    fireTimer = 0;
  }
  ship.targetY = clamp(ship.targetY, ship.height * 0.5, GAME_HEIGHT - ship.height * 0.5 - 30);
  ship.y += (ship.targetY - ship.y) * 12 * deltaTime;
  missiles.forEach((missile) => { missile.x += missile.speed * deltaTime; });
  enemies.forEach((enemy) => { enemy.x -= enemy.speed * deltaTime; });
  missiles = missiles.filter((missile) => missile.x < GAME_WIDTH + 50);
  enemies = enemies.filter((enemy) => enemy.x + enemy.width > -24);

  for (let m = missiles.length - 1; m >= 0; m -= 1) {
    const missile = missiles[m];
    for (let e = enemies.length - 1; e >= 0; e -= 1) {
      const enemy = enemies[e];
      if (missile.x + missile.width > enemy.x + 6 && missile.x < enemy.x + enemy.width - 6 && missile.y > enemy.y - enemy.height * 0.6 && missile.y < enemy.y + enemy.height * 0.6) {
        explosions.push({ x: enemy.x + enemy.width * 0.5, y: enemy.y, life: 1 });
        enemies.splice(e, 1);
        missiles.splice(m, 1);
        score += 180;
        break;
      }
    }
  }

  for (let e = enemies.length - 1; e >= 0; e -= 1) {
    if (shipHit(enemies[e])) {
      gameOver = true;
      break;
    }
  }

  for (let i = explosions.length - 1; i >= 0; i -= 1) {
    explosions[i].life -= deltaTime * 1.8;
    if (explosions[i].life <= 0) explosions.splice(i, 1);
  }
  enemySpawnTimer += deltaTime;
  if (enemySpawnTimer >= enemySpawnRate) {
    spawnEnemy();
    enemySpawnTimer = 0;
  }
  sea.offset += sea.speed * deltaTime;
  if (sea.offset >= 90) sea.offset -= 90;
}

function drawHUD() {
  if (scoreLabel) {
    scoreLabel.textContent = `Score: ${score}`;
  }

  ctx.fillStyle = '#053a5c';
  ctx.font = '18px Arial';
  ctx.fillText(`Score: ${score}`, 22, 34);
  if (gameOver) {
    ctx.fillStyle = 'rgba(180, 20, 20, 0.95)';
    ctx.font = 'bold 32px Arial';
    ctx.fillText('GAME OVER', GAME_WIDTH * 0.5 - 100, GAME_HEIGHT * 0.45);
    ctx.font = '18px Arial';
    ctx.fillStyle = '#053a5c';
    ctx.fillText('You got hit by an enemy.', GAME_WIDTH * 0.5 - 118, GAME_HEIGHT * 0.5);
  } else {
    ctx.fillText('Use W/S or ↑/↓ and SPACE to fire', 22, 58);
  }
}

function draw() {
  drawBackground();
  drawSeaVixen(ship.x, ship.y);
  missiles.forEach(drawMissile);
  enemies.forEach(drawEnemy);
  explosions.forEach(drawExplosion);
  drawHUD();
}

function loop(timestamp) {
  const deltaTime = Math.min(0.033, (timestamp - lastTime) / 1000);
  lastTime = timestamp;
  update(deltaTime);
  draw();
  requestAnimationFrame(loop);
}

requestAnimationFrame((timestamp) => {
  lastTime = timestamp;
  loop(timestamp);
});
