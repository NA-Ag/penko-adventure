/**
 * Model File Manifests for Virtual File System
 *
 * Each model has a list of files that need to be downloaded and cached
 * at /local-model/* for the virtual file system to serve.
 */

export interface ModelFile {
  name: string;      // Filename only (for display)
  path: string;      // Relative path for caching (e.g., "onnx/model_q4.onnx")
  url: string;       // Full HuggingFace URL
}

export const MODEL_FILES: Record<string, ModelFile[]> = {
  // Tiny: IBM Granite 4.0 350M (~700MB)
  'onnx-community/granite-4.0-350m-ONNX-web': [
    { name: 'config.json', path: 'config.json', url: 'https://huggingface.co/onnx-community/granite-4.0-350m-ONNX-web/resolve/main/config.json' },
    { name: 'tokenizer.json', path: 'tokenizer.json', url: 'https://huggingface.co/onnx-community/granite-4.0-350m-ONNX-web/resolve/main/tokenizer.json' },
    { name: 'tokenizer_config.json', path: 'tokenizer_config.json', url: 'https://huggingface.co/onnx-community/granite-4.0-350m-ONNX-web/resolve/main/tokenizer_config.json' },
    { name: 'generation_config.json', path: 'generation_config.json', url: 'https://huggingface.co/onnx-community/granite-4.0-350m-ONNX-web/resolve/main/generation_config.json' },
    { name: 'model_q4.onnx', path: 'onnx/model_q4.onnx', url: 'https://huggingface.co/onnx-community/granite-4.0-350m-ONNX-web/resolve/main/onnx/model_q4.onnx' },
    { name: 'model_q4.onnx_data', path: 'onnx/model_q4.onnx_data', url: 'https://huggingface.co/onnx-community/granite-4.0-350m-ONNX-web/resolve/main/onnx/model_q4.onnx_data' }
  ],

  // Small: Qwen 2.5 0.5B (~600MB) - RECOMMENDED
  'onnx-community/Qwen2.5-0.5B-Instruct': [
    { name: 'config.json', path: 'config.json', url: 'https://huggingface.co/onnx-community/Qwen2.5-0.5B-Instruct/resolve/main/config.json' },
    { name: 'tokenizer.json', path: 'tokenizer.json', url: 'https://huggingface.co/onnx-community/Qwen2.5-0.5B-Instruct/resolve/main/tokenizer.json' },
    { name: 'tokenizer_config.json', path: 'tokenizer_config.json', url: 'https://huggingface.co/onnx-community/Qwen2.5-0.5B-Instruct/resolve/main/tokenizer_config.json' },
    { name: 'generation_config.json', path: 'generation_config.json', url: 'https://huggingface.co/onnx-community/Qwen2.5-0.5B-Instruct/resolve/main/generation_config.json' },
    { name: 'model_q4.onnx', path: 'onnx/model_q4.onnx', url: 'https://huggingface.co/onnx-community/Qwen2.5-0.5B-Instruct/resolve/main/onnx/model_q4.onnx' }
  ],

  // Medium: Qwen 2.5 1.5B (~1.8GB)
  'onnx-community/Qwen2.5-1.5B': [
    { name: 'config.json', path: 'config.json', url: 'https://huggingface.co/onnx-community/Qwen2.5-1.5B/resolve/main/config.json' },
    { name: 'tokenizer.json', path: 'tokenizer.json', url: 'https://huggingface.co/onnx-community/Qwen2.5-1.5B/resolve/main/tokenizer.json' },
    { name: 'tokenizer_config.json', path: 'tokenizer_config.json', url: 'https://huggingface.co/onnx-community/Qwen2.5-1.5B/resolve/main/tokenizer_config.json' },
    { name: 'generation_config.json', path: 'generation_config.json', url: 'https://huggingface.co/onnx-community/Qwen2.5-1.5B/resolve/main/generation_config.json' },
    { name: 'model_q4.onnx', path: 'onnx/model_q4.onnx', url: 'https://huggingface.co/onnx-community/Qwen2.5-1.5B/resolve/main/onnx/model_q4.onnx' }
  ],

  // Reasoning: DeepSeek-R1-Distill-Qwen-1.5B (~1.5GB)
  'onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX': [
    { name: 'config.json', path: 'config.json', url: 'https://huggingface.co/onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX/resolve/main/config.json' },
    { name: 'tokenizer.json', path: 'tokenizer.json', url: 'https://huggingface.co/onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX/resolve/main/tokenizer.json' },
    { name: 'tokenizer_config.json', path: 'tokenizer_config.json', url: 'https://huggingface.co/onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX/resolve/main/tokenizer_config.json' },
    { name: 'generation_config.json', path: 'generation_config.json', url: 'https://huggingface.co/onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX/resolve/main/generation_config.json' },
    { name: 'model_q4.onnx', path: 'onnx/model_q4.onnx', url: 'https://huggingface.co/onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX/resolve/main/onnx/model_q4.onnx' }
  ]
};

export function getModelFiles(modelId: string): ModelFile[] {
  const files = MODEL_FILES[modelId];
  if (!files) {
    throw new Error(`Unknown model: ${modelId}. Available models: ${Object.keys(MODEL_FILES).join(', ')}`);
  }
  return files;
}
