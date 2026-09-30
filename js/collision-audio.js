/**
 * ASTRA — ASTEROID COLLISION
 * Audio Synthesizer Stub (Silent / No-Op)
 * All audio has been cleanly disabled per user direction.
 */

(function (window) {
  'use strict';

  class CollisionAudio {
    constructor() {
      this.isMuted = true;
      this.volume = 0;
    }

    ensureContext() {}
    playBeep() {}
    playAtmosphericEntry() {}
    playImpactSound() {}
    playTargetLock() {}
    playAlarm() {}
    setMuted() {}
    setVolume() {}
    stopAll() {}
  }

  window.CollisionAudio = CollisionAudio;
})(window);
