/**
 * Astronomy Math Engine for Star Finder (星空识星)
 * Handles Julian Date, GMST, LST, Equatorial-to-Horizontal conversion,
 * 3D spherical perspective projection, and celestial navigation guidance.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Astronomy = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const DEG2RAD = Math.PI / 180.0;
  const RAD2DEG = 180.0 / Math.PI;

  /**
   * Convert JavaScript Date to Julian Date (JD)
   */
  function dateToJulianDate(date) {
    const time = date.getTime();
    return time / 86400000.0 + 2440587.5;
  }

  /**
   * Greenwich Mean Sidereal Time (GMST) in degrees [0, 360)
   */
  function getGMST(jd) {
    const d = jd - 2451545.0; // Days from J2000.0
    const t = d / 36525.0;
    let gmst = 280.46061837 + 360.98564736629 * d + 0.000387933 * t * t - (t * t * t) / 38710000.0;
    gmst = ((gmst % 360.0) + 360.0) % 360.0;
    return gmst;
  }

  /**
   * Local Sidereal Time (LST) in degrees [0, 360)
   */
  function getLST(date, longitudeDeg) {
    const jd = dateToJulianDate(date);
    const gmst = getGMST(jd);
    return (((gmst + longitudeDeg) % 360.0) + 360.0) % 360.0;
  }

  /**
   * Standard IAU J2000 Rotational Orientation Constants (Archinal et al., IAU WGCCRE)
   * poleRaDeg / poleDecDeg: North rotational pole in J2000 Equatorial coordinates
   * w0Deg: Prime Meridian angle W at J2000.0 (degrees)
   * wRateDegPerDay: Sidereal rotation rate dW/dt (degrees/day; negative for retrograde worlds)
   */
  const IAU_ORIENTATIONS = {
    mercury: { poleRaDeg: 281.0097, poleDecDeg: 61.4143, w0Deg: 329.5469, wRateDegPerDay: 6.1385025,    solarDayHours: 4222.6 },
    venus:   { poleRaDeg: 272.76,   poleDecDeg: 67.16,   w0Deg: 160.20,   wRateDegPerDay: -1.4813688,   solarDayHours: 2802.0 },
    earth:   { poleRaDeg: 0.0,      poleDecDeg: 90.0,    w0Deg: 190.147,  wRateDegPerDay: 360.9856235,  solarDayHours: 24.0 },
    moon:    { poleRaDeg: 269.9949, poleDecDeg: 66.5392, w0Deg: 38.3213,  wRateDegPerDay: 13.17635815,  solarDayHours: 708.734 },
    mars:    { poleRaDeg: 317.6814, poleDecDeg: 52.8865, w0Deg: 176.630,  wRateDegPerDay: 350.89198226, solarDayHours: 24.65979 },
    jupiter: { poleRaDeg: 268.0566, poleDecDeg: 64.4953, w0Deg: 284.95,   wRateDegPerDay: 870.5360000,  solarDayHours: 9.925 },
    saturn:  { poleRaDeg: 40.589,   poleDecDeg: 83.537,  w0Deg: 38.90,    wRateDegPerDay: 810.7939024,  solarDayHours: 10.656 },
    uranus:  { poleRaDeg: 257.311,  poleDecDeg: -15.175, w0Deg: 203.81,   wRateDegPerDay: -501.1600928, solarDayHours: 17.24 },
    neptune: { poleRaDeg: 299.36,   poleDecDeg: 43.46,   w0Deg: 253.18,   wRateDegPerDay: 536.3128492,  solarDayHours: 16.11 }
  };

  /**
   * Compute Earth's Moon geocentric equatorial position and phase metadata
   */
  function computeEarthMoon(d, ctx) {
    const { L_sun, lambda_sun, cosEps, sinEps } = ctx;
    const L_moon = (218.316 + 13.176396 * d) % 360.0;
    const M_moon = (((134.963 + 13.064993 * d) % 360.0) + 360.0) % 360.0 * DEG2RAD;
    const F_moon = (((93.272 + 13.229350 * d) % 360.0) + 360.0) % 360.0 * DEG2RAD;
    const D_mean = (((L_moon - L_sun + 360.0) % 360.0) + 360.0) % 360.0 * DEG2RAD;

    const lambda_moon = ((L_moon + 6.289 * Math.sin(M_moon) - 1.274 * Math.sin(M_moon - 2 * D_mean) + 0.658 * Math.sin(2 * D_mean) + 360.0) % 360.0) * DEG2RAD;
    const beta_moon = (5.128 * Math.sin(F_moon)) * DEG2RAD;

    const cosBm = Math.cos(beta_moon);
    const sinBm = Math.sin(beta_moon);
    const cosLm = Math.cos(lambda_moon);
    const sinLm = Math.sin(lambda_moon);

    const moonX = cosBm * cosLm;
    const moonY = cosEps * cosBm * sinLm - sinEps * sinBm;
    const moonZ = sinEps * cosBm * sinLm + cosEps * sinBm;

    const moonRA = ((Math.atan2(moonY, moonX) * RAD2DEG + 360.0) % 360.0) / 15.0;
    const moonDec = Math.asin(Math.max(-1.0, Math.min(1.0, moonZ))) * RAD2DEG;

    // True ecliptic & spherical elongation (Meeus Ch. 48): eliminates ~14h equation-of-center phase drift
    const trueElong = (((lambda_moon - lambda_sun) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const cosPsi = cosBm * Math.cos(trueElong);
    const moonPhaseFrac = Math.max(0.0, Math.min(1.0, (1.0 - cosPsi) * 0.5));
    const moonMag = Math.round((-12.74 + (1.0 - moonPhaseFrac) * 6.0) * 10) / 10;
    const moonPhaseCycle = trueElong / (2 * Math.PI);

    let phaseNameEn = 'New Moon';
    let phaseNameCn = '新月 (朔)';
    if (moonPhaseCycle < 0.03 || moonPhaseCycle > 0.97) {
      phaseNameEn = 'New Moon'; phaseNameCn = '新月 (朔)';
    } else if (moonPhaseCycle < 0.22) {
      phaseNameEn = 'Waxing Crescent'; phaseNameCn = '峨眉月';
    } else if (moonPhaseCycle < 0.28) {
      phaseNameEn = 'First Quarter'; phaseNameCn = '上弦月';
    } else if (moonPhaseCycle < 0.47) {
      phaseNameEn = 'Waxing Gibbous'; phaseNameCn = '盈凸月';
    } else if (moonPhaseCycle < 0.53) {
      phaseNameEn = 'Full Moon'; phaseNameCn = '满月 (望)';
    } else if (moonPhaseCycle < 0.72) {
      phaseNameEn = 'Waning Gibbous'; phaseNameCn = '亏凸月';
    } else if (moonPhaseCycle < 0.78) {
      phaseNameEn = 'Last Quarter'; phaseNameCn = '下弦月';
    } else {
      phaseNameEn = 'Waning Crescent'; phaseNameCn = '残月';
    }

    return {
      id: 'moon',
      ra: moonRA,
      dec: moonDec,
      mag: moonMag,
      color: '#f8fafc',
      phase: moonPhaseFrac,
      moonPhase: {
        phase: moonPhaseCycle,
        fraction: Math.round(moonPhaseFrac * 100) / 100,
        nameEn: phaseNameEn,
        nameCn: phaseNameCn
      },
      distKm: 384400,
      isMoon: true,
      hostPlanet: 'earth',
      renderStyle: 'lunar_phase'
    };
  }

  /**
   * Extensible Observer Planet Registry.
   * Adding a new planet vantage point only requires calling registerObserverPlanet({...})
   * with its IAU orientation, optional moons, horizon aesthetics, and UI metadata.
   */
  const OBSERVER_PLANETS = {};
  const OBSERVER_PLANET_ORDER = [];

  function registerObserverPlanet(config) {
    if (!config || !config.id) {
      throw new Error('Observer planet config must specify a non-empty id');
    }
    const id = String(config.id).toLowerCase();
    const orientation = config.orientation || IAU_ORIENTATIONS[id] || null;
    const normalized = {
      id,
      ephemerisId: config.ephemerisId ? String(config.ephemerisId).toLowerCase() : id,
      nameEn: config.nameEn || (id.charAt(0).toUpperCase() + id.slice(1)),
      nameCn: config.nameCn || config.nameEn || id,
      icon: config.icon || '🪐',
      accentColor: config.accentColor || '#38bdf8',
      badgeBg: config.badgeBg || 'rgba(56, 189, 248, 0.15)',
      hintEn: config.hintEn || `Viewing the sky from ${config.nameEn || id}.`,
      hintCn: config.hintCn || `当前在${config.nameCn || config.nameEn || id}观测星空。`,
      usesCityPresets: Boolean(config.usesCityPresets),
      useEarthLST: Boolean(config.useEarthLST),
      orientation,
      solarDayHours: typeof config.solarDayHours === 'number'
        ? config.solarDayHours
        : ((orientation && typeof orientation.solarDayHours === 'number') ? orientation.solarDayHours : 24.0),
      getHeliocentricPosition: typeof config.getHeliocentricPosition === 'function' ? config.getHeliocentricPosition : null,
      moons: Array.isArray(config.moons) ? config.moons.map(m => ({ ...m })) : [],
      localSpacecraftHost: config.localSpacecraftHost !== undefined ? config.localSpacecraftHost : id,
      refractionScale: typeof config.refractionScale === 'number' ? config.refractionScale : (id === 'earth' ? 1.0 : 0.0),
      horizonHaze: config.horizonHaze || {
        topLookingDown: 'rgba(3, 6, 12, 0.65)',
        topNormal: 'rgba(4, 8, 16, 0.45)',
        bottom: 'rgba(2, 4, 8, 0.85)'
      },
      enabled: config.enabled !== false
    };
    if (!OBSERVER_PLANETS[id]) {
      OBSERVER_PLANET_ORDER.push(id);
    }
    OBSERVER_PLANETS[id] = normalized;
    return normalized;
  }

  function unregisterObserverPlanet(planetId) {
    const id = String(planetId || '').toLowerCase();
    if (!id || id === 'earth' || !OBSERVER_PLANETS[id]) return false;
    delete OBSERVER_PLANETS[id];
    const idx = OBSERVER_PLANET_ORDER.indexOf(id);
    if (idx !== -1) OBSERVER_PLANET_ORDER.splice(idx, 1);
    return true;
  }

  function hasObserverPlanet(planetId) {
    if (!planetId) return false;
    const cfg = OBSERVER_PLANETS[String(planetId).toLowerCase()];
    return Boolean(cfg && cfg.enabled);
  }

  function getObserverPlanetConfig(planetId) {
    const key = planetId ? String(planetId).toLowerCase() : 'earth';
    return OBSERVER_PLANETS[key] || OBSERVER_PLANETS.earth;
  }

  function getAvailableObserverPlanets(includeDisabled = false) {
    return OBSERVER_PLANET_ORDER
      .map(id => OBSERVER_PLANETS[id])
      .filter(cfg => cfg && (includeDisabled || cfg.enabled));
  }

  // Register default observer vantage points: Earth and Mars
  registerObserverPlanet({
    id: 'earth',
    nameEn: 'Earth',
    nameCn: '地球',
    icon: '🌍',
    accentColor: '#38bdf8',
    badgeBg: 'rgba(56, 189, 248, 0.15)',
    hintEn: 'Viewing from Earth: Moon, Sun & 5 planets visible.',
    hintCn: '当前在地球观测：月球、太阳及五大肉眼行星可见。',
    usesCityPresets: true,
    useEarthLST: true,
    orientation: IAU_ORIENTATIONS.earth,
    refractionScale: 1.0,
    localSpacecraftHost: 'earth',
    horizonHaze: {
      topLookingDown: 'rgba(3, 6, 12, 0.65)',
      topNormal: 'rgba(4, 8, 16, 0.45)',
      bottom: 'rgba(2, 4, 8, 0.85)'
    },
    moons: [
      { id: 'moon', distKm: 384400, renderStyle: 'lunar_phase', compute: computeEarthMoon }
    ]
  });

  registerObserverPlanet({
    id: 'mars',
    nameEn: 'Mars',
    nameCn: '火星',
    icon: '🔴',
    accentColor: '#f87171',
    badgeBg: 'rgba(248, 113, 113, 0.16)',
    hintEn: 'Viewing from Mars: Earth shines as a blue star; Phobos & Deimos orbit overhead.',
    hintCn: '当前在火星观测：地球蔚蓝闪耀，火卫一与火卫二升落长空。',
    usesCityPresets: false,
    useEarthLST: false,
    orientation: IAU_ORIENTATIONS.mars,
    refractionScale: 0.01,
    localSpacecraftHost: 'mars',
    horizonHaze: {
      topLookingDown: 'rgba(56, 20, 10, 0.70)',
      topNormal: 'rgba(72, 26, 12, 0.50)',
      bottom: 'rgba(38, 12, 6, 0.90)'
    },
    moons: [
      {
        id: 'phobos',
        distKm: 9376,
        periodDays: 0.31891023,
        theta0Deg: 189.6,
        mag: -1.5,
        color: '#cbd5e1',
        renderStyle: 'cratered_moon',
        isMartianMoon: true
      },
      {
        id: 'deimos',
        distKm: 23463,
        periodDays: 1.2624407,
        theta0Deg: 82.5,
        mag: 1.8,
        color: '#e2e8f0',
        renderStyle: 'pinpoint_moon',
        isMartianMoon: true
      }
    ]
  });

  /**
   * Build an orthonormal J2000 Equatorial frame { X0, Y0, Z_P } aligned with
   * a planet's IAU North rotational pole (poleRaDeg, poleDecDeg).
   */
  function getPlanetEquatorialFrame(orientation) {
    const alpha0 = orientation.poleRaDeg * DEG2RAD;
    const delta0 = orientation.poleDecDeg * DEG2RAD;
    const Z_P = [
      Math.cos(delta0) * Math.cos(alpha0),
      Math.cos(delta0) * Math.sin(alpha0),
      Math.sin(delta0)
    ];
    const X0 = [-Math.sin(alpha0), Math.cos(alpha0), 0];
    const Y0 = [
      Z_P[1] * X0[2] - Z_P[2] * X0[1],
      Z_P[2] * X0[0] - Z_P[0] * X0[2],
      Z_P[0] * X0[1] - Z_P[1] * X0[0]
    ];
    return { X0, Y0, Z_P };
  }

  // Planetary time-of-day synchronization mode:
  // 'proportional' (default): syncs the planet's solar day phase proportionally to the observer's Earth local solar time
  // 'realtime': uses true real-time IAU Prime Meridian W(d) + lonDeg at the current UTC instant
  let planetTimeSyncMode = 'proportional';
  let _cachedHorizBasisKey = '';
  let _cachedHorizBasis = null;

  function setPlanetTimeSyncMode(mode) {
    planetTimeSyncMode = (mode === 'realtime') ? 'realtime' : 'proportional';
    _cachedHorizBasisKey = '';
    _cachedHorizBasis = null;
    return planetTimeSyncMode;
  }

  function getPlanetTimeSyncMode() {
    return planetTimeSyncMode;
  }

  /**
   * Compute Earth's local apparent solar hour angle (degrees in [-180, 180), 0 = solar noon)
   * and solar day fraction [0, 1) (0 = midnight, 0.25 = ~6 AM, 0.5 = solar noon, 0.75 = ~6 PM).
   */
  function computeEarthSolarHourAngle(date, lonDeg) {
    const jd = dateToJulianDate(date);
    const d = jd - 2451545.0;
    const eps = (23.439 - 0.0000004 * d) * DEG2RAD;
    const L_sun = (280.460 + 0.9856474 * d) % 360.0;
    const g_sun = (((357.528 + 0.9856003 * d) % 360.0) + 360.0) % 360.0 * DEG2RAD;
    const lambda_sun = ((L_sun + 1.915 * Math.sin(g_sun) + 0.020 * Math.sin(2 * g_sun) + 360.0) % 360.0) * DEG2RAD;

    const sunX = Math.cos(lambda_sun);
    const sunY = Math.cos(eps) * Math.sin(lambda_sun);
    const sunRaDeg = (Math.atan2(sunY, sunX) * RAD2DEG + 360.0) % 360.0;
    const lstDeg = getLST(date, lonDeg);

    let haDeg = (((lstDeg - sunRaDeg) % 360.0) + 360.0) % 360.0;
    if (haDeg >= 180.0) haDeg -= 360.0; // [-180, +180): 0 = noon, -90 = morning, +90 = evening
    const dayFraction = (((haDeg + 180.0) % 360.0) + 360.0) % 360.0 / 360.0;
    return { haDeg, dayFraction, d, eps, L_sun, lambda_sun };
  }

  /**
   * Project the Sun direction seen from a planet onto its IAU equatorial plane (X0, Y0)
   * to find the planetocentric meridian angle where it is currently local solar noon.
   */
  function computePlanetSunMeridianDeg(d, eps, cfg, frame) {
    const cosEps = Math.cos(eps);
    const sinEps = Math.sin(eps);
    const helioMap = computeHeliocentricPositions(d);
    const obsPos = cfg.getHeliocentricPosition
      ? cfg.getHeliocentricPosition(d, helioMap, { cosEps, sinEps })
      : (helioMap[cfg.ephemerisId] || helioMap.earth);
    const sunRelX = -obsPos.xh;
    const sunRelY = -obsPos.yh;
    const sunRelZ = -obsPos.zh;
    const dist = Math.hypot(sunRelX, sunRelY, sunRelZ) || 1.0;

    const sx = sunRelX / dist;
    const sy = (sunRelY * cosEps - sunRelZ * sinEps) / dist;
    const sz = (sunRelY * sinEps + sunRelZ * cosEps) / dist;

    const pX = sx * frame.X0[0] + sy * frame.X0[1] + sz * frame.X0[2];
    const pY = sx * frame.Y0[0] + sy * frame.Y0[1] + sz * frame.Y0[2];
    const projectedLen = Math.hypot(pX, pY);
    const sunMeridianDeg = (Math.atan2(pY, pX) * RAD2DEG + 360.0) % 360.0;
    return { sunMeridianDeg, projectedLen };
  }

  /**
   * Format a planet's solar day duration (in Earth hours) as a human-readable string.
   */
  function formatSolarDayLength(hours) {
    if (hours >= 48.0) {
      return `${(hours / 24.0).toFixed(1)}d`;
    }
    const totalMin = Math.round(hours * 60);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${h}h ${String(m).padStart(2, '0')}m`;
  }

  /**
   * Format a planet's local solar time (in Earth hours elapsed since local midnight).
   */
  function formatPlanetLocalHours(localHours, solarDayHours) {
    const safeHours = ((localHours % solarDayHours) + solarDayHours) % solarDayHours;
    if (solarDayHours >= 48.0) {
      const wholeDays = Math.floor(safeHours / 24.0);
      const remHours = safeHours - wholeDays * 24.0;
      const hh = Math.floor(remHours);
      const mm = Math.floor((remHours - hh) * 60);
      return `Day ${wholeDays + 1} ${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    }
    const totalMin = Math.floor(safeHours * 60);
    const hh = Math.floor(totalMin / 60);
    const mm = totalMin % 60;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  }

  /**
   * Compute the local solar time on any registered observer planet, scaled proportionally
   * to the planet's solar day duration (e.g., 24h 40m on Mars, 9h 56m on Jupiter) in
   * 'proportional' mode, or derived from true IAU rotation in 'realtime' mode.
   */
  function getPlanetLocalSolarTime(date, lonDeg, observerPlanet = 'earth', timeSyncMode) {
    const cfg = getObserverPlanetConfig(observerPlanet);
    const syncMode = timeSyncMode || planetTimeSyncMode;
    const solarDayHours = cfg.solarDayHours || 24.0;
    const earthSolar = computeEarthSolarHourAngle(date, lonDeg);

    let dayFraction = earthSolar.dayFraction;
    let solarHourAngleDeg = earthSolar.haDeg;

    if (!cfg.useEarthLST && cfg.orientation && syncMode === 'realtime') {
      const frame = getPlanetEquatorialFrame(cfg.orientation);
      const { sunMeridianDeg, projectedLen } = computePlanetSunMeridianDeg(earthSolar.d, earthSolar.eps, cfg, frame);
      if (projectedLen >= 1e-6) {
        const W = ((cfg.orientation.w0Deg + cfg.orientation.wRateDegPerDay * earthSolar.d) % 360.0 + 360.0) % 360.0;
        const localMeridianDeg = ((W + lonDeg) % 360.0 + 360.0) % 360.0;
        const rotSign = cfg.orientation.wRateDegPerDay < 0 ? -1 : 1;
        let ha = ((((localMeridianDeg - sunMeridianDeg) * rotSign) % 360.0) + 360.0) % 360.0;
        if (ha >= 180.0) ha -= 360.0;
        solarHourAngleDeg = ha;
        dayFraction = (((ha + 180.0) % 360.0) + 360.0) % 360.0 / 360.0;
      }
    }

    const localHours = dayFraction * solarDayHours;
    return {
      planetId: cfg.id,
      timeSyncMode: cfg.useEarthLST ? 'realtime' : syncMode,
      dayFraction,
      solarDayHours,
      localHours,
      formattedTime: formatPlanetLocalHours(localHours, solarDayHours),
      formattedDayLength: formatSolarDayLength(solarDayHours),
      solarHourAngleDeg
    };
  }

  /**
   * Compute the local Horizontal-to-J2000-Equatorial orthonormal basis { East, North, Zenith }
   * for any registered observer planet (Earth, Mars, or any registered Solar System body).
   * In 'proportional' mode (default), non-Earth planets align their local solar day phase
   * proportionally to the observer's Earth local solar time at (lonDeg, date).
   */
  function getHorizontalBasis(latDeg, lonDeg, date, observerPlanet = 'earth', timeSyncMode) {
    const cfg = getObserverPlanetConfig(observerPlanet);
    const syncMode = timeSyncMode || planetTimeSyncMode;
    const t = date ? date.getTime() : 0;
    const cacheKey = `${t}|${latDeg}|${lonDeg}|${cfg.id}|${syncMode}`;
    if (_cachedHorizBasisKey === cacheKey && _cachedHorizBasis) {
      return _cachedHorizBasis;
    }

    if (cfg.useEarthLST || !cfg.orientation) {
      const lstDeg = getLST(date, lonDeg);
      const lstRad = lstDeg * DEG2RAD;
      const latRad = latDeg * DEG2RAD;
      const sL = Math.sin(lstRad), cL = Math.cos(lstRad);
      const sP = Math.sin(latRad), cP = Math.cos(latRad);
      const basis = {
        East:   [-sL, cL, 0],
        North:  [-sP * cL, -sP * sL, cP],
        Zenith: [cP * cL, cP * sL, sP],
        localMeridianDeg: lstDeg
      };
      _cachedHorizBasisKey = cacheKey;
      _cachedHorizBasis = basis;
      return basis;
    }

    const jd = dateToJulianDate(date);
    const d = jd - 2451545.0;
    const frame = getPlanetEquatorialFrame(cfg.orientation);
    const { X0, Y0, Z_P } = frame;

    const W = ((cfg.orientation.w0Deg + cfg.orientation.wRateDegPerDay * d) % 360.0 + 360.0) % 360.0;
    let localMeridianDeg = ((W + lonDeg) % 360.0 + 360.0) % 360.0;

    if (syncMode === 'proportional') {
      const earthSolar = computeEarthSolarHourAngle(date, lonDeg);
      const { sunMeridianDeg, projectedLen } = computePlanetSunMeridianDeg(earthSolar.d, earthSolar.eps, cfg, frame);
      if (projectedLen >= 1e-6) {
        const rotSign = cfg.orientation.wRateDegPerDay < 0 ? -1 : 1;
        localMeridianDeg = ((sunMeridianDeg + rotSign * earthSolar.haDeg) % 360.0 + 360.0) % 360.0;
      }
    }

    const L_obs = localMeridianDeg * DEG2RAD;
    const phi = latDeg * DEG2RAD;
    const cosL = Math.cos(L_obs), sinL = Math.sin(L_obs);
    const cosPhi = Math.cos(phi), sinPhi = Math.sin(phi);

    const X_lon = [
      X0[0] * cosL + Y0[0] * sinL,
      X0[1] * cosL + Y0[1] * sinL,
      X0[2] * cosL + Y0[2] * sinL
    ];

    const Zenith = [
      X_lon[0] * cosPhi + Z_P[0] * sinPhi,
      X_lon[1] * cosPhi + Z_P[1] * sinPhi,
      X_lon[2] * cosPhi + Z_P[2] * sinPhi
    ];

    const North = [
      Z_P[0] * cosPhi - X_lon[0] * sinPhi,
      Z_P[1] * cosPhi - X_lon[1] * sinPhi,
      Z_P[2] * cosPhi - X_lon[2] * sinPhi
    ];

    const East = [
      North[1] * Zenith[2] - North[2] * Zenith[1],
      North[2] * Zenith[0] - North[0] * Zenith[2],
      North[0] * Zenith[1] - North[1] * Zenith[0]
    ];

    const basis = { East, North, Zenith, primeMeridianDeg: W, localMeridianDeg, timeSyncMode: syncMode };
    _cachedHorizBasisKey = cacheKey;
    _cachedHorizBasis = basis;
    return basis;
  }

  /**
   * General Planetary Horizontal Altitude and Azimuth using the IAU orientation model.
   */
  function getPlanetHorizontal(raHours, decDeg, latDeg, lonDeg, date, observerPlanet = 'mars') {
    const { East, North, Zenith, localMeridianDeg } = getHorizontalBasis(latDeg, lonDeg, date, observerPlanet);

    const ra = raHours * 15.0 * DEG2RAD;
    const dec = decDeg * DEG2RAD;
    const cosDec = Math.cos(dec);
    const u = [cosDec * Math.cos(ra), cosDec * Math.sin(ra), Math.sin(dec)];

    const sinAlt = u[0] * Zenith[0] + u[1] * Zenith[1] + u[2] * Zenith[2];
    const clampedSinAlt = Math.max(-1.0, Math.min(1.0, sinAlt));
    const altDeg = Math.asin(clampedSinAlt) * RAD2DEG;

    const xN = u[0] * North[0] + u[1] * North[1] + u[2] * North[2];
    const yE = u[0] * East[0] + u[1] * East[1] + u[2] * East[2];
    const azDeg = (Math.atan2(yE, xN) * RAD2DEG + 360.0) % 360.0;

    return {
      altitude: altDeg,
      azimuth: azDeg,
      hourAngle: (((localMeridianDeg - raHours * 15.0) % 360.0) + 360.0) % 360.0
    };
  }

  /**
   * Mars Horizontal Altitude and Azimuth (backwards-compatible alias for getPlanetHorizontal)
   */
  function getMarsHorizontal(raHours, decDeg, latDeg, lonDeg, date) {
    return getPlanetHorizontal(raHours, decDeg, latDeg, lonDeg, date, 'mars');
  }

  /**
   * Convert Right Ascension (RA) in hours and Declination (Dec) in degrees
   * to Horizontal Altitude and Azimuth (degrees).
   * Supports any registered observerPlanet (default: 'earth').
   * Azimuth: 0° = North, 90° = East, 180° = South, 270° = West.
   */
  function equatorialToHorizontal(raHours, decDeg, latDeg, lonDeg, date, observerPlanet = 'earth') {
    const cfg = getObserverPlanetConfig(observerPlanet);
    if (!cfg.useEarthLST) {
      return getPlanetHorizontal(raHours, decDeg, latDeg, lonDeg, date, cfg.id);
    }

    const raDeg = raHours * 15.0;
    const lst = getLST(date, lonDeg);
    const haDeg = (((lst - raDeg) % 360.0) + 360.0) % 360.0;

    const haRad = haDeg * DEG2RAD;
    const decRad = decDeg * DEG2RAD;
    const latRad = latDeg * DEG2RAD;

    const sinLat = Math.sin(latRad);
    const cosLat = Math.cos(latRad);
    const sinDec = Math.sin(decRad);
    const cosDec = Math.cos(decRad);
    const cosHa = Math.cos(haRad);
    const sinHa = Math.sin(haRad);

    // Altitude calculation
    const sinAlt = sinLat * sinDec + cosLat * cosDec * cosHa;
    const clampedSinAlt = Math.max(-1.0, Math.min(1.0, sinAlt));
    const altRad = Math.asin(clampedSinAlt);

    // Azimuth calculation without dividing by cos(lat) or cos(alt) (no pole/zenith singularity)
    const sinAz = -cosDec * sinHa;
    const cosAz = sinDec * cosLat - cosDec * sinLat * cosHa;

    const azRad = Math.atan2(sinAz, cosAz);
    const azDeg = (azRad * RAD2DEG + 360.0) % 360.0;
    const altDeg = altRad * RAD2DEG;

    return {
      altitude: altDeg,
      azimuth: azDeg,
      hourAngle: haDeg
    };
  }

  /**
   * Convert Horizontal (Azimuth, Altitude) to 3D Cartesian vector on unit sphere.
   * X = East, Y = North, Z = Zenith (Up)
   */
  function horizontalToVector(azDeg, altDeg) {
    const azRad = azDeg * DEG2RAD;
    const altRad = altDeg * DEG2RAD;
    const cosAlt = Math.cos(altRad);
    return {
      x: cosAlt * Math.sin(azRad),
      y: cosAlt * Math.cos(azRad),
      z: Math.sin(altRad)
    };
  }

  /**
   * Convert 3D Cartesian vector back to Horizontal (Azimuth, Altitude)
   */
  function vectorToHorizontal(vec) {
    const len = Math.hypot(vec.x, vec.y, vec.z) || 1.0;
    const x = vec.x / len;
    const y = vec.y / len;
    const z = vec.z / len;

    const altRad = Math.asin(Math.max(-1.0, Math.min(1.0, z)));
    let azRad = Math.atan2(x, y);
    return {
      azimuth: (azRad * RAD2DEG + 360.0) % 360.0,
      altitude: altRad * RAD2DEG
    };
  }

  // Single-entry camera basis cache: eliminates thousands of redundant trig calls per frame
  let _camCache = null;

  /**
   * Precompute (and cache) the camera orthonormal basis & perspective parameters
   */
  function getCameraBasis(camAzDeg, camAltDeg, camRollDeg, fovDeg, screenWidth, screenHeight) {
    const roll = camRollDeg || 0;
    if (_camCache &&
        _camCache.camAzDeg === camAzDeg &&
        _camCache.camAltDeg === camAltDeg &&
        _camCache.camRollDeg === roll &&
        _camCache.fovDeg === fovDeg &&
        _camCache.screenWidth === screenWidth &&
        _camCache.screenHeight === screenHeight) {
      return _camCache;
    }

    const cAzRad = camAzDeg * DEG2RAD;
    const cAltRad = camAltDeg * DEG2RAD;
    const rollRad = roll * DEG2RAD;

    const cosAz = Math.cos(cAzRad), sinAz = Math.sin(cAzRad);
    const cosAlt = Math.cos(cAltRad), sinAlt = Math.sin(cAltRad);
    const cosR = Math.cos(rollRad), sinR = Math.sin(rollRad);

    // Camera Forward / Look vector
    const fx = cosAlt * sinAz;
    const fy = cosAlt * cosAz;
    const fz = sinAlt;

    // Camera Up vector (before roll)
    const ux = -sinAlt * sinAz;
    const uy = -sinAlt * cosAz;
    const uz = cosAlt;

    // Camera Right vector: cross(forward, up) = (cos(cAz), -sin(cAz), 0)
    const rx = cosAz;
    const ry = -sinAz;

    // Apply roll around Forward axis
    const rFinalX = cosR * rx + sinR * ux;
    const rFinalY = cosR * ry + sinR * uy;
    const rFinalZ = sinR * uz;

    const uFinalX = -sinR * rx + cosR * ux;
    const uFinalY = -sinR * ry + cosR * uy;
    const uFinalZ = cosR * uz;

    const minDim = Math.min(screenWidth, screenHeight);
    const fovRad = Math.max(10, Math.min(120, fovDeg)) * DEG2RAD;
    const focalLength = (minDim * 0.5) / Math.tan(fovRad * 0.5);

    _camCache = {
      camAzDeg, camAltDeg, camRollDeg: roll, fovDeg, screenWidth, screenHeight,
      fx, fy, fz,
      rFinalX, rFinalY, rFinalZ,
      uFinalX, uFinalY, uFinalZ,
      focalLength,
      centerX: screenWidth * 0.5,
      centerY: screenHeight * 0.5,
      fovLimitDeg: fovDeg * 0.75
    };
    return _camCache;
  }

  /**
   * Project a precomputed horizontal unit vector (vx, vy, vz) onto the 2D screen using a camera basis.
   * Zero trig calls per point.
   */
  function projectVectorToScreen(vx, vy, vz, basis, withAngularDist = true) {
    const camZ = vx * basis.fx + vy * basis.fy + vz * basis.fz;

    if (camZ <= 0.05) {
      return {
        x: -9999,
        y: -9999,
        visible: false,
        camZ: camZ,
        angularDistanceDeg: withAngularDist ? Math.acos(Math.max(-1.0, Math.min(1.0, camZ))) * RAD2DEG : 180,
        inFov: false
      };
    }

    const camX = vx * basis.rFinalX + vy * basis.rFinalY + vz * basis.rFinalZ;
    const camY = vx * basis.uFinalX + vy * basis.uFinalY + vz * basis.uFinalZ;

    const invZ = basis.focalLength / camZ;
    const px = basis.centerX + camX * invZ;
    const py = basis.centerY - camY * invZ; // Minus because screen Y is top-down

    const margin = 80;
    const inScreen = px >= -margin && px <= basis.screenWidth + margin &&
                     py >= -margin && py <= basis.screenHeight + margin;

    const angularDistanceDeg = withAngularDist
      ? Math.acos(Math.max(-1.0, Math.min(1.0, camZ))) * RAD2DEG
      : 0;

    return {
      x: px,
      y: py,
      visible: inScreen,
      camZ: camZ,
      angularDistanceDeg: angularDistanceDeg,
      inFov: withAngularDist ? (angularDistanceDeg <= basis.fovLimitDeg) : inScreen
    };
  }

  /**
   * 3D Perspective projection of a celestial point onto 2D screen viewport.
   *
   * @param {number} azDeg - Star Azimuth in degrees
   * @param {number} altDeg - Star Altitude in degrees
   * @param {number} camAzDeg - Camera Azimuth in degrees (view direction)
   * @param {number} camAltDeg - Camera Altitude in degrees (-90 to +90)
   * @param {number} camRollDeg - Camera Roll angle in degrees (clockwise)
   * @param {number} fovDeg - Camera Field of View in degrees (e.g. 60)
   * @param {number} screenWidth - Canvas viewport width
   * @param {number} screenHeight - Canvas viewport height
   */
  function projectToScreen(azDeg, altDeg, camAzDeg, camAltDeg, camRollDeg, fovDeg, screenWidth, screenHeight) {
    const basis = getCameraBasis(camAzDeg, camAltDeg, camRollDeg, fovDeg, screenWidth, screenHeight);
    const azRad = azDeg * DEG2RAD;
    const altRad = altDeg * DEG2RAD;
    const cosAlt = Math.cos(altRad);
    return projectVectorToScreen(cosAlt * Math.sin(azRad), cosAlt * Math.cos(azRad), Math.sin(altRad), basis, true);
  }

  /**
   * Slerp (Spherical Linear Interpolation) between two unit vectors.
   */
  function slerpVector(v1, v2, t) {
    let dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    dot = Math.max(-1.0, Math.min(1.0, dot));

    const theta = Math.acos(dot);
    if (Math.abs(theta) < 1e-5) {
      return { x: v1.x, y: v1.y, z: v1.z };
    }

    const sinTheta = Math.sin(theta);
    const a = Math.sin((1 - t) * theta) / sinTheta;
    const b = Math.sin(t * theta) / sinTheta;

    return {
      x: a * v1.x + b * v2.x,
      y: a * v1.y + b * v2.y,
      z: a * v1.z + b * v2.z
    };
  }

  /**
   * Interpolate great-circle arc between two points in (Azimuth, Altitude)
   */
  function interpolateGreatCircle(az1, alt1, az2, alt2, segments = 6) {
    const v1 = horizontalToVector(az1, alt1);
    const v2 = horizontalToVector(az2, alt2);
    const pts = [];

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const vt = slerpVector(v1, v2, t);
      pts.push(vectorToHorizontal(vt));
    }
    return pts;
  }

  /**
   * Calculate directional aiming navigation guidance from camera to target star
   */
  function getAimingGuidance(camAz, camAlt, targetAz, targetAlt) {
    // Delta azimuth in range [-180, 180]
    let deltaAz = (((targetAz - camAz + 540.0) % 360.0) - 180.0);
    let deltaAlt = targetAlt - camAlt;

    const totalAngle = Math.hypot(deltaAz, deltaAlt);
    const isLocked = totalAngle <= 3.0;

    let instructionsEn = [];
    let instructionsCn = [];

    if (isLocked) {
      instructionsEn.push('Target Locked in Reticle!');
      instructionsCn.push('目标已锁定在十字准星中！');
    } else {
      // Horizontal guidance
      if (deltaAz > 1.5) {
        instructionsEn.push(`Turn Right ${Math.round(deltaAz)}°`);
        instructionsCn.push(`向右转 ${Math.round(deltaAz)}°`);
      } else if (deltaAz < -1.5) {
        instructionsEn.push(`Turn Left ${Math.round(Math.abs(deltaAz))}°`);
        instructionsCn.push(`向左转 ${Math.round(Math.abs(deltaAz))}°`);
      }

      // Vertical guidance
      if (deltaAlt > 1.5) {
        instructionsEn.push(`Tilt Up ${Math.round(deltaAlt)}°`);
        instructionsCn.push(`向上仰 ${Math.round(deltaAlt)}°`);
      } else if (deltaAlt < -1.5) {
        instructionsEn.push(`Tilt Down ${Math.round(Math.abs(deltaAlt))}°`);
        instructionsCn.push(`向下俯 ${Math.round(Math.abs(deltaAlt))}°`);
      }
    }

    // Direction angle on screen for HUD guidance arrow (0° = Up, 90° = Right, etc.)
    // deltaAz > 0 is to the right (+X), deltaAlt > 0 is upwards (-screenY)
    const arrowAngleRad = Math.atan2(deltaAz, deltaAlt); // angle from up clockwise
    const arrowAngleDeg = arrowAngleRad * RAD2DEG;

    return {
      deltaAz,
      deltaAlt,
      totalAngle,
      isLocked,
      arrowAngleDeg,
      textEn: instructionsEn.join(', ') || 'Aligned',
      textCn: instructionsCn.join('，') || '已对齐'
    };
  }

  /**
   * Compute heliocentric ecliptic coordinates (AU) for all major Solar System planets at epoch offset d (days from J2000.0).
   */
  const VISIBLE_PLANET_IDS = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn'];

  function computeHeliocentricPositions(d) {
    // Earth Heliocentric Position
    const M_earth = (((357.528 + 0.9856003 * d) % 360.0) + 360.0) % 360.0 * DEG2RAD;
    const e_earth = 0.016709;
    const E_earth = M_earth + e_earth * Math.sin(M_earth) * (1.0 + e_earth * Math.cos(M_earth));
    const xv_e = Math.cos(E_earth) - e_earth;
    const yv_e = Math.sqrt(1.0 - e_earth * e_earth) * Math.sin(E_earth);
    const v_e = Math.atan2(yv_e, xv_e);
    const r_e = Math.hypot(xv_e, yv_e);
    const l_earth = v_e + 282.9404 * DEG2RAD;
    const xe = r_e * Math.cos(l_earth);
    const ye = r_e * Math.sin(l_earth);

    const map = {
      earth: {
        id: 'earth',
        xh: xe,
        yh: ye,
        zh: 0,
        r: r_e,
        baseMag: -3.86,
        color: '#38bdf8',
        isEarth: true,
        renderStyle: 'earth'
      }
    };

    const keplerPlanets = [
      { id: 'mercury', a: 0.387098,  e: 0.205630, i: 7.005, N: 48.331 + 0.0324587 * d,   w: 29.124 + 0.0101444 * d,  M: 168.656 + 4.0923344 * d,  baseMag: -0.4, color: '#e2e8f0' },
      { id: 'venus',   a: 0.723332,  e: 0.006773, i: 3.394, N: 76.680 + 0.0246590 * d,   w: 54.852 + 0.0138374 * d,  M: 48.005 + 1.6021302 * d,   baseMag: -4.4, color: '#fef08a' },
      { id: 'mars',    a: 1.523688,  e: 0.093405, i: 1.850, N: 49.557 + 0.0211085 * d,   w: 286.502 + 0.018497 * d,  M: 18.602 + 0.5240208 * d,   baseMag: -0.5, color: '#f87171' },
      { id: 'jupiter', a: 5.202561,  e: 0.048498, i: 1.303, N: 100.454 + 0.027685 * d,   w: 273.867 + 0.016450 * d,  M: 19.895 + 0.0830853 * d,   baseMag: -2.7, color: '#fed7aa' },
      { id: 'saturn',  a: 9.554747,  e: 0.055546, i: 2.489, N: 113.663 + 0.023898 * d,   w: 339.392 + 0.028485 * d,  M: 316.967 + 0.0334442 * d,  baseMag: 0.4,  color: '#fef3c7', hasRings: true, renderStyle: 'ringed_planet' },
      { id: 'uranus',  a: 19.191264, e: 0.047168, i: 0.770, N: 74.0005 + 0.000013978 * d, w: 96.6612 + 0.000030565 * d, M: 142.5905 + 0.011725806 * d, baseMag: 5.7, color: '#a5f3fc' },
      { id: 'neptune', a: 30.068963, e: 0.008586, i: 1.770, N: 131.7806 + 0.000030173 * d, w: 272.8461 - 0.000006027 * d, M: 260.2471 + 0.005995147 * d, baseMag: 7.8, color: '#60a5fa' }
    ];

    for (const p of keplerPlanets) {
      const M = (((p.M % 360.0) + 360.0) % 360.0) * DEG2RAD;
      let E = M + p.e * Math.sin(M) * (1.0 + p.e * Math.cos(M));
      E = E - (E - p.e * Math.sin(E) - M) / (1.0 - p.e * Math.cos(E));

      const xv = p.a * (Math.cos(E) - p.e);
      const yv = p.a * Math.sqrt(1.0 - p.e * p.e) * Math.sin(E);
      const v = Math.atan2(yv, xv);
      const r = Math.hypot(xv, yv);

      const N = (p.N % 360.0) * DEG2RAD;
      const w = (p.w % 360.0) * DEG2RAD;
      const i = p.i * DEG2RAD;

      const u = v + w;
      const xh = r * (Math.cos(N) * Math.cos(u) - Math.sin(N) * Math.sin(u) * Math.cos(i));
      const yh = r * (Math.sin(N) * Math.cos(u) + Math.cos(N) * Math.sin(u) * Math.cos(i));
      const zh = r * (Math.sin(u) * Math.sin(i));

      map[p.id] = { ...p, xh, yh, zh, r };
    }

    return map;
  }

  /**
   * Compute a natural satellite's J2000 equatorial direction from its host planet's registry spec.
   */
  function computePlanetMoon(moonSpec, d, planetCfg, ctx) {
    if (typeof moonSpec.compute === 'function') {
      return moonSpec.compute(d, ctx);
    }

    const orientation = moonSpec.orientation || planetCfg.orientation || IAU_ORIENTATIONS.earth;
    const { X0, Y0, Z_P } = getPlanetEquatorialFrame(orientation);

    const theta = (((moonSpec.theta0Deg || 0) + (360.0 / moonSpec.periodDays) * d) % 360.0 + 360.0) % 360.0 * DEG2RAD;
    const inc = (moonSpec.inclinationDeg || 0) * DEG2RAD;
    const node = (moonSpec.nodeDeg || 0) * DEG2RAD;
    const u = theta - node;

    const px = Math.cos(node) * Math.cos(u) - Math.sin(node) * Math.sin(u) * Math.cos(inc);
    const py = Math.sin(node) * Math.cos(u) + Math.cos(node) * Math.sin(u) * Math.cos(inc);
    const pz = Math.sin(u) * Math.sin(inc);

    const rx = px * X0[0] + py * Y0[0] + pz * Z_P[0];
    const ry = px * X0[1] + py * Y0[1] + pz * Z_P[1];
    const rz = px * X0[2] + py * Y0[2] + pz * Z_P[2];

    const ra = ((Math.atan2(ry, rx) * RAD2DEG + 360.0) % 360.0) / 15.0;
    const dec = Math.asin(Math.max(-1.0, Math.min(1.0, rz))) * RAD2DEG;

    const moonObj = {
      id: moonSpec.id,
      ra,
      dec,
      mag: moonSpec.mag !== undefined ? moonSpec.mag : 0.0,
      distKm: moonSpec.distKm || 10000,
      color: moonSpec.color || '#cbd5e1',
      isMoon: true,
      hostPlanet: planetCfg.id,
      renderStyle: moonSpec.renderStyle || 'cratered_moon'
    };
    if (moonSpec.isMartianMoon) moonObj.isMartianMoon = true;
    return moonObj;
  }

  /**
   * Compute instantaneous Equatorial coordinates (RA, Dec) and physical properties
   * for the Sun, local moons, and visible Solar System planets from any registered observerPlanet.
   */
  function getSolarSystemPositions(date, lat, lon, observerPlanet = 'earth') {
    const cfg = getObserverPlanetConfig(observerPlanet);
    const jd = dateToJulianDate(date);
    const d = jd - 2451545.0; // days from J2000.0 epoch

    // Obliquity of the Ecliptic
    const eps = (23.439 - 0.0000004 * d) * DEG2RAD;
    const cosEps = Math.cos(eps);
    const sinEps = Math.sin(eps);

    // Earth-geocentric solar longitude baseline (for Earth Sun & Lunar phase)
    const L_sun = (280.460 + 0.9856474 * d) % 360.0;
    const g_sun = (((357.528 + 0.9856003 * d) % 360.0) + 360.0) % 360.0 * DEG2RAD;
    const lambda_sun = ((L_sun + 1.915 * Math.sin(g_sun) + 0.020 * Math.sin(2 * g_sun) + 360.0) % 360.0) * DEG2RAD;

    // Heliocentric states for all planets
    const helioMap = computeHeliocentricPositions(d);
    const obsPos = cfg.getHeliocentricPosition
      ? cfg.getHeliocentricPosition(d, helioMap, { cosEps, sinEps, L_sun, lambda_sun })
      : (helioMap[cfg.ephemerisId] || helioMap.earth);
    const obsX = obsPos.xh, obsY = obsPos.yh, obsZ = obsPos.zh;

    // 1. Sun as seen from observer vantage point
    let sunRA, sunDec, sunDistAU, sunMag;
    if (cfg.id === 'earth') {
      const sunX = Math.cos(lambda_sun);
      const sunY = cosEps * Math.sin(lambda_sun);
      const sunZ = sinEps * Math.sin(lambda_sun);
      sunRA = ((Math.atan2(sunY, sunX) * RAD2DEG + 360.0) % 360.0) / 15.0;
      sunDec = Math.asin(sunZ) * RAD2DEG;
      sunDistAU = 1.0;
      sunMag = -26.74;
    } else {
      const sunRelX = -obsX;
      const sunRelY = -obsY;
      const sunRelZ = -obsZ;
      sunDistAU = Math.hypot(sunRelX, sunRelY, sunRelZ);
      const sunXeq = sunRelX;
      const sunYeq = sunRelY * cosEps - sunRelZ * sinEps;
      const sunZeq = sunRelY * sinEps + sunRelZ * cosEps;
      sunRA = ((Math.atan2(sunYeq, sunXeq) * RAD2DEG + 360.0) % 360.0) / 15.0;
      sunDec = Math.asin(Math.max(-1.0, Math.min(1.0, sunZeq / sunDistAU))) * RAD2DEG;
      sunMag = Math.round((-26.74 + 5 * Math.log10(sunDistAU)) * 100) / 100;
    }

    const sunObj = {
      id: 'sun',
      ra: sunRA,
      dec: sunDec,
      mag: sunMag,
      color: '#fbbf24',
      distAU: Math.round(sunDistAU * 100) / 100,
      renderStyle: 'sun'
    };

    // 2. Local Moons declared on the observer planet
    const moonCtx = { L_sun, lambda_sun, cosEps, sinEps, helioMap, obsPos };
    const moons = cfg.moons.map((mSpec) => computePlanetMoon(mSpec, d, cfg, moonCtx)).filter(Boolean);

    // 3. Other Solar System Planets visible from observer vantage point
    const excludeEphemerisId = cfg.getHeliocentricPosition ? null : cfg.ephemerisId;
    const planets = VISIBLE_PLANET_IDS
      .filter((pid) => pid !== excludeEphemerisId && helioMap[pid])
      .map((pid) => {
        const p = helioMap[pid];
        const xg = p.xh - obsX;
        const yg = p.yh - obsY;
        const zg = p.zh - obsZ;

        const xeq = xg;
        const yeq = yg * cosEps - zg * sinEps;
        const zeq = yg * sinEps + zg * cosEps;

        const distAU = Math.hypot(xg, yg, zg);
        const raHours = ((Math.atan2(yeq, xeq) * RAD2DEG + 360.0) % 360.0) / 15.0;
        const decDeg = Math.asin(Math.max(-1.0, Math.min(1.0, zeq / (distAU || 1)))) * RAD2DEG;

        let mag = p.baseMag;
        if (pid === 'earth') {
          mag = Math.round((-3.86 + 5 * Math.log10(Math.max(0.01, distAU))) * 10) / 10;
        }

        const planetObj = {
          id: p.id,
          ra: raHours,
          dec: decDeg,
          mag,
          distAU: Math.round(distAU * 100) / 100,
          color: p.color,
          hasRings: !!p.hasRings
        };
        if (p.isEarth) planetObj.isEarth = true;
        if (p.renderStyle) planetObj.renderStyle = p.renderStyle;
        return planetObj;
      });

    // Place Earth first among planets when viewing from non-Earth vantage points
    const earthIdx = planets.findIndex((p) => p.id === 'earth');
    const earthObj = earthIdx !== -1 ? planets[earthIdx] : null;
    if (earthIdx > 0) {
      planets.splice(earthIdx, 1);
      planets.unshift(earthObj);
    }

    // 4. Compute Horizontal (Azimuth, Altitude) if lat & lon provided
    const allComputed = [sunObj, ...moons, ...planets];
    if (typeof lat === 'number' && typeof lon === 'number') {
      allComputed.forEach((body) => {
        const h = equatorialToHorizontal(body.ra, body.dec, lat, lon, date, cfg.id);
        body.azimuth = h.azimuth;
        body.altitude = h.altitude;
      });
    }

    // Build ordered list: Sun, Earth (if non-Earth observer), local moons, remaining planets
    const list = earthObj
      ? [sunObj, earthObj, ...moons, ...planets.filter((p) => p.id !== 'earth')]
      : [sunObj, ...moons, ...planets];

    const result = {
      observerPlanet: cfg.id,
      sun: sunObj,
      moon: moons.find((m) => m.id === 'moon') || null,
      earth: earthObj,
      phobos: moons.find((m) => m.id === 'phobos') || null,
      deimos: moons.find((m) => m.id === 'deimos') || null,
      moons,
      planets,
      list,
      [Symbol.iterator]: function* () {
        yield* list;
      },
      find: function (predicate) {
        return list.find(predicate);
      },
      map: function (callback) {
        return list.map(callback);
      },
      filter: function (predicate) {
        return list.filter(predicate);
      },
      forEach: function (callback) {
        list.forEach(callback);
      },
      get length() {
        return list.length;
      }
    };

    // Expose every local moon by id on result for convenient lookup (e.g. result.io, result.titan)
    moons.forEach((m) => {
      if (!(m.id in result)) result[m.id] = m;
    });

    return result;
  }

  /**
   * Convert Horizontal (Azimuth, Altitude) to Equatorial (RA in hours, Dec in degrees).
   * Supports any registered observerPlanet (default: 'earth').
   */
  function horizontalToEquatorial(azDeg, altDeg, latDeg, lonDeg, date, observerPlanet = 'earth') {
    const cfg = getObserverPlanetConfig(observerPlanet);
    const azRad = azDeg * DEG2RAD;
    const altRad = altDeg * DEG2RAD;

    if (!cfg.useEarthLST) {
      const { East, North, Zenith } = getHorizontalBasis(latDeg, lonDeg, date, cfg.id);
      const cosAlt = Math.cos(altRad);
      const cE = cosAlt * Math.sin(azRad);
      const cN = cosAlt * Math.cos(azRad);
      const cZ = Math.sin(altRad);
      const ux = cE * East[0] + cN * North[0] + cZ * Zenith[0];
      const uy = cE * East[1] + cN * North[1] + cZ * Zenith[1];
      const uz = cE * East[2] + cN * North[2] + cZ * Zenith[2];
      const raDeg = (Math.atan2(uy, ux) * RAD2DEG + 360.0) % 360.0;
      const decDeg = Math.asin(Math.max(-1.0, Math.min(1.0, uz))) * RAD2DEG;
      return {
        ra: raDeg / 15.0,
        dec: decDeg
      };
    }

    const latRad = latDeg * DEG2RAD;
    const sinAlt = Math.sin(altRad);
    const cosAlt = Math.cos(altRad);
    const sinLat = Math.sin(latRad);
    const cosLat = Math.cos(latRad);
    const cosAz = Math.cos(azRad);
    const sinAz = Math.sin(azRad);

    const sinDec = sinLat * sinAlt + cosLat * cosAlt * cosAz;
    const decRad = Math.asin(Math.max(-1.0, Math.min(1.0, sinDec)));

    // Compute HA without dividing by cos(lat) or cos(dec) (avoids pole singularities)
    const sinHA = -sinAz * cosAlt;
    const cosHA = sinAlt * cosLat - cosAlt * sinLat * cosAz;
    const haDeg = (Math.atan2(sinHA, cosHA) * RAD2DEG + 360.0) % 360.0;

    const lstDeg = getLST(date, lonDeg);
    const raDeg = (((lstDeg - haDeg) % 360.0) + 360.0) % 360.0;
    return {
      ra: raDeg / 15.0,
      dec: decRad * RAD2DEG
    };
  }

  /**
   * Convert Geodetic (Lat, Lon, Alt km) to WGS84 ECEF Cartesian (X, Y, Z in km)
   */
  function geodeticToEcef(latDeg, lonDeg, altKm) {
    const a = 6378.137;
    const f = 1.0 / 298.257223563;
    const e2 = 2.0 * f - f * f;
    const latRad = latDeg * DEG2RAD;
    const lonRad = lonDeg * DEG2RAD;
    const sinLat = Math.sin(latRad);
    const cosLat = Math.cos(latRad);
    const sinLon = Math.sin(lonRad);
    const cosLon = Math.cos(lonRad);
    const N = a / Math.sqrt(1.0 - e2 * sinLat * sinLat);
    return {
      x: (N + altKm) * cosLat * cosLon,
      y: (N + altKm) * cosLat * sinLon,
      z: (N * (1.0 - e2) + altKm) * sinLat
    };
  }

  /**
   * Convert Sub-satellite Geodetic Position to Observer Topocentric (Azimuth, Altitude, Range)
   */
  function subsatelliteToTopocentric(subLat, subLon, subAlt, obsLat, obsLon, obsAlt = 0) {
    const sat = geodeticToEcef(subLat, subLon, subAlt);
    const obs = geodeticToEcef(obsLat, obsLon, obsAlt);
    const dx = sat.x - obs.x;
    const dy = sat.y - obs.y;
    const dz = sat.z - obs.z;

    const latRad = obsLat * DEG2RAD;
    const lonRad = obsLon * DEG2RAD;
    const sinLat = Math.sin(latRad);
    const cosLat = Math.cos(latRad);
    const sinLon = Math.sin(lonRad);
    const cosLon = Math.cos(lonRad);

    const east  = -sinLon * dx + cosLon * dy;
    const north = -sinLat * cosLon * dx - sinLat * sinLon * dy + cosLat * dz;
    const up    =  cosLat * cosLon * dx + cosLat * sinLon * dy + sinLat * dz;

    const range = Math.hypot(east, north, up);
    const altRad = Math.asin(Math.max(-1.0, Math.min(1.0, up / (range || 1e-9))));
    const azRad = Math.atan2(east, north);
    return {
      altitude: altRad * RAD2DEG,
      azimuth: (azRad * RAD2DEG + 360.0) % 360.0,
      rangeKm: range
    };
  }

  let liveISSTelemetry = null;

  function setLiveISSTelemetry(data) {
    if (!data) {
      liveISSTelemetry = null;
      return;
    }
    const lat = typeof data.lat === 'number' ? data.lat : (data.latitude || 0);
    const lon = typeof data.lon === 'number' ? data.lon : (data.longitude || 0);
    const alt = typeof data.alt === 'number' ? data.alt : (data.altitude || 418.0);
    liveISSTelemetry = {
      lat,
      lon,
      alt,
      velocity: data.velocity || 27600.0,
      visibility: data.visibility || 'daylight',
      timestamp: data.timestamp || (Date.now() / 1000.0)
    };
  }

  /**
   * Calculate instantaneous Topocentric and Equatorial position of ISS
   * Combines live telemetry with orbital extrapolation and analytical fallback
   */
  function getISSPosition(date, obsLat, obsLon) {
    const nowSec = date.getTime() / 1000.0;
    let subLat = 0;
    let subLon = 0;
    let subAlt = 418.0;
    let velocity = 27580.0;
    let visibility = 'daylight';

    function normalizeDeg180(deg) {
      return ((deg + 180) % 360 + 360) % 360 - 180;
    }

    if (liveISSTelemetry && liveISSTelemetry.timestamp) {
      const dt = nowSec - liveISSTelemetry.timestamp;
      // Extrapolate smoothly along 51.64° inclination orbit if dt within 10 minutes
      if (Math.abs(dt) < 600) {
        const vKms = (liveISSTelemetry.velocity || 27600) / 3600.0;
        const dDistKm = vKms * dt;
        const earthR = 6378.137 + liveISSTelemetry.alt;
        const dAngleRad = dDistKm / earthR;
        const incRad = 51.64 * DEG2RAD;
        subLat = liveISSTelemetry.lat + (dAngleRad * Math.cos(incRad) * RAD2DEG);
        subLat = Math.max(-51.64, Math.min(51.64, subLat));
        const earthRotDeg = dt * 0.004166667;
        const orbLonDelta = (dAngleRad * Math.sin(incRad) * RAD2DEG) / Math.cos(subLat * DEG2RAD + 1e-6);
        subLon = normalizeDeg180(liveISSTelemetry.lon + orbLonDelta - earthRotDeg);
        subAlt = liveISSTelemetry.alt;
        velocity = liveISSTelemetry.velocity;
        visibility = liveISSTelemetry.visibility;
      } else {
        subLat = liveISSTelemetry.lat;
        subLon = normalizeDeg180(liveISSTelemetry.lon);
        subAlt = liveISSTelemetry.alt;
      }
    } else {
      // Analytical circular LEO orbit model (51.64° inclination, 92.96 min period)
      const epochSec = 1700000000;
      const t = nowSec - epochSec;
      const periodSec = 5578.0;
      const u = (t / periodSec * 2 * Math.PI) % (2 * Math.PI);
      const incRad = 51.64 * DEG2RAD;
      subLat = Math.asin(Math.sin(incRad) * Math.sin(u)) * RAD2DEG;
      const earthRotDeg = (t / 86400.0) * 360.0;
      const orbLon = Math.atan2(Math.cos(incRad) * Math.sin(u), Math.cos(u)) * RAD2DEG;
      subLon = normalizeDeg180(orbLon - earthRotDeg);
      subAlt = 418.0;
    }

    const topoc = subsatelliteToTopocentric(subLat, subLon, subAlt, obsLat, obsLon, 0);
    const eq = horizontalToEquatorial(topoc.azimuth, topoc.altitude, obsLat, obsLon, date);

    // Magnitude scales with range (~ -3.5 directly overhead at 418km)
    const mag = Math.max(-3.8, Math.min(2.5, -1.8 + 5.0 * Math.log10(topoc.rangeKm / 420.0)));

    const roundedLat = Math.round(subLat * 100) / 100;
    const roundedLon = Math.round(subLon * 100) / 100;
    const roundedAlt = Math.round(subAlt * 10) / 10;
    const roundedVel = Math.round(velocity);

    return {
      id: 'iss',
      ra: eq.ra,
      dec: eq.dec,
      cachedAzimuth: topoc.azimuth,
      cachedAltitude: topoc.altitude,
      azimuth: topoc.azimuth,
      altitude: topoc.altitude,
      rangeKm: Math.round(topoc.rangeKm),
      subLat: roundedLat,
      subLon: roundedLon,
      subAlt: roundedAlt,
      lat: roundedLat,
      lon: roundedLon,
      altKm: roundedAlt,
      velocityKmh: roundedVel,
      velocity: roundedVel,
      visibility,
      mag: Math.round(mag * 10) / 10,
      isOverhead: topoc.altitude > 0,
      isSpacecraft: true,
      craftType: 'leo_station'
    };
  }

  /**
   * Calculate real-time topocentric positions for all man-made spacecraft:
   * ISS, Hubble (HST), Tiangong (CSS), James Webb (JWST), Voyager 1, and Voyager 2.
   */
  function getSpacecraftPositions(date, obsLat, obsLon, solarData) {
    const nowSec = date.getTime() / 1000.0;
    function normalizeDeg180(deg) {
      return ((deg + 180) % 360 + 360) % 360 - 180;
    }

    // 1. ISS
    const issPos = getISSPosition(date, obsLat, obsLon);

    // 2. Hubble Space Telescope (HST): Altitude ~525km, inc 28.47°, period 5724s
    const hstEpochSec = 1700000200;
    const tHst = nowSec - hstEpochSec;
    const uHst = ((tHst / 5724.0) * 2 * Math.PI) % (2 * Math.PI);
    const incHstRad = 28.47 * DEG2RAD;
    const subLatHst = Math.asin(Math.sin(incHstRad) * Math.sin(uHst)) * RAD2DEG;
    const rotHst = (tHst / 86400.0) * 360.0;
    const orbLonHst = Math.atan2(Math.cos(incHstRad) * Math.sin(uHst), Math.cos(uHst)) * RAD2DEG;
    const subLonHst = normalizeDeg180(orbLonHst - rotHst);
    const topocHst = subsatelliteToTopocentric(subLatHst, subLonHst, 525.0, obsLat, obsLon, 0);
    const eqHst = horizontalToEquatorial(topocHst.azimuth, topocHst.altitude, obsLat, obsLon, date);

    // 3. Tiangong Space Station (CSS): Altitude ~390km, inc 41.5°, period 5532s
    const cssEpochSec = 1700000500;
    const tCss = nowSec - cssEpochSec;
    const uCss = ((tCss / 5532.0) * 2 * Math.PI) % (2 * Math.PI);
    const incCssRad = 41.5 * DEG2RAD;
    const subLatCss = Math.asin(Math.sin(incCssRad) * Math.sin(uCss)) * RAD2DEG;
    const rotCss = (tCss / 86400.0) * 360.0;
    const orbLonCss = Math.atan2(Math.cos(incCssRad) * Math.sin(uCss), Math.cos(uCss)) * RAD2DEG;
    const subLonCss = normalizeDeg180(orbLonCss - rotCss);
    const topocCss = subsatelliteToTopocentric(subLatCss, subLonCss, 390.0, obsLat, obsLon, 0);
    const eqCss = horizontalToEquatorial(topocCss.azimuth, topocCss.altitude, obsLat, obsLon, date);

    // 4. James Webb Space Telescope (JWST): Sun-Earth L2 (anti-sunward point)
    let sunRA = 18.0;
    let sunDec = -23.0;
    if (solarData && solarData.sun) {
      sunRA = solarData.sun.ra;
      sunDec = solarData.sun.dec;
    } else {
      const s = getSolarSystemPositions(date);
      if (s && s.sun) {
        sunRA = s.sun.ra;
        sunDec = s.sun.dec;
      }
    }
    const jwstRA = (sunRA + 12.0) % 24.0;
    const jwstDec = -sunDec + 2.5 * Math.sin((nowSec / 15000000) * 2 * Math.PI);
    const topocJwst = equatorialToHorizontal(jwstRA, jwstDec, obsLat, obsLon, date);

    // 5. Voyager 1: Constellation Ophiuchus (RA 17.25h, Dec +12.33°)
    const v1RA = 17.25;
    const v1Dec = 12.33;
    const topocV1 = equatorialToHorizontal(v1RA, v1Dec, obsLat, obsLon, date);

    // 6. Voyager 2: Southern Constellation Pavo (RA 20.17h, Dec -59.67°)
    const v2RA = 20.17;
    const v2Dec = -59.67;
    const topocV2 = equatorialToHorizontal(v2RA, v2Dec, obsLat, obsLon, date);

    return [
      {
        id: 'iss',
        ...issPos,
        isSpacecraft: true,
        craftType: 'leo_station'
      },
      {
        id: 'hubble',
        ra: eqHst.ra,
        dec: eqHst.dec,
        cachedAzimuth: topocHst.azimuth,
        cachedAltitude: topocHst.altitude,
        azimuth: topocHst.azimuth,
        altitude: topocHst.altitude,
        rangeKm: Math.round(topocHst.rangeKm),
        subLat: Math.round(subLatHst * 100) / 100,
        subLon: Math.round(subLonHst * 100) / 100,
        subAlt: 525.0,
        lat: Math.round(subLatHst * 100) / 100,
        lon: Math.round(subLonHst * 100) / 100,
        altKm: 525.0,
        velocityKmh: 27300,
        velocity: 27300,
        mag: 1.8,
        isOverhead: topocHst.altitude > 0,
        isSpacecraft: true,
        craftType: 'leo_telescope'
      },
      {
        id: 'tiangong',
        ra: eqCss.ra,
        dec: eqCss.dec,
        cachedAzimuth: topocCss.azimuth,
        cachedAltitude: topocCss.altitude,
        azimuth: topocCss.azimuth,
        altitude: topocCss.altitude,
        rangeKm: Math.round(topocCss.rangeKm),
        subLat: Math.round(subLatCss * 100) / 100,
        subLon: Math.round(subLonCss * 100) / 100,
        subAlt: 390.0,
        lat: Math.round(subLatCss * 100) / 100,
        lon: Math.round(subLonCss * 100) / 100,
        altKm: 390.0,
        velocityKmh: 27650,
        velocity: 27650,
        mag: -1.8,
        isOverhead: topocCss.altitude > 0,
        isSpacecraft: true,
        craftType: 'leo_station'
      },
      {
        id: 'jwst',
        ra: jwstRA,
        dec: jwstDec,
        cachedAzimuth: topocJwst.azimuth,
        cachedAltitude: topocJwst.altitude,
        azimuth: topocJwst.azimuth,
        altitude: topocJwst.altitude,
        rangeKm: 1500000,
        subAlt: 1500000,
        altKm: 1500000,
        mag: 13.5,
        isOverhead: topocJwst.altitude > 0,
        isSpacecraft: true,
        craftType: 'lagrange_telescope'
      },
      {
        id: 'voyager1',
        ra: v1RA,
        dec: v1Dec,
        cachedAzimuth: topocV1.azimuth,
        cachedAltitude: topocV1.altitude,
        azimuth: topocV1.azimuth,
        altitude: topocV1.altitude,
        rangeKm: 24460000000,
        distAU: 163.5,
        velocityKms: 16.9,
        mag: 99.0,
        isOverhead: topocV1.altitude > 0,
        isSpacecraft: true,
        craftType: 'interstellar_probe'
      },
      {
        id: 'voyager2',
        ra: v2RA,
        dec: v2Dec,
        cachedAzimuth: topocV2.azimuth,
        cachedAltitude: topocV2.altitude,
        azimuth: topocV2.azimuth,
        altitude: topocV2.altitude,
        rangeKm: 20370000000,
        distAU: 136.2,
        velocityKms: 15.3,
        mag: 99.0,
        isOverhead: topocV2.altitude > 0,
        isSpacecraft: true,
        craftType: 'interstellar_probe'
      }
    ];
  }

  function magnitudeToRadius(mag, fov = 60) {
    const fovScale = 60.0 / Math.max(25.0, Math.min(95.0, fov));
    return Math.max(2.2, Math.min(8.5, 5.8 - mag * 1.1)) * fovScale;
  }

  function magnitudeToAlpha(mag) {
    return Math.max(0.25, Math.min(1.0, 1.0 - (mag + 1.5) * 0.12));
  }

  /**
   * Standard Saemundsson (1986) / Bennett (1982) Atmospheric Refraction Formula.
   * Converts True Geometric Altitude to Apparent Observed Altitude as seen
   * through Earth's atmosphere by a human observer or camera lens.
   *
   * @param {number} trueAltDeg - True geometric altitude in degrees
   * @param {number} pressureMbar - Atmospheric pressure in mbar (default 1010)
   * @param {number} tempC - Ambient temperature in Celsius (default 10)
   * @returns {number} Apparent altitude in degrees
   */
  function applyAtmosphericRefraction(trueAltDeg, pressureMbar = 1010, tempC = 10) {
    if (trueAltDeg < -1.5) {
      return trueAltDeg; // Deeply below horizon
    }
    // Saemundsson's formula: R = 1.02 / tan(h + 10.3 / (h + 5.11)) in arcminutes
    const h = Math.max(-0.5, trueAltDeg);
    const denomRad = (h + (10.3 / (h + 5.11))) * DEG2RAD;
    const rArcmin = 1.02 / Math.tan(denomRad);

    const weatherFactor = (pressureMbar / 1010.0) * (283.0 / (273.0 + tempC));
    const refrDeg = Math.max(0, (rArcmin * weatherFactor) / 60.0);
    return Math.min(90.0, trueAltDeg + refrDeg);
  }

  /**
   * Inverse Saemundsson / Bennett Atmospheric Refraction Formula.
   * Converts Apparent Observed Altitude back to True Geometric Altitude.
   *
   * @param {number} apparentAltDeg - Apparent observed altitude in degrees
   * @param {number} pressureMbar - Atmospheric pressure in mbar (default 1010)
   * @param {number} tempC - Ambient temperature in Celsius (default 10)
   * @returns {number} True geometric altitude in degrees
   */
  function removeAtmosphericRefraction(apparentAltDeg, pressureMbar = 1010, tempC = 10) {
    if (apparentAltDeg < -1.0) {
      return apparentAltDeg;
    }
    // Bennett's inverse formula: R = 1.00 / tan(h_app + 7.31 / (h_app + 4.4)) in arcminutes
    const h = Math.max(0.0, apparentAltDeg);
    const denomRad = (h + (7.31 / (h + 4.4))) * DEG2RAD;
    const rArcmin = 1.00 / Math.tan(denomRad);

    const weatherFactor = (pressureMbar / 1010.0) * (283.0 / (273.0 + tempC));
    const refrDeg = Math.max(0, (rArcmin * weatherFactor) / 60.0);
    return apparentAltDeg - refrDeg;
  }

  return {
    dateToJulianDate,
    getGMST,
    getLST,
    IAU_ORIENTATIONS,
    OBSERVER_PLANETS,
    registerObserverPlanet,
    unregisterObserverPlanet,
    hasObserverPlanet,
    getObserverPlanetConfig,
    getAvailableObserverPlanets,
    getPlanetEquatorialFrame,
    setPlanetTimeSyncMode,
    getPlanetTimeSyncMode,
    getPlanetLocalSolarTime,
    getHorizontalBasis,
    getPlanetHorizontal,
    computeHeliocentricPositions,
    equatorialToHorizontal,
    horizontalToEquatorial,
    applyAtmosphericRefraction,
    removeAtmosphericRefraction,
    geodeticToEcef,
    subsatelliteToTopocentric,
    setLiveISSTelemetry,
    getISSPosition,
    getSpacecraftPositions,
    magnitudeToRadius,
    magnitudeToAlpha,
    horizontalToVector,
    vectorToHorizontal,
    getCameraBasis,
    projectVectorToScreen,
    projectToScreen,
    interpolateGreatCircle,
    getAimingGuidance,
    getSolarSystemPositions,
    getMarsHorizontal,
    DEG2RAD,
    RAD2DEG
  };
});
