import { useState } from 'react';
import { performanceSnapshot } from '../platform/performance';
import { downloadText } from './useGame';

/** Mounted only for an explicit perf=1 session; all records stay on this device. */
export default function PerformanceTools({ label = '当前存档' }: { label?: string }) {
  const [open, setOpen] = useState(false), [report, setReport] = useState('');
  return <aside className="performance-tools"><button onClick={() => setOpen(value => !value)} aria-expanded={open}>性能记录</button>{open && <div>
    <p>{label}</p><p>记录启动、资源、实际绘制帧与指令耗时；无远程上报。</p>
    <button onClick={() => setReport(JSON.stringify(performanceSnapshot(), null, 2))}>生成诊断报告</button>
    <button onClick={() => downloadText(JSON.stringify(performanceSnapshot(), null, 2), 'goose-performance.json')}>导出本次记录</button>
    {report && <pre data-performance-report style={{ maxHeight: '30vh', overflow: 'auto', fontSize: 10, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{report}</pre>}
    <button onClick={() => setOpen(false)}>收起</button>
  </div>}</aside>;
}
