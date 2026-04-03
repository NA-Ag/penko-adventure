const fs = require('fs');

let content = fs.readFileSync('services/advanced/CartridgeService.ts', 'utf-8');

const simplifyLogic = `
            const firstSentence = (englishNarrative.match(/[^.!?]+[.!?]+/g) || [englishNarrative])[0] || englishNarrative;

            // OPTION C: Double Translation Hack for Simplification
            // We translate the complex English into the Native language, then back to English to flatten the vocabulary, 
            // and finally translate that flattened English to the Target language.
            let flattenedEnglish = firstSentence;
            if (this.profile.nativeLanguage !== Language.ENGLISH) {
                const tempNative = await this.translateAgent(firstSentence, 'en', this.profile.nativeLanguage);
                flattenedEnglish = await this.translateAgent(tempNative, this.profile.nativeLanguage, 'en');
            }

            // AGENT 2: Translate the English content back to the Target Language
            const [targetNarrative, targetSimplified] = await Promise.all([
                this.translateAgent(englishNarrative, 'en', this.profile.targetLanguage),
                this.translateAgent(flattenedEnglish, 'en', this.profile.targetLanguage)
            ]);
`;

content = content.replace(
    /            const firstSentence = \(englishNarrative\.match\(\/\[\^\.\!\?\]\+\[\.\!\?\]\+\/g\) \|\| \[englishNarrative\]\)\[0\] \|\| englishNarrative;[\s\S]*?            \/\/ AGENT 2: Translate the English content back to the Target Language[\s\S]*?            const \[targetNarrative, targetSimplified\] = await Promise\.all\(\[[\s\S]*?                this\.translateAgent\(englishNarrative, 'en', this\.profile\.targetLanguage\),[\s\S]*?                this\.translateAgent\(firstSentence, 'en', this\.profile\.targetLanguage\)[\s\S]*?            \]\);/,
    simplifyLogic
);

fs.writeFileSync('services/advanced/CartridgeService.ts', content);
