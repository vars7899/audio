function unlockAudioContext(audioCtx) {
  if (audioCtx.state !== "suspended") return;
  const b = document.body;
  const events = ["touchstart", "touchend", "mousedown", "keydown"];
  events.forEach((e) => b.addEventListener(e, unlock, false));
  function unlock() {
    audioCtx.resume().then(clean);
  }
  function clean() {
    events.forEach((e) => b.removeEventListener(e, unlock));
  }
}

// select audio file
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
unlockAudioContext(audioContext);
const file = document.getElementById("upload");
let audioSource;
let analyser;

// create the canvas context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// update the canvas
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
let mid = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
};
const bassCircleArray = [];
const centerCircleArray = [];
let bassCirclePosition = [
  { x: 0, y: 0 },
  { x: 0, y: window.innerHeight },
  { x: window.innerWidth, y: 0 },
  { x: window.innerWidth, y: window.innerHeight },
];
const PI_2 = Math.PI * 2;
// event listeners
window.addEventListener("resize", () => {
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
  mid = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  };
  bassCirclePosition = [
    { x: 0, y: 0 },
    { x: 0, y: window.innerHeight },
    { x: window.innerWidth, y: 0 },
    { x: window.innerWidth, y: window.innerHeight },
  ];
});
// window.onload = run();

// function run() {
file.addEventListener("change", function () {
  const files = this.files;
  const audio = document.getElementById("audio");
  audio.src = URL.createObjectURL(files[0]); // put the selected audio into the player
  audio.load();
  audio.play();
  audioSource = audioContext.createMediaElementSource(audio);
  analyser = audioContext.createAnalyser();
  audioSource.connect(analyser);
  analyser.connect(audioContext.destination); // connect to speaker
  analyser.fftSize = 1024;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const barWidth = canvas.width / bufferLength;
  let barHeight;
  let x;

  function animate() {
    x = 0;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    analyser.getByteFrequencyData(dataArray);
    drawVisuals(bufferLength, dataArray, barWidth, barHeight, x);
    centerCircle();
    cornerBassCircle();
    requestAnimationFrame(animate);
  }
  animate();
});

class FillCircle {
  constructor(position) {
    // position of circle
    this.x = position.x;
    this.y = position.y;
    // speed of spreading
    this.spreadSpeed = 15;
    // size of the circle
    this.size = 5;
    this.color = "white";
  }
  drawCircle() {
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, PI_2);
    ctx.stroke();
  }
  updateCircle() {
    this.size += this.spreadSpeed;
  }
}
class CenterCircle {
  constructor(position) {
    // position of circle
    this.x = position.x;
    this.y = position.y;
    // speed of spreading
    this.spreadSpeed = 40;
    // size of the circle
    this.size = 5;
    this.color = "hsl(" + Math.random() * 360 + ",100%,10%)";
    this.width = 10;
  }
  drawCircle() {
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.width;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, PI_2);
    ctx.stroke();
  }
  updateCircle() {
    this.size += this.spreadSpeed;
    this.width--;
  }
}
class BombCircle {
  constructor(position) {
    this.x = position.x;
    this.y = position.y;
    this.size = Math.random() * 10 + 5;
    this.speedX = Math.random() * 12 - 6;
    this.speedY = Math.random() * 12 - 6;
    this.color = "hsl(" + Math.random() * 360 + ",100%,70%)";
  }
  drawBombCircle() {
    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, PI_2);
    ctx.stroke();
  }
  updateBombCircle() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.size >= 0.2) this.size -= 0.1;
  }
}

const cornerBassCircle = () => {
  for (let i = 0; i < bassCircleArray.length; i++) {
    bassCircleArray[i].drawBombCircle();
    bassCircleArray[i].updateBombCircle();
    if (bassCircleArray[i].size <= 0.3) {
      bassCircleArray.splice(i, 1);
      i--;
    }
  }
};
const centerCircle = () => {
  for (let i = 0; i < centerCircleArray.length; i++) {
    centerCircleArray[i].drawCircle();
    centerCircleArray[i].updateCircle();
    if (centerCircleArray[i].size > window.innerHeight / 3) {
      centerCircleArray.splice(i, 1);
    }
  }
};
function drawVisuals(bufferLength, dataArray, barWidth, barHeight, x) {
  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i] * 3;
    if (dataArray[i] > 150 && i > 210 && i < 250) {
      ctx.font = "900px Kalam";
      ctx.strokeText(
        "X",
        Math.random() * innerWidth,
        Math.random() * innerHeight
      );
    }

    if (dataArray[i] > 100 && i === 200) {
      ctx.font = "100px Noto Sans Devanagari";
      ctx.strokeText("स्वर", mid.x - 100, mid.y);
    }
    if (dataArray[i] > 250 && i < 1) {
      bassCircleArray.push(new BombCircle(bassCirclePosition[0]));
      bassCircleArray.push(new BombCircle(bassCirclePosition[1]));
      bassCircleArray.push(new BombCircle(bassCirclePosition[2]));
      bassCircleArray.push(new BombCircle(bassCirclePosition[3]));
      centerCircleArray.push(new CenterCircle(bassCirclePosition[0]));
      centerCircleArray.push(new CenterCircle(bassCirclePosition[1]));
      centerCircleArray.push(new CenterCircle(bassCirclePosition[2]));
      centerCircleArray.push(new CenterCircle(bassCirclePosition[3]));
    }
  }
}
// }
