import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Mp3Encoder } from '@breezystack/lamejs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MP3_KBPS = 128;

// Karplus-Strong Plucked String Synthesis for authentic Kora/Harp acoustic tones
function generateKoraTrack({
  outputPath,
  durationSeconds = 60,
  sampleRate = 44100,
  tempoBpm = 96,
  notesPattern = [],
  scaleFrequencies = {}
}) {
  const totalSamples = Math.floor(sampleRate * durationSeconds);
  const leftChannel = new Float32Array(totalSamples);
  const rightChannel = new Float32Array(totalSamples);

  const secondsPerBeat = 60 / tempoBpm;
  const sixteenthNoteDuration = secondsPerBeat / 4;
  const sixteenthSamples = Math.floor(sampleRate * sixteenthNoteDuration);

  // Active vibrating strings
  const activeStrings = [];

  function pluck(frequency, velocity, pan = 0.5, startSample) {
    const period = Math.max(2, Math.floor(sampleRate / frequency));
    const noiseBuffer = new Float32Array(period);
    // Initial burst (pluck impulse)
    for (let i = 0; i < period; i++) {
      noiseBuffer[i] = (Math.random() * 2 - 1) * velocity;
    }
    activeStrings.push({
      buffer: noiseBuffer,
      period,
      index: 0,
      decay: 0.993, // Slow natural decay like a long kora string
      pan,
      startSample,
      prevSample: 0
    });
  }

  // Schedule notes from pattern
  let currentStep = 0;
  const totalSteps = Math.floor(totalSamples / sixteenthSamples);

  while (currentStep < totalSteps) {
    const patternIdx = currentStep % notesPattern.length;
    const stepNotes = notesPattern[patternIdx];

    if (stepNotes) {
      const notes = Array.isArray(stepNotes) ? stepNotes : [stepNotes];
      notes.forEach((n) => {
        if (n && scaleFrequencies[n.note]) {
          const freq = scaleFrequencies[n.note];
          const vel = n.vel || 0.7;
          const pan = n.pan !== undefined ? n.pan : 0.5;
          const sampleOffset = currentStep * sixteenthSamples;
          if (sampleOffset < totalSamples) {
            pluck(freq, vel, pan, sampleOffset);
          }
        }
      });
    }
    currentStep++;
  }

  // Render samples with damping, lowpass filter, and stereo panning
  for (let s = 0; s < totalSamples; s++) {
    let outL = 0;
    let outR = 0;

    for (let i = activeStrings.length - 1; i >= 0; i--) {
      const str = activeStrings[i];
      if (s < str.startSample) continue;

      const idx = str.index;
      const nextIdx = (idx + 1) % str.period;

      // Karplus-Strong averaging filter
      const sample = 0.5 * (str.buffer[idx] + str.buffer[nextIdx]) * str.decay;
      str.buffer[idx] = sample;
      str.index = nextIdx;

      // Stereo positioning
      outL += sample * (1 - str.pan);
      outR += sample * str.pan;

      // Clean up dead strings
      if (Math.abs(sample) < 0.0001 && s > str.startSample + sampleRate * 2) {
        activeStrings.splice(i, 1);
      }
    }

    // Soft clip / master limiter
    leftChannel[s] = Math.tanh(outL * 1.4);
    rightChannel[s] = Math.tanh(outR * 1.4);
  }

  // Quantize float [-1, 1] channels to 16-bit PCM
  const left16 = new Int16Array(totalSamples);
  const right16 = new Int16Array(totalSamples);
  for (let s = 0; s < totalSamples; s++) {
    const valL = Math.max(-1, Math.min(1, leftChannel[s]));
    const valR = Math.max(-1, Math.min(1, rightChannel[s]));
    left16[s] = Math.floor(valL < 0 ? valL * 0x8000 : valL * 0x7fff);
    right16[s] = Math.floor(valR < 0 ? valR * 0x8000 : valR * 0x7fff);
  }

  // Encode stereo MP3 (on ne versionne que le .mp3 — cf .gitignore)
  const encoder = new Mp3Encoder(2, sampleRate, MP3_KBPS);
  const blockSize = 1152;
  const chunks = [];
  for (let i = 0; i < totalSamples; i += blockSize) {
    const l = left16.subarray(i, i + blockSize);
    const r = right16.subarray(i, i + blockSize);
    const mp3 = encoder.encodeBuffer(l, r);
    if (mp3.length) chunks.push(Buffer.from(mp3));
  }
  const tail = encoder.flush();
  if (tail.length) chunks.push(Buffer.from(tail));
  const mp3Buffer = Buffer.concat(chunks);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, mp3Buffer);
  console.log(`Generated: ${outputPath} (${(mp3Buffer.length / (1024 * 1024)).toFixed(2)} MB)`);
}

// African F frequencies (Silaba / Manding Kora tuning)
const koraScale = {
  F2: 87.31,
  G2: 98.00,
  A2: 110.00,
  Bb2: 116.54,
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.00,
  A3: 220.00,
  Bb3: 233.08,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.00,
  A4: 440.00,
  Bb4: 466.16,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46
};

// 1. Diarabi (Sidiki Diabaté style - emotional, flowing melodic polyrhythm)
const diarabiPattern = [
  // 16 sixteenths per measure (2 measures cycle = 32 steps)
  [{ note: 'F2', vel: 0.8, pan: 0.3 }, { note: 'F3', vel: 0.6, pan: 0.7 }],
  [{ note: 'C4', vel: 0.5, pan: 0.4 }],
  [{ note: 'A3', vel: 0.6, pan: 0.6 }],
  [{ note: 'C5', vel: 0.7, pan: 0.5 }],

  [{ note: 'C3', vel: 0.7, pan: 0.3 }, { note: 'A4', vel: 0.6, pan: 0.7 }],
  [{ note: 'F4', vel: 0.5, pan: 0.4 }],
  [{ note: 'G4', vel: 0.6, pan: 0.6 }],
  [{ note: 'A4', vel: 0.65, pan: 0.5 }],

  [{ note: 'Bb2', vel: 0.75, pan: 0.3 }, { note: 'D4', vel: 0.6, pan: 0.7 }],
  [{ note: 'F4', vel: 0.5, pan: 0.4 }],
  [{ note: 'Bb4', vel: 0.7, pan: 0.6 }],
  [{ note: 'D5', vel: 0.6, pan: 0.5 }],

  [{ note: 'C3', vel: 0.7, pan: 0.3 }, { note: 'C5', vel: 0.65, pan: 0.7 }],
  [{ note: 'Bb4', vel: 0.55, pan: 0.4 }],
  [{ note: 'A4', vel: 0.6, pan: 0.6 }],
  [{ note: 'G4', vel: 0.5, pan: 0.5 }],

  // Measure 2
  [{ note: 'F2', vel: 0.85, pan: 0.3 }, { note: 'F4', vel: 0.65, pan: 0.7 }],
  [{ note: 'A4', vel: 0.55, pan: 0.4 }],
  [{ note: 'C5', vel: 0.7, pan: 0.6 }],
  [{ note: 'F5', vel: 0.6, pan: 0.5 }],

  [{ note: 'D3', vel: 0.7, pan: 0.3 }, { note: 'D5', vel: 0.65, pan: 0.7 }],
  [{ note: 'C5', vel: 0.5, pan: 0.4 }],
  [{ note: 'Bb4', vel: 0.6, pan: 0.6 }],
  [{ note: 'A4', vel: 0.55, pan: 0.5 }],

  [{ note: 'Bb2', vel: 0.75, pan: 0.3 }, { note: 'G4', vel: 0.6, pan: 0.7 }],
  [{ note: 'F4', vel: 0.5, pan: 0.4 }],
  [{ note: 'G4', vel: 0.6, pan: 0.6 }],
  [{ note: 'A4', vel: 0.65, pan: 0.5 }],

  [{ note: 'C3', vel: 0.75, pan: 0.3 }, { note: 'G3', vel: 0.6, pan: 0.7 }],
  [{ note: 'E4', vel: 0.5, pan: 0.4 }],
  [{ note: 'G4', vel: 0.6, pan: 0.6 }],
  [{ note: 'E4', vel: 0.5, pan: 0.5 }]
];

// 2. Paroles de Sages (Sékou le Griot - calm contemplative storytelling kora)
const sagesPattern = [
  [{ note: 'D3', vel: 0.8, pan: 0.3 }, { note: 'A3', vel: 0.6, pan: 0.7 }],
  null,
  [{ note: 'D4', vel: 0.5, pan: 0.5 }],
  [{ note: 'F4', vel: 0.6, pan: 0.6 }],
  [{ note: 'A4', vel: 0.7, pan: 0.4 }],
  null,
  [{ note: 'F4', vel: 0.5, pan: 0.6 }],
  [{ note: 'D4', vel: 0.5, pan: 0.5 }],
  [{ note: 'G2', vel: 0.75, pan: 0.3 }, { note: 'D4', vel: 0.6, pan: 0.7 }],
  null,
  [{ note: 'Bb4', vel: 0.65, pan: 0.5 }],
  [{ note: 'A4', vel: 0.5, pan: 0.6 }],
  [{ note: 'G4', vel: 0.6, pan: 0.4 }],
  null,
  [{ note: 'F4', vel: 0.5, pan: 0.5 }],
  [{ note: 'E4', vel: 0.5, pan: 0.5 }]
];

const targetDir = path.join(__dirname, '..', 'web-app', 'public', 'assets', 'audio');

generateKoraTrack({
  outputPath: path.join(targetDir, 'diarabi.mp3'),
  durationSeconds: 45,
  tempoBpm: 92,
  notesPattern: diarabiPattern,
  scaleFrequencies: koraScale
});

generateKoraTrack({
  outputPath: path.join(targetDir, 'paroles_sages.mp3'),
  durationSeconds: 45,
  tempoBpm: 76,
  notesPattern: sagesPattern,
  scaleFrequencies: koraScale
});

generateKoraTrack({
  outputPath: path.join(targetDir, 'kora_masters.mp3'),
  durationSeconds: 45,
  tempoBpm: 104,
  notesPattern: diarabiPattern,
  scaleFrequencies: koraScale
});

generateKoraTrack({
  outputPath: path.join(targetDir, 'anansi.mp3'),
  durationSeconds: 45,
  tempoBpm: 80,
  notesPattern: sagesPattern,
  scaleFrequencies: koraScale
});
