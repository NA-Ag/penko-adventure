const fs = require('fs');

function fix(file, mode) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  // Fix internal cartridge service import
  content = content.replace(/import { CartridgeService } from '\.\.\/adventure\/advanced\/CartridgeService';/g, "import { CartridgeService } from './CartridgeService';");
  
  // Fix browser utils
  const utils = ['BrowserPreGenerator', 'BrowserVocabularyManager', 'BrowserStructuredOutput', 'BrowserContextCompressor', 'BrowserBatchGenerator'];
  utils.forEach(u => {
    content = content.replace(new RegExp("import { " + u + " } from '\\./" + u + "';", 'g'), "import { " + u + " } from '../../browser/" + u + "';");
  });

  // Fix data imports
  content = content.replace(/import { getPromptSet, PROMPTS } from '\.\.\/\.\./data/prompts';/g, "import { getPromptSet, PROMPTS } from '../../../data/adventure/" + mode + "/prompts';");
  content = content.replace(/import { getFewShot } from '\.\.\/\.\./data/fewShots';/g, "import { getFewShot } from '../../../data/fewShots';");
  content = content.replace(/import { TRANSLATIONS } from '\.\.\/\.\./translations';/g, "import { TRANSLATIONS } from '../../../translations';");
  content = content.replace(/import { Language } from '\.\.\/\.\./types';/g, "import { Language } from '../../../types';");
  content = content.replace(/import { Cartridge } from \"\.\.\/\.\./types\/Cartridge\";/g, 'import { Cartridge } from "../../../types/Cartridge";');
  content = content.replace(/import { DEBUG } from '\.\.\/\.\./config';/g, "import { DEBUG } from '../../../config';");
  content = content.replace(/import { BaseService } from '\.\.\/BaseService';/g, "import { BaseService } from '../../BaseService';");

  fs.writeFileSync(file, content);
}

fix('services/adventure/advanced/OptimizedBrowserService.ts', 'advanced');
fix('services/adventure/beginner/OptimizedBrowserService.ts', 'beginner');
console.log('Optimized imports fixed.');
