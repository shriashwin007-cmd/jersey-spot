import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(err) {
    return { error: err };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          position: 'fixed', inset: 0, background: '#000', color: '#f5b800',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', fontFamily: 'monospace', padding: '2rem',
          zIndex: 9999,
        }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>⚠ Render Error</h1>
          <pre style={{ fontSize: '0.8rem', color: '#ff6644', maxWidth: '800px', whiteSpace: 'pre-wrap', overflowY: 'auto', maxHeight: '60vh' }}>
            {this.state.error?.toString()}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
