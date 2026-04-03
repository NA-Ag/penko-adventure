const fs = require('fs');

let content = fs.readFileSync('services/cartridge/llm.worker.ts', 'utf-8');

// I introduced a syntax error earlier today by replacing try/catch blocks blindly.
// Let's count open/close braces for the onmessage function and fix it safely.
// The easiest way is to just grab the whole file, strip the end, and properly close it.

const endMarker = `            self.postMessage({ type: 'complete', id, payload: generatedText });`;
const idx = content.lastIndexOf(endMarker);
if (idx !== -1) {
    const validContent = content.substring(0, idx + endMarker.length);
    // We are inside an 'if (type === "generate_turn") { ...try...catch... }'
    // which is inside 'self.onmessage = async (event) => { ...try...catch...}'
    // Let's close them cleanly.
    const newEnd = `
        } // close if generate_turn
    } catch (error: any) {
        console.error("Worker Error:", error);
        self.postMessage({ type: 'error', id, payload: error.message });
    }
};`;
    fs.writeFileSync('services/cartridge/llm.worker.ts', validContent + newEnd);
}
