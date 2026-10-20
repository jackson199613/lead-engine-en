/* Lead Engine — site behaviour (English site) */
(function () {
  'use strict';

  // Mobile navigation ------------------------------------------------------
  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Scroll reveal (respects reduced motion) --------------------------------
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var targets = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(targets, function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          var el = entry.target;
          setTimeout(function () { el.classList.add('is-visible'); }, (i % 4) * 70);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
  }

  // Count-up on stats ------------------------------------------------------
  var nums = document.querySelectorAll('[data-count]');
  if (nums.length && !reduced && 'IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseFloat(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-suffix') || '';
        var prefix = el.getAttribute('data-prefix') || '';
        var decimals = (String(target).split('.')[1] || '').length;
        var start = null, dur = 1100;
        function tick(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        co.unobserve(el);
      });
    }, { threshold: 0.5 });
    Array.prototype.forEach.call(nums, function (el) { co.observe(el); });
  }

  // Current year -----------------------------------------------------------
  var y = document.querySelectorAll('[data-year]');
  Array.prototype.forEach.call(y, function (el) { el.textContent = new Date().getFullYear(); });
})();

/* Hero platform-name rotator ---------------------------------------------- */
(function () {
  var box = document.getElementById('rotator');
  if (!box) return;
  var items = box.querySelectorAll('span');
  if (items.length < 2) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var i = 0;
  setInterval(function () {
    items[i].classList.remove('is-active');
    i = (i + 1) % items.length;
    items[i].classList.add('is-active');
  }, 2200);
})();

/* Cookie consent bar ------------------------------------------------------ */
(function () {
  var KEY = 'le_consent';
  // Google Analytics 4 measurement ID (e.g. 'G-XXXXXXXXXX'). Empty = no analytics is loaded at all.
  var GA_ID = '';

  function get(n) {
    var m = document.cookie.match('(^|;)\\s*' + n + '\\s*=\\s*([^;]+)');
    return m ? m.pop() : '';
  }
  function set(v) {
    document.cookie = KEY + '=' + v + ';path=/;max-age=' + (60 * 60 * 24 * 180) + ';SameSite=Lax';
  }

  // Analytics loads only after an explicit "Accept all". With "Essential only" or no choice yet,
  // nothing loads — this must match what the privacy policy promises.
  function loadAnalytics() {
    if (window.__leAnalytics || !GA_ID) return;
    window.__leAnalytics = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true });
    var g = document.createElement('script');
    g.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    g.async = true;
    document.head.appendChild(g);
  }

  if (get(KEY) === 'all') { loadAnalytics(); return; }
  if (get(KEY)) return;
  var bar = document.createElement('div');
  bar.className = 'cookiebar';
  bar.setAttribute('role', 'dialog');
  bar.setAttribute('aria-label', 'Cookie consent');
  bar.innerHTML =
    '<p>We use essential cookies and, with your consent, anonymous analytics. No ad tracking. See our '
    + '<a href="privacy.html">privacy policy</a>.</p>'
    + '<div class="btn-row"><button class="btn btn--ghost" data-c="essential">Essential only</button>'
    + '<button class="btn btn--primary" data-c="all">Accept all</button></div>';
  document.body.appendChild(bar);
  setTimeout(function () { bar.classList.add('is-on'); }, 700);
  bar.addEventListener('click', function (e) {
    var b = e.target.closest('[data-c]');
    if (!b) return;
    var choice = b.getAttribute('data-c');
    set(choice);
    if (choice === 'all') loadAnalytics();
    bar.classList.remove('is-on');
    setTimeout(function () { bar.remove(); }, 500);
  });
})();

/* Chat widget — messages are submitted to Netlify Forms ------------------- */
(function () {
  var TOPICS = ['Free AI visibility audit', 'Plans & quote', 'Is my industry a fit?', 'Something else'];

  var fab = document.createElement('button');
  fab.className = 'chat-fab';
  fab.type = 'button';
  fab.setAttribute('aria-label', 'Send us a message');
  fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'
    + '<path d="M21 11.5a8.4 8.4 0 01-9 8.4 8.9 8.9 0 01-4-.9L3 21l1.9-4.9A8.4 8.4 0 013 11.5a8.4 8.4 0 019-8.4 8.4 8.4 0 019 8.4z"/></svg>'
    + '<span class="badge">1</span>';
  document.body.appendChild(fab);

  var panel = document.createElement('div');
  panel.className = 'chat-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Send us a message');
  panel.innerHTML =
    '<div class="chat-head">'
    + '<button class="chat-close" type="button" aria-label="Close">×</button>'
    + '<strong>Lead Engine · Talk to us</strong>'
    + '<span><i class="dot"></i>Monday–Friday · replies within 1 business day</span>'
    + '</div>'
    + '<div class="chat-body" id="chat-body">'
    + '<div class="chat-hello">Hi, I’m a Lead Engine consultant. Want a free AI visibility audit, or to talk about your product line first? Leave your details and I’ll get back to you directly.</div>'
    + '<div class="chat-chips" id="chat-chips"></div>'
    + '<form id="chat-form">'
    + '<div class="field"><input type="text" name="name" placeholder="Your name" required></div>'
    + '<div class="field"><input type="text" name="contact" placeholder="Work email or WhatsApp *" required></div>'
    + '<div class="field"><textarea name="message" placeholder="Your product line, or your question (optional)"></textarea></div>'
    + '<button class="btn btn--primary" type="submit">Send</button>'
    + '<p class="chat-alt">Or message us on <a href="https://wa.me/16196093350" rel="noopener">WhatsApp +1 619-609-3350</a></p>'
    + '</form></div>';
  document.body.appendChild(panel);

  var chips = panel.querySelector('#chat-chips');
  var picked = TOPICS[0];
  TOPICS.forEach(function (t, i) {
    var b = document.createElement('button');
    b.className = 'chat-chip' + (i === 0 ? ' is-on' : '');
    b.type = 'button';
    b.textContent = t;
    b.addEventListener('click', function () {
      picked = t;
      chips.querySelectorAll('.chat-chip').forEach(function (x) { x.classList.remove('is-on'); });
      b.classList.add('is-on');
    });
    chips.appendChild(b);
  });

  function open() { panel.classList.add('is-on'); var b = fab.querySelector('.badge'); if (b) b.remove(); }
  function close() { panel.classList.remove('is-on'); }
  fab.addEventListener('click', function () { panel.classList.contains('is-on') ? close() : open(); });
  panel.querySelector('.chat-close').addEventListener('click', close);
  var railBtn = document.getElementById('open-chat');
  if (railBtn) railBtn.addEventListener('click', open);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  panel.querySelector('#chat-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target;
    var btn = f.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = 'Sending…';
    var data = {
      'form-name': 'chat',
      name: f.name.value,
      contact: f.contact.value,
      topic: picked,
      message: f.message.value,
      page: location.pathname
    };
    var body = Object.keys(data).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]);
    }).join('&');
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body })
      .then(function () {
        document.getElementById('chat-body').innerHTML =
          '<div class="chat-done"><div class="tick"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></div>'
          + '<strong style="display:block;color:var(--ink);font-size:1.05rem;margin-bottom:6px">Thanks — we’ll be in touch</strong>'
          + '<span class="note">We reply within 1 business day using the contact you left.<br>In a hurry? <a href="https://wa.me/16196093350" rel="noopener">WhatsApp +1 619-609-3350</a>.</span></div>';
      })
      .catch(function () {
        btn.disabled = false; btn.textContent = 'Failed to send — retry';
      });
  });
})();

/* Top scroll progress bar ---------------------------------------------------------- */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var bar = document.createElement('div');
  bar.className = 'scroll-bar';
  document.body.appendChild(bar);
  var ticking = false;
  function update() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
})();

/* Intro splash · glass globe, click to enter ------------------------------
   Main image: splash-orb.webp (glass sphere + glowing earth + light bands); alternate: splash-orb-alt.webp (glass sphere + liquid wave).
   Switch with <body data-intro-orb="wave">. Image backgrounds are pre-normalized to white and blended with multiply.
   Sequence: light streams converge → sphere fades in, scan ring lights up, title decodes → act 2: AI platforms orbit
        → on click the camera pushes through the globe and a white flash reveals the homepage. */
(function () {
  if (!document.body || document.body.dataset.intro !== 'on') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  try { if (sessionStorage.getItem('le_splash')) return; } catch (e) {}

  var ORBS = {
    globe: { src: 'splash-orb', cx: 0.4988, cy: 0.4884, r: 0.3525 },
    wave:  { src: 'splash-orb-alt', cx: 0.4996, cy: 0.4860, r: 0.3373 }
  };
  var ORB = ORBS[document.body.dataset.introOrb] || ORBS.globe;
  var EN = 'OUTBOUND EMAIL · GEO';

  var chars = 'Lead Engine'.split('').map(function (c, i) {
    return '<span style="animation-delay:' + (0.72 + i * 0.06) + 's">' + (c === ' ' ? '&nbsp;' : c) + '</span>';
  }).join('');

  var el = document.createElement('div');
  el.className = 'splash';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-label', 'Lead Engine · Enter site');
  el.innerHTML =
      '<div class="sp-aurora" aria-hidden="true"><i></i><i></i><i></i></div>'
    + '<div class="sp-halo" aria-hidden="true"></div>'
    + '<div class="sp-shadow" aria-hidden="true"><i></i></div>'
    + '<canvas class="sp-fx sp-fx--back" aria-hidden="true"></canvas>'
    + '<div class="sp-orb" aria-hidden="true"><img alt="" decoding="async" fetchpriority="high"></div>'
    + '<div class="sp-gloss" aria-hidden="true"><i></i></div>'
    + '<canvas class="sp-fx sp-fx--front" aria-hidden="true"></canvas>'
    + '<div class="sp-veil"></div>'
    + '<button class="sp-skip" type="button">Skip →</button>'
    + '<div class="sp-inner">'
    +   '<div class="sp-logo">'
    +     '<svg viewBox="-1 -1 102 103" aria-hidden="true"><path d="M99.8 0 46.6 21.5 42.7 78.4 18.9 68.5 17.6 14.2 0.2 3.8 2.75 81.1 45.3 100.4 90.4 82.5 93 65.3 65.6 74.5 61.8 65.5 92.2 51.2 96.4 34.2 66.1 43.7 61.9 35.5 95.7 18.5Z"/></svg>'
    +   '</div>'
    +   '<h1 class="sp-name">' + chars + '</h1>'
    +   '<p class="sp-en" aria-label="' + EN + '">' + EN.replace(/./g, '&nbsp;') + '</p>'
    +   '<p class="sp-slogan">An always-on <b>inquiry pipeline</b><br>for B2B manufacturers</p>'
    +   '<div class="sp-markets"><i>Americas</i><i>Europe</i><i>Middle East</i><i>Asia-Pacific</i></div>'
    +   '<div class="sp-plat"><i>ChatGPT</i><i>Perplexity</i><i>Claude</i><i>Gemini</i><i>Grok</i><i>DeepSeek</i></div>'
    +   '<button class="sp-enter" type="button"><span>Enter site</span>'
    +     '<svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>'
    +   '</button>'
    + '</div>'
    + '<div class="sp-dots"><i class="on"></i><i></i></div>'
    + '<p class="sp-hint">Click anywhere to enter</p>'
    + '<div class="sp-flash" aria-hidden="true"></div>';

  document.body.appendChild(el);
  document.body.classList.add('splash-on');

  var t0 = performance.now();
  var orb = el.querySelector('.sp-orb'), img = orb.querySelector('img');
  var gloss = el.querySelector('.sp-gloss'), halo = el.querySelector('.sp-halo'), shadow = el.querySelector('.sp-shadow');
  var flash = el.querySelector('.sp-flash'), inner = el.querySelector('.sp-inner'), enEl = el.querySelector('.sp-en');
  var cvB = el.querySelector('.sp-fx--back'), cvF = el.querySelector('.sp-fx--front');
  var cB = cvB.getContext('2d'), cF = cvF.getContext('2d');
  var mono = getComputedStyle(document.body).getPropertyValue('--mono') || 'monospace';

  /* ---------- layout: sphere center and radius (CSS px) ---------- */
  var W = 0, H = 0, CX = 0, CY = 0, R = 0, mobile = false;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  function place(node, size, cx, cy) {
    node.style.width = node.style.height = size + 'px';
    node.style.left = (cx - size / 2) + 'px';
    node.style.top = (cy - size / 2) + 'px';
  }
  function layout() {
    W = el.clientWidth; H = el.clientHeight; mobile = W < 900;
    if (mobile) { CX = W / 2; CY = H * 0.255; R = Math.min(W * 0.3, H * 0.15); }
    else { CX = W / 2 + Math.min(W * 0.2, 330); CY = H * 0.48; R = Math.min(H * 0.3, W * 0.18, 310); }
    [cvB, cvF].forEach(function (c) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); });
    var S = R / ORB.r;
    orb.style.width = orb.style.height = S + 'px';
    orb.style.left = (CX - ORB.cx * S) + 'px';
    orb.style.top = (CY - ORB.cy * S) + 'px';
    orb.style.transformOrigin = (ORB.cx * 100) + '% ' + (ORB.cy * 100) + '%';
    place(gloss, R * 2, CX, CY);
    place(halo, R * 3.4, CX, CY);
    place(flash, Math.max(W, H) * 2.2, CX, CY);
    shadow.style.width = R * 1.9 + 'px'; shadow.style.height = R * 0.42 + 'px';
    shadow.style.left = (CX - R * 0.95) + 'px'; shadow.style.top = (CY + R * 0.98) + 'px';
    el.style.setProperty('--ox', (CX / W * 100) + '%');
    el.style.setProperty('--oy', (CY / H * 100) + '%');
  }
  var orbAt = null;   // fade in only after the image loads, so it never pops in on slow networks
  img.onload = function () { orbAt = (performance.now() - t0) / 1000; };
  img.src = ORB.src + (window.innerWidth < 900 ? '-m' : '') + '.webp';
  layout();
  window.addEventListener('resize', layout);

  /* ---------- light streams: trailing rays spiral into the sphere ---------- */
  var streams = [];
  function spawn(delay) {
    streams.push({
      a0: Math.random() * 6.283, r0: 2.1 + Math.random() * 1.3,
      turn: (Math.random() < 0.5 ? -1 : 1) * (0.9 + Math.random() * 0.9),
      born: delay, du: 1.1 + Math.random() * 0.8,
      hue: Math.random(), w: 0.6 + Math.random() * 1.1
    });
  }
  var NS = mobile ? 34 : 64;
  for (var i = 0; i < NS; i++) spawn(0.05 + Math.random() * 1.1);
  function streamPt(s, e) {           // e: 0 → 1, along the spiral from outside to the sphere surface
    var r = (s.r0 + (1.0 - s.r0) * e) * R, a = s.a0 + s.turn * e;
    return [CX + Math.cos(a) * r, CY + Math.sin(a) * r * 0.82];
  }
  function streamColor(h, a) {
    return h < 0.4 ? 'rgba(43,91,255,' + a + ')' : h < 0.75 ? 'rgba(124,92,255,' + a + ')' : 'rgba(14,165,198,' + a + ')';
  }

  /* ---------- orbits: AI platforms ---------- */
  var RINGS = [
    { r: 1.3, tx: 1.18, tz: 0.28, sp: 0.36, names: ['ChatGPT', 'Claude'] },
    { r: 1.46, tx: 1.3, tz: -0.5, sp: -0.26, names: ['Perplexity', 'Gemini'] },
    { r: 1.62, tx: 1.06, tz: 0.85, sp: 0.2, names: ['Grok', 'DeepSeek'] }
  ];
  function ringPt(rg, ang) {
    var x = Math.cos(ang) * rg.r, z = Math.sin(ang) * rg.r;
    var c = Math.cos(rg.tx), s = Math.sin(rg.tx), y1 = -z * s, z1 = z * c;
    var c2 = Math.cos(rg.tz), s2 = Math.sin(rg.tz);
    return [x * c2 - y1 * s2, x * s2 + y1 * c2, z1];
  }
  var spin = 0, tiltY = 0, mX = 0, mY = 0, CAM = 6;
  function proj(v) {
    var c = Math.cos(spin), s = Math.sin(spin);
    var x1 = v[0] * c + v[2] * s, z1 = -v[0] * s + v[2] * c;
    var c2 = Math.cos(tiltY), s2 = Math.sin(tiltY);
    var y2 = v[1] * c2 - z1 * s2, z2 = v[1] * s2 + z1 * c2;
    var k = CAM / (CAM - z2) * 0.985;
    return [CX + x1 * k * R, CY - y2 * k * R, z2];
  }
  el.addEventListener('pointermove', function (e) { mX = (e.clientX / W - 0.5) * 2; mY = (e.clientY / H - 0.5) * 2; });

  /* ---------- title decode: letters scramble, then lock left to right ---------- */
  var GLYPH = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#/<>';
  function decode(t) {
    var p = (t - 1.35) / 0.9;
    if (p < 0) return;
    if (p >= 1.05) { if (enEl.textContent !== EN) enEl.textContent = EN; return; }
    var out = '';
    for (var i = 0; i < EN.length; i++) {
      var ch = EN[i];
      if (ch === ' ' || ch === '·' || i / EN.length < p) out += ch;
      else out += GLYPH[(Math.random() * GLYPH.length) | 0];
    }
    enEl.textContent = out;
  }

  function ease(x) { return x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3); }
  function easeIn(x) { return x <= 0 ? 0 : x >= 1 ? 1 : x * x * x; }
  var last = t0, raf = 0, outAt = 0, alive = true, sweepAt = 2.4, nextSpawn = 2.6;

  function frame(now) {
    if (!alive) return;
    var t = (now - t0) / 1000, dt = Math.min((now - last) / 1000, 0.05); last = now;
    var ex = outAt ? Math.min(1, (now - outAt) / 900) : 0;     // exit progress (linear)
    tiltY += (mY * 0.18 + 0.2 - tiltY) * 0.05;
    spin += dt * 0.25;
    decode(t);

    // sphere: fade in → gentle float + follows the cursor; on exit the camera pushes in until it fills the screen
    var rev = orbAt === null ? 0 : ease((t - Math.max(0.5, orbAt)) / 1.6);
    var bob = Math.sin(t * 1.1) * R * 0.025 * rev;
    var warp = easeIn(ex), fill = Math.max(W, H) * 1.1 / R;
    var sc = (0.6 + 0.4 * rev) * (1 + warp * (fill - 1));
    var mx = mX * (1 - warp), my = mY * (1 - warp);
    var tf = 'translate3d(' + (mx * R * 0.03) + 'px,' + (bob + my * R * 0.02) + 'px,0) perspective(1200px) rotateX(' + (-my * 6).toFixed(2) + 'deg) rotateY(' + (mx * 8).toFixed(2) + 'deg) scale(' + sc + ')';
    orb.style.transform = gloss.style.transform = tf;
    orb.style.opacity = rev;
    var blur = rev < 1 ? 22 * (1 - rev) : warp * 14;
    orb.style.filter = blur > 0.05 ? 'blur(' + blur.toFixed(1) + 'px)' : 'none';
    gloss.style.opacity = rev * (1 - warp);
    halo.style.opacity = (0.7 + 0.3 * Math.sin(t * 0.9)) * rev * (1 - warp);
    shadow.style.opacity = rev * (1 - warp * 3);
    shadow.style.transform = 'scale(' + (1 - bob / R * 1.2) + ')';
    flash.style.opacity = ex > 0.45 ? Math.min(1, (ex - 0.45) / 0.25) * 0.95 : 0;   // hold the white flash, then fade out with the whole splash
    gloss.style.setProperty('--gx', (35 - mx * 14) + '%');
    gloss.style.setProperty('--gy', (28 - my * 12) + '%');
    var sw = (t - sweepAt) / 1.3;
    if (sw > 1) { sweepAt += 6; sw = 0; }
    gloss.style.setProperty('--sw', (sw <= 0 ? -60 : -60 + ease(sw) * 220) + '%');

    [cB, cF].forEach(function (c) { c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H); });
    var fade = 1 - Math.min(1, ex * 2.5);

    // scan ring: tick ring around the sphere + a radar sweep (drawn behind)
    var hr = ease((t - 1.2) / 1.2) * fade;
    if (hr > 0) {
      var RR = R * 1.1, rot = t * 0.12;
      cB.save(); cB.translate(CX, CY);
      cB.strokeStyle = 'rgba(43,91,255,' + 0.22 * hr + ')'; cB.lineWidth = 1;
      cB.beginPath(); cB.arc(0, 0, RR, 0, 6.283); cB.stroke();
      for (var k = 0; k < 120; k++) {
        var a = rot + k / 120 * 6.283, long = k % 10 === 0, len = long ? 9 : 4;
        cB.strokeStyle = 'rgba(43,91,255,' + (long ? 0.45 : 0.2) * hr + ')';
        cB.beginPath();
        cB.moveTo(Math.cos(a) * RR, Math.sin(a) * RR);
        cB.lineTo(Math.cos(a) * (RR + len), Math.sin(a) * (RR + len));
        cB.stroke();
      }
      var sa = t * 0.9, grd = cB.createConicGradient ? cB.createConicGradient(sa - 0.9, 0, 0) : null;
      if (grd) {
        grd.addColorStop(0, 'rgba(34,211,238,0)');
        grd.addColorStop(0.14, 'rgba(34,211,238,' + 0.5 * hr + ')');
        grd.addColorStop(0.145, 'rgba(34,211,238,0)');
        grd.addColorStop(1, 'rgba(34,211,238,0)');
        cB.strokeStyle = grd; cB.lineWidth = 3;
        cB.beginPath(); cB.arc(0, 0, RR + 5, 0, 6.283); cB.stroke();
      }
      cB.restore();
    }

    // light streams (front): a burst on entry, then one every so often so the pipeline feels alive
    if (!outAt && t > nextSpawn) { spawn(t); nextSpawn = t + 0.55 + Math.random() * 0.6; }
    cF.lineCap = 'round';
    for (var i = streams.length - 1; i >= 0; i--) {
      var s = streams[i], e = (t - s.born) / s.du;
      if (e < 0) continue;
      if (e > 1.25) { streams.splice(i, 1); continue; }
      var head = Math.min(1, e), tail = Math.max(0, head - 0.28), al = Math.min(1, t / 0.5) * fade;
      if (head > tail) {
        var steps = 10, prev = streamPt(s, tail);
        for (var j = 1; j <= steps; j++) {
          var u = tail + (head - tail) * j / steps, q = streamPt(s, ease(u) * 0.6 + u * 0.4);
          var aa = al * (j / steps) * 0.75 * (e > 1 ? 1 - (e - 1) * 4 : 1);
          cF.strokeStyle = streamColor(s.hue, aa); cF.lineWidth = s.w * (0.4 + j / steps);
          cF.beginPath(); cF.moveTo(prev[0], prev[1]); cF.lineTo(q[0], q[1]); cF.stroke();
          prev = q;
        }
      }
      if (e >= 1 && e < 1.25) {        // a small glint where the stream meets the sphere
        var p = streamPt(s, 1), ga = (1 - (e - 1) * 4) * 0.6 * al;
        var g = cF.createRadialGradient(p[0], p[1], 0, p[0], p[1], 8);
        g.addColorStop(0, 'rgba(255,255,255,' + ga + ')'); g.addColorStop(1, 'rgba(34,211,238,0)');
        cF.fillStyle = g; cF.beginPath(); cF.arc(p[0], p[1], 8, 0, 6.283); cF.fill();
      }
    }

    // orbits + AI platform nodes: back half behind the sphere, front half in front
    var ra = ease((t - 2.4) / 1.2) * fade;
    if (ra > 0) {
      RINGS.forEach(function (rg, ri) {
        var prev = null;
        for (var j = 0; j <= 120; j++) {
          var q = proj(ringPt(rg, j / 120 * 6.283));
          if (prev) {
            var c = (q[2] + prev[2]) > 0 ? cF : cB;
            c.strokeStyle = 'rgba(43,91,255,' + (0.16 * ra) + ')'; c.lineWidth = 1;
            c.beginPath(); c.moveTo(prev[0], prev[1]); c.lineTo(q[0], q[1]); c.stroke();
          }
          prev = q;
        }
        rg.names.forEach(function (nm, ni) {
          var q = proj(ringPt(rg, t * rg.sp + ni * Math.PI + ri * 2.09));
          var c = q[2] > 0 ? cF : cB, fa = (q[2] > 0 ? 1 : 0.45) * ra;
          var g = c.createRadialGradient(q[0], q[1], 0, q[0], q[1], 10);
          g.addColorStop(0, 'rgba(43,91,255,' + fa + ')'); g.addColorStop(1, 'rgba(124,92,255,0)');
          c.fillStyle = g; c.beginPath(); c.arc(q[0], q[1], 10, 0, 6.283); c.fill();
          c.fillStyle = 'rgba(255,255,255,' + fa + ')'; c.beginPath(); c.arc(q[0], q[1], 2, 0, 6.283); c.fill();
          if (!mobile) {
            c.font = '500 11px ' + mono; c.fillStyle = 'rgba(30,45,90,' + 0.72 * fa + ')';
            c.fillText(nm, q[0] + 12, q[1] + 4);
          }
        });
      });
    }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  // act 2: light up the markets row after 3.4 s
  var dots = el.querySelectorAll('.sp-dots i');
  var t2 = setTimeout(function () {
    el.classList.add('act2');
    dots[0].classList.remove('on');
    dots[1].classList.add('on');
  }, 3400);

  var gone = false;
  function enter() {
    if (gone) return;
    gone = true;
    clearTimeout(t2);
    outAt = performance.now();
    el.classList.add('is-warp');
    document.body.classList.remove('splash-on');
    try { sessionStorage.setItem('le_splash', '1'); } catch (e) {}
    setTimeout(function () { el.classList.add('is-out'); }, 650);
    setTimeout(function () {
      alive = false; cancelAnimationFrame(raf);
      window.removeEventListener('resize', layout);
      el.remove();
    }, 1500);
  }

  el.addEventListener('click', enter);
  document.addEventListener('keydown', function onKey(e) {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { enter(); document.removeEventListener('keydown', onKey); }
  });
  window.addEventListener('wheel', enter, { once: true, passive: true });
})();

/* Pipeline page · sticky table of contents under the nav, highlights the current section ---------------- */
(function () {
  var toc = document.querySelector('.page-toc');
  if (!toc) return;
  var header = document.querySelector('.site-header');
  var root = document.documentElement;
  function offsets() {
    var h = header ? header.getBoundingClientRect().height : 0;
    root.style.setProperty('--header-h', h + 'px');
    root.style.setProperty('--toc-offset', (h + toc.offsetHeight + 12) + 'px');
  }
  offsets();
  window.addEventListener('resize', offsets);
  window.addEventListener('load', offsets);

  var links = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]'));
  var targets = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var list = toc.querySelector('.page-toc-list');
  var current = null;
  function setActive(i) {
    if (current === i) return;
    current = i;
    links.forEach(function (a, k) { a.classList.toggle('is-active', k === i); });
    var a = links[i];
    if (a && list.scrollWidth > list.clientWidth) {   // on mobile, scroll the active item into view
      list.scrollTo({ left: a.offsetLeft - list.clientWidth / 2 + a.offsetWidth / 2, behavior: 'smooth' });
    }
  }
  function onScroll() {
    var line = (parseFloat(getComputedStyle(root).getPropertyValue('--toc-offset')) || 130) + 20;
    var idx = -1;
    targets.forEach(function (el, k) { if (el && el.getBoundingClientRect().top <= line) idx = k; });
    setActive(idx);
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { ticking = false; onScroll(); });
  }, { passive: true });
  onScroll();
})();

/* ROI calculator: same assumptions as the comparison table on the pipeline page. Our fees are quoted individually. */
(function () {
  var box = document.querySelector('[data-roi]');
  if (!box) return;
  var TIERS = [
    { name: 'Starter', reach: 5000 },
    { name: 'Standard', reach: 20000 },
    { name: 'Flagship', reach: 50000 }
  ];
  var HUMAN_RATE = 0.0036;          // experienced rep, personalized emails (Results page basis)
  var LINE_RATE = 0.0012;           // pipeline, conservative inquiry rate
  var VALID = 20 / 24;              // ~20 of 24 inquiries counted as qualified
  var WORKDAYS = 22;

  var $ = function (s) { return box.querySelector(s); };
  var out = function (k) { return box.querySelector('[data-out="' + k + '"]'); };
  var people = $('#roi-people'), cost = $('#roi-cost'), daily = $('#roi-daily');

  function usd(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function about(n) { return n >= 10 ? Math.round(n).toLocaleString('en-US') : (Math.round(n * 10) / 10).toString(); }
  function round10(n) { return Math.round(n / 10) * 10; }

  function calc() {
    var p = +people.value || 1;
    var c = Math.min(Math.max(+cost.value || 0, 0), 1e6);
    var d = +daily.value || 1;
    var tIdx = +(box.querySelector('input[name="roi-tier"]:checked') || { value: 1 }).value;
    var t = TIERS[tIdx];

    var hCost = p * c, hSend = p * d * WORKDAYS, hInq = hSend * HUMAN_RATE;
    var mInq = t.reach * LINE_RATE * VALID;
    var perPerson = d * WORKDAYS * HUMAN_RATE;
    var need = Math.ceil(mInq / perPerson);

    out('people').textContent = p + (p === 1 ? ' rep' : ' reps');
    out('daily').textContent = d + ' / day';
    out('hInq').textContent = about(hInq);
    out('hCost').textContent = usd(hCost);
    out('hSend').textContent = hSend.toLocaleString('en-US');
    out('hCpi').textContent = hInq > 0 && c > 0 ? '~' + usd(round10(hCost / hInq)) : '—';
    out('tName').textContent = 'Outbound line · ' + t.name;
    out('mInq').textContent = about(mInq);
    out('mSend').textContent = t.reach.toLocaleString('en-US');
    var nEl = out('mNeed'); if (nEl) nEl.textContent = need.toLocaleString('en-US');

    var max = Math.max(hInq, mInq) || 1;
    box.querySelector('[data-bar="h"]').style.width = Math.max(2, hInq / max * 100) + '%';
    box.querySelector('[data-bar="m"]').style.width = Math.max(2, mInq / max * 100) + '%';

    var ratio = hInq > 0 ? mInq / hInq : 0;
    var r = ratio >= 10 ? Math.round(ratio) : Math.round(ratio * 10) / 10;
    var v = 'About <strong>' + r + '×</strong> your current inquiry volume.';
    if (need > p) v += ' Matching it in-house would take roughly <strong>' + need + ' reps</strong> — about ' + usd(need * c) + ' a month in payroll at your numbers.';
    out('verdict').innerHTML = v;
  }
  box.addEventListener('input', calc);
  box.addEventListener('change', calc);
  calc();
})();

/* Homepage AI answer: type the buyer's question, list suppliers, then slide "your company" in.
   One orchestrated moment; waits until the intro splash has closed. ------------------------ */
(function () {
  var box = document.querySelector('.x-answer');
  if (!box || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var q = box.querySelector('[data-type]');
  var items = Array.prototype.slice.call(box.querySelectorAll('li'));
  var you = box.querySelector('li.x-you');
  var text = q.getAttribute('data-type');
  document.documentElement.classList.add('x-js');
  q.textContent = '';
  var caret = document.createElement('i'); caret.className = 'x-caret';
  q.parentNode.appendChild(caret);

  function run() {
    var i = 0;
    (function type() {
      q.textContent = text.slice(0, ++i);
      if (i < text.length) return setTimeout(type, 22 + Math.random() * 30);
      setTimeout(function () {
        caret.remove();
        var others = items.filter(function (li) { return li !== you; });
        others.forEach(function (li, k) { setTimeout(function () { li.classList.add('x-in'); }, k * 160); });
        setTimeout(function () { you && you.classList.add('x-in'); }, others.length * 160 + 500);
      }, 350);
    })();
  }
  function ready() { return !document.body.classList.contains('splash-on'); }
  (function wait() { ready() ? setTimeout(run, 300) : setTimeout(wait, 200); })();
})();
