import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './ui/App';
import './ui/styles.css';

class GameBoundary extends React.Component<{children: React.ReactNode}, {error: boolean}> {
  state = {error: false};
  static getDerivedStateFromError() { return {error: true}; }
  render() { return this.state.error ? <main className="boot-screen"><div className="boot-card"><h1>小店需要缓一缓</h1><p>画面遇到了一点问题。已保存的进度仍在，刷新后可以继续。</p><button className="primary" onClick={() => location.reload()}>重新回到鹅巷</button></div></main> : this.props.children; }
}
createRoot(document.getElementById('root')!).render(<GameBoundary><App /></GameBoundary>);
