const fs = require('fs');

let content = fs.readFileSync('services/cartridge/llm.worker.ts', 'utf-8');

// Replace the block exactly to ensure brace balance
const badBlock = `            } catch (e: any) {
                // If returning true throws an internal pipeline abortion error, catch it gracefully
                if (e.message && e.message.includes('abort')) {
                    generatedText = generatedOutput.trim();
                } else {
                    throw e;
                }
            }
            
            self.postMessage({ type: 'complete', id, payload: generatedText });
        }
    } catch (error: any) {`;

const goodBlock = `            } catch (e: any) {
                // If returning true throws an internal pipeline abortion error, catch it gracefully
                if (e.message && e.message.includes('abort')) {
                    generatedText = generatedOutput.trim();
                } else {
                    throw e;
                }
            }
            
            self.postMessage({ type: 'complete', id, payload: generatedText });
        } // Close else if (type === 'generate_turn')
    } catch (error: any) {`;

content = content.replace(badBlock, goodBlock);
fs.writeFileSync('services/cartridge/llm.worker.ts', content);
