let audioContext;
let analyser;
let dataArray;
let currentNote = null;

const micSelect = document.getElementById("micSelect");
const startBtn = document.getElementById("startBtn");
const noteDisplay = document.getElementById("note");

// Piano sampler
const sampler = new Tone.Sampler({
  urls: {
    A0: "A0.mp3",
    C1: "C1.mp3",
    D#1: "Ds1.mp3",
    F#1: "Fs1.mp3",
    A1: "A1.mp3",
    C2: "C2.mp3",
    D#2: "Ds2.mp3",
    F#2: "Fs2.mp3",
    A2: "A2.mp3",
    C3: "C3.mp3",
    D#3: "Ds3.mp3",
    F#3: "Fs3.mp3",
    A3: "A3.mp3",
    C4: "C4.mp3",
    D#4: "Ds4.mp3",
    F#4: "Fs4.mp3",
    A4: "A4.mp3",
    C5: "C5.mp3",
    D#5: "Ds5.mp3",
    F#5: "Fs5.mp3",
    A5: "A5.mp3",
    C6: "C6.mp3",
    D#6: "Ds6.mp3",
    F#6: "Fs6.mp3",
    A6: "A6.mp3",
    C7: "C7.mp3",
    D#7: "Ds7.mp3",
    F#7: "Fs7.mp3",
    A7: "A7.mp3",
    C8: "C8.mp3"
  },
  release: 1,
  baseUrl: "https://tonejs.github.io/audio/salamander/"
}).toDestination();

async function loadMics() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const mics = devices.filter(d => d.kind === "audioinput");

  micSelect.innerHTML = "";
  mics.forEach((mic, index) => {
    const option = document.createElement("option");
    option.value = mic.deviceId;
    option.text = mic.label || `Microphone ${index + 1}`;
    micSelect.appendChild(option);
  });
}

startBtn.addEventListener("click", async () => {
  await Tone.start();

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      deviceId: micSelect.value ? { exact: micSelect.value } : undefined
    }
  });

  audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);

  analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;

  source.connect(analyser);

  dataArray = new Float32Array(analyser.fftSize);

  detectPitch();
});

function detectPitch() {
  analyser.getFloatTimeDomainData(dataArray);
  const pitch = autoCorrelate(dataArray, audioContext.sampleRate);

  if (pitch !== -1) {
    const note = frequencyToNote(pitch);

    noteDisplay.innerText = note;

    if (note !== currentNote) {
      sampler.triggerAttackRelease(note, "8n");
      currentNote = note;
    }
  }

  requestAnimationFrame(detectPitch);
}

function autoCorrelate(buffer, sampleRate) {
  let SIZE = buffer.length;
  let rms = 0;

  for (let i = 0; i < SIZE; i++) {
    rms += buffer[i] * buffer[i];
  }

  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1;

  let bestOffset = -1;
  let bestCorrelation = 0;

  for (let offset = 8; offset < 1000; offset++) {
    let correlation = 0;

    for (let i = 0; i < SIZE - offset; i++) {
      correlation += buffer[i] * buffer[i + offset];
    }

    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestOffset = offset;
    }
  }

  if (bestOffset === -1) return -1;

  return sampleRate / bestOffset;
}

function frequencyToNote(freq) {
  const noteStrings = ["C", "C#", "D", "D#", "E", "F",
                       "F#", "G", "G#", "A", "A#", "B"];

  const noteNum = 12 * (Math.log(freq / 440) / Math.log(2));
  const noteIndex = Math.round(noteNum) + 69;
  const octave = Math.floor(noteIndex / 12) - 1;
  const noteName = noteStrings[noteIndex % 12];

  return noteName + octave;
}

loadMics();
