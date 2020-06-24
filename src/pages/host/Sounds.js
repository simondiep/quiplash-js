const GLOBAL_VOLUME = 0.05;

export function playBackgroundMusic() {
  const music = document.getElementById("bg-music");
  music.volume = GLOBAL_VOLUME / 6;
  music.play();
}

export function playPunchSound() {
  playSound("sound-punch");
}

export function playWooYeahSound() {
  playSound("sound-woo-yeah");
}

function playSound(elementId) {
  const sound = document.getElementById(elementId);
  sound.volume = GLOBAL_VOLUME;
  sound.play();
}

export function speakText(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  // utterance.lang = "en-GB";
  utterance.rate = 1.2;
  // utterance.pitch = 2;
  utterance.volume = 0.25;
  window.speechSynthesis.speak(utterance);
}
