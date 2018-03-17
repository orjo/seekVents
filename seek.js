var cw = 320;
var ch = 80;
var stepsn = 16;
var stepw = cw / stepsn;
var step = 0;
var pattern = [];
var oscref = [];
var sound = ['s1', 's2', 's3', 's4'];
var soundColor = ['#AA7F39', '#AA6439', '#256E5D', '#2C4870'];
var rulerColor;
var os = [];
var low = 80;
var hi = 600;
var fps = 6;

var setup = function() {
  var canvas = createCanvas(320, 80);
  canvas.parent('canvas-wrapper');
  frameRate(fps);
  rulerColor = color(255, 96);

  // load from param
  var url = new URL(window.location.href);
  var c = url.searchParams.get("c");
  if (c && c.length) {
    loadB64ToState(c);
  }
  resetSketch();


  // event listeners
  document.getElementById('reset').addEventListener('click', function() {
    resetSketch('hard');
  });
  document.getElementById('fps').addEventListener('change', function() {
    fps = parseInt(this.options[this.selectedIndex].value);
    resetSketch('speedOnly')
  });
  document.getElementById('load').addEventListener('click', function() {
    loadB64ToState(readB64FromTextarea());
    resetSketch();
  });
  document.getElementById('copylink').addEventListener('click', function() {
    document.getElementById('blink').select();
    document.execCommand('Copy');
  });
  document.getElementById('copycode').addEventListener('click', function() {
    document.getElementById('b64').select();
    document.execCommand('Copy');
  });
  document.getElementById('b64').addEventListener('click', function() {
    this.select();
  });

}

var draw = function() {
  background(0);
  renderPattern();
  renderRuler();

  playSound();

  stepAhead();
}

var resetSketch = function(pressed) {
  if (pressed === 'speedOnly') {
    frameRate(fps);
    writeB64ToTextarea();
    writeB64Link();
    return;
  }

  step = 0;
  frameRate(fps);
  document.getElementById('fps').value = fps;

  // only clear data if button was manually pressed
  if (pressed === 'hard') {
    pattern = [];
    oscref = [];
  }

  if (!pattern.length) {
    generatePattern();
  }

  if (!oscref.length) {
    oscref = getRandomSounds();
  }

  if (os.length) {
    removeOscillators();
    os = [];
  }

  oscref.forEach(function(el) {
    initOsc(os, el.type, el.hz);
  });

  writeB64ToTextarea();
  writeB64Link();
}

var getRandomSounds = function() {
  var arr = [];
  arr.push({
    type: 'sine',
    hz: getRand(low, hi)
  });
  arr.push({
    type: 'triangle',
    hz: getRand(low, hi)
  });
  arr.push({
    type: 'sawtooth',
    hz: getRand(low, hi)
  });
  arr.push({
    type: 'square',
    hz: getRand(low, hi)
  });
  return arr;
};

var removeOscillators = function() {
  os.forEach(function(o) {
    o.stop();
    delete o;
  });
}

var getRand = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}



var stepAhead = function() {
  step = (step + 1) < stepsn ? ++step : 0;
}

var renderRuler = function() {
  fill(rulerColor);
  rect(step * stepw, 0, stepw, ch);
}

var renderPattern = function() {
  pattern.forEach(function(p, pi) {
    sound.forEach(function(s, si) {
      if (p[s]) {
        fill(soundColor[si]);
        rect(pi * stepw, si * stepw, stepw, stepw);
      }
    });
  });
}


var generatePattern = function() {
  var r = 3;
  for (i = 0; i < stepsn; i++) {
    pattern.push({
      s1: randChance(r),
      s2: randChance(r),
      s3: randChance(r),
      s4: randChance(r)
    });
  }
}

var randChance = function(x) {
  if (x === 0) return false;

  return Math.random() < 1 / x;
}


var initOsc = function(osc, type, freq) {
  osc.push(new p5.Oscillator());
  var i = osc.length - 1;
  osc[i].setType(type);
  osc[i].freq(freq);
  osc[i].amp(0);
  osc[i].start();
}

var playSound = function() {
  os.forEach(function(o, oi) {
    if (pattern[step][sound[oi]]) {
      o.amp(0.2, 0.05);
    } else {
      o.amp(0, 0.05);
    }
  });
}


var getState = function() {
  return {
    pattern: pattern,
    oscref: oscref,
    fps: fps
  };
}

var objectToB64 = function(obj) {
  return btoa(JSON.stringify(obj));
}

var writeB64ToTextarea = function() {
  document.getElementById('b64').value = objectToB64(getState());
}

var writeB64Link = function() {
  document.getElementById('blink').value = 'http://orjo.net/seekVents/?c=' + objectToB64(getState());
}

var readB64FromTextarea = function() {
  return document.getElementById('b64').value;
}

var loadB64ToState = function(b) {
  var state = JSON.parse(atob(b));
  fps = state.fps;
  pattern = state.pattern;
  oscref = state.oscref;
}