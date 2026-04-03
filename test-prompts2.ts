import { getEducationalPromptSet } from './data/educational';
const p_a2 = getEducationalPromptSet('de', 'A2');
const p_n5 = getEducationalPromptSet('ja', 'N5');
const p_n4 = getEducationalPromptSet('ja', 'N4');

console.log("=== A2 ===");
console.log(p_a2.narrative('de', 'A2', {id: 'car_sharing_debate', title: 'Car-Sharing Debate', systemPrompt: 'You are a traditionalist...', objectives: ['Formulate a logical argument']}, 'history', 'action', 'event'));

console.log("=== N5 ===");
console.log(p_n5.narrative('ja', 'N5', {id: 'test', title: 'test', systemPrompt: 'test', objectives: []}, 'history', 'action', 'event'));
