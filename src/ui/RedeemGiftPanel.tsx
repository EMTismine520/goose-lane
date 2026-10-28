import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Check, Gift, Info, LoaderCircle, LockKeyhole, Zap } from 'lucide-react';
import { GIFT_CODE_MAX_LENGTH } from '../content/gift-codes';
import type { GiftRedemptionResult } from '../platform/game-controller';
import { GiftArtwork, giftTierFor, GIFT_TITLES } from './GiftArtwork';

interface Props {
  busy: boolean;
  readOnly: boolean;
  redeemGift: (key: string) => Promise<GiftRedemptionResult>;
  onPendingChange: (pending: boolean) => void;
}

export function RedeemGiftPanel({ busy, readOnly, redeemGift, onPendingChange }: Props) {
  const id = useId();
  const [key, setKey] = useState('');
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<GiftRedemptionResult | null>(null);
  const running = useRef(false), composing = useRef(false), alive = useRef(false);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const locked = busy || pending;
  const received = result?.ok ? result : null;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (running.current || busy || readOnly || composing.current) return;
    if (!key.trim()) { setResult({ ok: false, message: '请输入兑换码。' }); return; }
    running.current = true;
    setPending(true); onPendingChange(true); setResult(null);
    try {
      const next = await redeemGift(key);
      if (!alive.current) return;
      setResult(next);
      if (next.ok) setKey('');
    } catch (cause) {
      if (alive.current) setResult({ ok: false, message: cause instanceof Error ? cause.message : '兑换未完成，请重试。' });
    } finally {
      running.current = false;
      if (alive.current) { setPending(false); onPendingChange(false); }
    }
  };

  return <section className={`gift-panel ${result?.ok ? 'gift-panel--success' : ''}`} aria-busy={pending}>
    <div className="gift-hero">
      <GiftArtwork amount={received?.energyAdded} opened={!!received}/>
      <h3>{received ? GIFT_TITLES[giftTierFor(received.energyAdded)] : '一份心意，满满体力'}</h3>
      <p>{received ? '好好收下，继续经营你的小馆' : '输入兑换码，开启一份新活力'}</p>
    </div>
    <form className="gift-form" onSubmit={event => void submit(event)}>
      <div className="gift-input-heading"><label htmlFor={id}>兑换码</label><span>支持粘贴</span></div>
      <input id={id} type="text" inputMode="text" value={key} maxLength={GIFT_CODE_MAX_LENGTH}
        placeholder="请输入兑换码" autoComplete="off" autoCorrect="off" autoCapitalize="characters" spellCheck={false}
        readOnly={locked} aria-invalid={result?.ok === false} aria-describedby={`${id}-feedback ${id}-rules`}
        onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }}
        onKeyDown={event => { if (event.key === 'Enter' && (composing.current || event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229)) event.preventDefault(); }}
        onChange={event => { setKey(event.target.value); setResult(null); }}/>
      <button className="primary gift-submit" type="submit" disabled={locked || readOnly || !key.trim()}>
        {pending ? <LoaderCircle size={19} className="spinning"/> : <Gift size={19}/>}{pending ? '兑换中…' : '立即兑换'}
      </button>
    </form>
    <div className="gift-feedback" id={`${id}-feedback`}>
      {pending ? <p role="status" className="gift-pending">正在保存体力，请稍候…</p>
        : result?.ok ? <div className="gift-success" role="status"><span><Check size={20}/></span><div><b>兑换成功，体力 +{result.energyAdded.toLocaleString()}</b><small>到账后体力 {result.energyValue.toLocaleString()} 点</small></div></div>
        : result ? <p className="gift-error" role="alert"><Info size={18}/><span>{result.message}</span></p>
        : !readOnly && <p className="gift-hint">准备好兑换码，就可以领取啦</p>}
      {readOnly && <p className="gift-readonly" role="status"><LockKeyhole size={17}/><span>当前窗口只读。请关闭弹窗，通过顶部“接管”取得经营权限后再兑换。</span></p>}
    </div>
    <p className="gift-rules" id={`${id}-rules`}><Zap size={15}/><span>有效兑换码可重复使用<br/>奖励超过 100 点也会完整保留</span></p>
  </section>;
}
