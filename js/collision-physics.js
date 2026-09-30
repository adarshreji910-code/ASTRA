/**
 * ASTRA — ASTEROID COLLISION
 * Physics Simulation Engine
 * Based on peer-reviewed Earth Impact Effects Program formulations:
 * Collins, G. S., Melosh, H. J., & Marcus, R. A. (2005). 
 * "Earth Impact Effects Program: A Web-based computer program for calculating
 * the regional environmental consequences of a meteoroid impact on Earth."
 * Meteoritics & Planetary Science, 40(6), 817-840.
 */

(function (window) {
  'use strict';

  // Fundamental physical constants
  const CONSTANTS = {
    G: 9.81,                     // Earth surface gravity (m/s^2)
    R_EARTH: 6371.0,             // Earth radius (km)
    V_ESCAPE: 11.19,             // Earth escape velocity (km/s)
    RHO_AIR_SL: 1.225,           // Air density at sea level (kg/m^3)
    SCALE_HEIGHT: 8000.0,        // Atmospheric scale height (m)
    SPEED_OF_SOUND: 340.0,       // Speed of sound at sea level (m/s)
    SPEED_SEISMIC: 5.0,          // P-wave seismic speed (km/s)
    JOULES_PER_MEGATON: 4.184e15,// 1 Megaton TNT in Joules
    LUMINOUS_EFFICIENCY: 0.003,  // Fraction of KE radiated as light/heat
    SEISMIC_EFFICIENCY: 1.0e-4,  // Fraction of KE coupled into ground motion
    TARGET_DENSITY_SEDIMENT: 2500,// Target rock density (kg/m^3)
    TARGET_DENSITY_CRYSTAL: 2750, // Crystalline target rock density (kg/m^3)
    WATER_DENSITY: 1025          // Seawater density (kg/m^3)
  };

  /**
   * Density values by asteroid composition (kg/m^3)
   */
  const COMPOSITIONS = {
    'iron': {
      name: 'Iron-Nickel Metallic',
      density: 7800,
      strength: 1.0e8, // Yield strength in Pa
      description: 'Dense metallic nickel-iron asteroid (M-type). High penetrative power, resistant to atmospheric breakup.'
    },
    'stony': {
      name: 'Stony / Silicate Rock',
      density: 3000,
      strength: 5.0e6, // Yield strength in Pa
      description: 'Chondritic silicate rock asteroid (S-type). Standard near-Earth object composition.'
    },
    'carbonaceous': {
      name: 'Carbonaceous Chondrite',
      density: 1800,
      strength: 1.0e6, // Yield strength in Pa
      description: 'Volatile-rich, porous carbonaceous asteroid (C-type / B-type). Bennu / Ryugu analogue.'
    },
    'cometary': {
      name: 'Porous / Cometary Ice',
      density: 1000,
      strength: 1.0e5, // Yield strength in Pa
      description: 'Low-density icy aggregate with organic dust mantle. High probability of upper atmospheric airburst.'
    }
  };

  class ImpactPhysics {
    /**
     * Compute comprehensive impact parameters
     * @param {Object} params
     * @param {number} params.diameter - Projectile diameter in meters
     * @param {number} params.velocity - Entry velocity in km/s (relative to Earth)
     * @param {number} params.density - Projectile density in kg/m^3
     * @param {number} params.angle - Impact angle in degrees (default 45)
     * @param {string} params.targetType - 'land' | 'water'
     * @param {number} [params.waterDepth] - Water depth in meters if ocean impact
     * @returns {Object} Comprehensive scientific simulation results
     */
    static calculate(params) {
      const diameter = Math.max(1.0, Number(params.diameter) || 100); // m
      const velocityKmS = Math.max(11.2, Number(params.velocity) || 20); // km/s
      const velocity = velocityKmS * 1000.0; // m/s
      const density = Math.max(500, Number(params.density) || 3000); // kg/m^3
      const angleDeg = Math.min(90, Math.max(5, Number(params.angle) || 45)); // deg
      const angleRad = (angleDeg * Math.PI) / 180.0;
      const targetType = params.targetType === 'water' ? 'water' : 'land';
      const targetDensity = targetType === 'water' ? CONSTANTS.WATER_DENSITY : CONSTANTS.TARGET_DENSITY_SEDIMENT;

      // 1. Mass & Volume
      const radius = diameter / 2.0;
      const volume = (4.0 / 3.0) * Math.PI * Math.pow(radius, 3); // m^3
      const mass = volume * density; // kg

      // 2. Kinetic Energy
      const kineticEnergy = 0.5 * mass * Math.pow(velocity, 2); // Joules
      const energyMt = kineticEnergy / CONSTANTS.JOULES_PER_MEGATON; // Megatons TNT
      const energyKt = energyMt * 1000.0; // Kilotons TNT

      // Comparisons
      const hiroshimaEquiv = kineticEnergy / (15 * CONSTANTS.JOULES_PER_MEGATON * 0.001); // 15 kt
      const tsarBombaEquiv = energyMt / 50.0; // 50 Mt

      // 3. Atmospheric Deceleration & Airburst check (Collins et al. 2005)
      // Stagnation pressure vs yield strength
      let yieldStrength = 5.0e6; // default stony
      for (const key in COMPOSITIONS) {
        if (Math.abs(COMPOSITIONS[key].density - density) < 500) {
          yieldStrength = COMPOSITIONS[key].strength;
          break;
        }
      }

      // Airburst calculation
      const dragCoeff = 1.0;
      const massLossCoeff = 1.0e-8; // kg/J
      // Characteristic altitude of breakup (m)
      const airburstThreshold = Math.log(
        (CONSTANTS.RHO_AIR_SL * Math.pow(velocity, 2)) / (2 * yieldStrength)
      );
      
      let isAirburst = false;
      let burstAltitude = 0; // m
      let surfaceImpactVelocity = velocity; // m/s

      // Small stones (< 50m) at steep or shallow angles can burst at altitude
      if (diameter < 65 && airburstThreshold > 0) {
        burstAltitude = Math.max(0, Math.min(45000, CONSTANTS.SCALE_HEIGHT * airburstThreshold));
        if (burstAltitude > 2000) {
          isAirburst = true;
          surfaceImpactVelocity = velocity * 0.45; // decelerated fragments
        }
      }

      // 4. Crater Dimensions (Schmidt & Holsapple 1982 / Collins et al. 2005)
      // Transient crater diameter D_tc (meters)
      const g = CONSTANTS.G;
      const sinAngleFactor = Math.pow(Math.sin(angleRad), 1.0 / 3.0);
      
      // Collins 2005 Eq (1):
      // D_tc = 1.161 * (rho_i / rho_t)^(1/3) * L^0.78 * v_i^0.44 * g^(-0.22) * sin(theta)^(1/3)
      const D_tc = 1.161 * 
        Math.pow(density / targetDensity, 1.0 / 3.0) *
        Math.pow(diameter, 0.78) *
        Math.pow(surfaceImpactVelocity, 0.44) *
        Math.pow(g, -0.22) *
        sinAngleFactor;

      // Transient depth d_tc
      const d_tc = D_tc / (2.0 * Math.SQRT2); // approx 0.354 * D_tc

      // Transition to complex crater on Earth: ~3200m in sedimentary rock
      const D_c = 3200.0; // m
      let D_final = 0;
      let d_final = 0;
      let craterType = 'simple';

      if (D_tc < D_c) {
        // Simple crater (parabolic bowl)
        craterType = 'simple';
        D_final = 1.25 * D_tc;
        d_final = 0.2 * D_final; // approx rim to floor depth
      } else {
        // Complex crater (flat floor with central peak or rings)
        craterType = 'complex';
        D_final = 1.17 * Math.pow(D_tc, 1.13) / Math.pow(D_c, 0.13);
        // Final depth d_f = 0.28 * D_final^0.301 (km units converted to m)
        const D_final_km = D_final / 1000.0;
        const d_final_km = 0.28 * Math.pow(D_final_km, 0.301);
        d_final = d_final_km * 1000.0;
      }

      // Breccia thickness & Rim height
      const h_rim = 0.07 * Math.pow(D_tc, 4) / Math.pow(D_final, 3);
      const excavatedVolume = (Math.PI / 8.0) * Math.pow(D_tc, 2) * d_tc; // m^3
      const excavatedMass = excavatedVolume * targetDensity; // kg

      // 5. Thermal Radiation (Collins et al. 2005)
      // Fireball radius R_fb (m)
      const R_fb = 0.002 * Math.pow(kineticEnergy, 1.0 / 3.0); // approx m
      const thermalEnergy = CONSTANTS.LUMINOUS_EFFICIENCY * kineticEnergy;

      // Distance thresholds for thermal effects (meters):
      // Exposure Phi = (eta * E_k) / (2 * pi * r^2) * tau
      // 3rd degree burns: 4.2e5 J/m^2
      // 2nd degree burns: 2.5e5 J/m^2
      // 1st degree burns: 1.3e5 J/m^2
      // Ignition of clothing/trees: 6.7e5 J/m^2
      const rThermalIgnition = Math.sqrt(thermalEnergy / (2 * Math.PI * 6.7e5));
      const rThermal3rdBurn = Math.sqrt(thermalEnergy / (2 * Math.PI * 4.2e5));
      const rThermal2ndBurn = Math.sqrt(thermalEnergy / (2 * Math.PI * 2.5e5));
      const rThermal1stBurn = Math.sqrt(thermalEnergy / (2 * Math.PI * 1.3e5));

      // 6. Air Blast Overpressure (Collins 2005 / Glasstone & Dolan 1977)
      // Blast wave overpressure Delta P as function of distance
      // Using yield-scaled distance: lambda = r / (E_Mt)^(1/3)
      // Thresholds:
      // 20 psi (137.9 kPa) -> Concrete multi-story collapse, near 100% fatalities
      // 5 psi (34.5 kPa)   -> Standard residential buildings collapse, heavy casualties
      // 1 psi (6.89 kPa)   -> Glass windows shatter, lightweight debris injuries
      const blastRadius20psi = 1.65 * Math.pow(energyMt, 1.0 / 3.0) * 1000.0; // m
      const blastRadius5psi  = 3.80 * Math.pow(energyMt, 1.0 / 3.0) * 1000.0; // m
      const blastRadius1psi  = 9.40 * Math.pow(energyMt, 1.0 / 3.0) * 1000.0; // m

      // 7. Seismic Ground Shaking (Richter Magnitude)
      // Seismic energy E_s = 1e-4 * E_k
      // Magnitude M_w = 0.67 * log10(E_k) - 5.87
      const seismicMagnitude = Math.max(0, (0.67 * Math.log10(kineticEnergy) - 5.87));

      // Radius of noticeable seismic shaking (MMI IV / felt indoors)
      // Approx where effective M_eff >= 4.0
      // M_eff = M_w - 0.0048*r_km - 1.16*log10(r_km)
      const seismicRadiusFelt = Math.pow(10, (seismicMagnitude - 2.5) / 1.16) * 1000.0; // m

      // 8. Affected Area & Global Climate Implications
      const totalBlastAreaKm2 = Math.PI * Math.pow(blastRadius1psi / 1000.0, 2);
      const craterAreaKm2 = Math.PI * Math.pow((D_final / 2.0) / 1000.0, 2);
      
      // Global dust / climatic perturbation index
      let climateEffect = 'Localized regional event. Negligible global climate disturbance.';
      if (energyMt >= 100000) {
        climateEffect = 'GLOBAL EXTINCTION LEVEL EVENT: Massive stratospheric dust loading, sunlight blocked for years, collapse of photosynthesizing food webs.';
      } else if (energyMt >= 10000) {
        climateEffect = 'SEVERE GLOBAL CLIMATIC DISRUPTION: Multi-year impact winter, sub-zero temperature drops globally, severe agriculture collapse.';
      } else if (energyMt >= 1000) {
        climateEffect = 'HEMISPHERIC CLIMATIC IMPACT: Stratospheric ozone depletion, hemisphere-scale cooling, acid rain, multi-season crop failures.';
      } else if (energyMt >= 100) {
        climateEffect = 'SUB-CONTINENTAL IMPACT: Significant regional forest fires, particulate haze lasting weeks, regional climate anomalies.';
      }

      // 9. Tsunami estimate if oceanic impact
      let tsunami = null;
      if (targetType === 'water') {
        const waterDepth = Number(params.waterDepth) || 3000; // m
        const cavityRadius = Math.min(D_tc * 1.5, waterDepth * 3);
        tsunami = {
          cavityRadiusM: cavityRadius,
          initialWaveHeightM: Math.min(waterDepth, cavityRadius * 0.4),
          waveHeightAt100kmM: (cavityRadius * 0.4) * (cavityRadius / 100000.0) * 1.8,
          waveHeightAt500kmM: (cavityRadius * 0.4) * (cavityRadius / 500000.0) * 1.8
        };
      }

      return {
        inputs: {
          diameterM: diameter,
          velocityKmS: velocityKmS,
          densityKgM3: density,
          angleDeg: angleDeg,
          targetType: targetType,
          targetDensityKgM3: targetDensity
        },
        mass: {
          valueKg: mass,
          formatted: ImpactPhysics.formatSci(mass) + ' kg',
          classification: 'MODEL OUTPUT'
        },
        energy: {
          joules: kineticEnergy,
          megatonsTNT: energyMt,
          kilotonsTNT: energyKt,
          formattedJoules: ImpactPhysics.formatSci(kineticEnergy) + ' J',
          formattedMt: energyMt < 1 ? energyKt.toFixed(1) + ' kt' : energyMt.toLocaleString(undefined, { maximumFractionDigits: 1 }) + ' Mt',
          hiroshimaEquiv: Math.round(hiroshimaEquiv),
          tsarBombaEquiv: tsarBombaEquiv.toFixed(1),
          classification: 'MODEL OUTPUT'
        },
        entry: {
          isAirburst: isAirburst,
          burstAltitudeM: burstAltitude,
          surfaceImpactVelocityKmS: surfaceImpactVelocity / 1000.0,
          classification: 'MODEL OUTPUT'
        },
        crater: {
          transientDiameterM: D_tc,
          finalDiameterM: D_final,
          finalDiameterKm: D_final / 1000.0,
          depthM: d_final,
          rimHeightM: h_rim,
          type: craterType,
          excavatedVolumeM3: excavatedVolume,
          excavatedMassKg: excavatedMass,
          craterAreaKm2: craterAreaKm2,
          formattedDiameter: (D_final >= 1000) ? (D_final / 1000.0).toFixed(2) + ' km' : Math.round(D_final) + ' m',
          formattedDepth: (d_final >= 1000) ? (d_final / 1000.0).toFixed(2) + ' km' : Math.round(d_final) + ' m',
          classification: 'CALCULATED ESTIMATE'
        },
        thermal: {
          fireballRadiusM: R_fb,
          fireballRadiusKm: R_fb / 1000.0,
          radiusIgnitionM: rThermalIgnition,
          radius3rdBurnM: rThermal3rdBurn,
          radius2ndBurnM: rThermal2ndBurn,
          radius1stBurnM: rThermal1stBurn,
          formattedFireball: (R_fb / 1000.0).toFixed(2) + ' km',
          formatted3rdBurn: (rThermal3rdBurn / 1000.0).toFixed(1) + ' km',
          classification: 'CALCULATED ESTIMATE'
        },
        blast: {
          radius20psiM: blastRadius20psi,
          radius5psiM: blastRadius5psi,
          radius1psiM: blastRadius1psi,
          radius20psiKm: blastRadius20psi / 1000.0,
          radius5psiKm: blastRadius5psi / 1000.0,
          radius1psiKm: blastRadius1psi / 1000.0,
          affectedAreaKm2: totalBlastAreaKm2,
          classification: 'CALCULATED ESTIMATE'
        },
        seismic: {
          richterMagnitude: Number(seismicMagnitude.toFixed(2)),
          feltRadiusKm: Math.min(20000, seismicRadiusFelt / 1000.0),
          classification: 'CALCULATED ESTIMATE'
        },
        climate: {
          summary: climateEffect,
          classification: 'MODEL INTERPRETATION'
        },
        tsunami: tsunami,
        citation: 'Earth Impact Effects Program (Collins, Melosh, Marcus 2005)'
      };
    }

    /**
     * Calculate exact environmental effects at a specific distance from impact point
     * @param {Object} results - Object returned by ImpactPhysics.calculate()
     * @param {number} distanceKm - Observer distance in kilometers
     * @returns {Object} Local damage telemetry
     */
    static getEffectsAtDistance(results, distanceKm) {
      const dKm = Math.max(0.01, Number(distanceKm) || 1.0);
      const dM = dKm * 1000.0;
      const energyMt = results.energy.megatonsTNT;
      const energyJ = results.energy.joules;

      // 1. Arrival Times
      // Speed of sound ~340 m/s
      const airblastArrivalSec = dM / CONSTANTS.SPEED_OF_SOUND;
      // Seismic P-wave ~5 km/s
      const seismicArrivalSec = dKm / CONSTANTS.SPEED_SEISMIC;

      // 2. Overpressure at distance
      // Using Collins 2005 overpressure scaling:
      const scaledDistance = dKm / Math.pow(energyMt, 1.0 / 3.0);
      let overpressurePsi = 0;
      let overpressureKPa = 0;

      if (scaledDistance < 0.05) {
        overpressurePsi = 2000.0;
        overpressureKPa = 13789.0;
      } else {
        // Standard high-explosive / kinetic shock decay equation
        overpressurePsi = (70.0 / Math.pow(scaledDistance, 3)) + 
                          (20.0 / Math.pow(scaledDistance, 2)) + 
                          (10.0 / scaledDistance);
        overpressurePsi = Math.min(1500, Math.max(0.001, overpressurePsi));
        overpressureKPa = overpressurePsi * 6.89476;
      }

      // Wind speed (m/s)
      const ambientP = 101325; // Pa
      const deltaP_Pa = overpressureKPa * 1000.0;
      const windSpeedMS = (5.0 * deltaP_Pa) / (7.0 * ambientP * (1.0 + (6.0 * deltaP_Pa) / (7.0 * ambientP))) * CONSTANTS.SPEED_OF_SOUND;

      // 3. Thermal Exposure at distance
      const thermalEnergy = CONSTANTS.LUMINOUS_EFFICIENCY * energyJ;
      const transAtm = Math.exp(-dM / 30000.0); // Transmissivity
      const thermalFluence = (thermalEnergy / (2.0 * Math.PI * Math.pow(dM, 2))) * transAtm; // J/m^2

      let thermalEffectDesc = 'No thermal injury';
      if (dM <= results.thermal.fireballRadiusM) {
        thermalEffectDesc = 'Inside fireball: complete thermal vaporization';
      } else if (thermalFluence >= 6.7e5) {
        thermalEffectDesc = 'Spontaneous ignition of clothing, wood and foliage; 3rd degree burns';
      } else if (thermalFluence >= 4.2e5) {
        thermalEffectDesc = '3rd degree burns to exposed skin over entire body';
      } else if (thermalFluence >= 2.5e5) {
        thermalEffectDesc = '2nd degree burns to exposed skin';
      } else if (thermalFluence >= 1.3e5) {
        thermalEffectDesc = '1st degree burns (sunburn equivalent)';
      }

      // 4. Seismic Intensity at distance (Modified Mercalli Intensity - MMI)
      const M_w = results.seismic.richterMagnitude;
      const M_eff = Math.max(0, M_w - 0.0048 * dKm - 1.16 * Math.log10(Math.max(1, dKm)));
      
      let mmi = 'I';
      let mmiDesc = 'Instrumental: Not felt except by instruments';
      if (dM <= results.crater.finalDiameterM / 2.0) {
        mmi = 'XII';
        mmiDesc = 'Catastrophic: Ground zero total destruction and cratering';
      } else if (M_eff >= 8.0) {
        mmi = 'X - XII';
        mmiDesc = 'Disastrous: Most masonry and frame structures destroyed, ground cracked';
      } else if (M_eff >= 7.0) {
        mmi = 'VIII - IX';
        mmiDesc = 'Severe: Heavy damage to masonry, chimneys twisted, partial collapse';
      } else if (M_eff >= 6.0) {
        mmi = 'VI - VII';
        mmiDesc = 'Strong: Difficult to stand, furniture broken, plaster cracked';
      } else if (M_eff >= 5.0) {
        mmi = 'IV - V';
        mmiDesc = 'Moderate: Felt by all indoors, rattling doors and dishes';
      } else if (M_eff >= 3.5) {
        mmi = 'II - III';
        mmiDesc = 'Weak: Felt by few persons at rest, subtle swinging of lamps';
      }

      // Structural blast damage description
      let blastDesc = 'No structural blast damage';
      if (dM <= results.crater.finalDiameterM / 2.0) {
        blastDesc = 'Total crater excavation and pulverization';
      } else if (overpressurePsi >= 20.0) {
        blastDesc = 'Complete destruction of reinforced concrete structures; 100% fatalities';
      } else if (overpressurePsi >= 5.0) {
        blastDesc = 'Collapse of residential wood and brick houses; severe casualties';
      } else if (overpressurePsi >= 1.0) {
        blastDesc = 'Widespread window glass shattering; light laceration injuries';
      } else if (overpressurePsi >= 0.2) {
        blastDesc = 'Loud acoustic sonic boom, rattling doors, negligible structural damage';
      }

      return {
        distanceKm: dKm,
        isInsideCrater: dM <= results.crater.finalDiameterM / 2.0,
        overpressurePsi: Number(overpressurePsi.toFixed(2)),
        overpressureKPa: Number(overpressureKPa.toFixed(1)),
        windSpeedKmh: Number((windSpeedMS * 3.6).toFixed(0)),
        blastArrivalSec: Number(airblastArrivalSec.toFixed(1)),
        blastDesc: blastDesc,
        thermalFluenceKJm2: Number((thermalFluence / 1000.0).toFixed(1)),
        thermalEffectDesc: thermalEffectDesc,
        seismicArrivalSec: Number(seismicArrivalSec.toFixed(1)),
        effectiveMagnitude: Number(M_eff.toFixed(1)),
        mmi: mmi,
        mmiDesc: mmiDesc,
        status: (dKm > results.blast.radius1psiKm * 2.5 && dKm > results.thermal.radius1stBurnM / 1000.0 * 2.5) ? 'NOT MODELED' : 'CALCULATED RESULT'
      };
    }

    /**
     * Helper to format numbers in scientific notation
     */
    static formatSci(num) {
      if (num === 0) return '0';
      const exp = Math.floor(Math.log10(Math.abs(num)));
      const mantissa = num / Math.pow(10, exp);
      return `${mantissa.toFixed(2)} × 10${ImpactPhysics.toSuperscript(exp)}`;
    }

    static toSuperscript(n) {
      const chars = {
        '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³',
        '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
      };
      return String(n).split('').map(c => chars[c] || c).join('');
    }
  }

  // Export to global scope
  window.ImpactPhysics = ImpactPhysics;
  window.ASTRA_COMPOSITIONS = COMPOSITIONS;
  window.ASTRA_PHYSICS_CONSTANTS = CONSTANTS;

})(window);
