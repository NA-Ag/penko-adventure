
class RecorderProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 4096;
    this._buffer = new Float32Array(this.bufferSize);
    this._bytesWritten = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input && input.length > 0) {
      const channel0 = input[0];
      
      // Append to buffer
      this.append(channel0);
      
      // Calculate RMS for VAD (Volume Detection)
      // Doing this here saves the main thread from iterating thousands of samples
      let sum = 0;
      for (let i = 0; i < channel0.length; i++) {
        sum += channel0[i] * channel0[i];
      }
      const rms = Math.sqrt(sum / channel0.length);
      
      // Send volume update for Visualizer/VAD
      this.port.postMessage({ type: 'volume', volume: rms });
    }
    return true;
  }

  append(channelData) {
    if (this._bytesWritten + channelData.length > this.bufferSize) {
      this.flush();
    }
    this._buffer.set(channelData, this._bytesWritten);
    this._bytesWritten += channelData.length;
    
    if (this._bytesWritten >= this.bufferSize) {
      this.flush();
    }
  }

  flush() {
    // Send the full buffer to the main thread
    // We slice it to send a copy, not the reference which gets overwritten
    this.port.postMessage({ 
        type: 'audio', 
        data: this._buffer.slice(0, this._bytesWritten) 
    });
    this._bytesWritten = 0;
  }
}

registerProcessor('recorder.worklet', RecorderProcessor);
