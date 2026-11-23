/**
 * Mobile Sensors & AR Camera Controller for Star Finder (星空识星)
 * True 3D rotation matrix calculation (Tait-Bryan Z-X-Y),
 * gimbal-lock-free orientation, and adaptive dual-stage damping filter.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Sensors = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const DEG2RAD = Math.PI / 180.0;
  const RAD2DEG = 180.0 / Math.PI;

  let isGyroActive = false;
  let isCameraActive = false;
  let cameraStream = null;

  // Damping mode: 'smooth' (cinematic stabilization) vs 'responsive'
  let dampingMode = 'smooth';
  let compassOffset = 0.0;
  try {
    if (typeof localStorage !== 'undefined') {
      const savedOffset = parseFloat(localStorage.getItem('starfinder_compass_offset') || '0.0');
      if (isFinite(savedOffset)) compassOffset = savedOffset;
    }
  } catch (e) {}

  // Current smoothed camera orientation
  let currentAzimuth = 180.0;
  let currentAltitude = 30.0;
  let currentRoll = 0.0;
  let hasInitialOrientation = false;

  // Raw target orientation from device
  let targetAzimuth = 180.0;
  let targetAltitude = 30.0;
  let targetRoll = 0.0;

  let orientationCallback = null;

  /**
   * Convert Tait-Bryan angles (alpha, beta, gamma) to rear camera Azimuth, Altitude, and Roll
   * using full 3D rotation matrix to avoid gimbal lock or coordinate coupling.
   */
  function convertEulerToLookAngles(alphaDeg, betaDeg, gammaDeg) {
    const a = alphaDeg * DEG2RAD;
    const b = betaDeg * DEG2RAD;
    const g = gammaDeg * DEG2RAD;

    const ca = Math.cos(a), sa = Math.sin(a);
    const cb = Math.cos(b), sb = Math.sin(b);
    const cg = Math.cos(g), sg = Math.sin(g);

    // Rear camera look vector is -Z axis of device in Earth ENU coordinate frame
    // V_look = - (Col 3 of R_z(alpha) * R_x(beta) * R_y(gamma))
    const vx = -(ca * sg + sa * sb * cg);
    const vy = -(sa * sg - ca * sb * cg);
    const vz = -(cb * cg);

    // Altitude: angle above horizon (-90° to +90°)
    const clampedZ = Math.max(-1.0, Math.min(1.0, vz));
    const altRad = Math.asin(clampedZ);
    const altDeg = altRad * RAD2DEG;

    // Azimuth: angle measured from True North (0°) clockwise toward East (90°)
    let azRad = Math.atan2(vx, vy);
    let azDeg = (((azRad * RAD2DEG + 360.0 + compassOffset) % 360.0) + 360.0) % 360.0;

    // Camera roll: rotation of top of phone relative to vertical meridian
    const rxBase = Math.cos(azRad);
    const ryBase = -Math.sin(azRad);
    const rzBase = 0.0;

    const uxBase = -Math.sin(altRad) * Math.sin(azRad);
    const uyBase = -Math.sin(altRad) * Math.cos(azRad);
    const uzBase = Math.cos(altRad);

    // Device +Y axis (top of phone) in Earth frame
    const uxDev = -sa * cb;
    const uyDev = ca * cb;
    const uzDev = sb;

    const dotR = uxDev * rxBase + uyDev * ryBase + uzDev * rzBase;
    const dotU = uxDev * uxBase + uyDev * uyBase + uzDev * uzBase;
    const rollDeg = Math.atan2(dotR, dotU) * RAD2DEG;

    return {
      azimuth: azDeg,
      altitude: altDeg,
      roll: rollDeg
    };
  }

  /**
   * Request permission for DeviceOrientation (iOS 13+ requires explicit user gesture)
   */
  async function requestOrientationPermission() {
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const response = await DeviceOrientationEvent.requestPermission();
        return response === 'granted';
      } catch (err) {
        console.warn('Orientation permission error:', err);
        return false;
      }
    }
    return true;
  }

  // Set once any 'deviceorientationabsolute' event arrives; from then on relative events are ignored
  let receivedAbsoluteEvent = false;

  /**
   * Handle device orientation event
   */
  function handleDeviceOrientation(event) {
    if (!isGyroActive) return;

    if (event.type === 'deviceorientationabsolute') {
      receivedAbsoluteEvent = true;
    } else if (receivedAbsoluteEvent) {
      return; // relative event, but a true-north absolute stream is available
    }

    let alpha = event.alpha;
    let beta = event.beta;
    let gamma = event.gamma;

    if (beta === null || gamma === null) return;

    // iOS provides direct webkitCompassHeading (0 = North, 90 = East)
    if (typeof event.webkitCompassHeading !== 'undefined' && event.webkitCompassHeading !== null) {
      // Invert webkitCompassHeading into standard alpha coordinate
      alpha = (360.0 - event.webkitCompassHeading) % 360.0;
    } else if (alpha === null) {
      alpha = 0;
    }

    const angles = convertEulerToLookAngles(alpha, beta, gamma);

    targetAzimuth = angles.azimuth;
    targetAltitude = angles.altitude;
    targetRoll = angles.roll;

    if (!hasInitialOrientation) {
      currentAzimuth = targetAzimuth;
      currentAltitude = targetAltitude;
      currentRoll = targetRoll;
      hasInitialOrientation = true;
    }
  }

  /**
   * Start listening to device orientation sensors
   */
  async function startOrientation(callback) {
    orientationCallback = callback;
    const hasPermission = await requestOrientationPermission();
    if (!hasPermission) {
      return false;
    }

    // Prefer deviceorientationabsolute for true compass heading, but also listen to plain
    // deviceorientation: some Android browsers expose the absolute handler yet never fire it,
    // and iOS only fires the relative event (with webkitCompassHeading).
    receivedAbsoluteEvent = false;
    hasInitialOrientation = false;
    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute', handleDeviceOrientation, true);
    }
    if ('ondeviceorientation' in window) {
      window.addEventListener('deviceorientation', handleDeviceOrientation, true);
    }

    isGyroActive = true;
    return true;
  }

  /**
   * Stop listening to device orientation sensors
   */
  function stopOrientation() {
    isGyroActive = false;
    window.removeEventListener('deviceorientationabsolute', handleDeviceOrientation, true);
    window.removeEventListener('deviceorientation', handleDeviceOrientation, true);
  }

  /**
   * Adaptive Damping Filter
   * Eliminates hand micro-jitter while keeping deliberate pans smooth and responsive
   */
  function updateSmoothedOrientation() {
    if (!isGyroActive) return null;

    // Shortest angular difference for azimuth [-180, 180]
    let diffAz = (targetAzimuth - currentAzimuth + 540.0) % 360.0 - 180.0;
    let diffAlt = targetAltitude - currentAltitude;
    let diffRoll = (targetRoll - currentRoll + 540.0) % 360.0 - 180.0;

    const totalAngularDelta = Math.hypot(diffAz, diffAlt);

    // Adaptive lerp factor based on motion speed
    let factor = 0.08; // default smooth damping

    if (dampingMode === 'smooth') {
      if (totalAngularDelta < 0.25) {
        // Micro-jitter deadband: damp heavily to keep stars completely steady
        factor = 0.02;
      } else if (totalAngularDelta < 1.5) {
        // Gentle rotation: buttery planetarium smoothness
        factor = 0.06;
      } else if (totalAngularDelta < 8.0) {
        // Medium turning: smooth follow
        factor = 0.12;
      } else {
        // Rapid swing: catch up quickly without noticeable lag
        factor = 0.22;
      }
    } else {
      // Responsive mode
      factor = totalAngularDelta < 0.2 ? 0.04 : 0.18;
    }

    currentAzimuth = (currentAzimuth + diffAz * factor + 360.0) % 360.0;
    currentAltitude = Math.max(-90.0, Math.min(90.0, currentAltitude + diffAlt * factor));
    // Keep roll in [-180, 180) so it never accumulates or unwinds the long way
    currentRoll = ((currentRoll + diffRoll * factor + 540.0) % 360.0) - 180.0;

    if (orientationCallback) {
      orientationCallback({
        azimuth: currentAzimuth,
        altitude: currentAltitude,
        roll: currentRoll,
        rawAz: targetAzimuth,
        rawAlt: targetAltitude
      });
    }

    return {
      azimuth: currentAzimuth,
      altitude: currentAltitude,
      roll: currentRoll
    };
  }

  /**
   * Start AR camera stream
   */
  async function startCamera(videoElement) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Camera API not supported.');
    }

    const constraints = {
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false
    };

    try {
      cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
      videoElement.srcObject = cameraStream;
      videoElement.setAttribute('playsinline', 'true');
      videoElement.classList.add('active');
      await videoElement.play();
      isCameraActive = true;
      return true;
    } catch (err) {
      console.warn('Camera access denied:', err);
      stopCamera(videoElement);
      throw err;
    }
  }

  /**
   * Stop AR camera stream
   */
  function stopCamera(videoElement) {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      cameraStream = null;
    }
    if (videoElement) {
      videoElement.srcObject = null;
      videoElement.classList.remove('active');
    }
    isCameraActive = false;
  }

  // Offscreen canvas for analyzing camera luminance
  let lightAnalysisCanvas = null;
  let lightAnalysisCtx = null;

  /**
   * Estimate ambient environment light from camera feed
   */
  function estimateCameraLight(videoElement) {
    if (!videoElement || videoElement.readyState < 2) {
      return null;
    }

    if (!lightAnalysisCanvas) {
      lightAnalysisCanvas = document.createElement('canvas');
      lightAnalysisCanvas.width = 48;
      lightAnalysisCanvas.height = 36;
      lightAnalysisCtx = lightAnalysisCanvas.getContext('2d', { willReadFrequently: true });
    }

    try {
      lightAnalysisCtx.drawImage(videoElement, 0, 0, 48, 36);
      const imgData = lightAnalysisCtx.getImageData(0, 0, 48, 36);
      const data = imgData.data;
      let totalLuminance = 0;
      const totalPixels = data.length / 4;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        totalLuminance += 0.299 * r + 0.587 * g + 0.114 * b;
      }

      const avgLuminance = totalLuminance / totalPixels; // 0 to 255

      let suggestedMode = 'suburb';
      let suggestedLimitingMag = 4.8;

      if (avgLuminance > 115) {
        suggestedMode = 'city';
        suggestedLimitingMag = 3.2;
      } else if (avgLuminance > 45) {
        suggestedMode = 'suburb';
        const ratio = (115 - avgLuminance) / (115 - 45);
        suggestedLimitingMag = Math.round((3.2 + ratio * 1.8) * 10) / 10;
      } else {
        suggestedMode = 'desert';
        const ratio = Math.min(1.0, (45 - avgLuminance) / 45);
        suggestedLimitingMag = Math.round((5.0 + ratio * 1.5) * 10) / 10;
      }

      return {
        luminance: Math.round(avgLuminance),
        suggestedMode,
        suggestedLimitingMag,
        descEn: avgLuminance > 115
          ? `Bright Urban Sky (${Math.round(avgLuminance)}) ➔ City (≤${suggestedLimitingMag}m)`
          : (avgLuminance > 45
            ? `Dim Suburban Sky (${Math.round(avgLuminance)}) ➔ Suburb (≤${suggestedLimitingMag}m)`
            : `Pristine Dark Sky (${Math.round(avgLuminance)}) ➔ Desert (≤${suggestedLimitingMag}m)`),
        descZh: avgLuminance > 115
          ? `城市明亮环境 (${Math.round(avgLuminance)}) ➔ 城市 (≤${suggestedLimitingMag}等)`
          : (avgLuminance > 45
            ? `郊区微光夜色 (${Math.round(avgLuminance)}) ➔ 郊区 (≤${suggestedLimitingMag}等)`
            : `野外极暗夜空 (${Math.round(avgLuminance)}) ➔ 荒漠 (≤${suggestedLimitingMag}等)`)
      };
    } catch (e) {
      console.warn('Light estimation error:', e);
      return null;
    }
  }

  /**
   * One-time camera light metering sample (temporary stream if AR camera is off)
   */
  async function sampleCameraLightOnce(videoElement) {
    if (isCameraActive && videoElement && videoElement.readyState >= 2) {
      return estimateCameraLight(videoElement);
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Camera not supported.');
    }

    let tempStream = null;
    let tempVideo = null;
    try {
      tempStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      tempVideo = document.createElement('video');
      tempVideo.muted = true;
      tempVideo.setAttribute('playsinline', 'true');
      tempVideo.srcObject = tempStream;
      await tempVideo.play();

      // Wait 350ms for camera auto-exposure stabilization
      await new Promise((resolve) => setTimeout(resolve, 350));

      const result = estimateCameraLight(tempVideo);
      return result;
    } finally {
      if (tempStream) {
        tempStream.getTracks().forEach((track) => track.stop());
      }
      if (tempVideo) {
        tempVideo.srcObject = null;
      }
    }
  }

  return {
    startOrientation,
    stopOrientation,
    updateSmoothedOrientation,
    startCamera,
    stopCamera,
    estimateCameraLight,
    sampleCameraLightOnce,
    isGyroActive: () => isGyroActive,
    isCameraActive: () => isCameraActive,
    setDampingMode: (mode) => { dampingMode = mode; },
    getDampingMode: () => dampingMode,
    getCompassOffset: () => compassOffset,
    setCompassOffset: (offset) => {
      compassOffset = offset;
      try { if (typeof localStorage !== 'undefined') localStorage.setItem('starfinder_compass_offset', offset.toString()); } catch (e) {}
    },
    adjustCompassOffset: (delta) => {
      compassOffset = Math.round((compassOffset + delta) * 10) / 10;
      try { if (typeof localStorage !== 'undefined') localStorage.setItem('starfinder_compass_offset', compassOffset.toString()); } catch (e) {}
      return compassOffset;
    }
  };
});
