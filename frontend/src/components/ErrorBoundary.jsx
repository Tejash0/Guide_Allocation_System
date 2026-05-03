import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unknown error' };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error:', error, info.componentStack);
  }

  handleReload() {
    window.location.reload();
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
        backgroundColor: '#f8f9fa',
      }}>
        <div style={{
          background: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: 8,
          padding: '2rem 2.5rem',
          maxWidth: 480,
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          <h2 style={{ color: '#dc3545', marginBottom: '0.5rem' }}>
            Something went wrong
          </h2>
          <p style={{ color: '#6c757d', marginBottom: '1.5rem', fontSize: 14 }}>
            An unexpected error occurred. The details have been logged to the console.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              background: '#0d6efd',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '0.5rem 1.25rem',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }
}
