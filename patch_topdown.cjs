const fs = require('fs');

// We are going to replace the hand-drawn topdown sprite in topdown.ts with the actual 
// PENKO_IDLE[0] matrix, but slightly modified, so it retains its natural "side-profile" 
// look but we use it as the top-down character representation to prevent it from looking "squished".
const idle = require('./components/penko_anim/idle.ts').PENKO_IDLE;
const walk = require('./components/penko_anim/walk.ts').PENKO_WALK;
const walkRight = require('./components/penko_anim/walk_right.ts').PENKO_WALK_RIGHT;
const idleRight = require('./components/penko_anim/jump_right.ts').PENKO_JUMP_RIGHT; // We'll just use the first frame of jump_right or build one

let newTopdownContent = `
import { PENKO_IDLE } from './idle';
import { PENKO_WALK } from './walk';
import { PENKO_WALK_RIGHT } from './walk_right';

// To keep Penko looking consistent and prevent him from looking "squished", 
// we will just reuse his perfectly proportioned 16x16 side-profile sprites 
// for the top-down visualizer. We can map the directions to these existing frames.

// Flip a matrix horizontally for Left animations
const flipMatrix = (matrix) => {
  return matrix.map(row => [...row].reverse());
};

export const PENKO_TOPDOWN = {
  // Down/Up just use the standard facing-forward idle and walk
  idle_down: PENKO_IDLE,
  walk_down: PENKO_WALK,
  idle_up: PENKO_IDLE,
  walk_up: PENKO_WALK,
  
  // Right uses the walk_right animations
  idle_right: [PENKO_WALK_RIGHT[1]], // The middle standing frame of walk_right
  walk_right: PENKO_WALK_RIGHT,
  
  // Left is just Right flipped horizontally
  idle_left: [flipMatrix(PENKO_WALK_RIGHT[1])],
  walk_left: PENKO_WALK_RIGHT.map(flipMatrix)
};
`;

fs.writeFileSync('components/penko_anim/topdown.ts', newTopdownContent);
