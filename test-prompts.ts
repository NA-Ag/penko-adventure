import { getEducationalPromptSet } from './data/educational';
const p = getEducationalPromptSet('de', 'B2');
console.log(p.narrative('de', 'B2', {id: 'test', title: 'test', systemPrompt: 'test', objectives: []}, 'history', 'action', 'event'));