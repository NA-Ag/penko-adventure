import * as A1 from './A1/prompts';
import * as A2 from './A2/prompts';
import * as B1 from './B1/prompts';
import * as B2 from './B2/prompts';
import * as C1 from './C1/prompts';
import * as C2 from './C2/prompts';
import * as JLPT_N5 from './JLPT_N5/prompts';
import * as JLPT_N4 from './JLPT_N4/prompts';
import * as JLPT_N3 from './JLPT_N3/prompts';
import * as JLPT_N2 from './JLPT_N2/prompts';
import * as JLPT_N1 from './JLPT_N1/prompts';
import * as HSK_1 from './HSK_1/prompts';
import * as HSK_2 from './HSK_2/prompts';
import * as HSK_3 from './HSK_3/prompts';
import * as HSK_4 from './HSK_4/prompts';
import * as HSK_5 from './HSK_5/prompts';
import * as HSK_6 from './HSK_6/prompts';
import * as BASE from './prompts';

const LEVEL_MAP: Record<string, any> = {
    'A1': A1, 'A2': A2, 'B1': B1, 'B2': B2, 'C1': C1, 'C2': C2,
    'JLPT_N5': JLPT_N5, 'JLPT_N4': JLPT_N4, 'JLPT_N3': JLPT_N3, 'JLPT_N2': JLPT_N2, 'JLPT_N1': JLPT_N1,
    'HSK_1': HSK_1, 'HSK_2': HSK_2, 'HSK_3': HSK_3, 'HSK_4': HSK_4, 'HSK_5': HSK_5, 'HSK_6': HSK_6,
    // Add spaces for direct matches from CEFRLevel type if necessary
    'HSK 1': HSK_1, 'HSK 2': HSK_2, 'HSK 3': HSK_3, 'HSK 4': HSK_4, 'HSK 5': HSK_5, 'HSK 6': HSK_6,
    'N5': JLPT_N5, 'N4': JLPT_N4, 'N3': JLPT_N3, 'N2': JLPT_N2, 'N1': JLPT_N1
};

export const getEducationalPromptSet = (langCode: string, levelName: string) => {
    const levelModule = LEVEL_MAP[levelName];
    if (levelModule && levelModule.getEducationalPromptSet) {
        return levelModule.getEducationalPromptSet(langCode);
    }
    // Fallback to base if level not found
    return BASE.getEducationalPromptSet(langCode);
};
