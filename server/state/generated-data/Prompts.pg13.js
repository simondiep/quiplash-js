export function getRandomPG13Prompt() {
  return prompts[Math.floor(Math.random() * prompts.length)];
}

const prompts = [
  "Tristan\u2019s favorite drink is ___",
  "You have 24 hours to prepare for a fight against Tristan.  What do you do and what do you bring?",
  "Define the axes on which Tristan rates food quality.",
  "What would Tristan name his cat?",
  "What is Tristan\u2019s go-to workout song?",
  "What is Tristan\u2019s favorite movie?",
  "Tristan has lost his water bottle again.  Where did he leave it this time?",
];
