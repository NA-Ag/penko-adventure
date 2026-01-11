#!/bin/bash
# Auto-wrap remaining console.log/warn statements with DEBUG flags
# Run from project root: bash scripts/wrap-console-logs.sh

echo "Wrapping console statements with DEBUG flags..."

# OnnxService.ts - wrap with DEBUG.ONNX or DEBUG.ERRORS
sed -i 's/^        console\.log(/        if (DEBUG.ONNX) console.log(/g' services/OnnxService.ts
sed -i 's/^            console\.log(/            if (DEBUG.ONNX) console.log(/g' services/OnnxService.ts
sed -i 's/^                console\.log(/                if (DEBUG.ONNX) console.log(/g' services/OnnxService.ts

sed -i 's/^        console\.warn(/        if (DEBUG.ONNX) console.warn(/g' services/OnnxService.ts
sed -i 's/^            console\.warn(/            if (DEBUG.ONNX) console.warn(/g' services/OnnxService.ts
sed -i 's/^                console\.warn(/                if (DEBUG.ONNX) console.warn(/g' services/OnnxService.ts

sed -i 's/^        console\.error(/        if (DEBUG.ERRORS) console.error(/g' services/OnnxService.ts
sed -i 's/^            console\.error(/            if (DEBUG.ERRORS) console.error(/g' services/OnnxService.ts
sed -i 's/^                console\.error(/                if (DEBUG.ERRORS) console.error(/g' services/OnnxService.ts

# CustomTranslationEngine.ts - wrap with DEBUG.TRANSLATION
sed -i 's/^        console\.log(/        if (DEBUG.TRANSLATION) console.log(/g' services/CustomTranslationEngine.ts
sed -i 's/^            console\.log(/            if (DEBUG.TRANSLATION) console.log(/g' services/CustomTranslationEngine.ts
sed -i 's/^                console\.log(/                if (DEBUG.TRANSLATION) console.log(/g' services/CustomTranslationEngine.ts

sed -i 's/^        console\.warn(/        if (DEBUG.TRANSLATION) console.warn(/g' services/CustomTranslationEngine.ts
sed -i 's/^            console\.warn(/            if (DEBUG.TRANSLATION) console.warn(/g' services/CustomTranslationEngine.ts
sed -i 's/^                console\.warn(/                if (DEBUG.TRANSLATION) console.warn(/g' services/CustomTranslationEngine.ts

sed -i 's/^        console\.error(/        if (DEBUG.ERRORS) console.error(/g' services/CustomTranslationEngine.ts
sed -i 's/^            console\.error(/            if (DEBUG.ERRORS) console.error(/g' services/CustomTranslationEngine.ts
sed -i 's/^                console\.error(/                if (DEBUG.ERRORS) console.error(/g' services/CustomTranslationEngine.ts

# InputChecker.ts - wrap with DEBUG.INPUT_CHECKER
sed -i 's/^        console\.log(/        if (DEBUG.INPUT_CHECKER) console.log(/g' services/InputChecker.ts
sed -i 's/^            console\.log(/            if (DEBUG.INPUT_CHECKER) console.log(/g' services/InputChecker.ts
sed -i 's/^                console\.log(/                if (DEBUG.INPUT_CHECKER) console.log(/g' services/InputChecker.ts

sed -i 's/^        console\.warn(/        if (DEBUG.INPUT_CHECKER) console.warn(/g' services/InputChecker.ts
sed -i 's/^            console\.warn(/            if (DEBUG.INPUT_CHECKER) console.warn(/g' services/InputChecker.ts
sed -i 's/^                console\.warn(/                if (DEBUG.INPUT_CHECKER) console.warn(/g' services/InputChecker.ts

sed -i 's/^        console\.error(/        if (DEBUG.ERRORS) console.error(/g' services/InputChecker.ts
sed -i 's/^            console\.error(/            if (DEBUG.ERRORS) console.error(/g' services/InputChecker.ts
sed -i 's/^                console\.error(/                if (DEBUG.ERRORS) console.error(/g' services/InputChecker.ts

echo "✅ Done! Now add imports to the 3 files:"
echo ""
echo "Add to services/OnnxService.ts (line 7):"
echo "  // Already added!"
echo ""
echo "Add to services/CustomTranslationEngine.ts (top):"
echo "  import { DEBUG } from '../config';"
echo ""
echo "Add to services/InputChecker.ts (top):"
echo "  import { DEBUG } from '../config';"
echo ""
echo "Verify with: grep -c 'if (DEBUG' services/*.ts"
