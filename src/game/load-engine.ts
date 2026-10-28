const importEngine = () => import('phaser');
import { perfMark } from '../platform/performance';
let engine: ReturnType<typeof importEngine> | undefined;
/** Started with App boot, concurrently with local save hydration. */
export function loadEngine() { return engine ??= importEngine().then(module => { perfMark('engine-ready'); return module; }).catch(error => { engine = undefined; throw error; }); }
