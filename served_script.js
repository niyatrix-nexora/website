function isTemplatePreview() {
  return window.location.protocol === 'file:' || window.location.pathname.indexOf('/website/templates/') !== -1;
}

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

const NN_REDUCE_MOTION = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const NN_COARSE_POINTER = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
const NN_LOW_POWER = NN_REDUCE_MOTION || (navigator.deviceMemory && navigator.deviceMemory <= 4);
const NN_DPR_CAP = NN_LOW_POWER ? 1 : 1.4;
const NN_HERO_TUBE_SEGMENTS = NN_LOW_POWER ? 220 : 420;
const NN_HERO_RADIAL_SEGMENTS = NN_LOW_POWER ? 8 : 12;

function fixPreviewTemplateLinks() {
  if (!isTemplatePreview()) return;

  const previewPages = {
    home: 'demo2.html',
    blog: 'blog.html',
    careers: 'careers.html'
  };

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    const routeMatch = href.match(/\{\%\s*url\s+['"]([^'"]+)['"]\s*\%\}(.*)/);
    if (!routeMatch || !previewPages[routeMatch[1]]) return;

    link.setAttribute('href', previewPages[routeMatch[1]] + routeMatch[2]);
  });
}
// ── CURSOR
function ensureCursorElement(id) {

      let element = document.getElementById(id);
      if (element) return element;

      element = document.createElement('div');
      element.id = id;
      (document.body || document.documentElement).appendChild(element);
      return element;
    }

    const dot = ensureCursorElement('dot');
    const trail = ensureCursorElement('trail');

    if (!NN_LOW_POWER && !NN_COARSE_POINTER) {
      let mx = 0, my = 0, tx = 0, ty = 0;
      document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        dot.style.left = mx + 'px'; dot.style.top = my + 'px';
        if(dot.style.opacity === '0' || !dot.style.opacity) { dot.style.opacity = '1'; trail.style.opacity = '1'; }
      });
      document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; trail.style.opacity = '0'; });
      (function lerp() {
        if (!document.hidden) {
          tx += (mx - tx) * .13;
          ty += (my - ty) * .13;
          trail.style.left = Math.round(tx) + 'px';
          trail.style.top = Math.round(ty) + 'px';
        }
        requestAnimationFrame(lerp);
      })();
    }


    function closeMenu() {
      const menuButton = document.querySelector('.menu-btn');
      const navMobile = document.querySelector('.nav-mobile');
      if (!menuButton || !navMobile) return;
      menuButton.classList.remove('active');
      navMobile.classList.remove('active');
    }

    function toggleMenu() {
      const menuButton = document.querySelector('.menu-btn');
      const navMobile = document.querySelector('.nav-mobile');
      if (!menuButton || !navMobile) return;
      menuButton.classList.toggle('active');
      navMobile.classList.toggle('active');
    }
    document.querySelectorAll('.nav-mobile a').forEach(a => {
      a.addEventListener('click', () => { closeMenu(); });
    });

    // Also close mobile nav when clicking the CTA
    const cta = document.querySelector('.nav-cta');
    if (cta) {
      cta.addEventListener('click', () => {
        closeMenu();
      });
    }

    // ── NAVBAR — hide on scroll down, show on scroll up, disappear past hero
    const navbar = document.querySelector('nav');
    if (navbar) {
      const hero = document.getElementById('hero');
      let lastY = window.scrollY;
      let heroVisible = true;

      // Watch hero section — when it leaves viewport, nav can hide on scroll down
      if (hero) {
        const heroObs = new IntersectionObserver(entries => {
          heroVisible = entries[0].isIntersecting;
          if (heroVisible) {
            // Back in hero — always show nav
            navbar.classList.remove('nav-hidden', 'nav-scrolled');
            navbar.classList.add('nav-visible');
          }
        }, { threshold: 0.05 });
        heroObs.observe(hero);
      }

      let _scrollTicking = false;
      window.addEventListener('scroll', () => {
        if (_scrollTicking) return;
        _scrollTicking = true;
        requestAnimationFrame(() => {
          const currentY = window.scrollY;
          const delta = currentY - lastY;
          if (heroVisible || currentY < 80) {
            navbar.classList.remove('nav-hidden', 'nav-scrolled');
            navbar.classList.add('nav-visible');
          } else if (delta > 4) {
            navbar.classList.add('nav-hidden');
            navbar.classList.remove('nav-visible');
            closeMenu();
          } else if (delta < -4) {
            navbar.classList.remove('nav-hidden');
            navbar.classList.add('nav-visible', 'nav-scrolled');
          }
          lastY = currentY;
          _scrollTicking = false;
        });
      }, { passive: true });
    }


    // ══════════════════════════════════════════════
    // ── HERO BACKGROUND — 3D INFINITY SYMBOL ──
    // ══════════════════════════════════════════════
    const bgC = document.getElementById('bg');
    if (window.THREE && bgC) {
    const hero = document.getElementById('hero');
    const ren = new THREE.WebGLRenderer({ canvas: bgC, alpha: true, antialias: false, powerPreference: 'high-performance' });
    ren.setPixelRatio(Math.min(devicePixelRatio, NN_DPR_CAP));
    ren.setSize(innerWidth, innerHeight);
    ren.toneMapping = THREE.ACESFilmicToneMapping;
    ren.toneMappingExposure = 1.1;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x010610);
    scene.fog = new THREE.FogExp2(0x010610, 0.015);
    const cam = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, .1, 600);
    cam.position.set(0, 0, 8);
    cam.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0x001833, .6));
    const emeraldKey = new THREE.PointLight(0x00ff99, 4, 35); emeraldKey.position.set(0, 9, 4); scene.add(emeraldKey);
    const cyanFill = new THREE.PointLight(0x00eeff, 2.5, 28); cyanFill.position.set(-9, 4, 2); scene.add(cyanFill);
    const blueRight = new THREE.PointLight(0x0066ff, 1.8, 22); blueRight.position.set(9, 3, -1); scene.add(blueRight);
    const purpleBack = new THREE.PointLight(0x6600ff, 1.2, 18); purpleBack.position.set(0, 6, -8); scene.add(purpleBack);
    const groundGlow = new THREE.PointLight(0x00ff88, 1.0, 12); groundGlow.position.set(0, -3, 0); scene.add(groundGlow);

    class Lemniscate extends THREE.Curve {
      constructor(a = 4.5) { super(); this.a = a; }
      getPoint(t, out = new THREE.Vector3()) {
        const th = t * Math.PI * 2;
        const d = 1 + Math.sin(th) ** 2;
        const x = this.a * Math.cos(th) / d;
        const y = this.a * Math.sin(th) * Math.cos(th) / d;
        const z = Math.sin(th * 2) * .3;
        return out.set(x, y, z);
      }
    }
    const lemCurve = new Lemniscate();
    const heroTubes = [];

    const coreGeo = new THREE.TubeGeometry(lemCurve, NN_HERO_TUBE_SEGMENTS, .14, NN_HERO_RADIAL_SEGMENTS, true);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0x5b6ef5, emissive: 0x1a237e, emissiveIntensity: 1.2, transparent: true, opacity: .9, roughness: .1, metalness: .6 });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat); scene.add(coreMesh); heroTubes.push(coreMesh);

    const wireGeo = new THREE.TubeGeometry(lemCurve, NN_HERO_TUBE_SEGMENTS, .055, NN_HERO_RADIAL_SEGMENTS, true);
    const wireMat = new THREE.MeshStandardMaterial({ color: 0x9b87f5, emissive: 0x4a1d96, emissiveIntensity: 2, transparent: true, opacity: .7, roughness: .05, metalness: .8 });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat); scene.add(wireMesh); heroTubes.push(wireMesh);

    [
      { r: .28, col: 0x5b6ef5, op: .035 },
      { r: .42, col: 0x00d4ff, op: .025 }
    ].forEach(({ r, col, op }) => {
      const g = new THREE.TubeGeometry(lemCurve, Math.floor(NN_HERO_TUBE_SEGMENTS * 0.6), r, NN_HERO_RADIAL_SEGMENTS, true);
      const m = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide });
      const mesh = new THREE.Mesh(g, m); scene.add(mesh); heroTubes.push(mesh);
    });

    const coreSphereMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc, blending: THREE.AdditiveBlending, transparent: true, opacity: .55, depthWrite: false });
    const coreSphere = new THREE.Mesh(new THREE.SphereGeometry(.4, 32, 32), coreSphereMat); scene.add(coreSphere);
    const coreGlowMat = new THREE.MeshBasicMaterial({ color: 0x00aaff, blending: THREE.AdditiveBlending, transparent: true, opacity: .18, depthWrite: false });
    const coreGlow = new THREE.Mesh(new THREE.SphereGeometry(.9, 32, 32), coreGlowMat); scene.add(coreGlow);
    coreSphere.visible = false;
    coreGlow.visible = false;

    const aVert = `
uniform float uTime;
uniform float uSpeed;
uniform float uBend;
varying vec2 vUv;
varying float vIntensity;
void main(){
  vUv=uv;
  vec3 p=position;
  float wave=sin(p.x*0.35+uTime*uSpeed)*uBend
    +sin(p.x*0.7-uTime*uSpeed*0.6)*uBend*0.5
    +cos(p.x*0.2+uTime*uSpeed*0.4+1.2)*uBend*0.35;
  p.z+=wave;
  p.y+=sin(p.x*0.15+uTime*0.25)*0.4;
  vIntensity=(wave/uBend)*0.5+0.5;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
}`;

    const aFrag = `
uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uOpacity;
varying vec2 vUv;
varying float vIntensity;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p);
  f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
void main(){
  vec2 uv=vUv;
  float curtainFade=smoothstep(0.0,0.18,uv.y)*smoothstep(1.0,0.55,uv.y);
  float edgeFade=smoothstep(0.0,0.05,uv.x)*smoothstep(1.0,0.95,uv.x);
  float s1=pow(abs(sin(uv.x*28.0+uTime*1.1)),4.0);
  float s2=pow(abs(sin(uv.x*17.0-uTime*0.7+0.8)),3.5);
  float s3=pow(abs(sin(uv.x*43.0+uTime*1.4+2.1)),5.0);
  float strands=s1*0.5+s2*0.3+s3*0.2;
  float n1=noise(uv*vec2(5.0,9.0)+vec2(uTime*0.25,0.0));
  float n2=noise(uv*vec2(9.0,5.0)+vec2(0.0,-uTime*0.18));
  float n3=noise(uv*vec2(14.0,14.0)+uTime*0.12);
  float organic=n1*0.5+n2*0.35+n3*0.15;
  float colorShift=sin(uv.x*2.8+uTime*0.35)*0.5+0.5;
  float colorShift2=cos(uv.x*1.6-uTime*0.28+1.4)*0.5+0.5;
  vec3 col=mix(uColor1,uColor2,colorShift);
  col=mix(col,uColor3,colorShift2*0.5);
  float b=pow(clamp(strands*organic*vIntensity,0.0,1.0),0.65);
  float alpha=curtainFade*edgeFade*b*uOpacity;
  col+=uColor1*pow(uv.y,3.0)*0.4;
  gl_FragColor=vec4(col,clamp(alpha,0.0,1.0));
}`;

    function mkAurora({ w, h, seg, pos, rot, c1, c2, c3, op, speed, bend }) {
      const geo = new THREE.PlaneGeometry(w, h, NN_LOW_POWER ? Math.min(seg, 28) : seg, NN_LOW_POWER ? 24 : 48);
      const mat = new THREE.ShaderMaterial({
        vertexShader: aVert, fragmentShader: aFrag,
        uniforms: { uTime: { value: 0 }, uSpeed: { value: speed }, uBend: { value: bend }, uColor1: { value: new THREE.Color(c1) }, uColor2: { value: new THREE.Color(c2) }, uColor3: { value: new THREE.Color(c3) }, uOpacity: { value: op } },
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...pos); mesh.rotation.set(...rot); scene.add(mesh);
      return mesh;
    }

    const auroraLayers = [
      mkAurora({ w: 90, h: 35, seg: 90, pos: [0, 18, -22], rot: [0, 0, 0], c1: 0x00ff88, c2: 0x00eeff, c3: 0x001166, op: .85, speed: .55, bend: 1.8 }),
      mkAurora({ w: 55, h: 28, seg: 65, pos: [-35, 14, -16], rot: [0, .45, 0], c1: 0x00dd77, c2: 0x00bbff, c3: 0x220055, op: .65, speed: .42, bend: 1.4 }),
      mkAurora({ w: 55, h: 28, seg: 65, pos: [35, 14, -16], rot: [0, -.45, 0], c1: 0x00ff99, c2: 0x0099ee, c3: 0x110033, op: .60, speed: .48, bend: 1.6 }),
      mkAurora({ w: 45, h: 22, seg: 55, pos: [0, 11, -4], rot: [.12, 0, 0], c1: 0x00ffbb, c2: 0x00ffdd, c3: 0x003399, op: .38, speed: .68, bend: 1.2 }),
      mkAurora({ w: 130, h: 45, seg: 110, pos: [0, 25, -45], rot: [0, 0, 0], c1: 0x003322, c2: 0x001a44, c3: 0x0a0015, op: .92, speed: .30, bend: 2.4 }),
      mkAurora({ w: 70, h: 30, seg: 75, pos: [15, 16, -30], rot: [0, -.2, 0], c1: 0x00cc66, c2: 0x0055cc, c3: 0x220044, op: .50, speed: .38, bend: 1.5 }),
      mkAurora({ w: 70, h: 30, seg: 75, pos: [-15, 16, -30], rot: [0, .2, 0], c1: 0x00bb55, c2: 0x0044bb, c3: 0x110033, op: .45, speed: .44, bend: 1.3 })
    ];

    const STARS = NN_LOW_POWER ? 450 : 1100;
    const starPos = new Float32Array(STARS * 3);
    for (let i = 0; i < STARS; i++) {
      starPos[i * 3] = (Math.random() - .5) * 500;
      starPos[i * 3 + 1] = Math.random() * 220 - 10;
      starPos[i * 3 + 2] = (Math.random() - .5) * 500;
    }
    const starGeo = new THREE.BufferGeometry(); starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: .12, transparent: true, opacity: .78, blending: THREE.AdditiveBlending, sizeAttenuation: true })));

    const PC = NN_LOW_POWER ? 90 : 220;
    const driftPos = new Float32Array(PC * 3), driftVel = new Float32Array(PC * 3);
    for (let i = 0; i < PC; i++) {
      driftPos[i * 3] = (Math.random() - .5) * 32; driftPos[i * 3 + 1] = (Math.random() - .5) * 18; driftPos[i * 3 + 2] = (Math.random() - .5) * 20;
      driftVel[i * 3] = (Math.random() - .5) * .018; driftVel[i * 3 + 1] = .006 + Math.random() * .012; driftVel[i * 3 + 2] = (Math.random() - .5) * .010;
    }
    const driftGeo = new THREE.BufferGeometry(); driftGeo.setAttribute('position', new THREE.BufferAttribute(driftPos, 3));
    const driftMesh = new THREE.Points(driftGeo, new THREE.PointsMaterial({ color: 0x00ffaa, size: .06, transparent: true, opacity: .50, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(driftMesh);

    const floorMat = new THREE.MeshStandardMaterial({ color: 0x001520, metalness: .85, roughness: .08, transparent: true, opacity: .55 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), floorMat); floor.rotation.x = -Math.PI / 2; floor.position.y = -5.2; scene.add(floor);
    floor.visible = false;
    [[6, 9, 0x00ff99, .14], [10, 14, 0x00ddff, .07], [15, 20, 0x0055ff, .04]].forEach(([ri, ro, col, op]) => {
      const ring = new THREE.Mesh(new THREE.RingGeometry(ri, ro, 64), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false }));
      ring.rotation.x = -Math.PI / 2; ring.position.y = -5.1; ring.visible = false; scene.add(ring);
    });

    let mxN = 0, myN = 0;
    document.addEventListener('mousemove', e => { mxN = (e.clientX / innerWidth - .5) * 2; myN = -(e.clientY / innerHeight - .5) * 2 });
    const clock = new THREE.Clock();
    let heroTime = 0;
    let bgActive = false;
    let bgFrame = 0;
    function animBg() {
      if (!bgActive) { bgFrame = 0; return; }
      bgFrame = requestAnimationFrame(animBg);
      const dt = clock.getDelta(); heroTime += dt;
      auroraLayers.forEach((layer, i) => { layer.material.uniforms.uTime.value = heroTime + i * 1.8; });
      const iy = 0;
      const irx = myN * .04;
      const iry = heroTime * .32 + mxN * .08;
      heroTubes.forEach(mesh => { mesh.position.y = iy; mesh.rotation.x = irx; mesh.rotation.y = iry; });
      coreSphere.position.y = iy; coreGlow.position.y = iy;
      coreMat.emissiveIntensity = 1 + .4 * Math.sin(heroTime * 1.5);
      wireMat.emissiveIntensity = 2 + .8 * Math.sin(heroTime * 2 + 1);
      coreSphere.material.opacity = .4 + Math.sin(heroTime * 2.1) * .2;
      const pa = driftGeo.attributes.position.array;
      for (let i = 0; i < PC; i++) {
        pa[i * 3] += driftVel[i * 3]; pa[i * 3 + 1] += driftVel[i * 3 + 1]; pa[i * 3 + 2] += driftVel[i * 3 + 2];
        if (pa[i * 3 + 1] > 12) { pa[i * 3 + 1] = -8; pa[i * 3] = (Math.random() - .5) * 32; pa[i * 3 + 2] = (Math.random() - .5) * 20; }
      }
      driftGeo.attributes.position.needsUpdate = true;
      cam.position.x += (mxN * .5 - cam.position.x) * .02;
      cam.position.y += (myN * .3 - cam.position.y) * .02;
      cam.position.z = 8;
      cam.lookAt(0, 0, 0);
      emeraldKey.intensity = 3.5 + Math.sin(heroTime * .9) * .8;
      cyanFill.position.x = -9 + Math.sin(heroTime * .27) * 2;
      groundGlow.intensity = .8 + Math.sin(heroTime * 1.4) * .4;
      ren.render(scene, cam);
    }

    function setBgActive(active) {
      bgActive = active && !document.hidden && !NN_LOW_POWER;
      if (bgActive && !bgFrame) animBg();
      if (!bgActive && bgFrame) {
        cancelAnimationFrame(bgFrame);
        bgFrame = 0;
      }
      if (bgC) {
        bgC.style.display = bgActive ? 'block' : 'none';
      }
    }

    if (hero) {
      const bgObs = new IntersectionObserver(entries => {
        setBgActive(entries[0].isIntersecting);
      }, { threshold: 0.01 });
      bgObs.observe(hero);
    } else {
      setBgActive(true);
    }

    document.addEventListener('visibilitychange', () => {
      setBgActive(!document.hidden && (!hero || hero.getBoundingClientRect().bottom > 0));
    });

    if (NN_LOW_POWER) ren.render(scene, cam);

    window.addEventListener('resize', debounce(() => {
      cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix();
      ren.setSize(innerWidth, innerHeight);
    }, 150));
    }

    // About section uses a dedicated Three.js stack on the right side.

    // ── MATRIX SCRAMBLE & SPLIT TEXT UTILITIES ──
    function scrambleText(el, text) {
      const chars = '!<>-_\\/[]{}—=+*^?#________';
      const original = text;
      const length = original.length;
      const queue = [];
      let frame = 0;

      for (let i = 0; i < length; i++) {
        const to = original[i];
        if (to === ' ' || to === '\n') {
          queue.push({ to, start: 0, end: 0, char: to });
          continue;
        }
        const start = Math.floor(Math.random() * 8);
        const end = start + Math.floor(Math.random() * 12) + 4;
        queue.push({ to, start, end, char: '' });
      }

      function update() {
        let output = '';
        let complete = 0;
        for (let i = 0; i < length; i++) {
          const { to, start, end, char } = queue[i];
          if (to === ' ' || to === '\n') {
            output += to;
            complete++;
            continue;
          }
          if (frame >= end) {
            complete++;
            output += to;
          } else if (frame >= start) {
            if (!queue[i].char || Math.random() < 0.28) {
              queue[i].char = chars[Math.floor(Math.random() * chars.length)];
            }
            output += `<span class="text-accent2" style="opacity:0.8;">${queue[i].char}</span>`;
          } else {
            output += '';
          }
        }
        el.innerHTML = output;
        if (complete < length) {
          requestAnimationFrame(update);
          frame++;
        } else {
          el.textContent = original;
        }
      }
      update();
    }

    function initSplitText() {
      document.querySelectorAll('.section-title').forEach(title => {
        if (title.dataset.split) return;
        title.dataset.split = "true";

        const text = title.innerHTML.trim();
        const parts = text.split(/(<br\s*\/?>)/gi);
        
        const newHTML = parts.map(part => {
          if (part.match(/<br\s*\/?>/i)) {
            return part;
          }
          return part.split(/\s+/).map(word => {
            if (!word) return '';
            return `<span class="split-word"><span class="split-char">${word}</span></span>`;
          }).join(' ');
        }).join('');

        title.innerHTML = newHTML;

        const chars = title.querySelectorAll('.split-char');
        chars.forEach((char, idx) => {
          char.style.setProperty('--delay', `${idx * 0.04}s`);
        });
      });
    }

    // ── SCROLL REVEAL ──
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');

          // Trigger scramble text on eyebrows inside the revealed element
          e.target.querySelectorAll('.eyebrow').forEach(eyebrow => {
            if (!eyebrow.dataset.scrambled) {
              eyebrow.dataset.scrambled = "true";
              const targetText = eyebrow.textContent.trim();
              scrambleText(eyebrow, targetText);
            }
          });

          e.target.querySelectorAll('.stat-val[data-t]').forEach(el => {
            const tgt = +el.dataset.t; let c = 0;
            const step = tgt / 60;
            const id = setInterval(() => { c = Math.min(c + step, tgt); el.textContent = Math.floor(c) + (tgt > 5 ? '+' : ''); if (c >= tgt) clearInterval(id) }, 20);
          });
        }
      });
    }, { threshold: .12 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

    // ── CONTACT FORM SUBMIT → Google Forms via hidden iframe
    // Entry IDs extracted from pre-fill URL
    function handleGFSubmit(e) {
      const btn  = document.getElementById('sub-btn');
      const form = document.getElementById('contact-form');

      btn.textContent   = 'Sending\u2026';
      btn.style.opacity = '.7';
      btn.disabled      = true;

      // After form posts to hidden iframe, show success
      const iframe = document.getElementById('gf-hidden');
      iframe.onload = function () {
        btn.textContent      = '\u2713 Message received \u2014 we\u2019ll reply within 24h';
        btn.style.background = '#059669';
        btn.style.color      = '#ffffff';
        btn.style.opacity    = '1';
        btn.disabled         = false;
        form.reset();
        setTimeout(function () {
          btn.textContent      = 'Send message \u2192';
          btn.style.background = '';
          btn.style.color      = '';
          btn.style.opacity    = '1';
        }, 6000);
      };
      // Let the native form submit proceed (targets gf-hidden iframe)
    }

    function handleSubmit(e) { handleGFSubmit(e); }

    function getCookie(name) {
      const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
      return v ? v[2] : '';
    }

    // ── PRODUCT STACK (THREE.JS + GSAP) ──
    const stackCanvas = document.getElementById('stack-canvas');
    const stackSceneEl = stackCanvas ? stackCanvas.parentElement : null;
    if (window.THREE && stackCanvas && stackSceneEl) {
      const sRen = new THREE.WebGLRenderer({ canvas: stackCanvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
      sRen.setPixelRatio(Math.min(devicePixelRatio, NN_LOW_POWER ? 1 : 1.5));
      sRen.setClearColor(0x000000, 0);

      const sScene = new THREE.Scene();
      const sCam = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
      sCam.position.set(0, 1.8, 6.2);
      sCam.lookAt(0, 0.8, 0);

      sScene.add(new THREE.AmbientLight(0x1a1f3a, 0.9));
      const key = new THREE.PointLight(0x7c3aed, 1.6, 20); key.position.set(3, 4, 6); sScene.add(key);
      const fill = new THREE.PointLight(0x22d3ee, 1.1, 18); fill.position.set(-4, 2, 4); sScene.add(fill);
      const back = new THREE.PointLight(0x3b82f6, 1.2, 14); back.position.set(0, 6, -6); sScene.add(back);

      const stackGroup = new THREE.Group();
      stackGroup.rotation.set(-0.78, 0.18, -0.5);
      stackGroup.position.set(-0.25, 0.1, 0);
      sScene.add(stackGroup);

      const roundedRectShape = (w, h, r) => {
        const shape = new THREE.Shape();
        const x = -w / 2;
        const y = -h / 2;
        shape.moveTo(x + r, y);
        shape.lineTo(x + w - r, y);
        shape.quadraticCurveTo(x + w, y, x + w, y + r);
        shape.lineTo(x + w, y + h - r);
        shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        shape.lineTo(x + r, y + h);
        shape.quadraticCurveTo(x, y + h, x, y + h - r);
        shape.lineTo(x, y + r);
        shape.quadraticCurveTo(x, y, x + r, y);
        return shape;
      };

      const cardTexture = (label, icon) => {
        const c = document.createElement('canvas');
        c.width = 512; c.height = 128;
        const ctx = c.getContext('2d');
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(26, 32, 64, 64, 16);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#f5f6ff';
        ctx.font = '700 32px Inter, sans-serif';
        ctx.fillText(icon, 46, 78);
        ctx.fillStyle = '#f5f7ff';
        ctx.font = '700 30px Syne, sans-serif';
        ctx.fillText(label, 110, 82);
        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 4;
        return tex;
      };

      const makeCard = ({ label, icon, color, emissive, y, z, height }) => {
        const shape = roundedRectShape(4.6, 1.08, 0.26);
        const geo = new THREE.ExtrudeGeometry(shape, {
          depth: 0.16,
          bevelEnabled: true,
          bevelThickness: 0.06,
          bevelSize: 0.06,
          bevelSegments: 5,
          curveSegments: 24
        });
        geo.center();
        const mat = new THREE.MeshStandardMaterial({
          color,
          emissive,
          emissiveIntensity: 0.6,
          roughness: 0.25,
          metalness: 0.6
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(0, y, z);
        mesh.scale.set(1, height, 1);

        const glowMat = new THREE.MeshBasicMaterial({
          color: emissive,
          transparent: true,
          opacity: 0.35,
          blending: THREE.AdditiveBlending
        });
        const glow = new THREE.Mesh(geo.clone(), glowMat);
        glow.position.copy(mesh.position);
        glow.scale.set(1.03, height * 1.03, 1.03);

        const labelGeo = new THREE.PlaneGeometry(3.9, 0.82);
        const labelMat = new THREE.MeshBasicMaterial({ map: cardTexture(label, icon), transparent: true });
        const labelMesh = new THREE.Mesh(labelGeo, labelMat);
        labelMesh.position.set(0, y + 0.02, z + 0.16);

        stackGroup.add(glow, mesh, labelMesh);
      };

      [
        { label: 'AI Native', icon: 'AI', color: 0x8b5cf6, emissive: 0x6d28d9, y: 1.02, z: 0.48, height: 1.1 },
        { label: 'Design Obsessed', icon: 'UX', color: 0x6d28d9, emissive: 0x7c3aed, y: 0.34, z: 0.22, height: 1.02 },
        { label: 'Fast Systems', icon: '99', color: 0x2563eb, emissive: 0x3b82f6, y: -0.34, z: -0.02, height: 0.98 },
        { label: 'Open Workflow', icon: 'OP', color: 0x0ea5a5, emissive: 0x14b8a6, y: -1.02, z: -0.28, height: 0.94 }
      ].forEach(makeCard);

      const waveGroup = new THREE.Group();
      const waveMat = new THREE.MeshBasicMaterial({ color: 0x7c8cff, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending });
      const waveMat2 = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending });
      const waveCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-5.2, 0.4, -1.6),
        new THREE.Vector3(-2.8, 2.4, 0.8),
        new THREE.Vector3(0.6, 1.8, 1.0),
        new THREE.Vector3(3.8, 0.6, -0.5),
        new THREE.Vector3(5.4, -0.3, -1.1)
      ]);
      const tube1 = new THREE.TubeGeometry(waveCurve, 160, 0.06, 12, false);
      const tube2 = new THREE.TubeGeometry(waveCurve, 160, 0.1, 16, false);
      const wave1 = new THREE.Mesh(tube1, waveMat);
      const wave2 = new THREE.Mesh(tube2, waveMat2);
      wave1.position.set(0.2, 0.3, -1.7);
      wave2.position.set(0.1, -0.1, -2.2);
      waveGroup.add(wave1, wave2);
      sScene.add(waveGroup);

      const stars = new THREE.BufferGeometry();
      const starCount = NN_LOW_POWER ? 90 : 220;
      const starPos = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i++) {
        starPos[i * 3] = (Math.random() - 0.5) * 13;
        starPos[i * 3 + 1] = Math.random() * 9 - 1.2;
        starPos[i * 3 + 2] = (Math.random() - 0.5) * 11 - 2.5;
      }
      stars.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      const starMat = new THREE.PointsMaterial({ color: 0x8aa2ff, size: 0.032, transparent: true, opacity: 0.75 });
      const starField = new THREE.Points(stars, starMat);
      sScene.add(starField);

      let targetRX = 0;
      let targetRY = 0;
      stackSceneEl.addEventListener('mousemove', e => {
        const rect = stackSceneEl.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        targetRX = -ny * 0.2;
        targetRY = nx * 0.3;
      });
      stackSceneEl.addEventListener('mouseleave', () => { targetRX = 0; targetRY = 0; });

      if (window.gsap) {
        gsap.to(stackGroup.position, { y: 0.28, duration: 5.2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
        gsap.to(waveGroup.rotation, { z: 0.14, duration: 7, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      }

      const doResizeStack = () => {
        const { width, height } = stackSceneEl.getBoundingClientRect();
        sRen.setSize(width, height);
        sCam.aspect = width / height;
        sCam.updateProjectionMatrix();
      };
      doResizeStack();
      window.addEventListener('resize', debounce(doResizeStack, 150));

      const clockStack = new THREE.Clock();
      let stackActive = false;
      let stackFrame = 0;
      function renderStack() {
        if (!stackActive) { stackFrame = 0; return; }
        stackFrame = requestAnimationFrame(renderStack);
        const t = clockStack.getElapsedTime();
        stackGroup.rotation.x += ( -0.78 + targetRX - stackGroup.rotation.x) * 0.06;
        stackGroup.rotation.y += ( 0.18 + targetRY - stackGroup.rotation.y) * 0.06;
        waveGroup.rotation.y = Math.sin(t * 0.18) * 0.1;
        sRen.render(sScene, sCam);
      }

      function setStackActive(active) {
        stackActive = active && !document.hidden && !NN_LOW_POWER;
        if (stackActive && !stackFrame) renderStack();
        if (!stackActive && stackFrame) {
          cancelAnimationFrame(stackFrame);
          stackFrame = 0;
        }
      }

      const stackObs = new IntersectionObserver(entries => {
        setStackActive(entries[0].isIntersecting);
      }, { threshold: 0.01 });
      stackObs.observe(stackSceneEl);
      document.addEventListener('visibilitychange', () => {
        setStackActive(!document.hidden && stackSceneEl.getBoundingClientRect().top < innerHeight);
      });
      if (NN_LOW_POWER) sRen.render(sScene, sCam);
    }

// 3D stacked layers for .stack-wrap
function initStack3D(){
  document.querySelectorAll('.stack-wrap').forEach(wrap => {
    // create container
    if(wrap.querySelector('.stack-3d')) return; // already initialized
    const rows = Array.from(wrap.querySelectorAll('.stack-row'));
    const container = document.createElement('div'); container.className = 'stack-3d';
    // move rows into container
    rows.forEach(r => container.appendChild(r));
    wrap.appendChild(container);

    const total = rows.length;
    const spacingZ = 28; // px depth between layers
    const offsetY = -18; // px shift per layer
    rows.forEach((r, i) => {
      const idx = i; // keep original order
      const depth = (total - idx - 1) * spacingZ;
      const y = (idx - Math.floor(total/2)) * 14; // stack spread
      r.style.transform = `translateX(-50%) translateY(${y}px) translateZ(${depth}px) rotateX(-6deg)`;
      r.style.zIndex = total - idx;
      r.style.willChange = 'transform';
    });

    // interactive tilt
    wrap.addEventListener('mousemove', e => {
      const rect = wrap.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      const rx = (-py) * 10; // rotateX
      const ry = px * 18; // rotateY
      container.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(-120px)`;
    });
    wrap.addEventListener('mouseleave', () => { container.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(-120px)'; });

  });
}

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initStack3D); else initStack3D();

// ══════════════════════════════════════════════
// ── SERVICE CARD HOVER — INFINITY LOOP CANVAS ──
// ══════════════════════════════════════════════
// Disabled to prevent GPU overhead and eliminate lag on hover.
function initServiceCardHover() {}

// ── PAGE-SPECIFIC: BLOG & CAREERS ──
// Set active navigation link based on current page
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'demo2.html';
  document.querySelectorAll('.nav-desktop a, .nav-mobile a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'demo2.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Add hover effects for blog cards
function initBlogCards() {
  document.querySelectorAll('.blog-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-8px)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
    });

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', `${x}%`);
      card.style.setProperty('--my', `${y}%`);
    });
  });
}

function initPositionCards() {
  document.querySelectorAll('.position-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-4px)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
    });

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', `${x}%`);
      card.style.setProperty('--my', `${y}%`);
    });
  });
}


// Add hover effects for benefit items
function initBenefitItems() {
  document.querySelectorAll('.benefit-card, .testi, .flow-step').forEach(item => {
    item.addEventListener('mouseenter', () => {
      item.style.transform = 'translateY(-4px)';
    });
    item.addEventListener('mouseleave', () => {
      item.style.transform = 'translateY(0)';
      item.style.removeProperty('--mx');
      item.style.removeProperty('--my');
    });

    item.addEventListener('mousemove', (e) => {
      const rect = item.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      item.style.setProperty('--mx', `${x}%`);
      item.style.setProperty('--my', `${y}%`);
    });
  });
}


// Initialize page-specific functionality
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    fixPreviewTemplateLinks();
    setActiveNavLink();
    initSplitText();
    initBlogCards();
    initPositionCards();
    initBenefitItems();
    initGlassCards();
  });
} else {
  fixPreviewTemplateLinks();
  setActiveNavLink();
  initSplitText();
  initBlogCards();
  initPositionCards();
  initBenefitItems();
  initGlassCards();
}

// Shimmer tracking for case study cards, stat boxes, cert tiles
function initGlassCards() {
  const selectors = [
    '#case-studies .grid > div',
    '.stat-box',
    '#certifications .grid > div',
  ];
  document.querySelectorAll(selectors.join(',')).forEach(card => {
    card.style.position = 'relative';
    card.style.overflow = 'hidden';

    // inject shimmer pseudo via inline style trick using a child div
    const shimmer = document.createElement('div');
    shimmer.className = 'glass-shimmer';
    shimmer.style.cssText = [
      'position:absolute', 'inset:0', 'border-radius:inherit',
      'pointer-events:none', 'z-index:0',
      'opacity:0', 'transition:opacity 0.4s ease'
    ].join(';');
    card.insertBefore(shimmer, card.firstChild);

    // keep existing children above shimmer
    Array.from(card.children).forEach(child => {
      if (child !== shimmer) { child.style.position = 'relative'; child.style.zIndex = '1'; }
    });

    card.addEventListener('mouseenter', () => { shimmer.style.opacity = '1'; });
    card.addEventListener('mouseleave', () => {
      shimmer.style.opacity = '0';
      card.style.removeProperty('--mx');
      card.style.removeProperty('--my');
    });
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      card.style.setProperty('--mx', `${x}%`);
      card.style.setProperty('--my', `${y}%`);
      shimmer.style.background = `radial-gradient(280px circle at ${x}% ${y}%, rgba(255,255,255,0.07) 0%, transparent 65%)`;
    });
  });
}

// ── NEWSLETTER FORM SUBMIT (shared across all pages)
const legalData = {
  privacy: {
    title: "Privacy Policy",
    date: "Last Updated: January 01, 2026",
    content: `
      <p class="mb-5 leading-relaxed">At NIYATRIX NEXORA, we take data security and privacy seriously. This policy describes how we collect, store, and process user data across our website and services.</p>
      <h4 class="text-white font-bold text-base mb-3 mt-6 uppercase tracking-wider font-logo text-accent">1. Information Collection</h4>
      <p class="mb-5 leading-relaxed text-sm text-muted">We only collect information directly submitted via contact forms and newsletter sign-ups (such as name, company email, and message details). We do not run intrusive trackers.</p>
      <h4 class="text-white font-bold text-base mb-3 uppercase tracking-wider font-logo text-accent">2. Use of Information</h4>
      <p class="mb-5 leading-relaxed text-sm text-muted">Submitted data is used exclusively to facilitate customer support, deliver requested system audits, and send technical insights emails. We never sell data to third-party advertisers.</p>
      <h4 class="text-white font-bold text-base mb-3 uppercase tracking-wider font-logo text-accent">3. Data Security & Storage</h4>
      <p class="mb-5 leading-relaxed text-sm text-muted">We encrypt data in transit and at rest using AES-256 standards. Our servers align with ISO 27001 and SOC 2 compliance certifications to guarantee system-level protection.</p>
    `
  },
  terms: {
    title: "Terms of Service",
    date: "Last Updated: January 01, 2026",
    content: `
      <p class="mb-5 leading-relaxed">Welcome to NIYATRIX NEXORA. By accessing our marketing website or services, you agree to comply with the terms specified herein.</p>
      <h4 class="text-white font-bold text-base mb-3 mt-6 uppercase tracking-wider font-logo text-accent">1. Intellectual Property</h4>
      <p class="mb-5 leading-relaxed text-sm text-muted">All visual assets, layout tokens, WebGL custom shaders, and branding properties are the intellectual property of NIYATRIX NEXORA Software Pvt. Ltd.</p>
      <h4 class="text-white font-bold text-base mb-3 uppercase tracking-wider font-logo text-accent">2. Acceptable Use</h4>
      <p class="mb-5 leading-relaxed text-sm text-muted">Users must not run scripts to scrape site code, inject malicious vectors, or disrupt server response times. Unauthorized replication of our custom Three.js particles and designs is prohibited.</p>
      <h4 class="text-white font-bold text-base mb-3 uppercase tracking-wider font-logo text-accent">3. Limitation of Liability</h4>
      <p class="mb-5 leading-relaxed text-sm text-muted">NIYATRIX NEXORA provides materials on an "as-is" basis. We hold no liability for disruptions in third-party service dependencies (e.g. Google Maps, web-hosting assets).</p>
    `
  }
};

function openModal(contentHtml) {
  const modal = document.getElementById('global-modal');
  const modalContent = document.getElementById('modal-content');
  if (!modal || !modalContent) return;

  modalContent.innerHTML = contentHtml;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';

  if (window.gsap) {
    gsap.fromTo("#global-modal > div", { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" });
  }
  window.paintModalAurora && window.setTimeout(window.paintModalAurora, 20);
}

function closeModal() {
  const modal = document.getElementById('global-modal');
  const modalContent = document.getElementById('modal-content');
  if (!modal || !modalContent) return;

  const finish = () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
    modalContent.innerHTML = '';
  };

  if (window.gsap) {
    gsap.to("#global-modal > div", { opacity: 0, scale: 0.95, duration: 0.2, ease: "power2.in", onComplete: finish });
  } else {
    finish();
  }
}

function openLegalModal(type) {
  const data = legalData[type];
  if (!data) return;

  openModal(`
    <div class="flex flex-col gap-6">
      <div>
        <span class="text-[10px] font-bold text-accent uppercase tracking-widest block mb-2 font-ui">${data.date}</span>
        <h2 class="font-hero text-3xl font-bold text-white tracking-tight">${data.title}</h2>
      </div>
      <div class="pt-6 border-t border-white/5 font-body leading-relaxed text-muted">${data.content}</div>
    </div>
  `);
}

function initGlobalModal() {
  const modal = document.getElementById('global-modal');
  const starsLayer = document.getElementById('modal-stars-layer');
  const cvs = document.getElementById('modal-aurora-canvas');
  if (!modal || !starsLayer || !cvs) return;

  if (!starsLayer.dataset.ready) {
    [
      [6,4,1.2,.12,.55,3.1,-1.2],[18,8,1,.10,.45,4.2,-2],[33,3,1.5,.15,.65,2.8,-.5],
      [48,7,1,.10,.40,5.1,-3.1],[62,5,1.3,.12,.55,3.7,-1.8],[75,9,1,.10,.42,4.6,-2.3],
      [88,4,1.4,.14,.60,3.3,-.9],[94,11,1,.10,.38,5.5,-4.1],[9,20,1,.10,.40,4.9,-2.7],
      [22,30,1.2,.12,.50,3.5,-1.5],[38,25,1,.10,.38,5.8,-3.8],[52,32,1.3,.13,.55,2.9,-.7],
      [66,22,1,.10,.42,4.4,-2.1],[80,28,1.5,.15,.62,3.2,-1.1],[92,35,1,.10,.40,5.3,-3.5],
      [4,50,1.1,.11,.48,3.8,-1.6],[16,60,1,.10,.38,5,-3.2],[29,55,1.4,.14,.58,3,-.8],
      [44,65,1,.10,.42,4.7,-2.5],[57,58,1.2,.12,.52,3.6,-1.4],[71,62,1,.10,.40,5.2,-3.6],
      [84,55,1.3,.13,.56,3.1,-.6],[96,68,1,.10,.38,4.8,-2.9],[11,78,1.2,.12,.50,3.4,-1.3],
      [25,85,1,.10,.40,5.6,-4],[40,80,1.5,.15,.64,2.7,-.4],[55,88,1,.10,.42,4.5,-2.2],
      [69,82,1.1,.11,.48,3.9,-1.7],[82,90,1,.10,.38,5.4,-3.3],[95,84,1.3,.13,.55,3.2,-.9]
    ].forEach(([x, y, s, a, b, d, dl]) => {
      const el = document.createElement('div');
      el.className = 'mstar';
      el.style.cssText = `left:${x}%;top:${y}%;width:${s}px;height:${s}px;--a:${a};--b:${b};--d:${d}s;--dl:${dl}s;`;
      starsLayer.appendChild(el);
    });
    starsLayer.dataset.ready = 'true';
  }

  window.paintModalAurora = function paintModalAurora() {
    const inner = document.getElementById('modal-inner');
    const w = inner ? inner.offsetWidth : cvs.offsetWidth;
    const h = inner ? inner.scrollHeight : cvs.offsetHeight;
    if (!w || !h) return;
    cvs.width = w;
    cvs.height = h;
    cvs.style.height = h + 'px';
    const ctx = cvs.getContext('2d');

    ctx.fillStyle = 'rgba(2, 8, 18, 0.2)';
    ctx.fillRect(0, 0, w, h);

    function radial(x, y, r, stops) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      stops.forEach(stop => g.addColorStop(stop[0], stop[1]));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    radial(w * 0.08, h * 0.12, w * 0.45, [[0, 'rgba(0,210,195,0.28)'], [0.4, 'rgba(0,160,180,0.12)'], [1, 'rgba(0,160,180,0)']]);
    radial(w * 0.72, h * 0.08, w * 0.38, [[0, 'rgba(0,180,220,0.20)'], [0.5, 'rgba(0,130,200,0.08)'], [1, 'rgba(0,130,200,0)']]);
    radial(w * 0.88, h * 0.78, w * 0.50, [[0, 'rgba(91,110,245,0.22)'], [0.4, 'rgba(155,135,245,0.09)'], [1, 'rgba(155,135,245,0)']]);
    radial(w * 0.50, h * 0.55, w * 0.40, [[0, 'rgba(80,60,200,0.10)'], [1, 'rgba(80,60,200,0)']]);

    ctx.globalAlpha = 0.025;
    for (let i = 0; i < 180; i++) {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.5 + 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  modal.addEventListener('click', event => {
    if (event.target === modal) closeModal();
  });
  window.addEventListener('resize', () => {
    if (!modal.classList.contains('hidden')) window.paintModalAurora();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGlobalModal);
} else {
  initGlobalModal();
}

function handleSubscribe(e) {
  e.preventDefault();
  const btn = document.getElementById('sub-news-btn');
  btn.textContent = 'Subscribed!';
  btn.style.background = '#059669';
  btn.style.color = '#ffffff';
  btn.style.opacity = '1';
}