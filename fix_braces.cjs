const fs = require('fs');
let code = fs.readFileSync('services/cartridge/llm.worker.ts', 'utf-8');

// The worker still has syntax errors due to unmatched braces. 
// I will rewrite the end of the file strictly.
let newCode = code.replace(
    /            self\.postMessage\(\{ type: 'complete', id, payload: generatedText \}\);\n        \}\n        \} \/\/ Missing brace for if \(type === 'init_model'\) \.\.\. else if \(type === 'generate_turn'\) \{\n    \} catch \(error: any\) \{\n        console\.error\("Worker Error:", error\);\n        self\.postMessage\(\{ type: 'error', id, payload: error\.message \}\);\n    \}\n\};/,
    `            self.postMessage({ type: 'complete', id, payload: generatedText });
        } // End of generate_turn
    } catch (error: any) {
        console.error("Worker Error:", error);
        self.postMessage({ type: 'error', id, payload: error.message });
    }
};`
);

fs.writeFileSync('services/cartridge/llm.worker.ts', newCode);
