export function initAmbience() {
  const canvas = document.getElementById('ambience-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, animationId, running = false;
  let currentTheme = 'night';

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  // ============================================================
  //  NIGHT — stars, galaxies, meteors, asteroids
  // ============================================================
  const night = (() => {
    const STAR_COUNT = 120;
    const GALAXY_COUNT = 3;
    const DISTANT_GALAXY_COUNT = 12;
    const CLOSE_GALAXY_COUNT = 2;
    let stars, galaxies, distantGalaxies, closeGalaxies, meteors, asteroids, nextMeteorTime, nextAsteroidTime;

    function createStar() {
      const brightness = Math.random();
      let hue, sat;
      const roll = Math.random();
      if (roll < 0.35) { hue = 215 + Math.random() * 30; sat = 30 + Math.random() * 40; }
      else if (roll < 0.5) { hue = 25 + Math.random() * 25; sat = 40 + Math.random() * 30; }
      else { hue = 0; sat = 0; }
      return {
        x: Math.random() * width, y: Math.random() * height,
        size: brightness * 1.8 + 0.4,
        baseAlpha: brightness * 0.7 + 0.15,
        pulseSpeed: Math.random() * 0.01 + 0.003,
        pulseOffset: Math.random() * Math.PI * 2,
        hue, sat,
      };
    }

    function createGalaxy() {
      const hue = 220 + Math.random() * 60;
      return {
        x: Math.random() * width, y: Math.random() * height,
        radiusX: 60 + Math.random() * 100, radiusY: 25 + Math.random() * 40,
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.00004,
        driftX: (Math.random() - 0.5) * 0.02, driftY: (Math.random() - 0.5) * 0.015,
        alpha: 0.04 + Math.random() * 0.04, hue,
      };
    }

    function createCloseGalaxy() {
      const hue = Math.random() > 0.5 ? 210 + Math.random() * 30 : 270 + Math.random() * 40;
      const armCount = Math.random() > 0.3 ? 2 : 3;
      // scatter star-like dots embedded in the galaxy
      const embeddedStars = [];
      const rx = 140 + Math.random() * 100;
      for (let i = 0; i < 40 + Math.floor(Math.random() * 30); i++) {
        const dist = Math.random();
        const angle = Math.random() * Math.PI * 2;
        embeddedStars.push({
          dist, angle,
          size: 0.3 + Math.random() * 1.2,
          alpha: 0.2 + Math.random() * 0.5,
          pulseSpeed: 0.005 + Math.random() * 0.008,
          pulseOffset: Math.random() * Math.PI * 2,
        });
      }
      return {
        x: Math.random() * width * 0.8 + width * 0.1,
        y: Math.random() * height * 0.7 + height * 0.05,
        radiusX: rx,
        radiusY: rx * (0.3 + Math.random() * 0.25),
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.00006,
        driftX: (Math.random() - 0.5) * 0.008,
        driftY: (Math.random() - 0.5) * 0.006,
        alpha: 0.025 + Math.random() * 0.025,
        hue,
        armCount,
        armTightness: 2.5 + Math.random() * 1.5,
        embeddedStars,
        pulseSpeed: 0.0015 + Math.random() * 0.002,
        pulseOffset: Math.random() * Math.PI * 2,
      };
    }

    function createDistantGalaxy() {
      const roll = Math.random();
      let hue, sat;
      if (roll < 0.3) { hue = 220 + Math.random() * 40; sat = 40 + Math.random() * 20; }       // blue-purple
      else if (roll < 0.55) { hue = 280 + Math.random() * 30; sat = 30 + Math.random() * 25; }  // violet
      else if (roll < 0.75) { hue = 30 + Math.random() * 25; sat = 35 + Math.random() * 20; }   // warm gold
      else { hue = 190 + Math.random() * 30; sat = 25 + Math.random() * 20; }                   // teal

      const isSpiral = Math.random() > 0.4;
      return {
        x: Math.random() * width, y: Math.random() * height,
        radiusX: 8 + Math.random() * 18,
        radiusY: 4 + Math.random() * 10,
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.00002,
        alpha: 0.015 + Math.random() * 0.035,
        hue, sat,
        pulseSpeed: 0.002 + Math.random() * 0.003,
        pulseOffset: Math.random() * Math.PI * 2,
        isSpiral,
        armCount: isSpiral ? (Math.random() > 0.5 ? 2 : 3) : 0,
      };
    }

    return {
      init() {
        stars = Array.from({ length: STAR_COUNT }, createStar);
        galaxies = Array.from({ length: GALAXY_COUNT }, createGalaxy);
        distantGalaxies = Array.from({ length: DISTANT_GALAXY_COUNT }, createDistantGalaxy);
        closeGalaxies = Array.from({ length: CLOSE_GALAXY_COUNT }, createCloseGalaxy);
        meteors = []; asteroids = [];
        nextMeteorTime = 0;
        nextAsteroidTime = 15000 + Math.random() * 15000;
      },

      draw(time, ts) {
        // close galaxies (drawn first, largest and furthest back)
        for (const cg of closeGalaxies) {
          cg.x += cg.driftX; cg.y += cg.driftY; cg.rotation += cg.rotSpeed;
          if (cg.x < -cg.radiusX * 2) cg.x = width + cg.radiusX;
          if (cg.x > width + cg.radiusX * 2) cg.x = -cg.radiusX;
          if (cg.y < -cg.radiusY * 2) cg.y = height + cg.radiusY;
          if (cg.y > height + cg.radiusY * 2) cg.y = -cg.radiusY;

          const pulse = 0.85 + 0.15 * Math.sin(time * cg.pulseSpeed + cg.pulseOffset);
          const a = cg.alpha * pulse;

          ctx.save();
          ctx.translate(cg.x, cg.y);
          ctx.rotate(cg.rotation);
          ctx.scale(1, cg.radiusY / cg.radiusX);

          // outer halo
          const haloGr = ctx.createRadialGradient(0, 0, 0, 0, 0, cg.radiusX * 1.3);
          haloGr.addColorStop(0, `hsla(${cg.hue},40%,60%,${a * 0.4})`);
          haloGr.addColorStop(0.3, `hsla(${cg.hue + 10},35%,50%,${a * 0.25})`);
          haloGr.addColorStop(0.6, `hsla(${cg.hue + 15},25%,40%,${a * 0.08})`);
          haloGr.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(0, 0, cg.radiusX * 1.3, 0, Math.PI * 2);
          ctx.fillStyle = haloGr;
          ctx.fill();

          // bright nucleus
          const nucleusGr = ctx.createRadialGradient(0, 0, 0, 0, 0, cg.radiusX * 0.15);
          nucleusGr.addColorStop(0, `hsla(${cg.hue - 10},50%,85%,${a * 3})`);
          nucleusGr.addColorStop(0.4, `hsla(${cg.hue},45%,70%,${a * 2})`);
          nucleusGr.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(0, 0, cg.radiusX * 0.15, 0, Math.PI * 2);
          ctx.fillStyle = nucleusGr;
          ctx.fill();

          // spiral arms
          for (let arm = 0; arm < cg.armCount; arm++) {
            const armAngle = (arm / cg.armCount) * Math.PI * 2;
            // main arm
            ctx.beginPath();
            for (let t = 0.05; t < 1; t += 0.01) {
              const angle = armAngle + t * Math.PI * cg.armTightness;
              const r = t * cg.radiusX;
              const px = Math.cos(angle) * r;
              const py = Math.sin(angle) * r;
              if (t <= 0.06) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            const armAlpha = a * 0.7 * (1 - 0.3 * Math.sin(time * 0.001 + arm));
            ctx.strokeStyle = `hsla(${cg.hue + 5},45%,65%,${armAlpha})`;
            ctx.lineWidth = 3 + cg.radiusX * 0.04;
            ctx.lineCap = 'round';
            ctx.stroke();

            // secondary glow along arm
            ctx.beginPath();
            for (let t = 0.05; t < 1; t += 0.01) {
              const angle = armAngle + t * Math.PI * cg.armTightness;
              const r = t * cg.radiusX;
              const px = Math.cos(angle) * r;
              const py = Math.sin(angle) * r;
              if (t <= 0.06) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.strokeStyle = `hsla(${cg.hue + 20},35%,55%,${armAlpha * 0.3})`;
            ctx.lineWidth = 8 + cg.radiusX * 0.08;
            ctx.stroke();

            // dust lane (darker inner edge)
            ctx.beginPath();
            for (let t = 0.1; t < 0.9; t += 0.015) {
              const angle = armAngle + t * Math.PI * cg.armTightness + 0.15;
              const r = t * cg.radiusX * 0.95;
              const px = Math.cos(angle) * r;
              const py = Math.sin(angle) * r;
              if (t <= 0.115) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.strokeStyle = `hsla(${cg.hue + 30},20%,15%,${a * 0.4})`;
            ctx.lineWidth = 1.5 + cg.radiusX * 0.015;
            ctx.stroke();
          }

          // embedded stars
          for (const es of cg.embeddedStars) {
            const sPulse = 0.5 + 0.5 * Math.sin(time * es.pulseSpeed + es.pulseOffset);
            const r = es.dist * cg.radiusX;
            const px = Math.cos(es.angle) * r;
            const py = Math.sin(es.angle) * r;
            const sa = es.alpha * a * sPulse * 4;
            ctx.beginPath();
            ctx.arc(px, py, es.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${cg.hue - 20 + Math.random() * 40},30%,90%,${sa})`;
            ctx.fill();
          }

          ctx.restore();
        }

        // distant galaxies (drawn behind stars but in front of close galaxies)
        for (const dg of distantGalaxies) {
          dg.rotation += dg.rotSpeed;
          const pulse = 0.8 + 0.2 * Math.sin(time * dg.pulseSpeed + dg.pulseOffset);
          const a = dg.alpha * pulse;

          ctx.save();
          ctx.translate(dg.x, dg.y);
          ctx.rotate(dg.rotation);
          ctx.scale(1, dg.radiusY / dg.radiusX);

          // core glow
          const coreGr = ctx.createRadialGradient(0, 0, 0, 0, 0, dg.radiusX);
          coreGr.addColorStop(0, `hsla(${dg.hue},${dg.sat + 10}%,75%,${a * 1.8})`);
          coreGr.addColorStop(0.15, `hsla(${dg.hue},${dg.sat}%,65%,${a * 1.2})`);
          coreGr.addColorStop(0.4, `hsla(${dg.hue + 10},${dg.sat - 5}%,50%,${a * 0.5})`);
          coreGr.addColorStop(0.7, `hsla(${dg.hue + 15},${dg.sat - 10}%,40%,${a * 0.15})`);
          coreGr.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(0, 0, dg.radiusX, 0, Math.PI * 2);
          ctx.fillStyle = coreGr;
          ctx.fill();

          // spiral arms for spiral galaxies
          if (dg.isSpiral) {
            ctx.globalAlpha = a * 0.6;
            for (let arm = 0; arm < dg.armCount; arm++) {
              const armAngle = (arm / dg.armCount) * Math.PI * 2;
              ctx.beginPath();
              for (let t = 0; t < 1; t += 0.02) {
                const angle = armAngle + t * Math.PI * 2.5;
                const r = t * dg.radiusX * 0.9;
                const px = Math.cos(angle) * r;
                const py = Math.sin(angle) * r;
                if (t === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
              }
              ctx.strokeStyle = `hsla(${dg.hue},${dg.sat + 5}%,70%,${a * 0.4})`;
              ctx.lineWidth = 1 + dg.radiusX * 0.06;
              ctx.lineCap = 'round';
              ctx.stroke();
            }
            ctx.globalAlpha = 1;
          }

          ctx.restore();
        }

        // galaxies
        for (const g of galaxies) {
          g.x += g.driftX; g.y += g.driftY; g.rotation += g.rotSpeed;
          if (g.x < -g.radiusX * 2) g.x = width + g.radiusX;
          if (g.x > width + g.radiusX * 2) g.x = -g.radiusX;
          if (g.y < -g.radiusY * 2) g.y = height + g.radiusY;
          if (g.y > height + g.radiusY * 2) g.y = -g.radiusY;
          ctx.save();
          ctx.translate(g.x, g.y); ctx.rotate(g.rotation);
          ctx.scale(1, g.radiusY / g.radiusX);
          const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, g.radiusX);
          gr.addColorStop(0, `hsla(${g.hue},60%,70%,${g.alpha * 1.5})`);
          gr.addColorStop(0.3, `hsla(${g.hue},50%,55%,${g.alpha})`);
          gr.addColorStop(0.7, `hsla(${g.hue + 20},40%,40%,${g.alpha * 0.4})`);
          gr.addColorStop(1, 'transparent');
          ctx.beginPath(); ctx.arc(0, 0, g.radiusX, 0, Math.PI * 2);
          ctx.fillStyle = gr; ctx.fill(); ctx.restore();
        }

        // stars
        for (const s of stars) {
          const a = s.baseAlpha * (0.45 + 0.55 * Math.sin(time * s.pulseSpeed + s.pulseOffset));
          const col = s.sat > 0
            ? `hsla(${s.hue},${s.sat}%,88%,${a})`
            : `rgba(255,255,255,${a})`;
          const gr = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 3.5);
          gr.addColorStop(0, col);
          gr.addColorStop(0.5, col.replace(a + ')', a * 0.25 + ')'));
          gr.addColorStop(1, 'transparent');
          ctx.beginPath(); ctx.arc(s.x, s.y, s.size * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = gr; ctx.fill();
          ctx.beginPath(); ctx.arc(s.x, s.y, s.size * 0.45, 0, Math.PI * 2);
          ctx.fillStyle = col; ctx.fill();
        }

        // meteors
        if (ts > nextMeteorTime) {
          const angle = Math.random() * Math.PI * 0.5 + Math.PI * 0.15;
          const spd = 4 + Math.random() * 4;
          meteors.push({
            x: Math.random() * width * 0.6 + width * 0.3,
            y: Math.random() * height * 0.3,
            vx: -Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
            life: 1, decay: 0.008 + Math.random() * 0.008,
            length: 60 + Math.random() * 80, width: 1.2 + Math.random(),
          });
          nextMeteorTime = ts + 6000 + Math.random() * 6000;
        }
        for (let i = meteors.length - 1; i >= 0; i--) {
          const m = meteors[i];
          m.x += m.vx; m.y += m.vy; m.life -= m.decay;
          if (m.life <= 0) { meteors.splice(i, 1); continue; }
          const mag = Math.sqrt(m.vx * m.vx + m.vy * m.vy);
          const tx = m.x - (m.vx / mag) * m.length, ty = m.y - (m.vy / mag) * m.length;
          const gr = ctx.createLinearGradient(m.x, m.y, tx, ty);
          gr.addColorStop(0, `rgba(255,255,255,${m.life * 0.9})`);
          gr.addColorStop(0.3, `rgba(200,220,255,${m.life * 0.5})`);
          gr.addColorStop(1, 'transparent');
          ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(tx, ty);
          ctx.strokeStyle = gr; ctx.lineWidth = m.width * m.life;
          ctx.lineCap = 'round'; ctx.stroke();
          const hg = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 3);
          hg.addColorStop(0, `rgba(255,255,255,${m.life})`);
          hg.addColorStop(1, 'transparent');
          ctx.beginPath(); ctx.arc(m.x, m.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = hg; ctx.fill();
        }

        // asteroids
        if (ts > nextAsteroidTime) {
          const fromL = Math.random() > 0.5, sz = 3 + Math.random() * 4;
          const verts = [], vc = 6 + Math.floor(Math.random() * 4);
          for (let i = 0; i < vc; i++) verts.push({ angle: (i / vc) * Math.PI * 2, r: sz * (0.6 + Math.random() * 0.4) });
          asteroids.push({
            x: fromL ? -20 : width + 20, y: Math.random() * height * 0.6 + height * 0.1,
            vx: (fromL ? 1 : -1) * (0.15 + Math.random() * 0.25), vy: (Math.random() - 0.5) * 0.1,
            rotation: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.008,
            size: sz, vertices: verts, alpha: 0.5 + Math.random() * 0.3,
          });
          nextAsteroidTime = ts + 30000 + Math.random() * 30000;
        }
        for (let i = asteroids.length - 1; i >= 0; i--) {
          const a = asteroids[i];
          a.x += a.vx; a.y += a.vy; a.rotation += a.rotSpeed;
          if (a.x < -50 || a.x > width + 50 || a.y < -50 || a.y > height + 50) { asteroids.splice(i, 1); continue; }
          ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(a.rotation);
          ctx.beginPath();
          ctx.moveTo(Math.cos(a.vertices[0].angle) * a.vertices[0].r, Math.sin(a.vertices[0].angle) * a.vertices[0].r);
          for (let j = 1; j < a.vertices.length; j++) ctx.lineTo(Math.cos(a.vertices[j].angle) * a.vertices[j].r, Math.sin(a.vertices[j].angle) * a.vertices[j].r);
          ctx.closePath();
          ctx.fillStyle = `rgba(160,150,140,${a.alpha * 0.6})`; ctx.fill();
          ctx.strokeStyle = `rgba(200,190,175,${a.alpha * 0.4})`; ctx.lineWidth = 0.5; ctx.stroke();
          const eg = ctx.createRadialGradient(-a.size * 0.3, -a.size * 0.3, 0, 0, 0, a.size);
          eg.addColorStop(0, `rgba(220,215,200,${a.alpha * 0.3})`); eg.addColorStop(1, 'transparent');
          ctx.fillStyle = eg; ctx.fill(); ctx.restore();
        }
      },
    };
  })();

  // ============================================================
  //  FOREST — drifting leaves, rare birds
  // ============================================================
  const forest = (() => {
    let leaves, birds, nextLeafTime, nextBirdTime;

    const LEAF_COLORS = [
      { h: 100, s: 50, l: 35 }, // dark green
      { h: 120, s: 40, l: 30 }, // forest green
      { h: 80, s: 45, l: 40 },  // yellow-green
      { h: 35, s: 60, l: 35 },  // autumn brown
      { h: 50, s: 50, l: 38 },  // olive
    ];

    function spawnLeaf() {
      const c = LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)];
      return {
        x: Math.random() * width,
        y: -20,
        size: 6 + Math.random() * 8,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        vy: 0.3 + Math.random() * 0.5,
        // horizontal sway
        swayAmp: 30 + Math.random() * 40,
        swaySpeed: 0.008 + Math.random() * 0.008,
        swayOffset: Math.random() * Math.PI * 2,
        baseX: Math.random() * width,
        alpha: 0.35 + Math.random() * 0.3,
        color: c,
        age: 0,
      };
    }

    function drawLeaf(l) {
      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(l.rotation);
      ctx.globalAlpha = l.alpha;

      const s = l.size;
      const c = l.color;

      // leaf body
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.8, -s * 0.5, s * 0.6, s * 0.5, 0, s);
      ctx.bezierCurveTo(-s * 0.6, s * 0.5, -s * 0.8, -s * 0.5, 0, -s);
      ctx.fillStyle = `hsla(${c.h},${c.s}%,${c.l}%,1)`;
      ctx.fill();

      // center vein
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.8);
      ctx.lineTo(0, s * 0.8);
      ctx.strokeStyle = `hsla(${c.h},${c.s - 10}%,${c.l - 10}%,0.6)`;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // side veins
      for (let v = -0.4; v <= 0.4; v += 0.4) {
        ctx.beginPath();
        ctx.moveTo(0, s * v);
        ctx.lineTo(s * 0.35, s * (v - 0.2));
        ctx.moveTo(0, s * v);
        ctx.lineTo(-s * 0.35, s * (v - 0.2));
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      ctx.restore();
    }

    function spawnBird() {
      const fromLeft = Math.random() > 0.5;
      const speed = 1.5 + Math.random() * 1.5;
      return {
        x: fromLeft ? -40 : width + 40,
        y: Math.random() * height * 0.35 + height * 0.05,
        vx: (fromLeft ? 1 : -1) * speed,
        vy: (Math.random() - 0.5) * 0.3,
        wingSpan: 10 + Math.random() * 8,
        flapSpeed: 0.06 + Math.random() * 0.04,
        flapOffset: Math.random() * Math.PI * 2,
        alpha: 0.3 + Math.random() * 0.25,
        age: 0,
      };
    }

    function drawBird(b) {
      const flap = Math.sin(b.age * b.flapSpeed + b.flapOffset);
      const wingY = flap * b.wingSpan * 0.5;

      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.globalAlpha = b.alpha;
      ctx.strokeStyle = `rgba(20,40,20,0.8)`;
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';

      // left wing
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-b.wingSpan * 0.5, wingY - 3, -b.wingSpan, wingY);
      ctx.stroke();

      // right wing
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(b.wingSpan * 0.5, wingY - 3, b.wingSpan, wingY);
      ctx.stroke();

      ctx.globalAlpha = 1;
      ctx.restore();
    }

    return {
      init() {
        leaves = []; birds = [];
        nextLeafTime = 0;
        nextBirdTime = 20000 + Math.random() * 25000;
      },

      draw(time, ts) {
        // spawn leaves — keep ~4 on screen
        if (ts > nextLeafTime && leaves.length < 5) {
          leaves.push(spawnLeaf());
          nextLeafTime = ts + 2000 + Math.random() * 3000;
        }

        for (let i = leaves.length - 1; i >= 0; i--) {
          const l = leaves[i];
          l.age++;
          l.y += l.vy;
          l.x = l.baseX + Math.sin(l.age * l.swaySpeed + l.swayOffset) * l.swayAmp;
          l.rotation += l.rotSpeed;
          if (l.y > height + 30) { leaves.splice(i, 1); continue; }
          drawLeaf(l);
        }

        // birds
        if (ts > nextBirdTime) {
          birds.push(spawnBird());
          nextBirdTime = ts + 35000 + Math.random() * 30000;
        }

        for (let i = birds.length - 1; i >= 0; i--) {
          const b = birds[i];
          b.age++;
          b.x += b.vx;
          b.y += b.vy + Math.sin(b.age * 0.01) * 0.15;
          if (b.x < -60 || b.x > width + 60) { birds.splice(i, 1); continue; }
          drawBird(b);
        }
      },
    };
  })();

  // ============================================================
  //  BEACH — water glitter, rare crab, distant birds
  // ============================================================
  const beach = (() => {
    const SPARKLE_COUNT = 60;
    let sparkles, crabs, birds, nextCrabTime, nextBirdTime;

    function createSparkle() {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1 + Math.random() * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulseOffset: Math.random() * Math.PI * 2,
        baseAlpha: 0.1 + Math.random() * 0.25,
        // warm tones
        hue: 35 + Math.random() * 30,
      };
    }

    function drawSparkles(time) {
      for (const s of sparkles) {
        const pulse = Math.sin(time * s.pulseSpeed + s.pulseOffset);
        // only show when pulse is high — creates intermittent glitter
        if (pulse < 0.3) continue;
        const a = s.baseAlpha * ((pulse - 0.3) / 0.7);

        // 4-point star sparkle
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.globalAlpha = a;

        const r = s.size;

        // horizontal + vertical lines with glow
        const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 3);
        gr.addColorStop(0, `hsla(${s.hue},80%,85%,${a})`);
        gr.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(0, 0, r * 3, 0, Math.PI * 2);
        ctx.fillStyle = gr; ctx.fill();

        // cross sparkle
        ctx.strokeStyle = `hsla(${s.hue},90%,90%,${a * 1.2})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(0, -r * 2); ctx.lineTo(0, r * 2);
        ctx.moveTo(-r * 2, 0); ctx.lineTo(r * 2, 0);
        ctx.stroke();

        // diagonal cross (smaller)
        ctx.beginPath();
        ctx.moveTo(-r, -r); ctx.lineTo(r, r);
        ctx.moveTo(r, -r); ctx.lineTo(-r, r);
        ctx.stroke();

        // bright center dot
        ctx.beginPath(); ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue},90%,95%,${a * 1.5})`;
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.restore();
      }
    }

    function spawnCrab() {
      const fromLeft = Math.random() > 0.5;
      const size = 8 + Math.random() * 5;
      return {
        x: fromLeft ? -30 : width + 30,
        y: height - 40 - Math.random() * 60,
        vx: (fromLeft ? 1 : -1) * (0.3 + Math.random() * 0.4),
        size,
        legPhase: 0,
        alpha: 0.4 + Math.random() * 0.25,
        dir: fromLeft ? 1 : -1,
      };
    }

    function drawCrab(c) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.scale(c.dir, 1);
      ctx.globalAlpha = c.alpha;

      const s = c.size;
      const legWave = Math.sin(c.legPhase) * 3;

      // body — oval
      ctx.beginPath();
      ctx.ellipse(0, 0, s, s * 0.6, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(180,80,60,0.7)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(140,50,35,0.5)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // eyes
      ctx.fillStyle = 'rgba(30,30,30,0.8)';
      ctx.beginPath(); ctx.arc(s * 0.4, -s * 0.45, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(-s * 0.4, -s * 0.45, 1.5, 0, Math.PI * 2); ctx.fill();
      // eye stalks
      ctx.strokeStyle = 'rgba(180,80,60,0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(s * 0.3, -s * 0.25); ctx.lineTo(s * 0.4, -s * 0.45);
      ctx.moveTo(-s * 0.3, -s * 0.25); ctx.lineTo(-s * 0.4, -s * 0.45);
      ctx.stroke();

      // claws
      ctx.strokeStyle = 'rgba(200,90,65,0.7)';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      // right claw
      ctx.beginPath();
      ctx.moveTo(s, 0);
      ctx.lineTo(s * 1.5, -s * 0.3);
      ctx.lineTo(s * 1.7, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(s * 1.5, -s * 0.3);
      ctx.lineTo(s * 1.65, -s * 0.15);
      ctx.stroke();
      // left claw
      ctx.beginPath();
      ctx.moveTo(-s, 0);
      ctx.lineTo(-s * 1.5, -s * 0.3);
      ctx.lineTo(-s * 1.7, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s * 1.5, -s * 0.3);
      ctx.lineTo(-s * 1.65, -s * 0.15);
      ctx.stroke();

      // legs (3 per side)
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(170,75,55,0.6)';
      for (let i = 0; i < 3; i++) {
        const offset = (i - 1) * s * 0.4;
        const wave = (i % 2 === 0 ? legWave : -legWave);
        // right legs
        ctx.beginPath();
        ctx.moveTo(s * 0.7, offset);
        ctx.lineTo(s * 1.1, offset + s * 0.4 + wave);
        ctx.stroke();
        // left legs
        ctx.beginPath();
        ctx.moveTo(-s * 0.7, offset);
        ctx.lineTo(-s * 1.1, offset + s * 0.4 - wave);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      ctx.restore();
    }

    function spawnBird() {
      const fromLeft = Math.random() > 0.5;
      const speed = 0.6 + Math.random() * 0.8;
      return {
        x: fromLeft ? -30 : width + 30,
        y: Math.random() * height * 0.25 + height * 0.03,
        vx: (fromLeft ? 1 : -1) * speed,
        vy: (Math.random() - 0.5) * 0.15,
        wingSpan: 5 + Math.random() * 4,
        flapSpeed: 0.05 + Math.random() * 0.03,
        flapOffset: Math.random() * Math.PI * 2,
        alpha: 0.25 + Math.random() * 0.15,
        age: 0,
      };
    }

    function drawBird(b) {
      const flap = Math.sin(b.age * b.flapSpeed + b.flapOffset);
      const wingY = flap * b.wingSpan * 0.45;

      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.globalAlpha = b.alpha;
      ctx.strokeStyle = 'rgba(30,30,40,0.7)';
      ctx.lineWidth = 1.2;
      ctx.lineCap = 'round';

      // left wing
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-b.wingSpan * 0.5, wingY - 2, -b.wingSpan, wingY);
      ctx.stroke();

      // right wing
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(b.wingSpan * 0.5, wingY - 2, b.wingSpan, wingY);
      ctx.stroke();

      ctx.globalAlpha = 1;
      ctx.restore();
    }

    return {
      init() {
        sparkles = Array.from({ length: SPARKLE_COUNT }, createSparkle);
        crabs = []; birds = [];
        nextCrabTime = 25000 + Math.random() * 35000;
        nextBirdTime = 8000 + Math.random() * 10000;
      },

      draw(time, ts) {
        drawSparkles(time);

        // crabs
        if (ts > nextCrabTime) {
          crabs.push(spawnCrab());
          nextCrabTime = ts + 40000 + Math.random() * 30000;
        }

        for (let i = crabs.length - 1; i >= 0; i--) {
          const c = crabs[i];
          c.x += c.vx;
          c.legPhase += 0.15;
          if (c.x < -50 || c.x > width + 50) { crabs.splice(i, 1); continue; }
          drawCrab(c);
        }

        // birds
        if (ts > nextBirdTime && birds.length < 3) {
          birds.push(spawnBird());
          nextBirdTime = ts + 10000 + Math.random() * 15000;
        }

        for (let i = birds.length - 1; i >= 0; i--) {
          const b = birds[i];
          b.age++;
          b.x += b.vx;
          b.y += b.vy + Math.sin(b.age * 0.008) * 0.1;
          if (b.x < -50 || b.x > width + 50) { birds.splice(i, 1); continue; }
          drawBird(b);
        }
      },
    };
  })();

  // ============================================================
  //  CYBERPUNK — Night City skyline, moon, terminal-green rain, AVs, glitches
  // ============================================================
  const cyberpunk = (() => {
    const RAIN_COUNT = 140;
    const NEON = ['#00ff41', '#00f0ff', '#fcee0a'];
    const WINDOW_COLORS = [
      'rgba(252,238,10,', // sodium yellow
      'rgba(0,240,255,',  // cyan
      'rgba(0,255,65,',   // terminal green
      'rgba(255,214,170,', // warm white
    ];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let backdrop, rain, signs, beacons, liveWindows, avs, nextAvTime, nextGlitchTime, glitchFrames;

    function pick(list) {
      return list[Math.floor(Math.random() * list.length)];
    }

    // The static scene (moon and both rows of buildings) is painted once into
    // an offscreen canvas; only the lights, rain and traffic redraw per frame.
    function paintMoon(bctx) {
      const r = Math.min(width, height) * 0.09;
      const x = width * 0.8, y = height * 0.2;

      const halo = bctx.createRadialGradient(x, y, r * 0.8, x, y, r * 3.2);
      halo.addColorStop(0, 'rgba(0,255,65,0.07)');
      halo.addColorStop(0.5, 'rgba(0,255,65,0.02)');
      halo.addColorStop(1, 'transparent');
      bctx.fillStyle = halo;
      bctx.beginPath(); bctx.arc(x, y, r * 3.2, 0, Math.PI * 2); bctx.fill();

      const face = bctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
      face.addColorStop(0, 'rgba(238,255,245,0.5)');
      face.addColorStop(1, 'rgba(195,230,212,0.38)');
      bctx.fillStyle = face;
      bctx.beginPath(); bctx.arc(x, y, r, 0, Math.PI * 2); bctx.fill();

      bctx.fillStyle = 'rgba(70,115,95,0.14)';
      for (const [cx, cy, cr] of [[-0.3, -0.1, 0.22], [0.25, 0.3, 0.15], [0.35, -0.35, 0.1], [-0.1, 0.45, 0.08]]) {
        bctx.beginPath(); bctx.arc(x + cx * r, y + cy * r, cr * r, 0, Math.PI * 2); bctx.fill();
      }
    }

    function paintSkyline(bctx, row) {
      let x = -10;
      while (x < width + 10) {
        const w = row.minW + Math.random() * (row.maxW - row.minW);
        const h = height * (row.minH + Math.random() * (row.maxH - row.minH));
        const top = height - h;

        const body = bctx.createLinearGradient(0, top, 0, height);
        body.addColorStop(0, row.top);
        body.addColorStop(1, row.bottom);
        bctx.fillStyle = body;
        bctx.fillRect(x, top, w, h);

        // stepped crown on some towers
        if (Math.random() < 0.35) {
          const cw = w * (0.4 + Math.random() * 0.3);
          const ch = 8 + Math.random() * 22;
          bctx.fillRect(x + (w - cw) / 2, top - ch, cw, ch);
        }

        // antenna with a red beacon on the tall ones
        if (row.beacons && h > height * row.maxH * 0.75 && Math.random() < 0.6) {
          const ax = x + w * (0.3 + Math.random() * 0.4);
          const ah = 14 + Math.random() * 26;
          bctx.strokeStyle = row.top;
          bctx.lineWidth = 2;
          bctx.beginPath(); bctx.moveTo(ax, top); bctx.lineTo(ax, top - ah); bctx.stroke();
          beacons.push({ x: ax, y: top - ah, period: 1400 + Math.random() * 1600, offset: Math.random() * 3000 });
        }

        // window grid
        for (let wy = top + row.cell; wy < height - row.cell; wy += row.cell * 1.6) {
          for (let wx = x + row.cell * 0.6; wx < x + w - row.cell; wx += row.cell * 1.3) {
            if (Math.random() > row.lit) continue;
            const color = pick(WINDOW_COLORS);
            const alpha = row.windowAlpha * (0.4 + Math.random() * 0.6);
            if (row.live && Math.random() < 0.04) {
              liveWindows.push({ x: wx, y: wy, w: row.cell * 0.6, h: row.cell * 0.8, color, alpha, on: true });
            } else {
              bctx.fillStyle = color + alpha + ')';
              bctx.fillRect(wx, wy, row.cell * 0.6, row.cell * 0.8);
            }
          }
        }

        // vertical neon sign hanging off the side of a near tower
        if (row.signs && w > 40 && Math.random() < 0.3) {
          const sh = 30 + Math.random() * 60;
          signs.push({
            x: x + (Math.random() < 0.5 ? 4 : w - 10),
            y: top + 20 + Math.random() * Math.max(10, h * 0.4 - sh),
            w: 6, h: sh,
            color: pick(NEON),
            flicker: Math.random() < 0.4,
          });
        }

        x += w + Math.random() * row.gap;
      }
    }

    function paintBackdrop() {
      backdrop = document.createElement('canvas');
      backdrop.width = width;
      backdrop.height = height;
      const bctx = backdrop.getContext('2d');

      paintMoon(bctx);

      // haze where the city lights hit the smog
      const haze = bctx.createLinearGradient(0, height * 0.55, 0, height);
      haze.addColorStop(0, 'transparent');
      haze.addColorStop(1, 'rgba(0,255,65,0.06)');
      bctx.fillStyle = haze;
      bctx.fillRect(0, height * 0.55, width, height * 0.45);

      paintSkyline(bctx, {
        minW: 18, maxW: 55, minH: 0.12, maxH: 0.34, gap: 6, cell: 4,
        top: 'rgba(8,22,16,0.92)', bottom: 'rgba(4,12,8,0.96)',
        lit: 0.18, windowAlpha: 0.35,
      });
      paintSkyline(bctx, {
        minW: 40, maxW: 110, minH: 0.08, maxH: 0.26, gap: 30, cell: 6,
        top: 'rgba(2,7,4,0.98)', bottom: 'rgba(0,2,1,1)',
        lit: 0.22, windowAlpha: 0.5,
        beacons: true, signs: true, live: true,
      });
    }

    function createDrop() {
      return {
        x: Math.random() * (width + 200) - 100,
        y: Math.random() * height,
        len: 10 + Math.random() * 18,
        speed: 9 + Math.random() * 8,
        alpha: 0.08 + Math.random() * 0.18,
        tint: Math.random() < 0.3 ? '0,255,65' : '160,240,255',
      };
    }

    function spawnAv() {
      const fromLeft = Math.random() > 0.5;
      return {
        x: fromLeft ? -40 : width + 40,
        y: height * (0.12 + Math.random() * 0.35),
        vx: (fromLeft ? 1 : -1) * (1.6 + Math.random() * 1.8),
        dir: fromLeft ? 1 : -1,
        bob: Math.random() * Math.PI * 2,
      };
    }

    function drawAv(av, time) {
      const y = av.y + Math.sin(time * 0.03 + av.bob) * 1.5;

      // light trail
      const trail = ctx.createLinearGradient(av.x, y, av.x - av.dir * 90, y);
      trail.addColorStop(0, 'rgba(0,255,65,0.45)');
      trail.addColorStop(1, 'transparent');
      ctx.strokeStyle = trail;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(av.x - av.dir * 8, y); ctx.lineTo(av.x - av.dir * 90, y); ctx.stroke();

      // hull
      ctx.fillStyle = 'rgba(20,14,34,0.95)';
      ctx.beginPath();
      ctx.moveTo(av.x - av.dir * 10, y + 2);
      ctx.lineTo(av.x + av.dir * 12, y + 2);
      ctx.lineTo(av.x + av.dir * 7, y - 3);
      ctx.lineTo(av.x - av.dir * 6, y - 3);
      ctx.closePath();
      ctx.fill();

      // headlight and taillight
      ctx.fillStyle = 'rgba(220,250,255,0.95)';
      ctx.fillRect(av.x + av.dir * 11 - 1, y - 1, 2, 2);
      ctx.fillStyle = 'rgba(255,40,60,0.95)';
      ctx.fillRect(av.x - av.dir * 10 - 1, y - 1, 2, 2);
    }

    function glitch() {
      const bands = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < bands; i++) {
        const y = Math.random() * height;
        const h = 3 + Math.random() * 24;
        const dx = (Math.random() - 0.5) * 50;
        ctx.drawImage(canvas, 0, y, width, h, dx, y, width, h);
        ctx.fillStyle = Math.random() < 0.5 ? 'rgba(0,255,65,0.12)' : 'rgba(0,240,255,0.12)';
        ctx.fillRect(0, y, width, h);
      }
    }

    return {
      init() {
        signs = []; beacons = []; liveWindows = []; avs = [];
        paintBackdrop();
        rain = Array.from({ length: RAIN_COUNT }, createDrop);
        nextAvTime = 4000 + Math.random() * 6000;
        nextGlitchTime = 8000 + Math.random() * 8000;
        glitchFrames = 0;
      },

      draw(time, ts) {
        ctx.drawImage(backdrop, 0, 0);

        // windows that switch on and off as the city lives
        if (Math.random() < 0.05 && liveWindows.length) {
          const w = pick(liveWindows);
          w.on = !w.on;
        }
        for (const w of liveWindows) {
          if (!w.on) continue;
          ctx.fillStyle = w.color + w.alpha + ')';
          ctx.fillRect(w.x, w.y, w.w, w.h);
        }

        // neon signs, some with a dying tube
        ctx.save();
        ctx.shadowBlur = 14;
        for (const s of signs) {
          const off = s.flicker && Math.sin(time * 0.13 + s.x) > 0.92 && Math.random() < 0.6;
          if (off) continue;
          ctx.shadowColor = s.color;
          ctx.fillStyle = s.color;
          ctx.globalAlpha = 0.55;
          ctx.fillRect(s.x, s.y, s.w, s.h);
        }
        ctx.restore();

        // red aircraft-warning beacons
        for (const b of beacons) {
          const phase = ((ts + b.offset) % b.period) / b.period;
          if (phase > 0.18) continue;
          const a = 1 - phase / 0.18;
          const gr = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 6);
          gr.addColorStop(0, `rgba(255,40,60,${a})`);
          gr.addColorStop(1, 'transparent');
          ctx.fillStyle = gr;
          ctx.beginPath(); ctx.arc(b.x, b.y, 6, 0, Math.PI * 2); ctx.fill();
        }

        // AVs crossing the sky
        if (ts > nextAvTime && avs.length < 2) {
          avs.push(spawnAv());
          nextAvTime = ts + 9000 + Math.random() * 14000;
        }
        for (let i = avs.length - 1; i >= 0; i--) {
          const av = avs[i];
          av.x += av.vx;
          if (av.x < -140 || av.x > width + 140) { avs.splice(i, 1); continue; }
          drawAv(av, time);
        }

        // slanted rain
        ctx.lineWidth = 1;
        for (const d of rain) {
          d.x -= d.speed * 0.18;
          d.y += d.speed;
          if (d.y > height) { d.y = -d.len; d.x = Math.random() * (width + 200) - 100; }
          ctx.strokeStyle = `rgba(${d.tint},${d.alpha})`;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x + d.len * 0.18, d.y - d.len);
          ctx.stroke();
        }

        // the odd frame of signal corruption
        if (!reduceMotion && ts > nextGlitchTime) {
          glitchFrames = 4 + Math.floor(Math.random() * 6);
          nextGlitchTime = ts + 10000 + Math.random() * 14000;
        }
        if (glitchFrames > 0) {
          glitchFrames--;
          glitch();
        }
      },
    };
  })();

  // ============================================================
  //  HOGWARTS — the Marauder's Map: inked corridors, wandering footprints
  // ============================================================
  const hogwarts = (() => {
    const CELL = 130;      // grid spacing; corridors run along the grid lines
    const HALL = 8;        // corridor half-width
    const INK = '59,38,18';
    const PRINT_LIFE = 4500;
    const LABEL_FONT = "italic 13px 'IM Fell English', Georgia, serif";
    const PLACES = [
      'The Great Hall', 'Gryffindor Tower', 'Room of Requirement', 'Astronomy Tower',
      'The Owlery', 'Restricted Section', 'Kitchens', "Prefects' Bathroom", 'Trophy Room',
      'Dungeons', 'Hospital Wing', 'Divination', 'Potions', 'Greenhouses', 'One-Eyed Witch',
      "Headmaster's Office", 'Charms', 'Library', 'Clock Tower', 'Common Room',
    ];
    const WANDERERS = [
      { name: 'Harry Potter' }, { name: 'Hermione Granger' }, { name: 'Ron Weasley' },
      { name: 'Severus Snape' }, { name: 'Albus Dumbledore' }, { name: 'Argus Filch' },
      { name: 'Mrs Norris', paws: true }, { name: 'Ani' },
    ];
    let backdrop, cols, rows, ox, oy, edges, rooms, towers, stairs, walkers;

    const nx = (i) => ox + i * CELL;
    const ny = (j) => oy + j * CELL;

    function shuffled(list) {
      const out = [...list];
      for (let i = out.length - 1; i > 0; i--) {
        const k = Math.floor(Math.random() * (i + 1));
        [out[i], out[k]] = [out[k], out[i]];
      }
      return out;
    }

    // Corridors are grid edges: "i,j,h" joins (i,j)-(i+1,j), "i,j,v" joins (i,j)-(i,j+1).
    function neighbours(i, j) {
      const out = [];
      if (edges.has(`${i},${j},h`)) out.push([i + 1, j]);
      if (edges.has(`${i - 1},${j},h`)) out.push([i - 1, j]);
      if (edges.has(`${i},${j},v`)) out.push([i, j + 1]);
      if (edges.has(`${i},${j - 1},v`)) out.push([i, j - 1]);
      return out;
    }

    function generate() {
      cols = Math.ceil(width / CELL) + 1;
      rows = Math.ceil(height / CELL) + 1;
      ox = -Math.random() * CELL * 0.5;
      oy = -Math.random() * CELL * 0.5;

      edges = new Set();
      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          if (i < cols && Math.random() < 0.6) edges.add(`${i},${j},h`);
          if (j < rows && Math.random() < 0.6) edges.add(`${i},${j},v`);
        }
      }

      rooms = []; towers = []; stairs = [];
      const names = shuffled(PLACES);
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = nx(i), y = ny(j), roll = Math.random();
          if (roll < 0.42) {
            const inset = () => HALL + 8 + Math.random() * 16;
            const l = x + inset(), t = y + inset(), r = x + CELL - inset(), b = y + CELL - inset();
            // a door wherever a corridor runs past that wall
            const door = (has) => (has ? 0.3 + Math.random() * 0.4 : null);
            rooms.push({
              l, t, r, b,
              doors: {
                top: door(edges.has(`${i},${j},h`)),
                bottom: door(edges.has(`${i},${j + 1},h`)),
                left: door(edges.has(`${i},${j},v`)),
                right: door(edges.has(`${i + 1},${j},v`)),
              },
              label: Math.random() < 0.45 ? names.pop() : null,
            });
          } else if (roll < 0.5) {
            towers.push({ x: x + CELL / 2, y: y + CELL / 2, r: 18 + Math.random() * 10, label: Math.random() < 0.6 ? names.pop() : null });
          } else if (roll < 0.6) {
            stairs.push({ x: x + 22 + Math.random() * (CELL - 80), y: y + 22 + Math.random() * (CELL - 70), w: 30 + Math.random() * 10, h: 18 + Math.random() * 8 });
          }
        }
      }
    }

    function wallWithDoor(bctx, x1, y1, x2, y2, door) {
      if (door === null) {
        bctx.moveTo(x1, y1); bctx.lineTo(x2, y2);
        return;
      }
      const gap = 9 / Math.hypot(x2 - x1, y2 - y1);
      bctx.moveTo(x1, y1);
      bctx.lineTo(x1 + (x2 - x1) * (door - gap), y1 + (y2 - y1) * (door - gap));
      bctx.moveTo(x1 + (x2 - x1) * (door + gap), y1 + (y2 - y1) * (door + gap));
      bctx.lineTo(x2, y2);
    }

    function label(bctx, text, x, y, maxW) {
      const words = text.split(' ');
      const lines = [];
      let line = '';
      for (const word of words) {
        const next = line ? line + ' ' + word : word;
        if (line && bctx.measureText(next).width > maxW) { lines.push(line); line = word; }
        else line = next;
      }
      lines.push(line);
      lines.forEach((l, k) => bctx.fillText(l, x, y + (k - (lines.length - 1) / 2) * 14));
    }

    // The static map is inked once into an offscreen canvas.
    function paintBackdrop() {
      backdrop = document.createElement('canvas');
      backdrop.width = width;
      backdrop.height = height;
      const bctx = backdrop.getContext('2d');

      // corridors: stroke wide, then cut the middle out, so junctions merge cleanly
      const halls = document.createElement('canvas');
      halls.width = width;
      halls.height = height;
      const hctx = halls.getContext('2d');
      hctx.beginPath();
      for (const key of edges) {
        const [i, j, d] = key.split(',');
        const x = nx(+i), y = ny(+j);
        hctx.moveTo(x, y);
        if (d === 'h') hctx.lineTo(x + CELL, y);
        else hctx.lineTo(x, y + CELL);
      }
      hctx.lineCap = 'square';
      hctx.strokeStyle = `rgb(${INK})`;
      hctx.lineWidth = HALL * 2 + 3;
      hctx.stroke();
      hctx.globalCompositeOperation = 'destination-out';
      hctx.lineWidth = HALL * 2;
      hctx.stroke();
      bctx.globalAlpha = 0.34;
      bctx.drawImage(halls, 0, 0);
      bctx.globalAlpha = 1;

      bctx.strokeStyle = `rgba(${INK},0.34)`;
      bctx.lineWidth = 1.3;
      for (const rm of rooms) {
        bctx.beginPath();
        wallWithDoor(bctx, rm.l, rm.t, rm.r, rm.t, rm.doors.top);
        wallWithDoor(bctx, rm.r, rm.t, rm.r, rm.b, rm.doors.right);
        wallWithDoor(bctx, rm.r, rm.b, rm.l, rm.b, rm.doors.bottom);
        wallWithDoor(bctx, rm.l, rm.b, rm.l, rm.t, rm.doors.left);
        bctx.stroke();
      }

      for (const tw of towers) {
        bctx.beginPath(); bctx.arc(tw.x, tw.y, tw.r, 0, Math.PI * 2); bctx.stroke();
        bctx.beginPath(); bctx.arc(tw.x, tw.y, tw.r * 0.65, 0, Math.PI * 2); bctx.stroke();
        bctx.beginPath();
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * Math.PI * 2;
          bctx.moveTo(tw.x + Math.cos(a) * tw.r * 0.65, tw.y + Math.sin(a) * tw.r * 0.65);
          bctx.lineTo(tw.x + Math.cos(a) * tw.r, tw.y + Math.sin(a) * tw.r);
        }
        bctx.stroke();
      }

      // staircases, hatched
      bctx.lineWidth = 1;
      for (const st of stairs) {
        bctx.strokeRect(st.x, st.y, st.w, st.h);
        bctx.beginPath();
        for (let x = st.x + 4; x < st.x + st.w; x += 4) { bctx.moveTo(x, st.y); bctx.lineTo(x, st.y + st.h); }
        bctx.stroke();
      }

      bctx.font = LABEL_FONT;
      bctx.textAlign = 'center';
      bctx.textBaseline = 'middle';
      bctx.fillStyle = `rgba(${INK},0.55)`;
      for (const rm of rooms) {
        if (rm.label) label(bctx, rm.label, (rm.l + rm.r) / 2, (rm.t + rm.b) / 2, rm.r - rm.l - 8);
      }
      for (const tw of towers) {
        if (tw.label) label(bctx, tw.label, tw.x, tw.y + tw.r + 14, CELL - 20);
      }

      // the makers' credit, tucked into a corner above the footer
      bctx.textAlign = 'left';
      bctx.fillStyle = `rgba(${INK},0.5)`;
      bctx.font = "italic 15px 'IM Fell English', Georgia, serif";
      bctx.fillText('Messrs Moony, Wormtail, Padfoot & Prongs', 24, height - 104);
      bctx.font = "italic 13px 'IM Fell English', Georgia, serif";
      bctx.fillText('are proud to present the Marauder’s Map', 24, height - 86);
    }

    function spawnWalker(ts) {
      const busy = new Set(walkers.map((w) => w.name));
      const who = shuffled(WANDERERS).find((w) => !busy.has(w.name)) || WANDERERS[0];
      let i, j, tries = 0;
      do {
        i = Math.floor(Math.random() * cols);
        j = Math.floor(Math.random() * rows);
      } while (!neighbours(i, j).length && ++tries < 50);
      const w = {
        name: who.name, paws: !!who.paws,
        stride: who.paws ? 9 : 15,
        interval: who.paws ? 230 : 400,
        i, j, prev: null, dir: null, next: null, t: 0, side: 1,
        prints: [], stepsLeft: 45 + Math.floor(Math.random() * 60),
        nextStep: ts + Math.random() * 800,
      };
      pickNext(w);
      walkers.push(w);
    }

    // Wander the corridors, mostly straight on, never doubling back unless stuck.
    function pickNext(w) {
      const options = neighbours(w.i, w.j);
      if (!options.length) { w.stepsLeft = 0; return; }
      let choices = options.filter((n) => !(w.prev && n[0] === w.prev[0] && n[1] === w.prev[1]));
      if (!choices.length) choices = options;
      let next = null;
      if (w.dir && Math.random() < 0.55) {
        next = choices.find((n) => n[0] - w.i === w.dir[0] && n[1] - w.j === w.dir[1]) || null;
      }
      next = next || choices[Math.floor(Math.random() * choices.length)];
      w.dir = [next[0] - w.i, next[1] - w.j];
      w.prev = [w.i, w.j];
      w.next = next;
      w.t = 0;
    }

    function step(w, ts) {
      w.t += w.stride;
      if (w.t >= CELL) {
        [w.i, w.j] = w.next;
        pickNext(w);
        if (!w.stepsLeft) return;
      }
      const [dx, dy] = w.dir;
      w.side = -w.side;
      const sway = w.side * (w.paws ? 2.5 : 4);
      w.prints.push({
        x: nx(w.i) + dx * w.t - dy * sway + (Math.random() - 0.5),
        y: ny(w.j) + dy * w.t + dx * sway + (Math.random() - 0.5),
        angle: Math.atan2(dy, dx),
        born: ts,
      });
      w.stepsLeft--;
    }

    function drawPrint(p, a, paws) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle + Math.PI / 2);
      ctx.scale(1.4, 1.4);
      ctx.fillStyle = `rgba(${INK},${0.75 * a})`;
      ctx.beginPath();
      if (paws) {
        ctx.ellipse(0, 1.5, 2, 1.6, 0, 0, Math.PI * 2);
        for (const [tx, ty] of [[-1.9, -1.4], [-0.7, -2.6], [0.7, -2.6], [1.9, -1.4]]) {
          ctx.moveTo(tx + 0.8, ty);
          ctx.arc(tx, ty, 0.8, 0, Math.PI * 2);
        }
      } else {
        ctx.ellipse(0, -2.5, 2.4, 3.8, 0, 0, Math.PI * 2);
        ctx.moveTo(2, 4.2);
        ctx.ellipse(0, 4.2, 2, 2.2, 0, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.restore();
    }

    function drawBanner(w, x, y, a) {
      ctx.save();
      ctx.globalAlpha = a;
      ctx.font = LABEL_FONT;
      const tw = ctx.measureText(w.name).width;
      const bx = x + 10, by = y - 24, bw = tw + 12, bh = 18;
      ctx.fillStyle = 'rgba(243,230,196,0.92)';
      ctx.strokeStyle = `rgba(${INK},0.6)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bx, by); ctx.lineTo(bx + bw, by);
      ctx.lineTo(bx + bw - 4, by + bh / 2); ctx.lineTo(bx + bw, by + bh);
      ctx.lineTo(bx, by + bh); ctx.lineTo(bx + 4, by + bh / 2);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = `rgba(${INK},0.9)`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(w.name, bx + 6, by + bh / 2 + 1);
      ctx.restore();
    }

    return {
      init() {
        generate();
        paintBackdrop();
        walkers = [];
        // Map labels need the hand-lettered face; re-ink once it has loaded.
        document.fonts?.load(LABEL_FONT).then(() => {
          if (currentTheme === 'hogwarts') paintBackdrop();
        });
      },

      draw(time, ts) {
        ctx.drawImage(backdrop, 0, 0);

        while (walkers.length < 3) spawnWalker(ts);

        for (let k = walkers.length - 1; k >= 0; k--) {
          const w = walkers[k];
          if (w.stepsLeft > 0 && ts >= w.nextStep) {
            step(w, ts);
            w.nextStep = ts + w.interval * (0.85 + Math.random() * 0.3);
          }
          w.prints = w.prints.filter((p) => ts - p.born < PRINT_LIFE);
          for (const p of w.prints) {
            const age = ts - p.born;
            drawPrint(p, Math.min(1, age / 150) * (1 - age / PRINT_LIFE), w.paws);
          }
          const last = w.prints[w.prints.length - 1];
          if (last) {
            const fade = w.stepsLeft > 0 ? 1 : 1 - (ts - last.born) / PRINT_LIFE;
            drawBanner(w, last.x, last.y, Math.max(0, fade));
          } else if (w.stepsLeft <= 0) {
            walkers.splice(k, 1); // mischief managed
          }
        }
      },
    };
  })();

  // ============================================================
  //  MAIN LOOP
  // ============================================================
  const renderers = { night, forest, beach, cyberpunk, hogwarts };

  function getTheme() {
    return document.documentElement.getAttribute('data-theme') || 'night';
  }

  function initRenderer() {
    resize();
    const r = renderers[currentTheme];
    if (r) r.init();
  }

  let time = 0;
  function animate(ts) {
    if (!running) return;
    time++;
    ctx.clearRect(0, 0, width, height);
    const r = renderers[currentTheme];
    if (r) r.draw(time, ts);
    animationId = requestAnimationFrame(animate);
  }

  function start() {
    if (running) return;
    running = true;
    canvas.style.display = 'block';
    initRenderer();
    animationId = requestAnimationFrame(animate);
  }

  function stop() {
    running = false;
    canvas.style.display = 'none';
    cancelAnimationFrame(animationId);
  }

  function onThemeChange() {
    const theme = getTheme();
    currentTheme = theme;
    if (theme === 'reading') {
      stop();
    } else {
      stop();
      running = false;
      start();
    }
  }

  new MutationObserver(onThemeChange)
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  window.addEventListener('resize', () => {
    resize();
    // re-init sparkles/stars positions on resize
    const r = renderers[currentTheme];
    if (r) r.init();
  });

  currentTheme = getTheme();
  if (currentTheme !== 'reading') start();  
}
