import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './ui/App';
import './ui/game.css';
import { perfMark } from './platform/performance';
import { ItemArtProvider } from './ui/ItemArtContext';
perfMark('entry');
const PerformanceTools = lazy(() => import('./ui/PerformanceTools'));
const diagnostics = new URLSearchParams(location.search).get('perf') === '1';
const canvasDiagnostic = diagnostics && new URLSearchParams(location.search).get('renderer') === 'canvas';

class GameBoundary extends React.Component<{children: React.ReactNode}, {error: boolean}> {
  state = {error: false};
  static getDerivedStateFromError() { return {error: true}; }
  render() { return this.state.error ? <main className="boot-screen"><div className="boot-card"><h1>小店需要缓一缓</h1><p>画面遇到了一点问题。已保存的进度仍在，刷新后可以继续。</p><button className="primary" onClick={() => location.reload()}>重新回到鹅巷</button></div></main> : this.props.children; }
}
createRoot(document.getElementById('root')!).render(<GameBoundary><ItemArtProvider value={canvasDiagnostic ? { renderer: 'canvas' } : {}}><App /></ItemArtProvider>{diagnostics && <Suspense fallback={null}><PerformanceTools/></Suspense>}</GameBoundary>);
