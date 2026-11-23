/**
 * Star Finder (星空识星) - Main Application Controller
 * Connects Canvas Sky Map, Sensors, Search, Reticle, Fact Sheet, and PWA
 */

(function () {
  'use strict';

  // Location persistence with forced migration from legacy Beijing
  let savedLoc = null;
  try {
    savedLoc = JSON.parse(localStorage.getItem('starfinder_saved_loc'));
  } catch (e) {}

  if (!savedLoc || savedLoc.nameEn === 'Beijing') {
    savedLoc = {
      lat: 37.5630,
      lon: -122.3255,
      nameEn: 'San Mateo (37.6°N)',
      nameCn: '圣马特奥 (37.6°N)'
    };
    localStorage.setItem('starfinder_saved_loc', JSON.stringify(savedLoc));
  }

  // State
  const state = {
    currentDate: new Date(),
    observerPlanet: localStorage.getItem('starfinder_observer_planet') || 'earth', // 'earth' | 'mars'
    observerLat: savedLoc.lat,
    observerLon: savedLoc.lon,
    locationName: (localStorage.getItem('starfinder_lang') === 'zh') ? savedLoc.nameCn : savedLoc.nameEn,
    language: localStorage.getItem('starfinder_lang') || 'en', // 'en' | 'zh'
    nightMode: localStorage.getItem('starfinder_night_mode') === 'true',
    gyroActive: false,
    arActive: false,
    selectedStar: null,
    aimingTargetStar: null,
    deferredInstallPrompt: null
  };

  // City Presets
  const CITY_PRESETS = [
    { nameEn: 'San Mateo', nameCn: '圣马特奥 (湾区)', lat: 37.5630, lon: -122.3255 },
    { nameEn: 'San Francisco', nameCn: '旧金山', lat: 37.7749, lon: -122.4194 },
    { nameEn: 'Beijing', nameCn: '北京', lat: 39.9042, lon: 116.4074 },
    { nameEn: 'Shanghai', nameCn: '上海', lat: 31.2304, lon: 121.4737 },
    { nameEn: 'Hong Kong', nameCn: '香港', lat: 22.3193, lon: 114.1694 },
    { nameEn: 'Tokyo', nameCn: '东京', lat: 35.6762, lon: 139.6503 },
    { nameEn: 'New York', nameCn: '纽约', lat: 40.7128, lon: -74.0060 },
    { nameEn: 'London', nameCn: '伦敦', lat: 51.5074, lon: -0.1278 },
    { nameEn: 'Sydney', nameCn: '悉尼', lat: -33.8688, lon: 151.2093 }
  ];

  // DOM Elements
  const canvas = document.getElementById('sky-canvas');
  const mwCanvas = document.getElementById('milkyway-canvas');
  const arVideo = document.getElementById('ar-video');
  const langToggleBtn = document.getElementById('lang-toggle-btn');
  const nightToggleBtn = document.getElementById('night-toggle-btn');
  const gyroToggleBtn = document.getElementById('gyro-toggle-btn');
  const arToggleBtn = document.getElementById('ar-toggle-btn');
  const locationBtn = document.getElementById('location-btn');
  const installAppBtn = document.getElementById('install-app-btn');

  // Reticle HUD
  const lockBadge = document.getElementById('lock-badge');
  const badgeStarName = document.getElementById('badge-star-name');
  const badgeStarMeta = document.getElementById('badge-star-meta');
  const badgeHint = document.getElementById('badge-hint');

  // Aiming Guide HUD
  const aimingGuideHud = document.getElementById('aiming-guide-hud');
  const aimingArrow = document.getElementById('aiming-arrow-container');
  const aimingTargetName = document.getElementById('aiming-target-name');
  const aimingInstruction = document.getElementById('aiming-instruction');
  const aimingCloseBtn = document.getElementById('aiming-close-btn');

  // Search
  const searchContainer = document.querySelector('.search-container');
  const searchInput = document.getElementById('search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const autocompleteDropdown = document.getElementById('autocomplete-dropdown');

  // Fact Sheet Modal
  const sheetBackdrop = document.getElementById('sheet-backdrop');
  const factSheet = document.getElementById('fact-sheet');
  const sheetCloseBtn = document.getElementById('sheet-close-btn');
  const sheetAimBtn = document.getElementById('sheet-aim-btn');

  // Tooltip
  const tooltip = document.getElementById('star-tooltip');

  // Modals
  const locationModal = document.getElementById('location-modal');
  const closeLocationModalBtn = document.getElementById('close-location-modal-btn');
  const cityPresetsGrid = document.getElementById('city-presets-grid');
  const gpsLocateBtn = document.getElementById('gps-locate-btn');
  const iosInstallModal = document.getElementById('ios-install-modal');
  const closeIosModalBtn = document.getElementById('close-ios-modal-btn');
  const eventsModal = document.getElementById('events-modal');
  const gyroDampingText = document.getElementById('gyro-damping-text');

  // Planet Vantage controls (dynamically populated from Astronomy.getAvailableObserverPlanets())
  const planetToggleBtn = document.getElementById('planet-toggle-btn');
  const planetToggleIcon = document.getElementById('planet-toggle-icon');
  const planetToggleLabel = document.getElementById('planet-toggle-label');
  const planetVantageGrid = document.getElementById('planet-vantage-grid');
  const planetVantageBadge = document.getElementById('planet-vantage-badge');
  const planetVantageHint = document.getElementById('planet-vantage-hint');

  // Telemetry labels
  const telemetryAz = document.getElementById('telemetry-az');
  const telemetryAlt = document.getElementById('telemetry-alt');
  const telemetryFov = document.getElementById('telemetry-fov');

  const renderer = new SkyRenderer(canvas, mwCanvas);
  renderer.language = state.language;
  window.renderer = renderer;

  // URL Parameter overrides for camera & location (deep-linking, testing & direct previews).
  // Parsed once and reused below (?mode=..., ?only=milky_way, ?planet=...). Non-numeric values are ignored.
  const urlParams = new URLSearchParams(window.location.search);
  const numParam = (name, min, max) => {
    const v = parseFloat(urlParams.get(name));
    return isFinite(v) ? Math.max(min, Math.min(max, v)) : null;
  };
  const pAz = numParam('az', -360, 360);
  const pAlt = numParam('alt', -90, 90);
  const pFov = numParam('fov', 25, 95);
  const pLat = numParam('lat', -90, 90);
  const pLon = numParam('lon', -180, 180);
  const pPlanet = urlParams.get('planet');
  if (pPlanet && Astronomy.hasObserverPlanet && Astronomy.hasObserverPlanet(pPlanet)) {
    state.observerPlanet = pPlanet.toLowerCase();
  }
  if (pAz !== null) renderer.cameraAzimuth = (pAz + 360) % 360;
  if (pAlt !== null) renderer.cameraAltitude = pAlt;
  if (pFov !== null) renderer.fov = pFov;
  if (pLat !== null) state.observerLat = pLat;
  if (pLon !== null) state.observerLon = pLon;

  // Apply Initial Night Mode
  if (state.nightMode) {
    document.body.classList.add('night-mode');
    nightToggleBtn.classList.add('active');
  }

  // Advance the sky clock and refresh cached Az/Alt on every star, planet and spacecraft.
  // The renderer owns the (memoized) body list so the math runs once per tick, not twice.
  function updateAllStarHorizontalCoordinates() {
    state.currentDate = new Date();
    state.allCelestialBodies = renderer.getBodies(state.currentDate, state.observerLat, state.observerLon);
  }

  // Compute and display the observer location label for any registered planet
  function updateObserverLocationLabel() {
    const cfg = Astronomy.getObserverPlanetConfig(state.observerPlanet);
    const isZh = state.language === 'zh';
    if (!cfg.usesCityPresets) {
      const latHemi = state.observerLat >= 0 ? 'N' : 'S';
      const lonHemi = state.observerLon >= 0 ? 'E' : 'W';
      const planetLabel = isZh ? cfg.nameCn : cfg.nameEn;
      state.locationName = `${planetLabel} (${Math.abs(state.observerLat).toFixed(1)}°${latHemi}, ${Math.abs(state.observerLon).toFixed(1)}°${lonHemi})`;
    } else {
      let saved = null;
      try { saved = JSON.parse(localStorage.getItem('starfinder_saved_loc')); } catch (e) {}
      if (saved) {
        state.locationName = isZh ? (saved.nameCn || saved.nameEn) : (saved.nameEn || saved.nameCn);
      } else {
        state.locationName = isZh ? '圣马特奥 (37.6°N)' : 'San Mateo (37.6°N)';
      }
    }
    const locLabelEl = document.getElementById('location-label');
    if (locLabelEl) locLabelEl.textContent = state.locationName;
  }

  // Dynamically render selector buttons for every enabled planet in Astronomy.OBSERVER_PLANETS
  function renderPlanetVantageButtons() {
    if (!planetVantageGrid || !Astronomy.getAvailableObserverPlanets) return;
    const planets = Astronomy.getAvailableObserverPlanets();
    const isZh = state.language === 'zh';
    planetVantageGrid.innerHTML = '';
    planets.forEach((cfg) => {
      const btn = document.createElement('button');
      btn.id = `planet-${cfg.id}-btn`;
      btn.dataset.planet = cfg.id;
      btn.className = 'header-btn' + (state.observerPlanet === cfg.id ? ' active' : '');
      btn.style.justifyContent = 'center';
      btn.style.height = '36px';
      btn.style.fontSize = '13px';
      btn.textContent = isZh ? `${cfg.icon} ${cfg.nameCn}` : `${cfg.icon} ${cfg.nameEn}`;
      btn.addEventListener('click', () => {
        setObserverPlanet(cfg.id);
      });
      planetVantageGrid.appendChild(btn);
    });
  }

  // Synchronize planet toggle pill, modal active states, badge, hint, and location label
  function syncPlanetVantageUI() {
    const cfg = Astronomy.getObserverPlanetConfig(state.observerPlanet);
    const isZh = state.language === 'zh';
    const planetName = isZh ? cfg.nameCn : cfg.nameEn;

    if (planetToggleIcon) planetToggleIcon.textContent = cfg.icon;
    if (planetToggleLabel) planetToggleLabel.textContent = planetName;

    if (planetVantageGrid) {
      planetVantageGrid.querySelectorAll('[data-planet]').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.planet === cfg.id);
      });
    }

    if (planetVantageBadge) {
      planetVantageBadge.textContent = `${planetName} ${cfg.icon}`;
      planetVantageBadge.style.color = cfg.accentColor || 'var(--accent-cyan)';
      if (cfg.badgeBg) planetVantageBadge.style.background = cfg.badgeBg;
    }

    if (planetVantageHint) {
      let hintText = isZh ? cfg.hintCn : cfg.hintEn;
      if (!cfg.useEarthLST && Astronomy.getPlanetLocalSolarTime) {
        const pTime = Astronomy.getPlanetLocalSolarTime(state.currentDate, state.observerLon, cfg.id);
        hintText += isZh
          ? ` 当地太阳时 ${pTime.formattedTime} / ${pTime.formattedDayLength}（按昼长比例同步本地时间）。`
          : ` Local solar time: ${pTime.formattedTime} / ${pTime.formattedDayLength} (synced proportionally to your local time).`;
      }
      planetVantageHint.textContent = hintText;
    }

    updateObserverLocationLabel();
  }

  // Switch observation planet (any registered planet id) preserving relative Lat/Lng
  function setObserverPlanet(planet) {
    const cfg = Astronomy.getObserverPlanetConfig(planet);
    state.observerPlanet = cfg.id;
    try {
      localStorage.setItem('starfinder_observer_planet', state.observerPlanet);
    } catch (e) {}

    renderer.setObserverPlanet(state.observerPlanet);
    syncPlanetVantageUI();
    updateAllStarHorizontalCoordinates();
  }

  // Initialize dynamic planet vantage selector & active planet
  renderPlanetVantageButtons();
  setObserverPlanet(state.observerPlanet);

  if (planetToggleBtn) {
    planetToggleBtn.addEventListener('click', () => {
      const planets = Astronomy.getAvailableObserverPlanets();
      if (planets.length < 2) return;
      const idx = planets.findIndex((p) => p.id === state.observerPlanet);
      const next = planets[(idx + 1) % planets.length];
      setObserverPlanet(next.id);
    });
  }

  // Live ISS Telemetry Poller (only active when observing from Earth)
  function fetchLiveISSTelemetry() {
    const cfg = Astronomy.getObserverPlanetConfig(state.observerPlanet);
    if (cfg.localSpacecraftHost !== 'earth') return;
    fetch('https://api.wheretheiss.at/v1/satellites/25544')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.latitude !== undefined) {
          Astronomy.setLiveISSTelemetry({
            lat: data.latitude,
            lon: data.longitude,
            alt: data.altitude,
            velocity: data.velocity,
            visibility: data.visibility,
            timestamp: data.timestamp
          });
          updateAllStarHorizontalCoordinates();
        }
      })
      .catch((err) => console.log('ISS live telemetry fetch fallback:', err.message));
  }

  fetchLiveISSTelemetry();
  updateAllStarHorizontalCoordinates();

  // Refresh ISS telemetry every 6s and coordinates every 4s, but only while the page is visible
  // (saves battery & network when the PWA is backgrounded).
  setInterval(() => { if (!document.hidden) fetchLiveISSTelemetry(); }, 6000);
  setInterval(() => { if (!document.hidden) updateAllStarHorizontalCoordinates(); }, 4000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      updateAllStarHorizontalCoordinates();
      fetchLiveISSTelemetry();
    }
  });

  // Smooth Camera Pan Animation
  let panAnimation = null;
  function smoothPanTo(targetAz, targetAlt, duration = 800) {
    if (state.gyroActive) return; // Do not override sensor orientation

    const startAz = renderer.cameraAzimuth;
    const startAlt = renderer.cameraAltitude;

    // Shortest angular path for azimuth
    let diffAz = ((targetAz - startAz + 540) % 360) - 180;
    let diffAlt = targetAlt - startAlt;

    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1.0, elapsed / duration);
      // Smooth easeOutCubic curve
      const ease = 1 - Math.pow(1 - progress, 3);

      renderer.cameraAzimuth = (startAz + diffAz * ease + 360) % 360;
      renderer.cameraAltitude = Math.max(-90, Math.min(90, startAlt + diffAlt * ease));

      if (progress < 1.0) {
        panAnimation = requestAnimationFrame(step);
      } else {
        panAnimation = null;
      }
    }

    if (panAnimation) cancelAnimationFrame(panAnimation);
    panAnimation = requestAnimationFrame(step);
  }

  // ==========================================================================
  // Interactive Controls: Mouse Drag & Scroll Zoom (Continuous 360° Fly-Over)
  // ==========================================================================
  let isDragging = false;
  let isPitchFlipped = false;
  let lastPointerX = 0;
  let lastPointerY = 0;
  // Where the gesture started: used to tell a tap from a drag on release
  let downPointerX = 0;
  let downPointerY = 0;
  let wasMultiTouch = false;
  const activePointers = new Set();

  canvas.addEventListener('pointerdown', (e) => {
    if (e.target !== canvas) return;
    // A new primary pointer starts a fresh gesture (guards against lost pointerup events)
    if (e.isPrimary) { activePointers.clear(); wasMultiTouch = false; }
    activePointers.add(e.pointerId);
    if (activePointers.size > 1) wasMultiTouch = true;
    isDragging = true;
    isPitchFlipped = false;
    lastPointerX = downPointerX = e.clientX;
    lastPointerY = downPointerY = e.clientY;
    if (panAnimation) cancelAnimationFrame(panAnimation);
  });

  window.addEventListener('pointermove', (e) => {
    // Hover star detection for desktop pointer (throttled to one hit-test per frame)
    if (e.pointerType === 'mouse' && !isDragging) {
      scheduleHover(e.clientX, e.clientY);
    }

    if (!isDragging || state.gyroActive) return;
    // Pinch-zoom in progress: don't rotate the view at the same time
    if (activePointers.size > 1) {
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      return;
    }

    const dx = e.clientX - lastPointerX;
    const dy = e.clientY - lastPointerY;
    lastPointerX = e.clientX;
    lastPointerY = e.clientY;

    const sensitivity = (renderer.fov / 60.0) * 0.18;

    // Horizontal Azimuth rotation (yaw)
    const azDelta = (isPitchFlipped ? 1 : -1) * dx * sensitivity;
    renderer.cameraAzimuth = (renderer.cameraAzimuth + azDelta + 360.0) % 360.0;

    // Vertical continuous fly-over across Zenith (+90°) and Nadir (-90°)
    const dAlt = (isPitchFlipped ? -1 : 1) * dy * sensitivity;
    let newAlt = renderer.cameraAltitude + dAlt;

    if (newAlt > 90.0) {
      newAlt = 180.0 - newAlt;
      renderer.cameraAzimuth = (renderer.cameraAzimuth + 180.0) % 360.0;
      isPitchFlipped = !isPitchFlipped;
    } else if (newAlt < -90.0) {
      newAlt = -180.0 - newAlt;
      renderer.cameraAzimuth = (renderer.cameraAzimuth + 180.0) % 360.0;
      isPitchFlipped = !isPitchFlipped;
    }

    renderer.cameraAltitude = newAlt;
  });

  function endPointer(e, allowTap) {
    activePointers.delete(e.pointerId);
    if (!isDragging) return;
    if (activePointers.size > 0) return; // other finger still down (pinch ending)
    isDragging = false;
    isPitchFlipped = false;
    const wasPinch = wasMultiTouch;
    wasMultiTouch = false;
    // A tap = released close to where it started (not merely close to the last move event)
    if (!allowTap || wasPinch) return;
    const dist = Math.hypot(e.clientX - downPointerX, e.clientY - downPointerY);
    if (dist < 6) {
      const clickedStar = renderer.getStarAtPosition(e.clientX, e.clientY);
      if (clickedStar) {
        openFactSheet(clickedStar);
      }
    }
  }
  window.addEventListener('pointerup', (e) => endPointer(e, true));
  window.addEventListener('pointercancel', (e) => endPointer(e, false));

  // Scroll Wheel Zoom (FOV 25° - 95°)
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 1.08 : 0.92;
    renderer.fov = Math.max(25.0, Math.min(95.0, renderer.fov * zoomFactor));
  }, { passive: false });

  // Touch Pinch Zoom & Drag Handling
  let touchStartDist = 0;
  let touchStartFov = 60;

  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      touchStartDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartFov = renderer.fov;
    }
  }, { passive: true });

  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (touchStartDist > 0 && currentDist > 0) {
        const scale = touchStartDist / currentDist;
        renderer.fov = Math.max(25.0, Math.min(95.0, touchStartFov * scale));
      }
    }
  }, { passive: true });

  // Hover Tooltip: coalesce mousemove bursts into a single hit-test per animation frame
  let pendingHover = null;
  function scheduleHover(clientX, clientY) {
    const alreadyQueued = pendingHover !== null;
    pendingHover = { x: clientX, y: clientY };
    if (alreadyQueued) return;
    requestAnimationFrame(() => {
      const p = pendingHover;
      pendingHover = null;
      if (p && !isDragging) handleHover(p.x, p.y);
    });
  }

  function formatMag(mag) {
    return typeof mag === 'number' && isFinite(mag) ? mag.toFixed(2) : '—';
  }

  function handleHover(clientX, clientY) {
    const star = renderer.getStarAtPosition(clientX, clientY);
    renderer.hoveredStar = star;

    if (star) {
      const name = state.language === 'zh' ? star.nameCn : star.name;
      const constel = state.language === 'zh' ? star.constellationCn : star.constellation;
      const fact = state.language === 'zh' ? star.summaryCn : star.summaryEn;

      document.getElementById('tooltip-name').textContent = name;
      document.getElementById('tooltip-bayer').textContent = star.bayer || '';
      document.getElementById('tooltip-constel').textContent = `${constel || ''} • Mag ${formatMag(star.mag)}`;
      document.getElementById('tooltip-fact').textContent = fact || '';

      // Position tooltip avoiding screen edges
      const tooltipW = 260;
      const posX = Math.min(clientX + 16, window.innerWidth - tooltipW - 16);
      const posY = Math.min(clientY + 16, window.innerHeight - 140);

      tooltip.style.left = `${posX}px`;
      tooltip.style.top = `${posY}px`;
      tooltip.classList.add('visible');
    } else {
      tooltip.classList.remove('visible');
    }
  }

  // ==========================================================================
  // Fact Sheet Presentation & Lore Rendering
  // ==========================================================================
  const SPACECRAFT_SUBTITLES = {
    iss:      { zh: '国际空间站 • 近地微重力轨道 (~418 km) • 27,600 km/h • 倾角 51.6°', en: 'ISS • Low Earth Orbit (~418 km) • 27,600 km/h • Inc 51.6°' },
    hubble:   { zh: '哈勃空间望远镜 • 低地轨道 (525 km) • 27,300 km/h • 倾角 28.5°', en: 'Hubble Telescope • LEO (525 km) • 27,300 km/h • Inc 28.5°' },
    tiangong: { zh: '中国天宫空间站 • 空间站轨道 (390 km) • 27,650 km/h • 倾角 41.5°', en: 'Tiangong Space Station • LEO (390 km) • 27,650 km/h • Inc 41.5°' },
    jwst:     { zh: '詹姆斯·韦伯空间望远镜 • 日地L2拉格朗日晕轮轨道 (~150万 km)', en: 'James Webb Space Telescope • Sun-Earth L2 Halo Orbit (~1.5M km)' },
    voyager1: { zh: '旅行者1号 • 星际空间 (~245亿公里 / 163.5 AU) • 蛇夫座', en: 'Voyager 1 • Interstellar Space (~24.5B km / 163.5 AU) • Ophiuchus' },
    voyager2: { zh: '旅行者2号 • 星际空间 (~204亿公里 / 136.2 AU) • 孔雀座', en: 'Voyager 2 • Interstellar Space (~20.4B km / 136.2 AU) • Pavo' }
  };

  function openFactSheet(star) {
    state.selectedStar = star;
    renderer.selectedStar = star;

    const isZh = state.language === 'zh';
    const bayerBadge = star.bayer ? `<span class="sheet-bayer-badge">${star.bayer}</span>` : '';
    document.getElementById('sheet-main-name').innerHTML = `
      ${isZh ? (star.nameCn || star.name) : star.name}
      ${bayerBadge}
    `;

    let subText = isZh
      ? [star.constellationCn, star.pinyin].filter(Boolean).join(' • ')
      : [star.constellation, star.spectralType].filter(Boolean).join(' • ');
    if (star.id === 'moon' && star.moonPhase) {
      const pct = Math.round((star.moonPhase.fraction || 0) * 100);
      subText += isZh
        ? ` • 月相: ${star.moonPhase.nameCn} (${pct}%)`
        : ` • Phase: ${star.moonPhase.nameEn} (${pct}%)`;
    } else if ((star.isSpacecraft || star.isISS) && SPACECRAFT_SUBTITLES[star.id]) {
      subText = isZh ? SPACECRAFT_SUBTITLES[star.id].zh : SPACECRAFT_SUBTITLES[star.id].en;
    }
    document.getElementById('sheet-sub-name').textContent = subText;

    // Stats Grid
    document.getElementById('stat-mag').textContent = (star.mag !== undefined && star.mag < 90) ? star.mag.toFixed(1) : 'N/A';
    let distText = star.distanceLy !== undefined ? `${star.distanceLy} ly` : '--';
    if (star.isSpacecraft || star.isISS) {
      if (star.distAU) {
        distText = `${star.distAU.toFixed(1)} AU`;
      } else if (star.rangeKm >= 1000000) {
        distText = `${(star.rangeKm / 1000000).toFixed(2)}M km`;
      } else {
        distText = `${Math.round(star.rangeKm || 418)} km`;
      }
    } else if (star.isSolarSystem) {
      if (typeof star.distKm === 'number' && !star.distAU) {
        distText = `${Math.round(star.distKm).toLocaleString('en-US')} km`;
      } else if (typeof star.distAU === 'number') {
        distText = `${star.distAU.toFixed(2)} AU`;
      } else if (star.id === 'sun') {
        distText = '1.00 AU';
      } else {
        distText = `${(star.distanceLy * 63241).toFixed(2)} AU`;
      }
    }
    document.getElementById('stat-dist').textContent = distText;

    let specText = star.spectralType || '--';
    if (star.isSpacecraft || star.isISS) {
      if (star.craftType === 'leo_station' || star.craftType === 'leo_telescope') {
        specText = `LEO (${star.altKm || Math.round(star.subAlt || 400)} km)`;
      } else if (star.craftType === 'lagrange_telescope') {
        specText = 'Sun-Earth L2';
      } else if (star.craftType === 'interstellar_probe') {
        specText = 'Interstellar';
      }
    }
    document.getElementById('stat-spectral').textContent = specText;

    const curAlt = star.cachedAltitude !== undefined ? `${star.cachedAltitude.toFixed(1)}°` : '--';
    document.getElementById('stat-alt').textContent = curAlt;

    // Bulleted Astrophysical Facts
    const factsList = document.getElementById('sheet-facts-list');
    factsList.innerHTML = '';
    const astro = star.astrophysics || {};
    const facts = isZh ? (astro.zh || []) : (astro.en || []);
    facts.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      factsList.appendChild(li);
    });

    // Cultural Lore & Mythology
    const loreSrc = star.mythology || star.culturalHistory || {};
    const westernLore = isZh
      ? (loreSrc.western ? loreSrc.western.zh : '人类历史上著名的航天里程碑。')
      : (loreSrc.western ? loreSrc.western.en : 'Historic milestone in human space exploration.');
    const chineseLore = isZh
      ? (loreSrc.chinese ? loreSrc.chinese.zh : '探索星辰大海的壮丽篇章。')
      : (loreSrc.chinese ? loreSrc.chinese.en : 'An enduring inspiration for space exploration.');

    document.getElementById('sheet-western-lore').textContent = westernLore;
    document.getElementById('sheet-chinese-lore').textContent = chineseLore;

    sheetBackdrop.classList.add('open');
    factSheet.classList.add('open');
  }

  function closeFactSheet() {
    state.selectedStar = null;
    renderer.selectedStar = null;
    sheetBackdrop.classList.remove('open');
    factSheet.classList.remove('open');
  }

  sheetCloseBtn.addEventListener('click', closeFactSheet);
  sheetBackdrop.addEventListener('click', closeFactSheet);

  // Global Escape: close any open modal overlay first, then the fact sheet
  // (the search box handles its own Escape and stops there)
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || e.target === searchInput) return;
    const openModals = document.querySelectorAll('.modal-overlay.open');
    if (openModals.length > 0) {
      openModals.forEach(m => m.classList.remove('open'));
    } else if (factSheet.classList.contains('open')) {
      closeFactSheet();
    }
  });

  // "Aim Here" / "对准此星" Quick Button in Fact Sheet
  sheetAimBtn.addEventListener('click', () => {
    if (state.selectedStar) {
      setAimingTarget(state.selectedStar);
      closeFactSheet();
      smoothPanTo(state.selectedStar.cachedAzimuth, state.selectedStar.cachedAltitude);
    }
  });

  // Reticle Center Lock Badge click
  lockBadge.addEventListener('click', () => {
    if (renderer.lockedStar) {
      openFactSheet(renderer.lockedStar);
    }
  });

  // ==========================================================================
  // Bilingual Search & Live Autocomplete (Stars, Sun, Moon, Planets, Pinyin)
  // ==========================================================================
  function normalizeStr(s) {
    if (!s) return '';
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  const SEARCH_ALIASES = {
    sun: ['sun', 'solar', '太阳', '日', 'taiyang', '金乌', '羲和', 'sol'],
    moon: ['moon', 'luna', '月亮', '月球', '太阴', '嫦娥', '玉兔', 'yueliang', 'yueqiu', 'taiyin', 'chanjuan'],
    venus: ['venus', '金星', '太白', '启明', '长庚', 'jinxing', 'taibai', 'qiming', 'changgeng'],
    jupiter: ['jupiter', '木星', '岁星', 'muxing', 'suixing'],
    earth: ['earth', 'terra', 'gaia', '地球', '后土', 'diqiu', 'houtu', 'pale blue dot'],
    phobos: ['phobos', '火卫一', 'huowei1', 'huoweiyi', 'stickney'],
    deimos: ['deimos', '火卫二', 'huowei2', 'huoweier'],
    mars: ['mars', '火星', '荧惑', 'huoxing', 'yinghuo'],
    saturn: ['saturn', '土星', '镇星', '填星', 'tuxing', 'zhenxing', 'tianxing'],
    mercury: ['mercury', '水星', '辰星', 'shuixing', 'chenxing'],
    uranus: ['uranus', '天王星', 'tianwang', 'tianwangxing'],
    neptune: ['neptune', '海王星', 'haiwang', 'haiwangxing'],
    sirius: ['sirius', '天狼星', '大犬', 'tianlang', 'dog star'],
    polaris: ['polaris', '北极星', '勾陈一', '紫微', 'beiji', 'north star', 'lodestar'],
    vega: ['vega', '织女星', '织女', '天琴', 'zhinv', 'zhinu'],
    altair: ['altair', '牛郎星', '牵牛', '河鼓二', '天鹰', 'niulang', 'hegu'],
    betelgeuse: ['betelgeuse', '参宿四', '猎户', 'shensu', 'caisu'],
    antares: ['antares', '心宿二', '大火', '天蝎', 'xinsu', 'dahuox'],
    iss: ['iss', 'space station', '国际空间站', '空间站', 'kongjianzhan', 'norad', '25544', 'leo'],
    hubble: ['hubble', 'hst', '哈勃', '哈勃望远镜', '哈勃空间望远镜', 'habo', 'telescope', '20580'],
    tiangong: ['tiangong', 'css', '天宫', '天宫空间站', '中国空间站', 'tianhe', 'wentian', 'mengtian', '48274'],
    jwst: ['jwst', 'webb', 'james webb', '韦伯', '韦布', '詹姆斯韦伯', 'weibo', 'lagrange', 'l2'],
    voyager1: ['voyager1', 'voyager 1', '旅行者1号', '旅行者一号', 'lvxingzhe1', 'golden record', 'interstellar'],
    voyager2: ['voyager2', 'voyager 2', '旅行者2号', '旅行者二号', 'lvxingzhe2', 'interstellar']
  };

  // Dropdown for currently visible celestial bodies in camera FOV
  function showCurrentlyVisibleDropdown() {
    if (!autocompleteDropdown) return;
    const isZh = state.language === 'zh';
    const visibleBodies = (renderer && renderer.getCurrentlyVisibleBodies)
      ? renderer.getCurrentlyVisibleBodies(state.currentDate, state.observerLat, state.observerLon)
      : [];

    // Live refresh (every 300ms) — skip the DOM rebuild when nothing visible has changed,
    // and keep the keyboard-highlighted row when it does.
    const altOf = (b) => (b.currentAlt !== undefined ? b.currentAlt : b.cachedAltitude);
    const sig = `${state.language}|${visibleBodies.length}|` +
      visibleBodies.slice(0, 10).map(b => `${b.id}:${Math.round(altOf(b))}`).join(',');
    const isShowingVisibleList = autocompleteDropdown.classList.contains('open') &&
      autocompleteDropdown.querySelector('.autocomplete-header');
    if (isShowingVisibleList && autocompleteDropdown.dataset.visibleSig === sig) return;
    autocompleteDropdown.dataset.visibleSig = sig;
    const prevActive = autocompleteDropdown.querySelector('.autocomplete-item.active');
    const prevActiveId = prevActive ? prevActive.dataset.id : null;

    autocompleteDropdown.innerHTML = '';

    // Header displaying count of currently visible celestial objects
    const header = document.createElement('div');
    header.className = 'autocomplete-header';
    header.innerHTML = `
      <span>${isZh ? `✦ 视场内可见 (${visibleBodies.length} 个天体)` : `✦ In Current View (${visibleBodies.length} objects)`}</span>
      <span class="autocomplete-header-hint">${isZh ? '点击自动对齐' : 'Click to aim'}</span>
    `;
    autocompleteDropdown.appendChild(header);

    if (visibleBodies.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'autocomplete-empty';
      emptyDiv.innerHTML = isZh
        ? '当前视野内暂无显著天体<br><span style="font-size:11px;opacity:0.8;">可旋转手机/拖拽星空，或在上方直接搜索</span>'
        : 'No prominent celestial bodies in current view.<br><span style="font-size:11px;opacity:0.8;">Pan camera or type above to search.</span>';
      autocompleteDropdown.appendChild(emptyDiv);
      autocompleteDropdown.classList.add('open');
      if (searchContainer) searchContainer.classList.add('active');
      return;
    }

    visibleBodies.slice(0, 10).forEach((star) => {
      const item = document.createElement('div');
      item.className = 'autocomplete-item';
      item.dataset.id = star.id || '';
      if (prevActiveId && star.id === prevActiveId) item.classList.add('active');
      const tagText = (star.isSpacecraft || star.isISS)
        ? (isZh ? '人造航天器' : 'Spacecraft')
        : (star.isSolarSystem
          ? (isZh ? '太阳系' : 'Solar System')
          : (isZh ? (star.constellationCn || '恒星') : (star.constellation || 'Star')));

      const altNum = star.currentAlt !== undefined ? star.currentAlt : star.cachedAltitude;
      const altStr = (altNum !== undefined && !isNaN(altNum))
        ? `Alt ${altNum >= 0 ? '+' : ''}${Math.round(altNum)}°`
        : '';
      const magStr = (star.mag !== undefined && star.mag < 90)
        ? `Mag ${star.mag.toFixed(1)}`
        : '';
      const metaParts = [altStr, magStr].filter(Boolean).join(' • ');

      const secName = isZh
        ? (star.name + (star.bayer ? ` (${star.bayer})` : ''))
        : (star.nameCn ? `${star.nameCn}${star.bayer ? ` (${star.bayer})` : ''}` : (star.bayer || ''));

      item.innerHTML = `
        <div class="item-left">
          <div class="item-color-dot" style="background: ${star.color || '#ffb300'};"></div>
          <div class="item-names">
            <span class="item-primary-name">${isZh ? (star.nameCn || star.name) : star.name}</span>
            <span class="item-secondary-name">${secName}</span>
          </div>
        </div>
        <div class="item-right">
          <span class="item-constellation">${tagText}</span>
          <span class="item-mag">${metaParts}</span>
        </div>
      `;

      item.addEventListener('click', (e) => {
        e.stopPropagation();
        searchInput.value = isZh ? (star.nameCn || star.name) : star.name;
        searchClearBtn.classList.add('visible');
        autocompleteDropdown.classList.remove('open');
        if (searchContainer) searchContainer.classList.remove('active');
        setAimingTarget(star);
        smoothPanTo(star.cachedAzimuth, star.cachedAltitude);
      });

      autocompleteDropdown.appendChild(item);
    });

    autocompleteDropdown.classList.add('open');
    if (searchContainer) searchContainer.classList.add('active');
  }

  // Click & Focus handlers for opening visible objects dropdown
  searchInput.addEventListener('focus', () => {
    if (searchContainer) searchContainer.classList.add('active');
    if (!searchInput.value.trim()) {
      showCurrentlyVisibleDropdown();
    }
  });

  searchInput.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!searchInput.value.trim()) {
      showCurrentlyVisibleDropdown();
    }
  });

  if (searchContainer) {
    searchContainer.addEventListener('click', (e) => {
      if (e.target !== searchClearBtn && !autocompleteDropdown.contains(e.target)) {
        searchInput.focus();
        if (!searchInput.value.trim()) {
          showCurrentlyVisibleDropdown();
        }
      }
    });
  }

  // Keyboard accessibility: Escape to close, ArrowDown/Up to navigate, Enter to pick
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      autocompleteDropdown.classList.remove('open');
      if (searchContainer) searchContainer.classList.remove('active');
      searchInput.blur();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const items = autocompleteDropdown.querySelectorAll('.autocomplete-item');
      if (items.length > 0) {
        e.preventDefault();
        let currentIndex = -1;
        items.forEach((item, idx) => {
          if (item.classList.contains('active')) currentIndex = idx;
        });
        if (e.key === 'ArrowDown') {
          currentIndex = (currentIndex + 1) % items.length;
        } else {
          currentIndex = (currentIndex - 1 + items.length) % items.length;
        }
        items.forEach((item, idx) => {
          item.classList.toggle('active', idx === currentIndex);
          if (idx === currentIndex) item.scrollIntoView({ block: 'nearest' });
        });
      }
    } else if (e.key === 'Enter') {
      const activeItem = autocompleteDropdown.querySelector('.autocomplete-item.active');
      if (activeItem) {
        e.preventDefault();
        activeItem.click();
      }
    }
  });

  // Global '/' keyboard shortcut to focus search input
  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      searchInput.focus();
      if (!searchInput.value.trim()) showCurrentlyVisibleDropdown();
    }
  });

  searchInput.addEventListener('input', () => {
    const rawQuery = searchInput.value.trim();
    const query = normalizeStr(rawQuery);
    searchClearBtn.classList.toggle('visible', rawQuery.length > 0);

    if (rawQuery.length === 0) {
      showCurrentlyVisibleDropdown();
      return;
    }

    const allPool = state.allCelestialBodies || StarsData.STARS;

    const matches = allPool.filter((star) => {
      // 1. Direct field matching
      const nameEnNorm = normalizeStr(star.name);
      const nameCn = star.nameCn || '';
      const pinyinNorm = normalizeStr(star.pinyin);
      const bayerNorm = normalizeStr(star.bayer);
      const constelEnNorm = normalizeStr(star.constellation);
      const constelCn = star.constellationCn || '';

      if (
        nameEnNorm.includes(query) ||
        nameCn.includes(rawQuery) ||
        pinyinNorm.includes(query) ||
        bayerNorm.includes(query) ||
        constelEnNorm.includes(query) ||
        constelCn.includes(rawQuery)
      ) {
        return true;
      }

      // 2. Check aliases (built-in + extensible per-body metadata searchAliases)
      const aliases = (SEARCH_ALIASES[star.id] || []).concat(Array.isArray(star.searchAliases) ? star.searchAliases : []);
      if (aliases.length > 0) {
        return aliases.some((alias) => {
          const aliasNorm = normalizeStr(alias);
          return aliasNorm.includes(query) || alias.includes(rawQuery);
        });
      }

      return false;
    });

    renderAutocompleteResults(matches);
  });

  searchClearBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    searchInput.value = '';
    searchClearBtn.classList.remove('visible');
    searchInput.focus();
    showCurrentlyVisibleDropdown();
  });

  function renderAutocompleteResults(matches) {
    autocompleteDropdown.innerHTML = '';
    if (matches.length === 0) {
      autocompleteDropdown.innerHTML = `
        <div style="padding: 12px 16px; color: var(--text-muted); font-size: 12px; text-align: center;">
          ${state.language === 'zh' ? '未找到匹配天体 (支持中英文/拼音搜索)' : 'No matching celestial bodies found (supports EN/CN/Pinyin)'}
        </div>
      `;
      autocompleteDropdown.classList.add('open');
      if (searchContainer) searchContainer.classList.add('active');
      return;
    }

    const isZh = state.language === 'zh';
    matches.slice(0, 8).forEach((star) => {
      const item = document.createElement('div');
      item.className = 'autocomplete-item';

      const tagText = (star.isSpacecraft || star.isISS)
        ? (isZh ? '人造航天器' : 'Spacecraft')
        : (star.isSolarSystem
          ? (isZh ? '太阳系' : 'Solar System')
          : (isZh ? star.constellationCn : star.constellation));

      const magText = (star.mag !== undefined && star.mag < 90)
        ? `Mag ${star.mag.toFixed(2)}`
        : (isZh ? '深空探测' : 'Deep Space');

      item.innerHTML = `
        <div class="item-left">
          <div class="item-color-dot" style="background: ${star.color || '#ffb300'};"></div>
          <div class="item-names">
            <span class="item-primary-name">${isZh ? star.nameCn : star.name}</span>
            <span class="item-secondary-name">${isZh ? star.name : star.nameCn} (${star.bayer})</span>
          </div>
        </div>
        <div class="item-right">
          <span class="item-constellation">${tagText}</span>
          <span class="item-mag">${magText}</span>
        </div>
      `;

      item.addEventListener('click', (e) => {
        e.stopPropagation();
        searchInput.value = isZh ? star.nameCn : star.name;
        autocompleteDropdown.classList.remove('open');
        if (searchContainer) searchContainer.classList.remove('active');
        setAimingTarget(star);
        smoothPanTo(star.cachedAzimuth, star.cachedAltitude);
      });

      autocompleteDropdown.appendChild(item);
    });

    autocompleteDropdown.classList.add('open');
    if (searchContainer) searchContainer.classList.add('active');
  }

  // Dismiss dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (searchContainer && !searchContainer.contains(e.target) && !autocompleteDropdown.contains(e.target)) {
      autocompleteDropdown.classList.remove('open');
      searchContainer.classList.remove('active');
    }
  });

  // ==========================================================================
  // Directional Aiming Guide HUD
  // ==========================================================================
  // "Name (Bayer)" — omits the parentheses for objects with no Bayer designation
  function withBayer(name, bayer) {
    return bayer ? `${name || ''} (${bayer})` : (name || '');
  }

  function setAimingTarget(star) {
    state.aimingTargetStar = star;
    renderer.aimingTargetStar = star;

    const isZh = state.language === 'zh';
    aimingTargetName.textContent = isZh
      ? `目标: ${withBayer(star.nameCn || star.name, star.bayer)}`
      : `Target: ${withBayer(star.name, star.bayer)}`;

    aimingGuideHud.classList.add('active');
  }

  function clearAimingTarget() {
    state.aimingTargetStar = null;
    renderer.aimingTargetStar = null;
    aimingGuideHud.classList.remove('active');
  }

  aimingCloseBtn.addEventListener('click', clearAimingTarget);

  // Update Aiming HUD in animation frame (resolves live coordinates for moving spacecraft/planets)
  let lastAimArrowDeg = null;
  let lastAimLocked = null;
  function updateAimingHUD() {
    if (!state.aimingTargetStar) return;

    const targetId = state.aimingTargetStar.id;
    const liveStar = (state.allCelestialBodies && targetId)
      ? (state.allCelestialBodies.find(b => b.id === targetId) || state.aimingTargetStar)
      : state.aimingTargetStar;
    if (liveStar !== state.aimingTargetStar) {
      state.aimingTargetStar = liveStar;
      renderer.aimingTargetStar = liveStar;
    }

    const guidance = Astronomy.getAimingGuidance(
      renderer.cameraAzimuth, renderer.cameraAltitude,
      liveStar.cachedAzimuth, liveStar.cachedAltitude
    );

    const isZh = state.language === 'zh';
    setText(aimingInstruction, isZh ? guidance.textCn : guidance.textEn);

    // Rotate arrow icon towards target direction (only touch style when rounded angle changes)
    const arrowDeg = Math.round(guidance.arrowAngleDeg * 2) / 2;
    if (arrowDeg !== lastAimArrowDeg) {
      lastAimArrowDeg = arrowDeg;
      aimingArrow.style.transform = `rotate(${arrowDeg}deg)`;
    }

    if (guidance.isLocked !== lastAimLocked) {
      lastAimLocked = guidance.isLocked;
      if (guidance.isLocked) {
        aimingArrow.style.background = 'rgba(16, 185, 129, 0.3)';
        aimingArrow.style.borderColor = '#10b981';
      } else {
        aimingArrow.style.background = 'rgba(56, 189, 248, 0.15)';
        aimingArrow.style.borderColor = 'var(--accent-cyan)';
      }
    }
  }

  // ==========================================================================
  // Header Actions: Gyroscope, AR Camera, Night Mode, Language Toggle
  // ==========================================================================

  // DOM FAB elements
  const arFabBtn = document.getElementById('ar-fab-btn');
  const gyroFabBtn = document.getElementById('gyro-fab-btn');

  // Gyroscope / Compass Toggle Function
  async function toggleGyro() {
    if (state.gyroActive) {
      Sensors.stopOrientation();
      state.gyroActive = false;
      gyroToggleBtn.classList.remove('active');
      if (gyroFabBtn) gyroFabBtn.classList.remove('active');
    } else {
      const started = await Sensors.startOrientation((orientation) => {
        renderer.cameraAzimuth = orientation.azimuth;
        renderer.cameraAltitude = orientation.altitude;
        renderer.cameraRoll = orientation.roll;
      });
      if (started) {
        state.gyroActive = true;
        gyroToggleBtn.classList.add('active');
        if (gyroFabBtn) gyroFabBtn.classList.add('active');
      } else {
        alert(state.language === 'zh'
          ? '无法访问设备方向传感器或已被拒绝。'
          : 'Could not access device orientation sensors or permission denied.');
      }
    }
  }

  gyroToggleBtn.addEventListener('click', toggleGyro);
  if (gyroFabBtn) gyroFabBtn.addEventListener('click', toggleGyro);

  const arFloatingFab = document.getElementById('ar-floating-fab');
  const arFloatingLabel = document.getElementById('ar-floating-label');

  // AR Camera Toggle Function
  async function toggleCamera() {
    const appViewport = document.getElementById('app-viewport');
    if (state.arActive) {
      Sensors.stopCamera(arVideo);
      state.arActive = false;
      renderer.isAR = false;
      if (appViewport) appViewport.classList.remove('ar-active');
      if (arToggleBtn) arToggleBtn.classList.remove('active');
      if (arFabBtn) arFabBtn.classList.remove('active');
      if (arFloatingFab) arFloatingFab.classList.remove('active');
      if (arFloatingLabel) arFloatingLabel.textContent = state.language === 'zh' ? 'AR 透视' : 'AR Camera';
    } else {
      try {
        await Sensors.startCamera(arVideo);
        state.arActive = true;
        renderer.isAR = true;
        if (appViewport) appViewport.classList.add('ar-active');
        if (arToggleBtn) arToggleBtn.classList.add('active');
        if (arFabBtn) arFabBtn.classList.add('active');
        if (arFloatingFab) arFloatingFab.classList.add('active');
        if (arFloatingLabel) arFloatingLabel.textContent = state.language === 'zh' ? 'AR 运行中' : 'AR Active';
      } catch (err) {
        alert(state.language === 'zh'
          ? '相机开启失败或权限被拒绝。请在安全上下文（HTTPS）中使用后置摄像头。'
          : 'Camera access failed or permission denied. Please use HTTPS with a rear camera.');
      }
    }
  }

  if (arToggleBtn) arToggleBtn.addEventListener('click', toggleCamera);
  if (arFabBtn) arFabBtn.addEventListener('click', toggleCamera);
  if (arFloatingFab) arFloatingFab.addEventListener('click', toggleCamera);

  // Night Mode Toggle (Nocturnal Dark-Sky Red)
  nightToggleBtn.addEventListener('click', () => {
    state.nightMode = !state.nightMode;
    document.body.classList.toggle('night-mode', state.nightMode);
    nightToggleBtn.classList.toggle('active', state.nightMode);
    localStorage.setItem('starfinder_night_mode', state.nightMode ? 'true' : 'false');
  });

  // Bilingual Language Toggle [EN | 中文]
  langToggleBtn.addEventListener('click', () => {
    state.language = state.language === 'en' ? 'zh' : 'en';
    renderer.language = state.language;
    localStorage.setItem('starfinder_lang', state.language);
    applyTranslations();
  });

  function applyTranslations() {
    const isZh = state.language === 'zh';
    langToggleBtn.textContent = isZh ? 'EN' : '中文';
    document.title = isZh ? 'Star Finder (星空识星)' : 'Star Finder';

    // Update static i18n text
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (TRANSLATIONS[key]) {
        el.textContent = isZh ? TRANSLATIONS[key].zh : TRANSLATIONS[key].en;
      }
    });

    searchInput.placeholder = isZh
      ? '搜索恒星、星座、神话传说...'
      : 'Search star, constellation, lore...';

    badgeHint.textContent = isZh ? '点击查看恒星档案 ➔' : 'Tap to inspect ➔';

    if (arFloatingLabel) {
      if (state.arActive) {
        arFloatingLabel.textContent = isZh ? 'AR 运行中' : 'AR Active';
      } else {
        arFloatingLabel.textContent = isZh ? 'AR 透视' : 'AR Camera';
      }
    }

    // Update Sky Mode UI
    updateSkyModeUI();


    // Re-render open sheet or target if present
    if (state.selectedStar) {
      openFactSheet(state.selectedStar);
    }
    if (state.aimingTargetStar) {
      setAimingTarget(state.aimingTargetStar);
    }

    if (typeof renderEventsList === 'function' && eventsModal && eventsModal.classList.contains('open')) {
      renderEventsList();
    }

    renderCityPresets();
    renderPlanetVantageButtons();
    syncPlanetVantageUI();

    updateDampingLabel();
  }

  const TRANSLATIONS = {
    planet_vantage_title: { en: 'Observation Planet', zh: '观测星球 / 视点' },
    brand_sub: { en: 'Celestial Guide', zh: '全天实时星图' },
    loc_modal_title: { en: 'Stargazing Location', zh: '观星地点与经纬度' },
    gps_btn: { en: 'Auto GPS Locate', zh: '自动 GPS 定位' },
    city_presets: { en: 'City Presets', zh: '热门城市预设' },
    skymode_title: { en: 'Light Pollution & Sky Visibility', zh: '天空明暗与光污染设置' },
    skymode_city_name: { en: 'City Sky', zh: '城市夜空' },
    skymode_city_desc: { en: 'Heavy light pollution. Only planets, Moon, Sun & bright stars.', zh: '重度光污染。仅见太阳、月亮、明亮行星与主要导航亮星。' },
    skymode_suburb_name: { en: 'Suburb Sky', zh: '郊区夜空' },
    skymode_suburb_desc: { en: 'Moderate skyglow. Major constellations clearly visible.', zh: '中度郊区光害。清晰展现主要星座几何轮廓与中等亮星。' },
    skymode_desert_name: { en: 'Desert Dark Sky', zh: '荒漠暗夜' },
    skymode_desert_desc: { en: 'Pristine dark sky. Thousands of faint stars & luminous Milky Way.', zh: '极暗自然夜空。尽览数千颗暗星与璀璨银河壮美飞渡。' },
    skymode_ignore_name: { en: 'Ignore Ambient Light', zh: '忽略环境光' },
    skymode_ignore_desc: { en: 'Bypass all room, city & environment light. Full pristine dark sky with thousands of stars & radiant Milky Way.', zh: '完全忽略室内、城市与环境光。展现理想暗夜，尽览数千颗星辰与璀璨银河。' },
    opt_ignore_ambient: { en: 'Ignore Ambient Light', zh: '忽略环境光 (理想暗夜)' },
    opt_ignore_ambient_sub: { en: 'Display ideal dark sky bypassing ambient/city light', zh: '无视现场与城市光害，呈现纯净星空' },
    layer_ignore_ambient: { en: 'Ignore Ambient Light', zh: '忽略环境光 (理想暗夜)' },
    layer_ignore_ambient_desc: { en: 'Pristine dark sky bypassing room, city and camera light estimation', zh: '绕过现场室内光与城市光害，直接呈现理想暗夜' },
    cam_meter_btn: { en: 'Estimate Light via Camera', zh: '📷 摄像头实景测光估算' },
    cam_meter_hint: { en: 'Analyze live environment luminance via camera', zh: '通过摄像头分析真实环境光照与光害级别' },
    stat_mag: { en: 'Visual Mag', zh: '视星等' },
    stat_dist: { en: 'Distance', zh: '距离' },
    stat_spec: { en: 'Spectral Type', zh: '光谱型' },
    stat_alt: { en: 'Altitude', zh: '地平高度' },
    sec_astro: { en: 'Astrophysical Facts', zh: '恒星物理与天文学特征' },
    sec_lore: { en: 'Cultural Lore & Mythology', zh: '中西方神话与星象典故' },
    western_lore_title: { en: '🏛️ Western Mythology', zh: '🏛️ 西方神话与星名渊源' },
    chinese_lore_title: { en: '🐉 Chinese Astronomy', zh: '🐉 中国传统星象 (三垣二十八宿)' },
    aim_btn: { en: 'Aim Here', zh: '对准此星' },
    ios_guide_title: { en: 'Install Star Finder App', zh: '安装星空识星应用' },
    ios_step1: { en: 'Tap the Share button in Safari toolbar', zh: '点击 Safari 浏览器底部的“分享”按钮' },
    ios_step2: { en: 'Scroll down and tap "Add to Home Screen"', zh: '向下滑动并选择“添加到主屏幕”' },
    ios_step3: { en: 'Tap "Add" in top-right corner to finish install', zh: '点击右上角“添加”，即可随时离线使用' },
    gyro_damping_label: { en: 'Sensor Smoothing', zh: '陀螺仪防抖与灵敏度' },
    events_btn: { en: 'Sky Events', zh: '近期天象' },
    layers_btn: { en: 'Layers', zh: '图层' },
    layers_modal_title: { en: 'Sky View Layers & Filters', zh: '星空图层与防拥挤筛选' },
    layers_modal_sub: { en: 'Select visible objects to avoid crowding the sky', zh: '勾选显示图层，避免星空过于拥挤' },
    presets_title: { en: 'Quick Presets', zh: '快捷视角预设' },
    preset_all: { en: '🌟 All Layers', zh: '🌟 全天全景' },
    preset_stargazing: { en: '🔭 Stargazing Only', zh: '🔭 纯净观星' },
    preset_spacecraft: { en: '🛰️ Spacecraft & Probes', zh: '🛰️ 空间探测器' },
    preset_minimal: { en: '🌌 Minimalist Night', zh: '🌌 极简夜空' },
    layer_stars: { en: 'Major Navigational Stars', zh: '主要导航亮星' },
    layer_stars_desc: { en: '50+ brightest navigational stars', zh: '全天 50+ 颗最主要导航亮星' },
    layer_constellations: { en: 'Constellation Lines', zh: '星座连线与几何轮廓' },
    layer_constellations_desc: { en: 'Geometric stick figures & celestial lore', zh: '西方 88 星座连线与经典图形' },
    layer_solar: { en: 'Solar System Planets & Moon', zh: '太阳、月球与各大行星' },
    layer_solar_desc: { en: 'Sun, Moon phases, Mercury, Venus, Mars, Jupiter, Saturn', zh: '太阳、月相、水星、金星、火星、木星、土星' },
    layer_spacecraft: { en: 'Man-Made Spacecraft & Probes', zh: '人造航天器与深空探测器' },
    layer_spacecraft_desc: { en: 'ISS, Hubble, Tiangong, JWST, Voyager 1 & 2', zh: '国际空间站、哈勃、天宫、韦伯、旅行者1号与2号' },
    layer_spacecraft_leo: { en: 'Low Earth Orbit (LEO)', zh: '近地轨道 (LEO)' },
    layer_spacecraft_deep: { en: 'Lagrange L2 & Interstellar Probes', zh: '拉格朗日L2与星际探测器' },
    layer_milkyway: { en: 'Milky Way Stream', zh: '银河璀璨光带' },
    layer_milkyway_desc: { en: 'Smooth continuous galactic starlight ribbon', zh: '银河系银道面连续平滑飞渡光带' },
    layer_grid: { en: 'Horizon & Azimuth/Alt Grid', zh: '地平坐标系与方位网格' },
    layer_grid_desc: { en: 'Cardinal compass (N, E, S, W) and altitude circles', zh: '东南西北罗盘方位与等高角圈' },
    layer_labels: { en: 'Star Names & Distance Badges', zh: '星名文字与轨道测距徽章' },
    layer_labels_desc: { en: 'Text labels and orbit distances beside objects', zh: '天体旁悬浮名称与距离遥测' },
    events_modal_title: { en: 'Upcoming Celestial Events', zh: '近期重点天象盛宴' },
    events_modal_sub: { en: 'Curated astronomical wonders & meteor showers. Tap to jump & aim!', zh: '天文台精选天象日历与流星雨。点击即刻对准并定位！' },
    evt_cat_all: { en: 'All Events', zh: '全部天象' },
    evt_cat_soon: { en: '⚡ Happening Soon', zh: '⚡ 近期即将发生' },
    evt_cat_rare: { en: '⭐ Rare Wonders', zh: '⭐ 罕见奇观 (五星推荐)' },
    evt_cat_meteors: { en: '🌠 Meteor Showers', zh: '🌠 流星雨' },
    evt_cat_eclipses: { en: '🌑 Eclipses', zh: '🌑 日月食' },
    evt_cat_oppositions: { en: '🪐 Planet Oppositions', zh: '🪐 行星冲日' }
  };

  // Sensor Damping Mode Toggle
  const gyroDampingBtn = document.getElementById('gyro-damping-btn');

  function updateDampingLabel() {
    if (!gyroDampingText) return;
    const isZh = state.language === 'zh';
    gyroDampingText.textContent = state.dampingMode === 'responsive'
      ? (isZh ? 'Ultra Responsive (即时灵敏)' : 'Ultra Responsive')
      : (isZh ? 'Silky Smooth (防抖稳定)' : 'Silky Smooth (Stabilized)');
  }

  if (gyroDampingBtn) {
    gyroDampingBtn.addEventListener('click', () => {
      state.dampingMode = state.dampingMode === 'responsive' ? 'smooth' : 'responsive';
      Sensors.setDampingMode(state.dampingMode);
      updateDampingLabel();
    });
  }

  // Compass Fine-Tuning Calibration Controls
  const compassMinusBtn = document.getElementById('compass-minus-btn');
  const compassPlusBtn = document.getElementById('compass-plus-btn');
  const compassResetBtn = document.getElementById('compass-reset-btn');
  const compassOffsetDisplay = document.getElementById('compass-offset-display');

  function updateCompassDisplay() {
    if (compassOffsetDisplay) {
      const val = Sensors.getCompassOffset();
      compassOffsetDisplay.textContent = (val > 0 ? `+${val.toFixed(1)}°` : `${val.toFixed(1)}°`);
    }
  }

  if (compassMinusBtn) {
    compassMinusBtn.addEventListener('click', () => {
      Sensors.adjustCompassOffset(-2.0);
      updateCompassDisplay();
    });
  }
  if (compassPlusBtn) {
    compassPlusBtn.addEventListener('click', () => {
      Sensors.adjustCompassOffset(2.0);
      updateCompassDisplay();
    });
  }
  if (compassResetBtn) {
    compassResetBtn.addEventListener('click', () => {
      Sensors.setCompassOffset(0.0);
      updateCompassDisplay();
    });
  }
  updateCompassDisplay();

  // ==========================================================================
  // Sky Visibility & Light Pollution Modes (City, Suburb, Desert, Auto Camera)
  // ==========================================================================
  const SKY_MODES = [
    {
      id: 'city',
      limitingMag: 3.2,
      icon: '🏙️',
      labelEn: 'City (≤3.2m)',
      labelZh: '城市 (≤3.2等)'
    },
    {
      id: 'suburb',
      limitingMag: 4.8,
      icon: '🏡',
      labelEn: 'Suburb (≤4.8m)',
      labelZh: '郊区 (≤4.8等)'
    },
    {
      id: 'desert',
      limitingMag: 6.5,
      icon: '🌌',
      labelEn: 'Desert (≤6.5m)',
      labelZh: '荒漠 (≤6.5等)'
    },
    {
      id: 'ignore_ambient',
      limitingMag: 6.5,
      icon: '✨',
      labelEn: 'Ignore Light (≤6.5m)',
      labelZh: '忽略环境光 (≤6.5等)'
    },
    {
      id: 'auto_cam',
      limitingMag: 4.8,
      icon: '📷',
      labelEn: 'Auto (Camera)',
      labelZh: '📷 自动测光'
    }
  ];

  let currentSkyMode = localStorage.getItem('starfinder_sky_mode') || 'city';
  if (renderer.ignoreAmbientLight) {
    currentSkyMode = 'ignore_ambient';
  }

  function setSkyMode(modeId) {
    const found = SKY_MODES.find(m => m.id === modeId) || SKY_MODES[0];
    currentSkyMode = found.id;
    if (found.id === 'ignore_ambient') {
      renderer.setIgnoreAmbientLight(true);
      renderer.limitingMagnitude = 6.5;
    } else {
      renderer.setIgnoreAmbientLight(false);
      if (found.id !== 'auto_cam') {
        renderer.limitingMagnitude = found.limitingMag;
      }
    }
    localStorage.setItem('starfinder_sky_mode', found.id);
    localStorage.setItem('starfinder_limiting_mag', renderer.limitingMagnitude.toString());
    updateSkyModeUI();

    // If auto camera mode is chosen and camera is off, attempt one quick sample
    if (found.id === 'auto_cam' && !state.arActive) {
      Sensors.sampleCameraLightOnce(arVideo).then((est) => {
        if (est) {
          renderer.limitingMagnitude = est.suggestedLimitingMag;
          updateSkyModeUI();
        }
      }).catch((e) => console.log('Camera sampling skipped:', e));
    }
  }

  function updateSkyModeUI() {
    const isZh = state.language === 'zh';
    const found = SKY_MODES.find(m => m.id === currentSkyMode) || SKY_MODES[0];
    const skymodeIcon = document.getElementById('skymode-icon');
    const skymodeLabel = document.getElementById('skymode-label');
    if (skymodeIcon) skymodeIcon.textContent = found.icon;

    if (skymodeLabel) {
      if (found.id === 'auto_cam') {
        skymodeLabel.textContent = isZh
          ? `📷 自动测光 (≤${renderer.limitingMagnitude.toFixed(1)}等)`
          : `📷 Auto (≤${renderer.limitingMagnitude.toFixed(1)}m)`;
      } else if (found.id === 'ignore_ambient') {
        skymodeLabel.textContent = isZh ? '✨ 忽略环境光 (≤6.5等)' : '✨ Ignore Light (≤6.5m)';
      } else {
        skymodeLabel.textContent = isZh ? found.labelZh : found.labelEn;
      }
    }

    document.querySelectorAll('.skymode-card').forEach((card) => {
      const mode = card.getAttribute('data-mode');
      card.classList.toggle('active', mode === currentSkyMode);
    });

    const isIgnoring = currentSkyMode === 'ignore_ambient' || !!renderer.ignoreAmbientLight;
    const ignoreToggle = document.getElementById('ignore-ambient-toggle');
    if (ignoreToggle) ignoreToggle.checked = isIgnoring;
    const layerIgnoreToggle = document.getElementById('layer-toggle-ignore-ambient');
    if (layerIgnoreToggle) layerIgnoreToggle.checked = isIgnoring;
  }

  const skymodeBtn = document.getElementById('skymode-btn');
  if (skymodeBtn) {
    skymodeBtn.addEventListener('click', () => {
      const curIdx = SKY_MODES.findIndex(m => m.id === currentSkyMode);
      const nextIdx = (curIdx + 1) % SKY_MODES.length;
      setSkyMode(SKY_MODES[nextIdx].id);
    });
  }

  document.querySelectorAll('.skymode-card').forEach((card) => {
    card.addEventListener('click', () => {
      const mode = card.getAttribute('data-mode');
      if (mode) setSkyMode(mode);
    });
  });

  // Both "Ignore Ambient Light" switches (location modal + layers modal) share one handler
  ['ignore-ambient-toggle', 'layer-toggle-ignore-ambient'].forEach((id) => {
    const toggle = document.getElementById(id);
    if (toggle) {
      toggle.addEventListener('change', (e) => {
        setSkyMode(e.target.checked ? 'ignore_ambient' : 'desert');
      });
    }
  });

  // Support mode URL parameter override (e.g. ?mode=ignore_ambient or ?mode=city)
  if (urlParams.has('mode')) {
    setSkyMode(urlParams.get('mode'));
  }

  // Camera Light Meter Button in Location Modal
  const camMeterBtn = document.getElementById('cam-meter-btn');
  const camMeterStatus = document.getElementById('cam-meter-status');
  const camMeterBadge = document.getElementById('cam-meter-badge');

  if (camMeterBtn) {
    camMeterBtn.addEventListener('click', async () => {
      const isZh = state.language === 'zh';
      if (camMeterStatus) camMeterStatus.textContent = isZh ? '正在开启摄像头测光中...' : 'Sampling ambient light from camera...';
      if (camMeterBadge) camMeterBadge.textContent = '...';

      try {
        const est = await Sensors.sampleCameraLightOnce(arVideo);
        if (est) {
          // Apply mode first, then override with the exact measured limiting magnitude
          setSkyMode(est.suggestedMode);
          renderer.limitingMagnitude = est.suggestedLimitingMag;
          localStorage.setItem('starfinder_limiting_mag', est.suggestedLimitingMag.toString());
          updateSkyModeUI();
          if (camMeterStatus) {
            camMeterStatus.textContent = isZh
              ? `实测光度: ${est.luminance} ➔ 已自动切换至: ${est.descZh}`
              : `Measured: ${est.luminance} ➔ Switched to: ${est.descEn}`;
          }
          if (camMeterBadge) {
            camMeterBadge.textContent = `≤ ${est.suggestedLimitingMag}m`;
          }
        } else {
          if (camMeterStatus) camMeterStatus.textContent = isZh ? '未能获取有效视频帧' : 'No valid camera frame';
        }
      } catch (err) {
        console.warn('Camera meter error:', err);
        if (camMeterStatus) {
          camMeterStatus.textContent = isZh
            ? '测光失败 (未授予摄像头权限)'
            : 'Metering failed (camera permission denied)';
        }
      }
    });
  }

  // Periodic continuous camera metering when in AR mode & auto_cam (paused when tab is hidden)
  setInterval(() => {
    if (!document.hidden && currentSkyMode === 'auto_cam' && state.arActive && arVideo && arVideo.readyState >= 2) {
      const est = Sensors.estimateCameraLight(arVideo);
      if (est) {
        renderer.limitingMagnitude = est.suggestedLimitingMag;
        const isZh = state.language === 'zh';
        const skymodeLabel = document.getElementById('skymode-label');
        if (skymodeLabel) {
          skymodeLabel.textContent = isZh
            ? `📷 ≤${est.suggestedLimitingMag}等 (${est.luminance})`
            : `📷 ≤${est.suggestedLimitingMag}m (${est.luminance})`;
        }
        if (camMeterStatus) {
          camMeterStatus.textContent = isZh ? est.descZh : est.descEn;
        }
        if (camMeterBadge) {
          camMeterBadge.textContent = `≤ ${est.suggestedLimitingMag}m`;
        }
      }
    }
  }, 1500);

  // Apply initial limiting magnitude
  setSkyMode(currentSkyMode);

  // ==========================================================================
  // Location Settings & GPS Geolocation
  // ==========================================================================
  locationBtn.addEventListener('click', () => {
    syncPlanetVantageUI();
    locationModal.classList.add('open');
  });

  closeLocationModalBtn.addEventListener('click', () => {
    locationModal.classList.remove('open');
  });

  locationModal.addEventListener('click', (e) => {
    if (e.target === locationModal) locationModal.classList.remove('open');
  });

  // Render / refresh City Presets (with proper N/S hemisphere and active language)
  function renderCityPresets() {
    if (!cityPresetsGrid) return;
    cityPresetsGrid.innerHTML = '';
    const isZh = state.language === 'zh';
    CITY_PRESETS.forEach((city) => {
      const btn = document.createElement('button');
      btn.className = 'city-preset-btn';
      const hemi = city.lat >= 0 ? 'N' : 'S';
      const latLabel = `${Math.abs(city.lat).toFixed(1)}°${hemi}`;
      btn.textContent = `${isZh ? city.nameCn : city.nameEn} (${latLabel})`;

      btn.addEventListener('click', () => {
        state.observerLat = city.lat;
        state.observerLon = city.lon;
        localStorage.setItem('starfinder_saved_loc', JSON.stringify({
          lat: city.lat,
          lon: city.lon,
          nameEn: city.nameEn,
          nameCn: city.nameCn
        }));
        updateObserverLocationLabel();

        // Auto-adapt light pollution mode unless the user explicitly enabled Ignore Ambient Light
        if (!renderer.ignoreAmbientLight) {
          if (['Beijing', 'Shanghai', 'Hong Kong', 'Tokyo', 'New York', 'London'].includes(city.nameEn)) {
            setSkyMode('city');
          } else {
            setSkyMode('suburb');
          }
        }

        updateAllStarHorizontalCoordinates();
        locationModal.classList.remove('open');
      });

      cityPresetsGrid.appendChild(btn);
    });
  }
  renderCityPresets();

  gpsLocateBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    gpsLocateBtn.textContent = state.language === 'zh' ? '正在定位中...' : 'Locating...';
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        state.observerLat = pos.coords.latitude;
        state.observerLon = pos.coords.longitude;
        const gpsLabel = `GPS (${state.observerLat.toFixed(2)}°, ${state.observerLon.toFixed(2)}°)`;
        localStorage.setItem('starfinder_saved_loc', JSON.stringify({
          lat: state.observerLat,
          lon: state.observerLon,
          nameEn: gpsLabel,
          nameCn: gpsLabel
        }));
        updateObserverLocationLabel();
        gpsLocateBtn.textContent = state.language === 'zh' ? 'GPS 定位成功' : 'GPS Located';
        updateAllStarHorizontalCoordinates();
        setTimeout(() => locationModal.classList.remove('open'), 600);
      },
      (err) => {
        gpsLocateBtn.textContent = state.language === 'zh' ? '定位失败' : 'Failed';
        alert(`Geolocation error: ${err.message}`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  });

  // ==========================================================================
  // PWA Install Flow
  // ==========================================================================
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    state.deferredInstallPrompt = e;
    installAppBtn.style.display = 'inline-flex';
  });

  installAppBtn.addEventListener('click', async () => {
    if (state.deferredInstallPrompt) {
      state.deferredInstallPrompt.prompt();
      const choice = await state.deferredInstallPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        installAppBtn.style.display = 'none';
      }
      state.deferredInstallPrompt = null;
    } else {
      // Check for iOS / iPadOS Safari
      const isIos = (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) && !window.MSStream;
      if (isIos) {
        iosInstallModal.classList.add('open');
      } else {
        alert(state.language === 'zh'
          ? '点击浏览器菜单（⋮ 或分享）选择“安装应用”或“添加到主屏幕”。'
          : 'Open your browser menu (⋮ or Share) and select "Install app" or "Add to Home Screen".');
      }
    }
  });

  closeIosModalBtn.addEventListener('click', () => {
    iosInstallModal.classList.remove('open');
  });
  if (iosInstallModal) {
    iosInstallModal.addEventListener('click', (e) => {
      if (e.target === iosInstallModal) iosInstallModal.classList.remove('open');
    });
  }

  // ==========================================================================
  // Sky View Layers & Decluttering Modal Controller
  // ==========================================================================
  const layersModal = document.getElementById('layers-modal');
  const layersToggleBtn = document.getElementById('layers-toggle-btn');
  const closeLayersBtn = document.getElementById('close-layers-btn');

  const layerSwitchKeys = [
    { id: 'layer-toggle-stars', key: 'stars' },
    { id: 'layer-toggle-constellations', key: 'constellations' },
    { id: 'layer-toggle-solar', key: 'solar_system' },
    { id: 'layer-toggle-spacecraft', key: 'spacecraft' },
    { id: 'layer-toggle-spacecraft-leo', key: 'spacecraft_leo' },
    { id: 'layer-toggle-spacecraft-deep', key: 'spacecraft_deep' },
    { id: 'layer-toggle-milkyway', key: 'milky_way' },
    { id: 'layer-toggle-grid', key: 'horizon_grid' },
    { id: 'layer-toggle-labels', key: 'star_labels' }
  ];

  function syncLayerSwitchesUI() {
    layerSwitchKeys.forEach(({ id, key }) => {
      const el = document.getElementById(id);
      if (el) {
        el.checked = !!renderer.layers[key];
      }
    });
  }

  if (layersToggleBtn) {
    layersToggleBtn.addEventListener('click', () => {
      syncLayerSwitchesUI();
      layersModal.classList.add('open');
    });
  }

  if (closeLayersBtn) {
    closeLayersBtn.addEventListener('click', () => {
      layersModal.classList.remove('open');
    });
  }

  if (layersModal) {
    layersModal.addEventListener('click', (e) => {
      if (e.target === layersModal) layersModal.classList.remove('open');
    });
  }

  // Hook change listeners on each switch
  layerSwitchKeys.forEach(({ id, key }) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', (e) => {
        renderer.setLayer(key, e.target.checked);
        if (key === 'spacecraft') {
          // If master spacecraft toggle turned on/off, sync sub toggles
          const leoEl = document.getElementById('layer-toggle-spacecraft-leo');
          const deepEl = document.getElementById('layer-toggle-spacecraft-deep');
          if (e.target.checked) {
            renderer.setLayer('spacecraft_leo', true);
            renderer.setLayer('spacecraft_deep', true);
            if (leoEl) leoEl.checked = true;
            if (deepEl) deepEl.checked = true;
          }
        }
      });
    }
  });

  // URL parameter override for isolating layers (e.g. ?only_milky_way=1 or ?only=milky_way)
  if (urlParams.has('only_milky_way') || urlParams.get('only') === 'milky_way') {
    layerSwitchKeys.forEach(({ key }) => {
      renderer.setLayer(key, key === 'milky_way');
    });
    syncLayerSwitchesUI();
  }

  // Layer Preset Pills: [stars, constellations, solar_system, spacecraft(+leo/deep), milky_way, horizon_grid, star_labels]
  const LAYER_PRESETS = {
    all:        [1, 1, 1, 1, 1, 1, 1],
    stargazing: [1, 1, 1, 0, 1, 1, 1],
    spacecraft: [0, 0, 1, 1, 0, 1, 1],
    minimal:    [1, 0, 0, 0, 1, 0, 0]
  };
  document.querySelectorAll('.layer-preset-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.layer-preset-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const p = LAYER_PRESETS[pill.getAttribute('data-preset')];
      if (!p) return;
      const [stars, constellations, solar_system, spacecraft, milky_way, horizon_grid, star_labels] = p.map(Boolean);
      renderer.setAllLayers({
        stars, constellations, solar_system,
        spacecraft, spacecraft_leo: spacecraft, spacecraft_deep: spacecraft,
        milky_way, horizon_grid, star_labels
      });
      syncLayerSwitchesUI();
    });
  });

  // ==========================================================================
  // Upcoming Celestial Events Modal Controller
  // ==========================================================================
  // (eventsModal is looked up with the other DOM refs at the top of the file)
  const eventsToggleBtn = document.getElementById('events-toggle-btn');
  const closeEventsBtn = document.getElementById('close-events-btn');
  const eventsListContainer = document.getElementById('events-list-container');
  let currentEventCategory = 'all';

  function renderEventsList() {
    if (!eventsListContainer || !StarsData.CELESTIAL_EVENTS) return;
    eventsListContainer.innerHTML = '';
    const isZh = state.language === 'zh';

    const filtered = StarsData.CELESTIAL_EVENTS.filter((evt) => {
      if (currentEventCategory === 'all') return true;
      if (currentEventCategory === 'soon') {
        return evt.relativeEn.includes('days') || evt.relativeEn.includes('weeks') || evt.relativeEn.includes('month');
      }
      if (currentEventCategory === 'rare') {
        return evt.rarity >= 5;
      }
      return evt.category === currentEventCategory;
    });

    if (filtered.length === 0) {
      eventsListContainer.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px;">
          ${isZh ? '此分类下暂无临近天象' : 'No upcoming events in this category'}
        </div>
      `;
      return;
    }

    filtered.forEach((evt) => {
      const card = document.createElement('div');
      card.className = 'event-card';

      const rarityStars = '★'.repeat(evt.rarity) + '☆'.repeat(5 - evt.rarity);
      const title = isZh ? evt.titleZh : evt.titleEn;
      const dateDisplay = isZh ? evt.dateDisplayZh : evt.dateDisplayEn;
      const relative = isZh ? evt.relativeZh : evt.relativeEn;
      const summary = isZh ? evt.summaryZh : evt.summaryEn;
      const targetName = isZh ? evt.targetNameZh : evt.targetNameEn;
      const viewingTip = isZh ? evt.viewingTipZh : evt.viewingTipEn;

      card.innerHTML = `
        <div class="event-card-header">
          <div class="event-title-group">
            <span class="event-title">${title}</span>
            <div class="event-meta-row">
              <span class="event-date-badge">${dateDisplay}</span>
              <span class="event-rel-time">⏱️ ${relative}</span>
              <span class="event-rarity" title="Rarity: ${evt.rarity}/5">${rarityStars}</span>
            </div>
          </div>
          <button class="event-jump-btn" data-event-id="${evt.id}">
            🎯 ${isZh ? '对准定位' : 'Aim & Pan'}
          </button>
        </div>
        <p class="event-desc">${summary}</p>
        <div class="event-target-row">
          <div class="event-target-badge">
            <span style="font-weight: 700; color: var(--accent-cyan);">📍 ${isZh ? '天象天区:' : 'Target:'}</span> ${targetName}
          </div>
        </div>
        <div class="event-tip-box">
          <span style="font-weight: 700; color: #fbbf24;">💡 ${isZh ? '观测建议:' : 'Viewing Tip:'}</span> ${viewingTip}
        </div>
      `;

      // Jump Button Handler
      const jumpBtn = card.querySelector('.event-jump-btn');
      if (jumpBtn) {
        jumpBtn.addEventListener('click', () => {
          jumpToCelestialEvent(evt);
        });
      }

      eventsListContainer.appendChild(card);
    });
  }

  function jumpToCelestialEvent(evt) {
    // 1. Ensure required layer is visible
    if (evt.targetType === 'solar' || evt.targetType === 'planet') {
      renderer.setLayer('solar_system', true);
    } else if (evt.targetType === 'star') {
      renderer.setLayer('stars', true);
    }
    syncLayerSwitchesUI();

    // 2. Find target body or calculate topocentric position
    let targetStar = state.allCelestialBodies.find(b => b.id === evt.targetId);

    if (!targetStar) {
      // Calculate topocentric Azimuth & Altitude from event RA/Dec on the active observer planet
      const h = Astronomy.equatorialToHorizontal(
        evt.ra, evt.dec, state.observerLat, state.observerLon, state.currentDate, state.observerPlanet
      );
      targetStar = {
        id: evt.targetId,
        name: evt.targetNameEn,
        nameCn: evt.targetNameZh,
        bayer: evt.titleEn,
        cachedAzimuth: h.azimuth,
        cachedAltitude: Astronomy.applyAtmosphericRefraction ? Astronomy.applyAtmosphericRefraction(h.altitude) : h.altitude,
        mag: 5.6
      };
    }

    // 3. Aim camera and close modal
    setAimingTarget(targetStar);
    smoothPanTo(targetStar.cachedAzimuth, targetStar.cachedAltitude);
    eventsModal.classList.remove('open');
  }

  if (eventsToggleBtn) {
    eventsToggleBtn.addEventListener('click', () => {
      renderEventsList();
      eventsModal.classList.add('open');
    });
  }

  if (closeEventsBtn) {
    closeEventsBtn.addEventListener('click', () => {
      eventsModal.classList.remove('open');
    });
  }

  if (eventsModal) {
    eventsModal.addEventListener('click', (e) => {
      if (e.target === eventsModal) eventsModal.classList.remove('open');
    });
  }

  // Event category pills
  document.querySelectorAll('.event-category-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.event-category-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentEventCategory = pill.getAttribute('data-cat') || 'all';
      renderEventsList();
    });
  });

  // Register Service Worker with relative path
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js', { scope: './' })
        .then((reg) => {
          reg.update();
          console.log('Star Finder Service Worker registered:', reg.scope);
        })
        .catch((err) => console.warn('Service Worker registration failed:', err));
    });

    // Automatically reload when new service worker activates
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }

  // DOM writes are relatively expensive (style/layout invalidation); at 60fps only touch text that changed
  function setText(el, text) {
    if (el && el.textContent !== text) el.textContent = text;
  }

  function describeLockedDistance(star, isZh) {
    const km = star.rangeKm || 0;
    if (star.isSpacecraft || star.isISS) {
      const alt = typeof star.cachedAltitude === 'number' ? star.cachedAltitude.toFixed(1) : '—';
      if (star.id === 'iss') {
        return isZh
          ? `仰角 ${alt}° • 距离 ${Math.round(km)} km • 时速 2.76万km`
          : `Alt ${alt}° • Range ${Math.round(km)} km • 27,600 km/h`;
      }
      if (star.distAU) {
        // 1 亿 = 1e8; English uses billions (1e9)
        return isZh
          ? `星际空间 • 距离 ${star.distAU.toFixed(1)} AU (${(km / 1e8).toFixed(0)}亿 km)`
          : `Interstellar • ${star.distAU.toFixed(1)} AU (${(km / 1e9).toFixed(1)}B km)`;
      }
      if (km >= 1000000) {
        // 1 万 = 1e4
        return isZh
          ? `日地L2晕轮轨道 • 距离 ${Math.round(km / 1e4)}万 km`
          : `Sun-Earth L2 • ${(km / 1e6).toFixed(2)}M km`;
      }
      return isZh
        ? `LEO轨道 • 距离 ${Math.round(km)} km • 时速 ${star.velocityKmh ? star.velocityKmh.toLocaleString() : '2.7万'} km/h`
        : `LEO • Range ${Math.round(km)} km • ${star.velocityKmh ? star.velocityKmh.toLocaleString() : '27,000'} km/h`;
    }
    if (star.isSolarSystem) {
      return star.id === 'moon'
        ? '384,400 km'
        : (star.id === 'sun'
          ? '1.00 AU'
          : (typeof star.distAU === 'number' ? `${star.distAU.toFixed(2)} AU` : `${(star.distanceLy * 63241).toFixed(2)} AU`));
    }
    return star.distanceLy !== undefined ? `${star.distanceLy} ly` : '';
  }

  const DIRS_EN = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const DIRS_ZH = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];

  // ==========================================================================
  // Main 60fps Animation Loop
  // ==========================================================================
  function animate() {
    // 1. Update smoothed gyro orientation if active
    if (state.gyroActive) {
      Sensors.updateSmoothedOrientation();
    }

    // 2. Render Sky Map
    const result = renderer.render(
      state.currentDate, state.observerLat, state.observerLon
    );

    const isZh = state.language === 'zh';

    // 3. Update Reticle Lock Badge
    if (result.lockedStar) {
      const star = result.lockedStar;
      setText(badgeStarName, isZh ? (star.nameCn || star.name) : star.name);
      const distStr = describeLockedDistance(star, isZh);
      setText(badgeStarMeta, (star.isSpacecraft || star.isISS)
        ? distStr
        : [star.bayer, `Mag ${formatMag(star.mag)}`, distStr].filter(Boolean).join(' • '));
      lockBadge.classList.add('visible');
    } else {
      lockBadge.classList.remove('visible');
    }

    // 4. Update Aiming Guide HUD
    if (state.aimingTargetStar) {
      updateAimingHUD();
    }

    // 5. Update Telemetry
    const cardIdx = Math.round(((renderer.cameraAzimuth % 360) + 360) % 360 / 45) % 8;
    const cardDir = isZh ? DIRS_ZH[cardIdx] : DIRS_EN[cardIdx];

    setText(telemetryAz, `${Math.round(renderer.cameraAzimuth)}° (${cardDir})`);
    setText(telemetryAlt, `${Math.round(renderer.cameraAltitude)}°`);
    setText(telemetryFov, `${Math.round(renderer.fov)}°`);

    // 6. Update currently visible dropdown in real-time if open and search input is empty
    if (autocompleteDropdown && autocompleteDropdown.classList.contains('open') && !searchInput.value.trim()) {
      const now = performance.now();
      if (now - lastVisibleDropdownUpdate > 300) {
        lastVisibleDropdownUpdate = now;
        showCurrentlyVisibleDropdown();
      }
    }

    requestAnimationFrame(animate);
  }
  let lastVisibleDropdownUpdate = 0;

  // Ensure location label shows current location immediately
  const initLocLabel = document.getElementById('location-label');
  if (initLocLabel) {
    initLocLabel.textContent = state.locationName;
  }

  // Initial translation setup & kick off animation
  applyTranslations();
  requestAnimationFrame(animate);

})();
