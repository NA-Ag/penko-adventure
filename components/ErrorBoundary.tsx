import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-900 to-black text-white flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-red-700 rounded-lg p-8 max-w-md shadow-2xl">
            <h1 className="text-2xl font-bold mb-4 text-red-500 font-pixel tracking-widest">SYSTEM CRITICAL</h1>
            <p className="text-gray-300 mb-4 font-mono text-sm">
              The engine encountered an unexpected error.
            </p>
            <div className="mb-6">
              <pre className="text-[10px] bg-black p-3 rounded text-green-500 overflow-auto max-h-32 font-mono border border-gray-700">
                {this.state.error?.toString()}
              </pre>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-3 px-4 rounded font-pixel tracking-wide"
            >
              REBOOT SYSTEM
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}