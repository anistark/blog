export function initSpaceParticles() {
  const canvas = document.getElementById('space-particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, animationId, running = false;

  // --- Stars ---
  const STAR_COUNT = 120;
  let stars = [];

  function createStar() {
    const brightness = Math.random();
    // color: mostly white, some cool blue, some warm
    let hue, sat;
    const roll = Math.random();
    if (roll < 0.35) { hue = 215 + Math.random() * 30; sat = 30 + Math.random() * 40; }      // cool blue
    else if (roll < 0.5) { hue = 25 + Math.random() * 25; sat = 40 + Math.random() * 30; }    // warm orange
    else { hue = 0; sat = 0; }                                                                  // white
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size: brightness * 1.8 + 0.4,
      baseAlpha: brightness * 0.7 + 0.15,
      pulseSpeed: Math.random() * 0.01 + 0.003,
      pulseOffset: Math.random() * Math.PI * 2,
      hue, sat,
    };
  }

  function drawStars(time) {
    for (const s of stars) {
      const alpha = s.baseAlpha * (0.45 + 0.55 * Math.sin(time * s.pulseSpeed + s.pulseOffset));
      const color = s.sat > 0
        ? `hsla(${s.hue}, ${s.sat}%, 88%, ${alpha})`
        : `rgba(255, 255, 255, ${alpha})`;

      // glow
      const gr = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 3.5);
      gr.addColorStop(0, color);
      gr.addColorStop(0.5, color.replace(alpha + ')', alpha * 0.25 + ')'));
      gr.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * 3.5, 0, Math.PI * 2);
      ctx.fillStyle = gr;
      ctx.fill();

      // core
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }

  // --- Galaxies ---
  const GALAXY_COUNT = 3;
  let galaxies = [];

  function createGalaxy() {
    const hue = 220 + Math.random() * 60; // blue to purple
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      radiusX: 60 + Math.random() * 100,
      radiusY: 25 + Math.random() * 40,
      rotation: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 0.00004,
      driftX: (Math.random() - 0.5) * 0.02,
      driftY: (Math.random() - 0.5) * 0.015,
      alpha: 0.04 + Math.random() * 0.04,
      hue,
    };
  }

  function drawGalaxies() {
    for (const g of galaxies) {
      g.x += g.driftX;
      g.y += g.driftY;
      g.rotation += g.rotSpeed;

      // wrap
      if (g.x < -g.radiusX * 2) g.x = width + g.radiusX;
      if (g.x > width + g.radiusX * 2) g.x = -g.radiusX;
      if (g.y < -g.radiusY * 2) g.y = height + g.radiusY;
      if (g.y > height + g.radiusY * 2) g.y = -g.radiusY;

      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.rotate(g.rotation);
      ctx.scale(1, g.radiusY / g.radiusX);

      const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, g.radiusX);
      gr.addColorStop(0, `hsla(${g.hue}, 60%, 70%, ${g.alpha * 1.5})`);
      gr.addColorStop(0.3, `hsla(${g.hue}, 50%, 55%, ${g.alpha})`);
      gr.addColorStop(0.7, `hsla(${g.hue + 20}, 40%, 40%, ${g.alpha * 0.4})`);
      gr.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(0, 0, g.radiusX, 0, Math.PI * 2);
      ctx.fillStyle = gr;
      ctx.fill();
      ctx.restore();
    }
  }

  // --- Meteors / Shooting Stars ---
  let meteors = [];
  let nextMeteorTime = 0;

  function scheduleMeteor(time) {
    nextMeteorTime = time + 6000 + Math.random() * 6000; // 6-12s
  }

  function spawnMeteor() {
    // pick a random edge-ish start, streak inward
    const angle = Math.random() * Math.PI * 0.5 + Math.PI * 0.15; // mostly top-right to bottom-left
    const speed = 4 + Math.random() * 4;
    const startX = Math.random() * width * 0.6 + width * 0.3;
    const startY = Math.random() * height * 0.3;
    return {
      x: startX,
      y: startY,
      vx: -Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.0,
      decay: 0.008 + Math.random() * 0.008,
      length: 60 + Math.random() * 80,
      width: 1.2 + Math.random() * 1.0,
    };
  }

  function updateAndDrawMeteors(time) {
    if (time > nextMeteorTime) {
      meteors.push(spawnMeteor());
      scheduleMeteor(time);
    }

    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.x += m.vx;
      m.y += m.vy;
      m.life -= m.decay;

      if (m.life <= 0) { meteors.splice(i, 1); continue; }

      const tailX = m.x - (m.vx / Math.sqrt(m.vx * m.vx + m.vy * m.vy)) * m.length;
      const tailY = m.y - (m.vy / Math.sqrt(m.vx * m.vx + m.vy * m.vy)) * m.length;

      const gr = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
      gr.addColorStop(0, `rgba(255, 255, 255, ${m.life * 0.9})`);
      gr.addColorStop(0.3, `rgba(200, 220, 255, ${m.life * 0.5})`);
      gr.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(tailX, tailY);
      ctx.strokeStyle = gr;
      ctx.lineWidth = m.width * m.life;
      ctx.lineCap = 'round';
      ctx.stroke();

      // bright head
      const headGr = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 3);
      headGr.addColorStop(0, `rgba(255, 255, 255, ${m.life})`);
      headGr.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(m.x, m.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = headGr;
      ctx.fill();
    }
  }

  // --- Asteroids ---
  let asteroids = [];
  let nextAsteroidTime = 0;

  function scheduleAsteroid(time) {
    nextAsteroidTime = time + 30000 + Math.random() * 30000; // 30-60s
  }

  function spawnAsteroid() {
    const fromLeft = Math.random() > 0.5;
    const size = 3 + Math.random() * 4;
    // irregular shape: generate random vertex offsets
    const vertices = [];
    const vertexCount = 6 + Math.floor(Math.random() * 4);
    for (let i = 0; i < vertexCount; i++) {
      const angle = (i / vertexCount) * Math.PI * 2;
      const r = size * (0.6 + Math.random() * 0.4);
      vertices.push({ angle, r });
    }
    return {
      x: fromLeft ? -20 : width + 20,
      y: Math.random() * height * 0.6 + height * 0.1,
      vx: (fromLeft ? 1 : -1) * (0.15 + Math.random() * 0.25),
      vy: (Math.random() - 0.5) * 0.1,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.008,
      size,
      vertices,
      alpha: 0.5 + Math.random() * 0.3,
    };
  }

  function updateAndDrawAsteroids() {
    for (let i = asteroids.length - 1; i >= 0; i--) {
      const a = asteroids[i];
      a.x += a.vx;
      a.y += a.vy;
      a.rotation += a.rotSpeed;

      // remove if off-screen
      if (a.x < -50 || a.x > width + 50 || a.y < -50 || a.y > height + 50) {
        asteroids.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.rotation);

      // rocky body
      ctx.beginPath();
      const v0 = a.vertices[0];
      ctx.moveTo(Math.cos(v0.angle) * v0.r, Math.sin(v0.angle) * v0.r);
      for (let j = 1; j < a.vertices.length; j++) {
        const v = a.vertices[j];
        ctx.lineTo(Math.cos(v.angle) * v.r, Math.sin(v.angle) * v.r);
      }
      ctx.closePath();

      ctx.fillStyle = `rgba(160, 150, 140, ${a.alpha * 0.6})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(200, 190, 175, ${a.alpha * 0.4})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // subtle lit edge
      const edgeGr = ctx.createRadialGradient(-a.size * 0.3, -a.size * 0.3, 0, 0, 0, a.size);
      edgeGr.addColorStop(0, `rgba(220, 215, 200, ${a.alpha * 0.3})`);
      edgeGr.addColorStop(1, 'transparent');
      ctx.fillStyle = edgeGr;
      ctx.fill();

      ctx.restore();
    }
  }

  // --- Main loop ---
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function init() {
    resize();
    stars = Array.from({ length: STAR_COUNT }, createStar);
    galaxies = Array.from({ length: GALAXY_COUNT }, createGalaxy);
    meteors = [];
    asteroids = [];
    nextMeteorTime = 0;
    nextAsteroidTime = 15000 + Math.random() * 15000; // first asteroid after 15-30s
  }

  let time = 0;
  function animate(timestamp) {
    if (!running) return;
    time++;
    ctx.clearRect(0, 0, width, height);

    drawGalaxies();
    drawStars(time);
    updateAndDrawMeteors(timestamp);

    if (timestamp > nextAsteroidTime) {
      asteroids.push(spawnAsteroid());
      scheduleAsteroid(timestamp);
    }
    updateAndDrawAsteroids();

    animationId = requestAnimationFrame(animate);
  }

  function start() {
    if (running) return;
    running = true;
    canvas.style.display = 'block';
    resize();
    animationId = requestAnimationFrame(animate);
  }

  function stop() {
    running = false;
    canvas.style.display = 'none';
    cancelAnimationFrame(animationId);
  }

  function checkTheme() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    isLight ? stop() : start();
  }

  // Observe theme changes
  new MutationObserver(checkTheme)
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  window.addEventListener('resize', resize);

  init();
  checkTheme();
}
