/**
 * 60fps HTML5 Canvas Sky Map Renderer for Star Finder (星空识星)
 * High precision 3D-to-2D perspective projection, spectral star colors,
 * constellation lines, cardinal compass horizon, and targeting reticle.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(root.Astronomy || require('./astronomy.js'), root.StarsData || require('./stars-data.js'));
  } else {
    root.SkyRenderer = factory(root.Astronomy, root.StarsData);
  }
})(typeof self !== 'undefined' ? self : this, function (Astronomy, StarsData) {
  'use strict';

  // Horizontal-coordinate cache generation. The app only advances its clock every few seconds,
  // so equatorial→horizontal transforms (trig-heavy, run for thousands of stars) are memoized
  // on each object and recomputed only when (date, lat, lon) change. Module-level so several
  // renderer instances sharing the same StarsData objects can never collide.
  let coordGenerationCounter = 0;
  const refract = (alt) => (Astronomy.applyAtmosphericRefraction ? Astronomy.applyAtmosphericRefraction(alt) : alt);

  class SkyRenderer {
    constructor(canvas, mwCanvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d', { alpha: true });

      // Photorealistic Astrophotography Milky Way WebGL Layer
      this.mwCanvas = mwCanvas || (typeof document !== 'undefined' && typeof document.getElementById === 'function' ? document.getElementById('milkyway-canvas') : null);
      this.gl = null;
      this.mwProgram = null;
      this.mwTexture = null;
      this.mwTextureLoaded = false;
      this.mwSrc = './assets/milkyway.jpg';

      this.width = (typeof window !== 'undefined' && window.innerWidth) || (canvas && canvas.width) || 1024;
      this.height = (typeof window !== 'undefined' && window.innerHeight) || (canvas && canvas.height) || 768;
      this.dpr = (typeof window !== 'undefined' && Math.min(window.devicePixelRatio || 1, 2)) || 1;

      // Camera State
      this.cameraAzimuth = 180.0; // default looking South
      this.cameraAltitude = 30.0; // default 30° altitude
      this.cameraRoll = 0.0;
      this.fov = 60.0; // Field of View in degrees (zoomable 25° - 95°)

      // App Settings
      this.isAR = false;
      this.showGrid = true;
      this.showConstellations = true;
      this.language = 'en'; // 'en' | 'zh'
      this.limitingMagnitude = parseFloat(localStorage.getItem('starfinder_limiting_mag') || '3.5'); // Light pollution: 3.2=City, 4.8=Suburb, 6.5=Desert
      this.ignoreAmbientLight = localStorage.getItem('starfinder_ignore_ambient') === 'true';

      // Sky Layer Visibility Settings (User Selection Panel)
      this.layers = {
        stars: true,
        constellations: true,
        solar_system: true,
        spacecraft: true,
        spacecraft_leo: true,
        spacecraft_deep: true,
        milky_way: true,
        horizon_grid: true,
        star_labels: true
      };

      try {
        const savedLayers = localStorage.getItem('starfinder_layers');
        if (savedLayers) {
          Object.assign(this.layers, JSON.parse(savedLayers));
        }
      } catch (e) {
        console.warn('Failed to parse saved layers:', e);
      }

      // Interaction State
      this.hoveredStar = null;
      this.selectedStar = null;
      this.aimingTargetStar = null;
      this.lockedStar = null;
      this.currentBodies = [];
      this.observerPlanet = 'earth';

      // Reticle Lock Threshold (in degrees of angular separation from center)
      this.lockThresholdDeg = 3.5;

      if (this.mwCanvas && typeof this.mwCanvas.getContext === 'function') {
        try {
          this.gl = this.mwCanvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false }) ||
                    this.mwCanvas.getContext('experimental-webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false });
          if (this.gl) {
            this.initWebGLMilkyWay();
          }
        } catch (e) {
          console.warn('WebGL Milky Way initialization failed, falling back to 2D canvas:', e);
          this.gl = null;
        }
      }

      this.resize();
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', () => this.resize());
      }
    }

    /** Set observation planet (any registered observer planet id, default: 'earth') */
    setObserverPlanet(planet) {
      const cfg = Astronomy.getObserverPlanetConfig
        ? Astronomy.getObserverPlanetConfig(planet)
        : { id: planet === 'mars' ? 'mars' : 'earth' };
      this.observerPlanet = cfg.id;
      this._genPlanet = null;
      this.currentBodies = [];
      this._bodiesGen = null;
    }

    /** Get the active observer planet configuration from the Astronomy registry */
    getObserverPlanetConfig() {
      return Astronomy.getObserverPlanetConfig
        ? Astronomy.getObserverPlanetConfig(this.observerPlanet)
        : { id: this.observerPlanet || 'earth', refractionScale: 1.0, localSpacecraftHost: 'earth' };
    }

    resize() {
      this.dpr = (typeof window !== 'undefined' && Math.min(window.devicePixelRatio || 1, 2)) || 1;
      this.width = (typeof window !== 'undefined' && window.innerWidth) || (this.canvas && this.canvas.width) || 1024;
      this.height = (typeof window !== 'undefined' && window.innerHeight) || (this.canvas && this.canvas.height) || 768;
      this.canvas.width = Math.round(this.width * this.dpr);
      this.canvas.height = Math.round(this.height * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this._skyGrad = null;

      if (this.mwCanvas) {
        this.mwCanvas.width = Math.round(this.width * this.dpr);
        this.mwCanvas.height = Math.round(this.height * this.dpr);
        if (this.gl) {
          this.gl.viewport(0, 0, this.mwCanvas.width, this.mwCanvas.height);
        }
      }
    }

    /**
     * Page font family for canvas labels. Cached: getComputedStyle forces a style
     * recalculation and was previously called several times per frame.
     */
    bodyFontFamily() {
      if (!this._bodyFontFamily) {
        this._bodyFontFamily = (typeof document !== 'undefined' && document.body && typeof getComputedStyle === 'function')
          ? (getComputedStyle(document.body).fontFamily || 'sans-serif')
          : 'sans-serif';
      }
      return this._bodyFontFamily;
    }

    /**
     * Returns a generation number identifying the current (date, lat, lon, observerPlanet) tuple.
     * Bumps (globally unique) whenever any of them change.
     */
    coordGeneration(date, lat, lon) {
      const t = date ? date.getTime() : 0;
      const planet = this.observerPlanet || 'earth';
      if (this._genT !== t || this._genLat !== lat || this._genLon !== lon || this._genPlanet !== planet || !this._gen) {
        this._genT = t;
        this._genLat = lat;
        this._genLon = lon;
        this._genPlanet = planet;
        this._gen = ++coordGenerationCounter;
      }
      return this._gen;
    }

    /**
     * Memoized equatorial→horizontal transform. Sets obj._hAz, obj._hAlt (true altitude),
     * obj._hAltApp (refracted apparent altitude), and unit vector (_hx, _hy, _hz) for fast
     * zero-trig projection per frame.
     */
    horizontalOf(obj, date, lat, lon) {
      const gen = this.coordGeneration(date, lat, lon);
      if (obj._hGen !== gen) {
        const cfg = this.getObserverPlanetConfig();
        const h = Astronomy.equatorialToHorizontal(obj.ra, obj.dec, lat, lon, date, cfg.id);
        const scale = typeof cfg.refractionScale === 'number' ? cfg.refractionScale : 1.0;
        const appAlt = scale > 0
          ? h.altitude + (refract(h.altitude) - h.altitude) * scale
          : h.altitude;
        obj._hAz = h.azimuth;
        obj._hAlt = h.altitude;
        obj._hAltApp = appAlt;
        const azRad = h.azimuth * Astronomy.DEG2RAD;
        const altRad = appAlt * Astronomy.DEG2RAD;
        const cosAlt = Math.cos(altRad);
        obj._hx = cosAlt * Math.sin(azRad);
        obj._hy = cosAlt * Math.cos(azRad);
        obj._hz = Math.sin(altRad);
        obj._hGen = gen;
      }
      return obj;
    }

    /**
     * Builds (and caches per coordinate generation) the list of all prominent bodies:
     * spacecraft, Solar System bodies and named stars.
     */
    getBodies(currentDate, observerLat, observerLon) {
      const gen = this.coordGeneration(currentDate, observerLat, observerLon);
      if (this._bodiesGen === gen && this.currentBodies.length > 0) {
        // StarsData.STARS objects are shared, so re-validate each memo (a no-op unless
        // something else recomputed them for a different time/place)
        for (const star of this.currentBodies) this.syncCachedCoords(star, currentDate, observerLat, observerLon);
        return this.currentBodies;
      }

      // Real-time Solar System positions (works generically for any registered observer planet)
      const planetCfg = this.getObserverPlanetConfig();
      const solarData = Astronomy.getSolarSystemPositions
        ? Astronomy.getSolarSystemPositions(currentDate, observerLat, observerLon, planetCfg.id)
        : null;
      const solarList = (solarData && Array.isArray(solarData.list))
        ? solarData.list.map(body => ({
            ...(StarsData.SOLAR_SYSTEM_METADATA[body.id] || {}),
            ...body,
            isSolarSystem: true
          }))
        : [];

      // Real-time Spacecraft: local orbital craft only appear around their host planet;
      // deep-space Lagrange / interstellar craft remain visible across the Solar System.
      let spacecraftList = [];
      const isEarthHost = planetCfg.localSpacecraftHost === 'earth';
      if (Astronomy.getSpacecraftPositions && StarsData.SPACECRAFT_METADATA) {
        const crafts = Astronomy.getSpacecraftPositions(currentDate, observerLat, observerLon, solarData);
        spacecraftList = crafts
          .filter(c => {
            const isDeepSpace = c.craftType === 'lagrange_telescope' || c.craftType === 'interstellar_probe';
            if (isDeepSpace) return true;
            const craftHost = c.hostPlanet || 'earth';
            return craftHost === planetCfg.localSpacecraftHost;
          })
          .map(c => ({
            ...(StarsData.SPACECRAFT_METADATA[c.id] || {}),
            ...c,
            isSpacecraft: true,
            isISS: c.id === 'iss'
          }));
      } else if (isEarthHost && Astronomy.getISSPosition && StarsData.ISS_METADATA) {
        const issData = Astronomy.getISSPosition(currentDate, observerLat, observerLon);
        if (issData) spacecraftList = [{ ...StarsData.ISS_METADATA, ...issData, isISS: true, isSpacecraft: true }];
      }

      const allBodies = [...spacecraftList, ...solarList, ...StarsData.STARS];
      for (const star of allBodies) this.syncCachedCoords(star, currentDate, observerLat, observerLon);
      this.currentBodies = allBodies;
      this._bodiesGen = gen;
      return allBodies;
    }

    /** Refresh obj.cachedAzimuth / obj.cachedAltitude (apparent) from the memoized transform */
    syncCachedCoords(obj, date, lat, lon) {
      this.horizontalOf(obj, date, lat, lon);
      obj.cachedAzimuth = obj._hAz;
      obj.cachedAltitude = obj._hAltApp;
    }

    /**
     * Render a single 60fps frame
     */
    render(currentDate, observerLat, observerLon) {
      const ctx = this.ctx;
      const width = this.width;
      const height = this.height;
      const time = performance.now() * 0.001;

      // 1. Clear or render background
      if (this.isAR) {
        ctx.clearRect(0, 0, width, height);
        if (this.gl) this.clearWebGLMilkyWay();
      } else if (this.gl && this.mwTextureLoaded && this.layers.milky_way) {
        // Photorealistic WebGL Milky Way canvas is active underneath
        ctx.clearRect(0, 0, width, height);
        this.renderWebGLMilkyWay(currentDate, observerLat, observerLon);
        // Ground / Horizon shading if looking downward
        this.renderGroundHaze(observerLat, observerLon, currentDate);
      } else {
        if (this.gl) this.clearWebGLMilkyWay();
        // Celestial night sky background (cached per canvas size)
        if (!this._skyGrad) {
          const grad = ctx.createRadialGradient(
            width * 0.5, height * 0.4, 40,
            width * 0.5, height * 0.5, Math.max(width, height) * 0.8
          );
          grad.addColorStop(0, '#0c142b');
          grad.addColorStop(0.5, '#070b18');
          grad.addColorStop(1, '#03050c');
          this._skyGrad = grad;
        }
        ctx.fillStyle = this._skyGrad;
        ctx.fillRect(0, 0, width, height);

        // Ground / Horizon shading if looking downward
        this.renderGroundHaze(observerLat, observerLon, currentDate);
      }

      // 2. Horizontal (Az, Alt) coordinates for all prominent stars & Solar System bodies
      //    (cached until date/location change); only the screen projection runs every frame.
      const prominentCoords = new Map();
      let closestCenterDist = 999;
      let centerLockedStar = null;

      const allBodies = this.getBodies(currentDate, observerLat, observerLon);
      this.lastCurrentDate = currentDate;
      this.lastObserverLat = observerLat;
      this.lastObserverLon = observerLon;

      const camBasis = Astronomy.getCameraBasis
        ? Astronomy.getCameraBasis(this.cameraAzimuth, this.cameraAltitude, this.cameraRoll, this.fov, width, height)
        : null;

      for (const star of allBodies) {
        const azimuth = star.cachedAzimuth;
        const apparentAlt = star.cachedAltitude;

        const proj = (camBasis && Astronomy.projectVectorToScreen)
          ? Astronomy.projectVectorToScreen(star._hx, star._hy, star._hz, camBasis, true)
          : Astronomy.projectToScreen(
              azimuth, apparentAlt,
              this.cameraAzimuth, this.cameraAltitude, this.cameraRoll,
              this.fov, width, height
            );

        prominentCoords.set(star.id, {
          star,
          azimuth,
          altitude: apparentAlt,
          proj
        });

        // Check if star falls within center reticle lock circle (ONLY if its layer is visible)
        if (proj.visible && proj.camZ > 0 && this.isBodyLayerVisible(star)) {
          if (proj.angularDistanceDeg < closestCenterDist && proj.angularDistanceDeg <= this.lockThresholdDeg) {
            closestCenterDist = proj.angularDistanceDeg;
            centerLockedStar = star;
          }
        }
      }

      this.lockedStar = centerLockedStar;

      // 3. Render Coordinate Grid (Horizon & Alt/Az circles)
      if (this.showGrid && this.layers.horizon_grid) {
        this.renderCoordinateGrid(width, height);
      }

      // 4. Render Milky Way (银河) luminous galactic stream & dust clouds
      if (this.layers.milky_way) {
        if (this.gl && this.mwTextureLoaded) {
          this.renderMilkyWayLabels(currentDate, observerLat, observerLon, width, height, prominentCoords);
        } else {
          this.renderMilkyWay(currentDate, observerLat, observerLon, width, height);
        }
      }

      // 5. Render Constellation Lines
      if (this.showConstellations && this.layers.constellations) {
        this.renderConstellations(prominentCoords);
      }

      // 5. Render Background Stars
      if (this.layers.stars) {
        this.renderBackgroundStars(currentDate, observerLat, observerLon, width, height, time);
      }

      // 6. Render Prominent Stars, Planets, Spacecraft & Labels
      this.renderProminentStars(prominentCoords, width, height, time);

      // 7. Render Cardinal Horizon Compass Markers (N, E, S, W)
      if (this.layers.horizon_grid) {
        this.renderCardinalCompass(width, height);
      }

      // 8. Render Center Reticle
      this.renderReticle(width, height, !!this.lockedStar, time);

      // 9. Render Aiming Vector Guide if target active (including synthetic celestial event radiants)
      if (this.aimingTargetStar) {
        let targetItem = prominentCoords.get(this.aimingTargetStar.id);
        if (!targetItem && this.aimingTargetStar.cachedAzimuth !== undefined && this.aimingTargetStar.cachedAltitude !== undefined) {
          targetItem = {
            star: this.aimingTargetStar,
            proj: Astronomy.projectToScreen(
              this.aimingTargetStar.cachedAzimuth, this.aimingTargetStar.cachedAltitude,
              this.cameraAzimuth, this.cameraAltitude, this.cameraRoll,
              this.fov, width, height
            )
          };
        }
        this.renderAimingGuide(targetItem, width, height);
      }

      return {
        lockedStar: this.lockedStar
      };
    }

    /**
     * Subtle ground haze below horizon
     */
    renderGroundHaze() {
      // Horizon line altitude = 0°
      const projH = Astronomy.projectToScreen(
        this.cameraAzimuth, 0,
        this.cameraAzimuth, this.cameraAltitude, this.cameraRoll,
        this.fov, this.width, this.height
      );

      let startY = null;
      if (projH.camZ > 0.05 && projH.y < this.height) {
        startY = Math.max(0, projH.y);
      } else if (this.cameraAltitude < 0) {
        // Looking deep below horizon (horizon is above top of viewport)
        startY = 0;
      }

      if (startY !== null) {
        const ctx = this.ctx;
        const hazeGrad = ctx.createLinearGradient(0, startY, 0, this.height);
        const cfg = this.getObserverPlanetConfig();
        const haze = (cfg && cfg.horizonHaze) || {
          topLookingDown: 'rgba(3, 6, 12, 0.65)',
          topNormal: 'rgba(4, 8, 16, 0.45)',
          bottom: 'rgba(2, 4, 8, 0.85)'
        };
        hazeGrad.addColorStop(0, startY === 0 ? haze.topLookingDown : haze.topNormal);
        hazeGrad.addColorStop(1, haze.bottom);
        ctx.fillStyle = hazeGrad;
        ctx.fillRect(0, startY, this.width, this.height - startY);
      }
    }

    /**
     * Initialize WebGL Shader Program, Vertex Buffers & Photorealistic Texture
     */
    initWebGLMilkyWay() {
      const gl = this.gl;
      if (!gl) return;

      const vsSource = `
        attribute vec2 a_pos;
        varying vec2 v_uv;
        void main() {
          v_uv = a_pos * 0.5 + 0.5;
          gl_Position = vec4(a_pos, 0.0, 1.0);
        }
      `;

      const fsSource = `
        precision mediump float;
        varying vec2 v_uv;
        uniform mat3 u_camToEq;
        uniform vec2 u_resolution;
        uniform float u_tanHalfFov;
        uniform float u_brightness;
        uniform float u_nightMode;
        uniform sampler2D u_texture;

        const float PI = 3.141592653589793;
        const float TWO_PI = 6.283185307179586;
        const float RA0 = 4.64955712731386; // 17.76h * 15° * PI / 180 (Galactic Center)

        void main() {
          float minDim = min(u_resolution.x, u_resolution.y);
          vec2 ndc = (v_uv - 0.5) * 2.0;
          float cx = ndc.x * (u_resolution.x / minDim) * u_tanHalfFov;
          float cy = ndc.y * (u_resolution.y / minDim) * u_tanHalfFov;
          vec3 rayCam = vec3(cx, cy, 1.0);

          vec3 rayEq = normalize(u_camToEq * rayCam);

          float dec = asin(clamp(rayEq.z, -1.0, 1.0));
          float alpha = atan(rayEq.y, rayEq.x);
          if (alpha < 0.0) {
            alpha += TWO_PI;
          }

          float u = fract(0.5 + (RA0 - alpha) / TWO_PI);
          float v = 0.5 - dec / PI;

          vec4 texColor = texture2D(u_texture, vec2(u, v));

          // Astrophotography radiance & subtle contrast curve for Baade's Window and cosmic dust
          vec3 rgb = texColor.rgb;
          vec3 color = pow(rgb, vec3(1.1)) * (u_brightness * 1.45);

          // Scotopic dark-sky red night mode
          if (u_nightMode > 0.5) {
            float lum = dot(color, vec3(0.299, 0.587, 0.114));
            color = vec3(lum * 1.4, lum * 0.16, lum * 0.16);
          }

          // Cosmic alpha: void fades smoothly so background sky is visible
          float maxC = max(color.r, max(color.g, color.b));
          float alphaOut = clamp(maxC * 1.5, 0.0, 1.0);

          gl_FragColor = vec4(color * alphaOut, alphaOut);
        }
      `;

      function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          console.warn('Shader compile failed:', gl.getShaderInfoLog(shader));
          gl.deleteShader(shader);
          return null;
        }
        return shader;
      }

      const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
      const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
      if (!vs || !fs) return;

      const program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.warn('Program link failed:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return;
      }
      this.mwProgram = program;
      this.mwCamToEq = new Float32Array(9);

      // Fall back cleanly to the 2D Milky Way if the GPU context is lost
      if (this.mwCanvas && typeof this.mwCanvas.addEventListener === 'function') {
        this.mwCanvas.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          this.mwTextureLoaded = false;
          this.gl = null;
        });
      }

      // Full-screen quad buffer
      const quadBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
      const vertices = new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
         1.0,  1.0
      ]);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
      this.mwQuadBuffer = quadBuffer;

      // Uniform Locations
      this.mwUniforms = {
        camToEq: gl.getUniformLocation(program, 'u_camToEq'),
        resolution: gl.getUniformLocation(program, 'u_resolution'),
        tanHalfFov: gl.getUniformLocation(program, 'u_tanHalfFov'),
        brightness: gl.getUniformLocation(program, 'u_brightness'),
        nightMode: gl.getUniformLocation(program, 'u_nightMode'),
        texture: gl.getUniformLocation(program, 'u_texture'),
        posAttr: gl.getAttribLocation(program, 'a_pos')
      };

      // Create WebGL Texture
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      // 1x1 dark placeholder pixel until image loads
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([5, 8, 16, 255]));
      this.mwTexture = texture;

      // Load image
      if (typeof Image !== 'undefined') {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (!this.gl) return;
          gl.bindTexture(gl.TEXTURE_2D, this.mwTexture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          this.mwTextureLoaded = true;
        };
        img.onerror = (e) => {
          console.warn('[SkyRenderer] Failed to load Milky Way texture:', e);
        };
        img.src = this.mwSrc;
      }
    }

    /**
     * Render the Photorealistic 2K Astrophotography Milky Way in WebGL
     */
    renderWebGLMilkyWay(currentDate, observerLat, observerLon) {
      const gl = this.gl;
      if (!gl || !this.mwProgram || !this.mwTextureLoaded) return;

      gl.viewport(0, 0, this.mwCanvas.width, this.mwCanvas.height);
      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(this.mwProgram);

      // Reuse cached camera basis vectors in Horizontal frame (East, North, Zenith)
      const basis = Astronomy.getCameraBasis(
        this.cameraAzimuth, this.cameraAltitude, this.cameraRoll,
        this.fov, this.width, this.height
      );
      const rFinX = basis.rFinalX, rFinY = basis.rFinalY, rFinZ = basis.rFinalZ;
      const uFinX = basis.uFinalX, uFinY = basis.uFinalY, uFinZ = basis.uFinalZ;
      const fx = basis.fx, fy = basis.fy, fz = basis.fz;

      // Horiz to J2000 Equatorial matrix for the active observer planet (Earth, Mars, etc.)
      const horizBasis = Astronomy.getHorizontalBasis(observerLat, observerLon, currentDate, this.observerPlanet);
      const E = horizBasis.East;
      const N = horizBasis.North;
      const Z = horizBasis.Zenith;

      const camToEq = this.mwCamToEq;
      camToEq[0] = E[0] * rFinX + N[0] * rFinY + Z[0] * rFinZ;
      camToEq[1] = E[1] * rFinX + N[1] * rFinY + Z[1] * rFinZ;
      camToEq[2] = E[2] * rFinX + N[2] * rFinY + Z[2] * rFinZ;
      camToEq[3] = E[0] * uFinX + N[0] * uFinY + Z[0] * uFinZ;
      camToEq[4] = E[1] * uFinX + N[1] * uFinY + Z[1] * uFinZ;
      camToEq[5] = E[2] * uFinX + N[2] * uFinY + Z[2] * uFinZ;
      camToEq[6] = E[0] * fx    + N[0] * fy    + Z[0] * fz;
      camToEq[7] = E[1] * fx    + N[1] * fy    + Z[1] * fz;
      camToEq[8] = E[2] * fx    + N[2] * fy    + Z[2] * fz;

      const fovRad = Math.max(10, Math.min(120, this.fov)) * Math.PI / 180.0;
      const tanHalfFov = Math.tan(fovRad * 0.5);

      const skyFactor = this.ignoreAmbientLight
        ? 1.0
        : Math.max(0.65, Math.min(1.0, 0.65 + (this.limitingMagnitude - 3.2) * 0.1));

      const isNight = typeof document !== 'undefined' && document.body.classList.contains('night-mode');

      gl.uniformMatrix3fv(this.mwUniforms.camToEq, false, camToEq);
      gl.uniform2f(this.mwUniforms.resolution, this.mwCanvas.width, this.mwCanvas.height);
      gl.uniform1f(this.mwUniforms.tanHalfFov, tanHalfFov);
      gl.uniform1f(this.mwUniforms.brightness, 1.25 * skyFactor);
      gl.uniform1f(this.mwUniforms.nightMode, isNight ? 1.0 : 0.0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.mwTexture);
      gl.uniform1i(this.mwUniforms.texture, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.mwQuadBuffer);
      gl.enableVertexAttribArray(this.mwUniforms.posAttr);
      gl.vertexAttribPointer(this.mwUniforms.posAttr, 2, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    clearWebGLMilkyWay() {
      const gl = this.gl;
      if (!gl || !this.mwCanvas) return;
      gl.viewport(0, 0, this.mwCanvas.width, this.mwCanvas.height);
      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }

    /**
     * In-stream bilingual celestial labeling along the Milky Way stream
     */
    renderMilkyWayLabels(currentDate, observerLat, observerLon, width, height, prominentCoords) {
      if (this.isAR) return;

      const waypoints = StarsData.MILKY_WAY_WAYPOINTS;
      if (!waypoints || waypoints.length === 0) return;

      const ctx = this.ctx;
      const isNight = typeof document !== 'undefined' && document.body.classList.contains('night-mode');

      // 1. Project all waypoints
      const projected = waypoints.map((wp) => {
        this.horizontalOf(wp, currentDate, observerLat, observerLon);
        const proj = Astronomy.projectToScreen(
          wp._hAz, wp._hAlt,
          this.cameraAzimuth, this.cameraAltitude, this.cameraRoll,
          this.fov, width, height
        );
        return { wp, proj };
      });

      // 2. Bilingual stream label (Astrophotography watermark)
      const centerX = width * 0.5;
      const centerY = height * 0.5;
      let bestItem = null;
      let bestDist = Infinity;
      let bestIdx = -1;

      for (let k = 1; k < projected.length - 1; k++) {
        const item = projected[k];
        if (item.proj.camZ > 0.2 &&
            item.proj.x > width * 0.15 && item.proj.x < width * 0.85 &&
            item.proj.y > height * 0.15 && item.proj.y < height * 0.85) {
          const dist = Math.hypot(item.proj.x - centerX, item.proj.y - centerY);
          let starDist = 999;
          if (prominentCoords) {
            for (const coord of prominentCoords.values()) {
              const sp = coord.proj;
              if (!sp || !sp.visible || sp.camZ <= 0) continue;
              const d = Math.hypot(item.proj.x - sp.x, item.proj.y - sp.y);
              if (d < starDist) starDist = d;
            }
          }
          if (dist >= 100 && dist <= 280 && starDist >= 65 && dist < bestDist) {
            bestDist = dist;
            bestItem = item;
            bestIdx = k;
          }
        }
      }

      if (!bestItem) {
        for (let k = 1; k < projected.length - 1; k++) {
          const item = projected[k];
          if (item.proj.camZ > 0.2) {
            const dist = Math.hypot(item.proj.x - centerX, item.proj.y - centerY);
            if (dist >= 80 && dist < bestDist) {
              bestDist = dist;
              bestItem = item;
              bestIdx = k;
            }
          }
        }
      }

      if (bestItem && bestIdx > 0 && bestIdx < projected.length - 1) {
        const prev = projected[bestIdx - 1].proj;
        const next = projected[bestIdx + 1].proj;
        const dx = next.x - prev.x;
        const dy = next.y - prev.y;
        let angle = Math.atan2(dy, dx);
        if (angle > Math.PI * 0.5) angle -= Math.PI;
        else if (angle < -Math.PI * 0.5) angle += Math.PI;

        ctx.save();
        ctx.translate(bestItem.proj.x, bestItem.proj.y);
        ctx.rotate(angle);
        ctx.font = '600 11px ' + (this.language === 'zh' ? 'sans-serif' : '-apple-system, sans-serif');
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isNight ? 'rgba(255, 140, 140, 0.85)' : 'rgba(220, 240, 255, 0.88)';
        ctx.shadowColor = isNight ? 'rgba(255, 0, 0, 0.6)' : 'rgba(56, 189, 248, 0.6)';
        ctx.shadowBlur = 8;
        const labelText = this.language === 'zh' ? '✦ 银河 (Milky Way)' : '✦ Milky Way (银河)';
        const textOffset = 46;
        ctx.strokeStyle = isNight ? 'rgba(20, 0, 0, 0.85)' : 'rgba(5, 10, 25, 0.85)';
        ctx.lineWidth = 2.4;
        if (ctx.strokeText) ctx.strokeText(labelText, 0, -textOffset);
        ctx.fillText(labelText, 0, -textOffset);
        ctx.restore();
      }

      // 3. Galactic Center label if in view
      for (const item of projected) {
        if (!item.proj.visible || item.proj.camZ <= 0.15) continue;
        const wp = item.wp;
        if (wp.isCore && wp.labelEn && item.proj.inFov) {
          ctx.save();
          ctx.font = '600 11px ' + this.bodyFontFamily();
          ctx.fillStyle = isNight ? 'rgba(255, 170, 170, 0.88)' : 'rgba(255, 235, 205, 0.94)';
          ctx.textAlign = 'center';
          ctx.shadowColor = isNight ? 'rgba(255, 0, 0, 0.7)' : 'rgba(251, 191, 36, 0.6)';
          ctx.shadowBlur = 6;
          const labelText = this.language === 'zh' ? wp.labelZh : wp.labelEn;
          const labelDistY = 32;
          ctx.strokeStyle = isNight ? 'rgba(20, 0, 0, 0.85)' : 'rgba(5, 10, 25, 0.85)';
          ctx.lineWidth = 2.4;
          if (ctx.strokeText) ctx.strokeText(`✦ ${labelText}`, item.proj.x, item.proj.y + labelDistY);
          ctx.fillText(`✦ ${labelText}`, item.proj.x, item.proj.y + labelDistY);
          ctx.restore();
        }
      }
    }

    /**
     * Render the Milky Way (银河) luminous galactic stream and dust clouds
     */
    renderMilkyWay(currentDate, observerLat, observerLon, width, height) {
      if (this.isAR) return; // In AR mode, keep canvas transparent for real camera feed

      const waypoints = StarsData.MILKY_WAY_WAYPOINTS;
      if (!waypoints || waypoints.length === 0) return;

      const ctx = this.ctx;
      const isNight = document.body.classList.contains('night-mode');

      // 1. Project all waypoints to current horizontal and screen coordinates
      const projected = waypoints.map((wp) => {
        this.horizontalOf(wp, currentDate, observerLat, observerLon);
        const proj = Astronomy.projectToScreen(
          wp._hAz, wp._hAlt,
          this.cameraAzimuth, this.cameraAltitude, this.cameraRoll,
          this.fov, width, height
        );
        return {
          wp,
          azimuth: wp._hAz,
          altitude: wp._hAlt,
          proj
        };
      });

      // 2. Light pollution attenuation factor (maintains rich photographic floor or 1.0 when ignoring ambient)
      const skyFactor = this.ignoreAmbientLight
        ? 1.0
        : Math.max(0.78, Math.min(1.0, 0.78 + (this.limitingMagnitude - 3.2) * 0.067));

      // 3. Trace continuous chains of visible points in front of camera (camZ > 0.08)
      // Grouping into continuous polylines and stroking once eliminates all vertex circular bubbles
      const N = projected.length;
      const chains = [];
      let currentChain = [];

      for (let i = 0; i < N; i++) {
        const p = projected[i];
        if (p.proj.camZ > 0.08) {
          currentChain.push(p);
        } else {
          if (currentChain.length > 1) {
            chains.push(currentChain);
          }
          currentChain = [];
        }
      }
      if (currentChain.length > 1) {
        if (chains.length > 0 && projected[0].proj.camZ > 0.08 && projected[N - 1].proj.camZ > 0.08) {
          chains[0] = currentChain.concat(chains[0]);
        } else {
          chains.push(currentChain);
        }
      }

      ctx.save();

      // Authentic astrophotography color temperature by galactic region (RA)
      function getAstrophotoPalette(ra, isNightMode) {
        if (isNightMode) {
          return {
            halo: '255, 30, 30',
            cloud: '255, 60, 50',
            spine: '255, 110, 80',
            dust: '4, 0, 0',
            hAlpha: '255, 70, 70'
          };
        }
        // Sagittarius & Scorpius Galactic Bulge / Core (Warm golden-peach stellar luminescence)
        if ((ra >= 16.2 && ra <= 18.5) || (ra >= 15.5 && ra < 16.2)) {
          return {
            halo: '240, 185, 125',
            cloud: '255, 215, 145',
            spine: '255, 238, 185',
            dust: '2, 3, 10',
            hAlpha: '255, 130, 160'
          };
        }
        // Scutum Star Cloud (Luminous ivory-cream diamond cloud)
        if (ra > 18.5 && ra <= 19.3) {
          return {
            halo: '225, 225, 245',
            cloud: '255, 245, 220',
            spine: '255, 255, 240',
            dust: '2, 4, 12',
            hAlpha: '255, 140, 175'
          };
        }
        // Cygnus Cloud & North America Nebula (Silvery blue-white with faint H-alpha crimson/magenta warmth)
        if (ra >= 20.0 && ra <= 21.8) {
          return {
            halo: '180, 205, 255',
            cloud: '215, 228, 255',
            spine: '240, 245, 255',
            dust: '3, 5, 14',
            hAlpha: '255, 145, 185'
          };
        }
        // Carina Nebula & Southern Cross (Vibrant turquoise & rose Southern jewel)
        if (ra >= 10.5 && ra <= 13.0) {
          return {
            halo: '165, 220, 255',
            cloud: '205, 235, 255',
            spine: '235, 250, 255',
            dust: '2, 3, 10',
            hAlpha: '255, 130, 175'
          };
        }
        // Cassiopeia, Perseus & Auriga (Soft crystalline pale-blue stardust)
        if (ra >= 22.0 || ra <= 5.0) {
          return {
            halo: '160, 195, 245',
            cloud: '195, 220, 255',
            spine: '230, 242, 255',
            dust: '3, 5, 12',
            hAlpha: '240, 150, 180'
          };
        }
        // Anticenter / Monoceros / Puppis (Delicate cool cosmic dust)
        return {
          halo: '150, 180, 235',
          cloud: '185, 210, 250',
          spine: '220, 235, 255',
          dust: '3, 4, 11',
          hAlpha: '235, 140, 170'
        };
      }

      chains.forEach((chain) => {
        if (chain.length < 2) return;

        let totalW = 0, totalI = 0;
        chain.forEach((item) => {
          totalW += item.wp.width;
          totalI += item.wp.intensity;
        });
        const avgWidthDeg = totalW / chain.length;
        const avgIntensity = (totalI / chain.length) * skyFactor;
        const baseWidthPx = (avgWidthDeg / this.fov) * width;

        // Pass A & B: Multi-tier Volumetric Gaussian Star Cloud Puffs (Billowing astrophotography clouds)
        // Eliminates artificial stepped boundary strokes by relying purely on continuous Gaussian radial gradients
        for (let k = 0; k < chain.length - 1; k++) {
          const p1 = chain[k].proj;
          const p2 = chain[k + 1].proj;
          const wp1 = chain[k].wp;
          const wp2 = chain[k + 1].wp;

          const segDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
          const steps = Math.max(4, Math.min(10, Math.round(segDist / 14)));

          // Check if segment is in the Great Rift zone (Cygnus to Sagittarius, RA 17.0 - 21.6)
          const isGreatRift = (wp1.ra >= 17.0 && wp1.ra <= 21.6) || (wp2.ra >= 17.0 && wp2.ra <= 21.6);
          const isCoalsack = (wp1.ra >= 12.0 && wp1.ra <= 13.0);

          for (let s = 0; s <= steps; s++) {
            const t = s / steps;
            const mid12X = (p1.x + p2.x) * 0.5;
            const mid12Y = (p1.y + p2.y) * 0.5;
            const curX = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * mid12X + t * t * p2.x;
            const curY = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * mid12Y + t * t * p2.y;

            const curRa = wp1.ra + (wp2.ra - wp1.ra) * t;
            const curWidthDeg = wp1.width + (wp2.width - wp1.width) * t;
            const curIntensity = (wp1.intensity + (wp2.intensity - wp1.intensity) * t) * skyFactor;
            const localWidthPx = (curWidthDeg / this.fov) * width;

            const nextT = Math.min(1.0, t + 0.1);
            const nextX = (1 - nextT) * (1 - nextT) * p1.x + 2 * (1 - nextT) * nextT * mid12X + nextT * nextT * p2.x;
            const nextY = (1 - nextT) * (1 - nextT) * p1.y + 2 * (1 - nextT) * nextT * mid12Y + nextT * nextT * p2.y;
            const dx = nextX - curX;
            const dy = nextY - curY;
            const len = Math.hypot(dx, dy) || 1;
            const nx = -dy / len;
            const ny = dx / len;

            const colors = getAstrophotoPalette(curRa, isNight);

            // 1. Broad outer ambient luminescence (feathered cosmic haze fading smoothly to 0 with zero hard edges)
            const outerR = localWidthPx * 1.85;
            const outerGrad = ctx.createRadialGradient(curX, curY, 2, curX, curY, outerR);
            outerGrad.addColorStop(0, `rgba(${colors.halo}, ${0.13 * curIntensity})`);
            outerGrad.addColorStop(0.45, `rgba(${colors.halo}, ${0.05 * curIntensity})`);
            outerGrad.addColorStop(1, `rgba(${colors.halo}, 0)`);
            ctx.fillStyle = outerGrad;
            ctx.beginPath();
            ctx.arc(curX, curY, outerR, 0, Math.PI * 2);
            ctx.fill();

            if (isGreatRift && localWidthPx > 20) {
              // Classic Bifurcated Arms: Two parallel billowing star clouds with dark dust between them
              const armOffset = localWidthPx * 0.28;
              const puffR = localWidthPx * 0.72;

              // Arm 1 (Eastern / left branch)
              const g1 = ctx.createRadialGradient(curX + nx * armOffset, curY + ny * armOffset, 2, curX + nx * armOffset, curY + ny * armOffset, puffR);
              g1.addColorStop(0, `rgba(${colors.cloud}, ${0.24 * curIntensity})`);
              g1.addColorStop(0.4, `rgba(${colors.halo}, ${0.13 * curIntensity})`);
              g1.addColorStop(1, `rgba(${colors.halo}, 0)`);
              ctx.fillStyle = g1;
              ctx.beginPath();
              ctx.arc(curX + nx * armOffset, curY + ny * armOffset, puffR, 0, Math.PI * 2);
              ctx.fill();

              // Arm 2 (Western / right branch)
              const g2 = ctx.createRadialGradient(curX - nx * armOffset, curY - ny * armOffset, 2, curX - nx * armOffset, curY - ny * armOffset, puffR);
              g2.addColorStop(0, `rgba(${colors.cloud}, ${0.22 * curIntensity})`);
              g2.addColorStop(0.4, `rgba(${colors.halo}, ${0.12 * curIntensity})`);
              g2.addColorStop(1, `rgba(${colors.halo}, 0)`);
              ctx.fillStyle = g2;
              ctx.beginPath();
              ctx.arc(curX - nx * armOffset, curY - ny * armOffset, puffR, 0, Math.PI * 2);
              ctx.fill();

              // The Great Rift Dark Dust Lane (Absorption silhouette chasm)
              const dustR = localWidthPx * 0.38;
              const dustGrad = ctx.createRadialGradient(curX, curY, 1, curX, curY, dustR);
              dustGrad.addColorStop(0, `rgba(${colors.dust}, ${0.35 * curIntensity})`);
              dustGrad.addColorStop(0.65, `rgba(${colors.dust}, ${0.16 * curIntensity})`);
              dustGrad.addColorStop(1, `rgba(${colors.dust}, 0)`);
              ctx.fillStyle = dustGrad;
              ctx.beginPath();
              ctx.arc(curX, curY, dustR, 0, Math.PI * 2);
              ctx.fill();

            } else {
              // Volumetric Gaussian Star Cloud Puffs (Billowing astrophotography clouds)
              const puffR = localWidthPx * 1.05;
              const cloudGrad = ctx.createRadialGradient(curX, curY, 2, curX, curY, puffR);
              cloudGrad.addColorStop(0, `rgba(${colors.spine}, ${0.30 * curIntensity})`);
              cloudGrad.addColorStop(0.35, `rgba(${colors.cloud}, ${0.18 * curIntensity})`);
              cloudGrad.addColorStop(0.70, `rgba(${colors.halo}, ${0.07 * curIntensity})`);
              cloudGrad.addColorStop(1, `rgba(${colors.halo}, 0)`);

              ctx.fillStyle = cloudGrad;
              ctx.beginPath();
              ctx.arc(curX, curY, puffR, 0, Math.PI * 2);
              ctx.fill();

              // Inner luminous core spine filament
              const coreR = localWidthPx * 0.50;
              const coreGrad = ctx.createRadialGradient(curX, curY, 1, curX, curY, coreR);
              coreGrad.addColorStop(0, `rgba(${colors.spine}, ${0.26 * curIntensity})`);
              coreGrad.addColorStop(0.50, `rgba(${colors.cloud}, ${0.11 * curIntensity})`);
              coreGrad.addColorStop(1, `rgba(${colors.cloud}, 0)`);
              ctx.fillStyle = coreGrad;
              ctx.beginPath();
              ctx.arc(curX, curY, coreR, 0, Math.PI * 2);
              ctx.fill();

              // If Coalsack region, add dark ink-black absorption patch
              if (isCoalsack) {
                const coalR = localWidthPx * 0.45;
                const coalGrad = ctx.createRadialGradient(curX + nx * coalR * 0.4, curY + ny * coalR * 0.4, 2, curX + nx * coalR * 0.4, curY + ny * coalR * 0.4, coalR);
                coalGrad.addColorStop(0, `rgba(${colors.dust}, ${0.40 * curIntensity})`);
                coalGrad.addColorStop(0.7, `rgba(${colors.dust}, ${0.18 * curIntensity})`);
                coalGrad.addColorStop(1, `rgba(${colors.dust}, 0)`);
                ctx.fillStyle = coalGrad;
                ctx.beginPath();
                ctx.arc(curX + nx * coalR * 0.4, curY + ny * coalR * 0.4, coalR, 0, Math.PI * 2);
                ctx.fill();
              }
            }

            // H-alpha emission nebula knots (e.g. Lagoon M8 in Sagittarius, North America in Cygnus, Carina)
            if (wp1.isCloud || wp1.isCore) {
              const hR = localWidthPx * 0.45;
              const hGrad = ctx.createRadialGradient(curX, curY, 1, curX, curY, hR);
              hGrad.addColorStop(0, `rgba(${colors.hAlpha}, ${0.22 * curIntensity})`);
              hGrad.addColorStop(0.5, `rgba(${colors.hAlpha}, ${0.09 * curIntensity})`);
              hGrad.addColorStop(1, `rgba(${colors.hAlpha}, 0)`);
              ctx.fillStyle = hGrad;
              ctx.beginPath();
              ctx.arc(curX, curY, hR, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // Pass C: Micro-stardust particles along the galactic plane (unresolved stellar grain)
        if (chain.length >= 2) {
          for (let k = 0; k < chain.length; k++) {
            const item = chain[k];
            if (item.proj.camZ <= 0.12) continue;
            const colors = getAstrophotoPalette(item.wp.ra, isNight);
            const localWidthPx = (item.wp.width / this.fov) * width;
            const speckCount = Math.min(48, Math.max(18, Math.round(localWidthPx * 0.35)));

            // Compute local tangent (ux, uy) and normal (nx, ny) along galactic stream
            let tx = 0, ty = 0;
            if (k < chain.length - 1) {
              tx += chain[k + 1].proj.x - item.proj.x;
              ty += chain[k + 1].proj.y - item.proj.y;
            }
            if (k > 0) {
              tx += item.proj.x - chain[k - 1].proj.x;
              ty += item.proj.y - chain[k - 1].proj.y;
            }
            const tLen = Math.hypot(tx, ty) || 1;
            const ux = tx / tLen;
            const uy = ty / tLen;
            const nx = -uy;
            const ny = ux;

            for (let s = 0; s < speckCount; s++) {
              // Coprime high-frequency pseudo-random generator eliminates collinear comb artifacts
              const r1 = Math.abs(Math.sin(k * 7919.1 + s * 137.5 + item.wp.ra * 23.7)) % 1.0;
              const r2 = Math.abs(Math.sin(k * 4929.7 + s * 397.3 + item.wp.dec * 41.3)) % 1.0;
              const r3 = Math.abs(Math.sin(k * 1847.3 + s * 731.9 + (item.wp.ra + item.wp.dec) * 17.1)) % 1.0;

              // Gaussian-like lateral dispersion peaked at the core spine
              const latDisp = (r2 + r3 - 1.0) * localWidthPx * 0.85;
              const longDisp = (r1 - 0.5) * tLen;

              const speckX = item.proj.x + ux * longDisp + nx * latDisp;
              const speckY = item.proj.y + uy * longDisp + ny * latDisp;

              if (speckX >= 0 && speckX <= width && speckY >= 0 && speckY <= height) {
                const speckR = 0.45 + r3 * 1.15;
                const alpha = (0.24 + r3 * 0.48) * avgIntensity;
                const starColor = (r1 > 0.65) ? colors.spine : ((r2 > 0.45) ? colors.cloud : '255, 255, 255');
                ctx.fillStyle = `rgba(${starColor}, ${alpha})`;
                ctx.beginPath();
                ctx.arc(speckX, speckY, speckR, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }
        }

        // Pass D: Stream-aligned bilingual celestial labeling (Astrophotography watermark)
        let bestItem = null;
        let bestDistFromCenter = Infinity;
        let bestIdx = -1;
        const centerX = width * 0.5;
        const centerY = height * 0.5;

        // Prefer points with comfortable clearance from reticle (100px - 280px)
        for (let k = 1; k < chain.length - 1; k++) {
          const item = chain[k];
          if (item.proj.camZ > 0.2 &&
              item.proj.x > width * 0.15 && item.proj.x < width * 0.85 &&
              item.proj.y > height * 0.15 && item.proj.y < height * 0.85) {
            const dist = Math.hypot(item.proj.x - centerX, item.proj.y - centerY);
            if (dist >= 100 && dist <= 280 && dist < bestDistFromCenter) {
              bestDistFromCenter = dist;
              bestItem = item;
              bestIdx = k;
            }
          }
        }

        // Fallback if all points are within 100px or outside 280px
        if (!bestItem) {
          for (let k = 1; k < chain.length - 1; k++) {
            const item = chain[k];
            if (item.proj.camZ > 0.2) {
              const dist = Math.hypot(item.proj.x - centerX, item.proj.y - centerY);
              if (dist >= 80 && dist < bestDistFromCenter) {
                bestDistFromCenter = dist;
                bestItem = item;
                bestIdx = k;
              }
            }
          }
        }

        if (bestItem && bestIdx > 0 && bestIdx < chain.length - 1) {
          const prev = chain[bestIdx - 1].proj;
          const next = chain[bestIdx + 1].proj;
          const dx = next.x - prev.x;
          const dy = next.y - prev.y;
          let angle = Math.atan2(dy, dx);
          if (angle > Math.PI * 0.5) angle -= Math.PI;
          else if (angle < -Math.PI * 0.5) angle += Math.PI;

          ctx.save();
          ctx.translate(bestItem.proj.x, bestItem.proj.y);
          ctx.rotate(angle);
          ctx.font = '600 11px ' + (this.language === 'zh' ? 'sans-serif' : '-apple-system, sans-serif');
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = isNight ? 'rgba(255, 140, 140, 0.82)' : 'rgba(220, 240, 255, 0.88)';
          ctx.shadowColor = isNight ? 'rgba(255, 0, 0, 0.6)' : 'rgba(56, 189, 248, 0.6)';
          ctx.shadowBlur = 8;
          const labelText = this.language === 'zh' ? '✦ 银河 (Milky Way)' : '✦ Milky Way (银河)';
          const textOffset = Math.max(42, baseWidthPx * 0.65);
          ctx.strokeStyle = isNight ? 'rgba(20, 0, 0, 0.85)' : 'rgba(5, 10, 25, 0.85)';
          ctx.lineWidth = 2.4;
          if (ctx.strokeText) ctx.strokeText(labelText, 0, -textOffset);
          ctx.fillText(labelText, 0, -textOffset);
          ctx.restore();
        }
      });

      // 4. Grand Galactic Bulge (Sagittarius Core, Sgr A* region)
      for (const item of projected) {
        if (!item.proj.visible || item.proj.camZ <= 0.15) continue;
        const wp = item.wp;

        if (wp.isCore) {
          const coreRadius = (wp.width / this.fov) * width * 1.4;
          const cloudGrad = ctx.createRadialGradient(
            item.proj.x, item.proj.y, 2,
            item.proj.x, item.proj.y, Math.max(20, coreRadius)
          );

          if (isNight) {
            cloudGrad.addColorStop(0, `rgba(255, 150, 130, ${0.32 * wp.intensity * skyFactor})`);
            cloudGrad.addColorStop(0.35, `rgba(255, 90, 80, ${0.18 * wp.intensity * skyFactor})`);
            cloudGrad.addColorStop(0.7, `rgba(255, 40, 40, ${0.07 * wp.intensity * skyFactor})`);
            cloudGrad.addColorStop(1, 'rgba(255, 20, 20, 0)');
          } else {
            // Warm golden core bulge of classic astrophotography
            cloudGrad.addColorStop(0, `rgba(255, 238, 195, ${0.38 * wp.intensity * skyFactor})`);
            cloudGrad.addColorStop(0.28, `rgba(255, 210, 145, ${0.24 * wp.intensity * skyFactor})`);
            cloudGrad.addColorStop(0.60, `rgba(230, 175, 120, ${0.10 * wp.intensity * skyFactor})`);
            cloudGrad.addColorStop(1, 'rgba(170, 205, 255, 0)');
          }

          ctx.fillStyle = cloudGrad;
          ctx.beginPath();
          ctx.arc(item.proj.x, item.proj.y, Math.max(20, coreRadius), 0, Math.PI * 2);
          ctx.fill();

          // Dark dust silhouette across front of bulge (Pipe Nebula / Baade's Window)
          const darkR = coreRadius * 0.55;
          const darkGrad = ctx.createRadialGradient(
            item.proj.x - darkR * 0.35, item.proj.y + darkR * 0.2, 1,
            item.proj.x - darkR * 0.35, item.proj.y + darkR * 0.2, darkR
          );
          darkGrad.addColorStop(0, isNight ? 'rgba(5, 0, 0, 0.35)' : 'rgba(2, 3, 10, 0.35)');
          darkGrad.addColorStop(0.65, isNight ? 'rgba(5, 0, 0, 0.16)' : 'rgba(2, 3, 10, 0.16)');
          darkGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = darkGrad;
          ctx.beginPath();
          ctx.arc(item.proj.x - darkR * 0.35, item.proj.y + darkR * 0.2, darkR, 0, Math.PI * 2);
          ctx.fill();

          if (wp.labelEn && item.proj.inFov) {
            ctx.font = '600 11px ' + this.bodyFontFamily();
            ctx.fillStyle = isNight ? 'rgba(255, 170, 170, 0.85)' : 'rgba(255, 235, 205, 0.92)';
            ctx.textAlign = 'center';
            const labelText = this.language === 'zh' ? wp.labelZh : wp.labelEn;
            ctx.fillText(`✦ ${labelText}`, item.proj.x, item.proj.y + coreRadius * 0.5 + 14);
          }
        }
      }

      ctx.restore();
    }

    /**
     * Render Horizon, Altitude circles (30°, 60°), and Meridian lines
     */
    renderCoordinateGrid(width, height) {
      const ctx = this.ctx;
      ctx.save();
      ctx.lineWidth = 1;

      // Altitude Circles: 0° (Horizon), 30°, 60°
      const altLevels = [0, 30, 60];
      for (const alt of altLevels) {
        const isHorizon = alt === 0;
        ctx.strokeStyle = isHorizon ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = isHorizon ? 1.5 : 0.8;
        if (!isHorizon) ctx.setLineDash([4, 6]);

        ctx.beginPath();
        let first = true;
        for (let az = 0; az <= 360; az += 5) {
          const p = Astronomy.projectToScreen(
            az, alt,
            this.cameraAzimuth, this.cameraAltitude, this.cameraRoll,
            this.fov, width, height
          );
          if (p.visible && p.camZ > 0) {
            if (first) { ctx.moveTo(p.x, p.y); first = false; }
            else { ctx.lineTo(p.x, p.y); }
          } else {
            first = true;
          }
        }
        ctx.stroke();
      }

      ctx.restore();
    }

    /**
     * Render Constellation Lines and pointer asterisms
     */
    renderConstellations(coordsMap) {
      const ctx = this.ctx;
      ctx.save();
      ctx.lineWidth = 1.4;

      for (const constel of StarsData.CONSTELLATIONS) {
        const isAsterism = !!constel.isAsterism;
        ctx.strokeStyle = isAsterism ? 'rgba(252, 211, 77, 0.45)' : 'rgba(147, 197, 253, 0.4)';
        ctx.setLineDash(isAsterism ? [4, 4] : []);

        ctx.beginPath();
        let hasSegment = false;
        for (const [id1, id2] of constel.lines) {
          const item1 = coordsMap.get(id1);
          const item2 = coordsMap.get(id2);
          if (!item1 || !item2) continue;

          const p1 = item1.proj;
          const p2 = item2.proj;

          // If both stars are in front of camera
          if (p1.camZ > 0.1 && p2.camZ > 0.1) {
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            hasSegment = true;
          }
        }
        if (hasSegment) ctx.stroke();

        // Special Pointer Line (e.g. Merak -> Dubhe -> Polaris)
        if (constel.pointer) {
          const fromItem = coordsMap.get(constel.pointer.from);
          const toItem = coordsMap.get(constel.pointer.to);
          const targetItem = coordsMap.get(constel.pointer.target);

          if (fromItem && toItem && targetItem) {
            const pFrom = toItem.proj;
            const pTarget = targetItem.proj;
            if (pFrom.camZ > 0.1 && pTarget.camZ > 0.1) {
              ctx.save();
              ctx.strokeStyle = 'rgba(252, 211, 77, 0.6)';
              ctx.lineWidth = 1.2;
              ctx.setLineDash([2, 5]);
              ctx.beginPath();
              ctx.moveTo(pFrom.x, pFrom.y);
              ctx.lineTo(pTarget.x, pTarget.y);
              ctx.stroke();
              ctx.restore();
            }
          }
        }
      }

      ctx.restore();
    }

    /**
     * Render ambient background stars with subtle twinkle, batched by spectral color
     */
    renderBackgroundStars(date, lat, lon, width, height, time) {
      const bgStars = StarsData.BACKGROUND_STARS;
      if (!bgStars || bgStars.length === 0) return;

      // Group static background stars by color once so we issue ~6 ctx.fill() calls instead of ~900
      if (this._bgGroupsSrc !== bgStars || this._bgGroupsLen !== bgStars.length) {
        const map = new Map();
        for (let i = 0; i < bgStars.length; i++) {
          const s = bgStars[i];
          const col = s.color || '#ffffff';
          let bucket = map.get(col);
          if (!bucket) { bucket = []; map.set(col, bucket); }
          bucket.push(s);
        }
        this._bgColorGroups = [...map.entries()];
        this._bgGroupsSrc = bgStars;
        this._bgGroupsLen = bgStars.length;
      }

      const ctx = this.ctx;
      const TWO_PI = Math.PI * 2;
      const ignoreAmbient = !!this.ignoreAmbientLight;
      const limMag = this.limitingMagnitude;
      const basis = Astronomy.getCameraBasis
        ? Astronomy.getCameraBasis(this.cameraAzimuth, this.cameraAltitude, this.cameraRoll, this.fov, width, height)
        : null;
      const { fx, fy, fz, rFinalX, rFinalY, rFinalZ, uFinalX, uFinalY, uFinalZ, focalLength, centerX, centerY } = basis || {};
      const minX = -80, maxX = width + 80, minY = -80, maxY = height + 80;

      for (let g = 0; g < this._bgColorGroups.length; g++) {
        const [color, stars] = this._bgColorGroups[g];
        ctx.fillStyle = color;
        ctx.beginPath();
        let drawn = 0;

        for (let i = 0; i < stars.length; i++) {
          const bStar = stars[i];
          // Light pollution filtering: skip stars fainter than limiting magnitude (unless ignoring ambient)
          if (!ignoreAmbient && bStar.mag > limMag) continue;

          this.horizontalOf(bStar, date, lat, lon);

          let px, py;
          if (basis) {
            const vx = bStar._hx, vy = bStar._hy, vz = bStar._hz;
            const camZ = vx * fx + vy * fy + vz * fz;
            if (camZ <= 0.05) continue;
            const invZ = focalLength / camZ;
            px = centerX + (vx * rFinalX + vy * rFinalY + vz * rFinalZ) * invZ;
            if (px < minX || px > maxX) continue;
            py = centerY - (vx * uFinalX + vy * uFinalY + vz * uFinalZ) * invZ;
            if (py < minY || py > maxY) continue;
          } else {
            const p = Astronomy.projectToScreen(
              bStar._hAz, bStar._hAltApp,
              this.cameraAzimuth, this.cameraAltitude, this.cameraRoll,
              this.fov, width, height
            );
            if (!p.visible || p.camZ <= 0.05) continue;
            px = p.x; py = p.y;
          }

          // Twinkle factor
          const twinkle = 0.75 + 0.25 * Math.sin(time * bStar.twinkleSpeed + bStar.twinklePhase);
          const radius = Math.max(0.6, (5.8 - bStar.mag) * 0.45) * twinkle;

          ctx.moveTo(px + radius, py);
          ctx.arc(px, py, radius, 0, TWO_PI);
          drawn++;
        }

        if (drawn > 0) ctx.fill();
      }
    }

    /**
     * Compute the screen-space angle (radians, 0 = right, +PI/2 = down) pointing from the
     * Moon toward the Sun along the celestial great circle, so the Moon's sunlit limb always
     * faces the Sun accurately across Northern/Southern hemispheres, waxing/waning, and camera roll.
     */
    getMoonLitAngle(moonStar, moonProj, sunStar, width, height) {
      if (
        sunStar &&
        typeof moonStar._hx === 'number' &&
        typeof sunStar._hx === 'number' &&
        Astronomy.getCameraBasis &&
        Astronomy.projectVectorToScreen
      ) {
        const mx = moonStar._hx, my = moonStar._hy, mz = moonStar._hz;
        const sx = sunStar._hx, sy = sunStar._hy, sz = sunStar._hz;
        const dotSM = sx * mx + sy * my + sz * mz;
        const tx = sx - dotSM * mx;
        const ty = sy - dotSM * my;
        const tz = sz - dotSM * mz;
        const tLen = Math.hypot(tx, ty, tz);
        if (tLen > 1e-5) {
          const eps = 0.01;
          const basis = Astronomy.getCameraBasis(
            this.cameraAzimuth, this.cameraAltitude, this.cameraRoll,
            this.fov, width || this.width, height || this.height
          );
          const pSunDir = Astronomy.projectVectorToScreen(
            mx + (tx / tLen) * eps,
            my + (ty / tLen) * eps,
            mz + (tz / tLen) * eps,
            basis,
            false
          );
          const dx = pSunDir.x - moonProj.x;
          const dy = pSunDir.y - moonProj.y;
          if (Math.hypot(dx, dy) > 1e-4) {
            return Math.atan2(dy, dx);
          }
        }
      }
      // Fallback: Waxing = right (0) in Northern Hemisphere, left (PI) in Southern Hemisphere
      const cycle = (moonStar.moonPhase && typeof moonStar.moonPhase.phase === 'number')
        ? moonStar.moonPhase.phase
        : 0.25;
      const isWaning = cycle >= 0.5;
      const isSouth = typeof this._genLat === 'number' && this._genLat < 0;
      return (isWaning !== isSouth) ? Math.PI : 0;
    }

    /**
     * Render prominent stars, Sun, Moon, planets, glows, diffraction spikes, and labels
     */
    renderProminentStars(coordsMap, width, height, time) {
      const ctx = this.ctx;

      for (const [id, item] of coordsMap.entries()) {
        const star = item.star;
        const p = item.proj;
        if (!p.visible || p.camZ <= 0.05) continue;

        // Layer Visibility Filtering
        if (!this.isBodyLayerVisible(star)) continue;

        const isHovered = this.hoveredStar && this.hoveredStar.id === star.id;
        const isSelected = this.selectedStar && this.selectedStar.id === star.id;
        const isTarget = this.aimingTargetStar && this.aimingTargetStar.id === star.id;

        let baseRadius = 4.0;

        // Dedicated rendering for Sun, Moon, and Saturn
        if (star.id === 'sun') {
          // --- Sun: Golden Photosphere & Radiant Corona ---
          baseRadius = Math.max(12, 17 * (60.0 / this.fov));
          const coronaRadius = baseRadius * 3.6;

          const corona = ctx.createRadialGradient(p.x, p.y, baseRadius * 0.8, p.x, p.y, coronaRadius);
          corona.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
          corona.addColorStop(0.35, 'rgba(251, 191, 36, 0.45)');
          corona.addColorStop(0.7, 'rgba(245, 158, 11, 0.15)');
          corona.addColorStop(1, 'rgba(245, 158, 11, 0)');

          ctx.fillStyle = corona;
          ctx.beginPath();
          ctx.arc(p.x, p.y, coronaRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(p.x, p.y, baseRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, baseRadius * 0.65, 0, Math.PI * 2);
          ctx.fill();

        } else if (star.renderStyle === 'lunar_phase' || star.id === 'moon') {
          // --- Moon: Silver Disc with Physically Accurate Lunar Phase & Sun-Oriented Limb ---
          baseRadius = Math.max(10, 14 * (60.0 / this.fov));
          const phase = Math.max(0, Math.min(1, star.phase !== undefined ? star.phase : 0.5));
          const sunItem = coordsMap.get('sun');
          const litAngle = this.getMoonLitAngle(star, p, sunItem ? sunItem.star : null, width, height);

          const haloAlpha = 0.08 + 0.30 * phase;
          const halo = ctx.createRadialGradient(p.x, p.y, baseRadius, p.x, p.y, baseRadius * 2.8);
          halo.addColorStop(0, `rgba(248, 250, 252, ${haloAlpha.toFixed(2)})`);
          halo.addColorStop(1, 'rgba(248, 250, 252, 0)');
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(p.x, p.y, baseRadius * 2.8, 0, Math.PI * 2);
          ctx.fill();

          // Dark Earthshine base
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(p.x, p.y, baseRadius, 0, Math.PI * 2);
          ctx.fill();

          // Sunlit portion (rotated so +X points directly toward the Sun)
          if (phase > 0.01) {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(litAngle);
            ctx.beginPath();
            ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
            ctx.clip();

            ctx.fillStyle = '#f1f5f9';
            ctx.beginPath();
            if (phase >= 0.99) {
              // Full Moon: complete sunlit disc
              ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
            } else if (phase >= 0.5) {
              // Gibbous Moon: sunlit right semicircle + terminator bulging clockwise through left (-w, 0)
              ctx.arc(0, 0, baseRadius, -Math.PI / 2, Math.PI / 2, false);
              const w = baseRadius * (2 * phase - 1);
              if (w > 0.05) {
                ctx.ellipse(0, 0, w, baseRadius, 0, Math.PI / 2, -Math.PI / 2, false);
              }
            } else {
              // Crescent Moon: sunlit right semicircle carved counterclockwise through right (+w, 0)
              ctx.arc(0, 0, baseRadius, -Math.PI / 2, Math.PI / 2, false);
              const w = baseRadius * (1 - 2 * phase);
              if (w > 0.05) {
                ctx.ellipse(0, 0, w, baseRadius, 0, Math.PI / 2, -Math.PI / 2, true);
              }
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }

          ctx.strokeStyle = 'rgba(248, 250, 252, 0.55)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, baseRadius, 0, Math.PI * 2);
          ctx.stroke();

        } else if (star.hasRings || star.renderStyle === 'ringed_planet' || star.id === 'saturn') {
          // --- Ringed Planet (Saturn, Uranus, etc.) ---
          baseRadius = 5.5;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(-26 * Math.PI / 180);

          ctx.strokeStyle = 'rgba(254, 240, 138, 0.75)';
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.ellipse(0, 0, baseRadius * 2.7, baseRadius * 0.95, 0, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = star.color || '#fef08a';
          ctx.beginPath();
          ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

        } else if (star.renderStyle === 'earth' || star.id === 'earth') {
          // --- Earth: Radiant Sapphire "Pale Blue Dot" with Atmospheric Glow ---
          baseRadius = Math.max(6.0, 8.5 * (60.0 / this.fov));

          const halo = ctx.createRadialGradient(p.x, p.y, baseRadius * 0.7, p.x, p.y, baseRadius * 2.8);
          halo.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
          halo.addColorStop(0.5, 'rgba(14, 165, 233, 0.20)');
          halo.addColorStop(1, 'rgba(14, 165, 233, 0)');
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(p.x, p.y, baseRadius * 2.8, 0, Math.PI * 2);
          ctx.fill();

          // Earth Disc: Vibrant Blue Ocean
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.arc(p.x, p.y, baseRadius, 0, Math.PI * 2);
          ctx.fill();

          // Sunlit atmosphere swirl / crescent rim
          ctx.strokeStyle = 'rgba(240, 249, 255, 0.88)';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, baseRadius * 0.82, -Math.PI * 0.4, Math.PI * 0.4);
          ctx.stroke();

          ctx.fillStyle = '#bae6fd';
          ctx.beginPath();
          ctx.arc(p.x, p.y, baseRadius * 0.35, 0, Math.PI * 2);
          ctx.fill();

        } else if (star.renderStyle === 'cratered_moon' || star.id === 'phobos') {
          // --- Cratered Inner Moon (Phobos, Galilean/major moons, etc.) ---
          baseRadius = Math.max(4.5, 6.0 * (60.0 / this.fov));

          ctx.fillStyle = star.color || '#cbd5e1';
          ctx.beginPath();
          ctx.arc(p.x, p.y, baseRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
          ctx.beginPath();
          ctx.arc(p.x - baseRadius * 0.3, p.y - baseRadius * 0.2, baseRadius * 0.35, 0, Math.PI * 2);
          ctx.fill();

        } else if (star.renderStyle === 'pinpoint_moon' || star.id === 'deimos') {
          // --- Pinpoint Outer Moon (Deimos, distant planetary moons, etc.) ---
          baseRadius = Math.max(3.5, 4.5 * (60.0 / this.fov));

          ctx.fillStyle = star.color || '#f1f5f9';
          ctx.beginPath();
          ctx.arc(p.x, p.y, baseRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, baseRadius * 0.5, 0, Math.PI * 2);
          ctx.fill();

        } else if (star.isSpacecraft || star.isISS) {
          // --- Man-Made Spacecraft Rendering (ISS, Hubble, Tiangong, JWST, Voyager) ---
          baseRadius = 5.5;

          if (star.id === 'iss') {
            // 1. ISS: International Space Station (Dual amber solar wings + cyan strobe)
            const pulse = ((time * 0.55) % 1.0);
            ctx.beginPath();
            ctx.arc(p.x, p.y, baseRadius + pulse * 18, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(56, 189, 248, ${(1.0 - pulse) * 0.75})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.fillStyle = '#f59e0b';
            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 0.8;
            ctx.fillRect(-15, -4, 9, 8);
            ctx.strokeRect(-15, -4, 9, 8);
            ctx.fillRect(6, -4, 9, 8);
            ctx.strokeRect(6, -4, 9, 8);

            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(-6, 0);
            ctx.lineTo(6, 0);
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

          } else if (star.id === 'hubble') {
            // 2. Hubble Space Telescope (Silver barrel + blue wings + aperture door)
            const pulse = ((time * 0.5) % 1.0);
            ctx.beginPath();
            ctx.arc(p.x, p.y, baseRadius + pulse * 14, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(147, 197, 253, ${(1.0 - pulse) * 0.7})`;
            ctx.lineWidth = 1.0;
            ctx.stroke();

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(-12, -2, 6, 4);
            ctx.fillRect(6, -2, 6, 4);

            ctx.fillStyle = '#e2e8f0';
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 1;
            ctx.fillRect(-4, -6, 8, 12);
            ctx.strokeRect(-4, -6, 8, 12);

            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.ellipse(0, -6, 3.5, 1.5, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#60a5fa';
            ctx.beginPath();
            ctx.arc(0, 5, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

          } else if (star.id === 'tiangong') {
            // 3. Tiangong Space Station (T-shaped station with golden solar arrays)
            const pulse = ((time * 0.6) % 1.0);
            ctx.beginPath();
            ctx.arc(p.x, p.y, baseRadius + pulse * 16, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(248, 113, 113, ${(1.0 - pulse) * 0.7})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.fillStyle = '#f1f5f9';
            ctx.fillRect(-3, -7, 6, 14);
            ctx.fillRect(-8, -2, 16, 4);

            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(-14, -4, 5, 8);
            ctx.fillRect(9, -4, 5, 8);

            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(0, -6, 1.6, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

          } else if (star.id === 'jwst') {
            // 4. James Webb Space Telescope (Golden honeycomb hexagon + silver diamond sunshield)
            const pulse = ((time * 0.42) % 1.0);
            ctx.beginPath();
            ctx.arc(p.x, p.y, baseRadius + pulse * 20, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(251, 191, 36, ${(1.0 - pulse) * 0.75})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.fillStyle = 'rgba(226, 232, 240, 0.85)';
            ctx.beginPath();
            ctx.moveTo(0, -9);
            ctx.lineTo(8, 0);
            ctx.lineTo(0, 9);
            ctx.lineTo(-8, 0);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#f59e0b';
            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let a = 0; a < 6; a++) {
              const angle = (a * 60 - 30) * Math.PI / 180;
              const hx = Math.cos(angle) * 5.0;
              const hy = Math.sin(angle) * 5.0;
              if (a === 0) ctx.moveTo(hx, hy);
              else ctx.lineTo(hx, hy);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.arc(0, 0, 1.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

          } else if (star.id === 'voyager1' || star.id === 'voyager2') {
            // 5. Voyager 1 & 2 (Parabolic dish antenna & interstellar radio signal ripples)
            const colorHex = star.id === 'voyager1' ? '#a78bfa' : '#c084fc';
            const pulse = ((time * 0.35) % 1.0);

            for (let r = 0; r < 3; r++) {
              const phaseOffset = (pulse + r * 0.33) % 1.0;
              ctx.beginPath();
              ctx.arc(p.x, p.y, baseRadius + phaseOffset * 22, 0, Math.PI * 2);
              ctx.strokeStyle = `${colorHex}${Math.floor((1.0 - phaseOffset) * 200).toString(16).padStart(2, '0')}`;
              ctx.lineWidth = 1.0;
              ctx.stroke();
            }

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.fillStyle = '#f8fafc';
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(0, 0, 5.0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#cbd5e1';
            ctx.beginPath();
            ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#475569';
            ctx.beginPath();
            ctx.arc(0, 0, 1.3, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(3.5, 3.5);
            ctx.lineTo(8.5, 8.5);
            ctx.stroke();

            ctx.fillStyle = colorHex;
            ctx.beginPath();
            ctx.arc(8.5, 8.5, 1.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

          } else {
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fill();
          }

        } else {
          // --- Stars & Planets: Pogson Logarithmic Apparent Brightness Scaling ---
          const mag = star.mag;
          // Radius scales from ~8px (Venus, Sirius) to ~2.2px (faint stars)
          baseRadius = Math.max(2.2, Math.min(8.5, 5.8 - mag * 1.1));

          // 1. Outer Radial Glow (brighter objects cast larger halos)
          const glowMultiplier = mag < 0 ? 5.2 : (mag < 2 ? 4.0 : 3.0);
          const glowRadius = baseRadius * glowMultiplier;
          const starColor = (typeof star.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(star.color)) ? star.color : '#ffffff';
          const glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
          glowGrad.addColorStop(0, starColor);
          glowGrad.addColorStop(0.35, starColor + '66');
          glowGrad.addColorStop(1, starColor + '00');

          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
          ctx.fill();

          // 2. Core
          ctx.fillStyle = mag < 1.0 ? '#ffffff' : star.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, baseRadius * 0.8, 0, Math.PI * 2);
          ctx.fill();

          // 3. Diffraction spikes for super bright objects (Venus, Jupiter, Sirius, Vega)
          if (mag < 0.5) {
            const spikeLen = baseRadius * (mag < -2.0 ? 3.5 : 2.5);
            ctx.strokeStyle = (star.color || '#ffffff') + '77';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x - spikeLen, p.y);
            ctx.lineTo(p.x + spikeLen, p.y);
            ctx.moveTo(p.x, p.y - spikeLen);
            ctx.lineTo(p.x, p.y + spikeLen);
            ctx.stroke();
          }
        }

        // 4. Hover / Selection Ring
        if (isHovered || isSelected || isTarget) {
          const ringColor = isTarget ? '#fcd34d' : (isSelected ? '#10b981' : '#38bdf8');
          ctx.strokeStyle = ringColor;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, baseRadius + 7, 0, Math.PI * 2);
          ctx.stroke();
        }

        // 5. Star / Planet / Spacecraft Label (Toggled by this.layers.star_labels)
        if (this.layers.star_labels) {
          const name = this.language === 'zh' ? star.nameCn : star.name;
          ctx.font = '600 11px ' + (this.language === 'zh' ? 'sans-serif' : '-apple-system, sans-serif');
          ctx.fillStyle = isHovered || isSelected ? '#ffffff' : ((star.isSpacecraft || star.isISS) ? (star.color || '#38bdf8') : 'rgba(226, 232, 240, 0.85)');
          ctx.textAlign = 'left';
          ctx.fillText(name, p.x + baseRadius + 6, p.y + 4);

          // Constellation / Orbit badge under name
          if (baseRadius >= 4.0 || isHovered || isSelected || isTarget || star.isSpacecraft || star.isISS) {
            let metaDesc = '';
            if (star.isSpacecraft || star.isISS) {
              if (star.id === 'iss') {
                metaDesc = `${Math.round(star.rangeKm || 418)} km • LEO`;
              } else if (star.id === 'hubble') {
                metaDesc = `${Math.round(star.rangeKm || 525)} km • LEO 🔭`;
              } else if (star.id === 'tiangong') {
                metaDesc = `${Math.round(star.rangeKm || 390)} km • LEO 🏮`;
              } else if (star.id === 'jwst') {
                metaDesc = `1.5M km • Sun-Earth L2 ✨`;
              } else if (star.id === 'voyager1') {
                metaDesc = `24.5B km (163.5 AU) • Interstellar 🛸`;
              } else if (star.id === 'voyager2') {
                metaDesc = `20.4B km (136.2 AU) • Interstellar 🛸`;
              } else {
                metaDesc = `${Math.round(star.rangeKm || 0)} km`;
              }
            } else {
              metaDesc = this.language === 'zh' ? (star.constellationCn || '天体') : (star.constellation || 'Solar System');
            }

            ctx.font = '10px sans-serif';
            ctx.fillStyle = (star.isSpacecraft || star.isISS) ? (star.color || '#38bdf8') : 'rgba(148, 163, 184, 0.75)';
            ctx.fillText(metaDesc, p.x + baseRadius + 6, p.y + 16);
          }
        }
      }
    }

    /**
     * Render Cardinal Compass Points on the Horizon (N, NE, E, SE, S, SW, W, NW)
     */
    renderCardinalCompass(width, height) {
      const ctx = this.ctx;
      const points = [
        { deg: 0, en: 'N', zh: '北', isCardinal: true },
        { deg: 45, en: 'NE', zh: '东北' },
        { deg: 90, en: 'E', zh: '东', isCardinal: true },
        { deg: 135, en: 'SE', zh: '东南' },
        { deg: 180, en: 'S', zh: '南', isCardinal: true },
        { deg: 225, en: 'SW', zh: '西南' },
        { deg: 270, en: 'W', zh: '西', isCardinal: true },
        { deg: 315, en: 'NW', zh: '西北' }
      ];

      for (const pt of points) {
        const p = Astronomy.projectToScreen(
          pt.deg, 0,
          this.cameraAzimuth, this.cameraAltitude, this.cameraRoll,
          this.fov, width, height
        );

        if (!p.visible || p.camZ <= 0.05) continue;

        const label = this.language === 'zh' ? pt.zh : pt.en;
        const isCardinal = pt.isCardinal;

        // Horizon tick
        ctx.strokeStyle = isCardinal ? 'rgba(56, 189, 248, 0.8)' : 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = isCardinal ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - 6);
        ctx.lineTo(p.x, p.y + 6);
        ctx.stroke();

        // Compass Label Pill
        ctx.font = isCardinal ? '700 12px sans-serif' : '500 10px sans-serif';
        ctx.fillStyle = isCardinal ? '#38bdf8' : 'rgba(203, 213, 225, 0.75)';
        ctx.textAlign = 'center';
        ctx.fillText(label, p.x, p.y - 10);
      }
    }

    /**
     * Render Center Targeting Reticle (Crosshair)
     */
    renderReticle(width, height, isLocked, time) {
      const ctx = this.ctx;
      const cx = width * 0.5;
      const cy = height * 0.5;

      const reticleColor = isLocked ? '#10b981' : 'rgba(255, 255, 255, 0.45)';
      const pulse = isLocked ? Math.sin(time * 6.0) * 3 : 0;
      const radius = 38 + pulse;

      ctx.save();
      ctx.strokeStyle = reticleColor;
      ctx.lineWidth = isLocked ? 2.2 : 1.5;

      // Outer ring with subtle 4-gap segmentation
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Four corner corner brackets
      const bracketLen = 10;
      const crossGap = 16;
      const crossLen = 32;

      // Crosshairs with central gap
      ctx.beginPath();
      // Top
      ctx.moveTo(cx, cy - crossGap);
      ctx.lineTo(cx, cy - crossGap - crossLen);
      // Bottom
      ctx.moveTo(cx, cy + crossGap);
      ctx.lineTo(cx, cy + crossGap + crossLen);
      // Left
      ctx.moveTo(cx - crossGap, cy);
      ctx.lineTo(cx - crossGap - crossLen, cy);
      // Right
      ctx.moveTo(cx + crossGap, cy);
      ctx.lineTo(cx + crossGap + crossLen, cy);
      ctx.stroke();

      // Center dot
      if (isLocked) {
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    /**
     * Render Aiming Guide Pointer towards target star
     */
    renderAimingGuide(targetItem, width, height) {
      if (!targetItem) return;
      const ctx = this.ctx;
      const cx = width * 0.5;
      const cy = height * 0.5;
      const p = targetItem.proj;

      ctx.save();
      if (p.visible && p.camZ > 0) {
        // Star is on screen: draw glowing dotted laser line from center to star
        ctx.strokeStyle = 'rgba(252, 211, 77, 0.6)';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      ctx.restore();
    }

    setLayer(layerKey, enabled) {
      if (this.layers.hasOwnProperty(layerKey)) {
        this.layers[layerKey] = !!enabled;
        try {
          localStorage.setItem('starfinder_layers', JSON.stringify(this.layers));
        } catch (e) {}
      }
    }

    setAllLayers(layerMap) {
      if (layerMap && typeof layerMap === 'object') {
        Object.assign(this.layers, layerMap);
        try {
          localStorage.setItem('starfinder_layers', JSON.stringify(this.layers));
        } catch (e) {}
      }
    }

    /**
     * Determines whether a celestial body's layer is actively enabled and visible
     * under the current limiting magnitude
     */
    isBodyLayerVisible(star) {
      if (!star) return false;
      if (star.isSolarSystem) {
        return !!this.layers.solar_system;
      }
      if (star.isSpacecraft || star.isISS) {
        if (!this.layers.spacecraft) return false;
        const isLeo = star.craftType === 'leo_station' || star.craftType === 'leo_telescope';
        const isDeep = star.craftType === 'lagrange_telescope' || star.craftType === 'interstellar_probe';
        if (isLeo && !this.layers.spacecraft_leo) return false;
        if (isDeep && !this.layers.spacecraft_deep) return false;
        return true;
      }
      // Prominent star / Stellar body
      if (!this.layers.stars) return false;
      if (!this.ignoreAmbientLight && star.mag !== undefined && star.mag > this.limitingMagnitude) return false;
      return true;
    }

    /**
     * Sets whether to ignore ambient environment & city light
     */
    setIgnoreAmbientLight(enabled) {
      this.ignoreAmbientLight = !!enabled;
      try {
        localStorage.setItem('starfinder_ignore_ambient', this.ignoreAmbientLight.toString());
      } catch (e) {}
    }

    /**
     * Find star under screen coordinate (for touch or click)
     */
    getStarAtPosition(screenX, screenY, maxDist = 28) {
      let closest = null;
      let minDist = maxDist;
      const bodies = this.currentBodies && this.currentBodies.length > 0 ? this.currentBodies : StarsData.STARS;

      for (const star of bodies) {
        // Skip hidden layers during hit-testing
        if (!this.isBodyLayerVisible(star)) continue;

        // Project to screen using current camera
        const p = Astronomy.projectToScreen(
          star.cachedAzimuth || 0, star.cachedAltitude || 0,
          this.cameraAzimuth, this.cameraAltitude, this.cameraRoll,
          this.fov, this.width, this.height
        );
        if (p.visible && p.camZ > 0) {
          const d = Math.hypot(p.x - screenX, p.y - screenY);
          if (d < minDist) {
            minDist = d;
            closest = star;
          }
        }
      }
      return closest;
    }

    /**
     * Returns an array of all celestial bodies currently within the camera FOV / on-screen
     * respecting active layer visibility and limiting magnitude.
     * Sorted by brightness/prominence (magnitude ascending).
     */
    getCurrentlyVisibleBodies(currentDate, observerLat, observerLon) {
      const bodies = (this.currentBodies && this.currentBodies.length > 0)
        ? this.currentBodies
        : (StarsData.STARS || []);

      const width = this.width || (typeof window !== 'undefined' ? window.innerWidth : 1024);
      const height = this.height || (typeof window !== 'undefined' ? window.innerHeight : 768);
      const date = currentDate || this.lastCurrentDate || new Date();
      const lat = observerLat !== undefined ? observerLat : (this.lastObserverLat !== undefined ? this.lastObserverLat : 37.7749);
      const lon = observerLon !== undefined ? observerLon : (this.lastObserverLon !== undefined ? this.lastObserverLon : -122.4194);

      const visible = [];

      for (const star of bodies) {
        if (!this.isBodyLayerVisible(star)) continue;

        let az = star.cachedAzimuth;
        let alt = star.cachedAltitude;

        if (az === undefined || alt === undefined) {
          const horiz = Astronomy.equatorialToHorizontal(star.ra, star.dec, lat, lon, date);
          alt = Astronomy.applyAtmosphericRefraction ? Astronomy.applyAtmosphericRefraction(horiz.altitude) : horiz.altitude;
          az = horiz.azimuth;
          star.cachedAzimuth = az;
          star.cachedAltitude = alt;
        }

        const proj = Astronomy.projectToScreen(
          az, alt,
          this.cameraAzimuth, this.cameraAltitude, this.cameraRoll,
          this.fov, width, height
        );

        // Check if inside screen viewport with slight margin for edge visibility
        if (proj.visible && proj.camZ > 0.05 &&
            proj.x >= -20 && proj.x <= width + 20 &&
            proj.y >= -20 && proj.y <= height + 20) {
          visible.push({
            ...star,
            screenX: proj.x,
            screenY: proj.y,
            distCenter: proj.angularDistanceDeg || 0,
            currentAlt: alt,
            currentAz: az
          });
        }
      }

      // Sort by brightness/prominence (brightest first, Sun/Moon/Planets/bright stars)
      visible.sort((a, b) => {
        const magA = (a.mag !== undefined && a.mag !== null) ? a.mag : 99;
        const magB = (b.mag !== undefined && b.mag !== null) ? b.mag : 99;
        return magA - magB;
      });

      return visible;
    }
  }

  return SkyRenderer;
});
