/// <reference types="vite/client" />

// Type definitions for Vite worker imports
declare module '*?worker&url' {
  const workerUrl: string;
  export default workerUrl;
}

declare module '*?worker' {
  const WorkerFactory: new () => Worker;
  export default WorkerFactory;
}
