import { Component } from 'react';

/**
 * Catches render errors in a subtree so a single broken page shows a friendly
 * fallback instead of blanking the entire app.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Page crashed:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded p-6 text-sm text-red-800">
          <h2 className="font-semibold mb-2">Something went wrong on this page.</h2>
          <p className="font-mono text-xs mb-3 break-words">
            {String(this.state.error?.message || this.state.error)}
          </p>
          <button
            type="button"
            className="px-3 py-1.5 rounded bg-red-700 text-white text-sm cursor-pointer"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
