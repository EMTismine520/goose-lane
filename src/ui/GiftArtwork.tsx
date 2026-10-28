import { useId } from 'react';
import type { CSSProperties } from 'react';

export type GiftTier = 'little' | 'ribbon' | 'treasure';
export const giftTierFor = (amount: number): GiftTier => amount >= 10_000 ? 'treasure' : amount >= 1000 ? 'ribbon' : 'little';
export const GIFT_TITLES: Record<GiftTier, string> = { little: '小鹅的活力礼', ribbon: '满满心意礼盒', treasure: '小鹅的活力宝箱' };
const SPARKS = [[-69,-57,1],[64,-62,.8],[-92,-25,.7],[91,-24,1],[-45,-81,.6],[39,-85,.8],[-74,13,.6],[76,15,.7],[-14,-93,.7],[17,-68,.6]];

function GooseSeal({ chest = false }: { chest?: boolean }) {
  return <g transform={`translate(130 ${chest ? 143 : 144})`}>
    <circle r="15" fill="#edc879" stroke="#9a713e" strokeWidth="1.7"/>
    <circle r="11.5" fill="#fff0bd" stroke="#ffe7a5" strokeWidth="1.2"/>
    <path d="M-6 5Q-10 0-5-1H0V-5Q-1-10 4-9Q9-9 7-5L4-2Q5 5-1 6Z" fill="#fffdf1" stroke="#7c6040" strokeWidth="1.2" strokeLinejoin="round"/>
    <path d="M7-6L12-4L7-3Z" fill="#d99546"/><circle cx="4" cy="-6.5" r=".9" fill="#60472e"/>
    <path d="M-4 2Q-1 5 1 1" fill="none" stroke="#d6cbaa" strokeLinecap="round"/>
  </g>;
}

/** Decorative only: the persisted command result, never an animation, awards energy. */
export function GiftArtwork({ amount = 100, opened = false }: { amount?: number; opened?: boolean }) {
  const id = 'gift-' + useId().replace(/:/g, '');
  const tier = giftTierFor(amount), chest = tier === 'treasure', deluxe = tier === 'ribbon';
  const fill = (name: string) => `url(#${id}-${name})`;
  const duration = chest ? '900ms' : deluxe ? '650ms' : '450ms';
  return <div className={`gift-artwork gift-artwork--${tier}${opened ? ' is-open' : ''}`} aria-hidden="true" style={{ '--gift-duration': duration } as CSSProperties}>
    <svg viewBox="0 0 260 200" focusable="false">
      <defs>
        <linearGradient id={`${id}-face`} x1="0" y1="0" x2=".25" y2="1" gradientUnits="objectBoundingBox">
          <stop stopColor={chest ? '#e7b66c' : deluxe ? '#719c7b' : '#fff1ce'}/><stop offset=".55" stopColor={chest ? '#d09a52' : deluxe ? '#4e7d60' : '#f0d6a1'}/><stop offset="1" stopColor={chest ? '#bb7f3c' : deluxe ? '#3d664e' : '#dfbc80'}/>
        </linearGradient>
        <linearGradient id={`${id}-lid`} x2="0" y2="1"><stop stopColor={chest ? '#f4cf8a' : deluxe ? '#a5c9a3' : '#fff9e5'}/><stop offset=".48" stopColor={chest ? '#dbac61' : deluxe ? '#6f9b77' : '#f7e1b7'}/><stop offset="1" stopColor={chest ? '#bd8345' : deluxe ? '#497454' : '#ddbb80'}/></linearGradient>
        <linearGradient id={`${id}-gold`} x2="1" y2="1"><stop stopColor="#fff1bc"/><stop offset=".3" stopColor="#e7bf66"/><stop offset=".6" stopColor="#f5d58d"/><stop offset="1" stopColor="#ba8744"/></linearGradient>
        <linearGradient id={`${id}-ribbon`} x2="1" y2=".3"><stop stopColor={deluxe ? '#fae8a9' : '#b8cea1'}/><stop offset=".5" stopColor={deluxe ? '#dfb45c' : '#6d9c75'}/><stop offset="1" stopColor={deluxe ? '#ffedb7' : '#9cba8b'}/></linearGradient>
        <radialGradient id={`${id}-halo`}><stop stopColor="#e5efb9" stopOpacity=".85"/><stop offset="1" stopColor="#e9ecd1" stopOpacity="0"/></radialGradient>
        <radialGradient id={`${id}-light`}><stop stopColor="#fffbd6"/><stop offset=".35" stopColor="#d8ed9b" stopOpacity=".8"/><stop offset="1" stopColor="#8cbb7c" stopOpacity="0"/></radialGradient>
      </defs>
      <ellipse cx="130" cy="111" rx="107" ry="83" fill={fill('halo')}/>
      <ellipse cx="131" cy="177" rx={chest ? 79 : 67} ry="8" fill="#977c4c" opacity=".14"/>
      <ellipse cx="131" cy="174" rx="52" ry="4" fill="#8b6c42" opacity=".1"/>
      <g className="gift-light">
        <ellipse cx="130" cy="91" rx="82" ry="79" fill={fill('light')}/>
        <path d="M119 122L92 21L119 35L133 119L150 30L175 17L143 122Z" fill="#d9eaa6" opacity=".35"/>
      </g>
      <g className="gift-object" strokeLinejoin="round" strokeLinecap="round">
        {chest ? <>
          <path d="M65 109L78 102H188L200 112L190 169H76Z" fill="#785336" stroke="#765031" strokeWidth="2"/>
          <path d="M72 111Q130 100 193 110L187 124H77Z" fill="#654b31"/>
          <path d="M77 112Q130 106 187 112L184 123H80Z" fill="#bbcf8c"/>
          <path d="M66 116L194 116L190 164Q189 171 181 172H77Q69 171 68 164Z" fill={fill('face')} stroke="#8c6138" strokeWidth="2"/>
          <path d="M72 131Q103 126 121 132M143 132Q166 127 188 132M73 153Q98 147 112 154M148 156Q170 150 186 153" fill="none" stroke="#a37340" strokeWidth="1.6" opacity=".65"/>
          <path d="M77 121V163M182 121V164M106 122L105 165M153 121V165" stroke="#f5ce87" opacity=".45"/>
          <path d="M85 117H98L100 170H86ZM164 117H177L176 170H162Z" fill={fill('gold')} stroke="#a77a40" strokeWidth="1.3"/>
          <path d="M67 119H80V128H69ZM182 119H194L193 128H182ZM69 158H81V171H76Q70 171 69 165ZM179 158H191L190 166Q189 171 180 171Z" fill={fill('gold')} stroke="#a77a40" strokeWidth="1.2"/>
          {[91,170].map(x => <g key={x}><circle cx={x} cy="124" r="2.1" fill="#fff0b0" stroke="#ad7e3f"/><circle cx={x} cy="163" r="2.1" fill="#fff0b0" stroke="#ad7e3f"/></g>)}
          <path d="M79 168H181" stroke="#f0bd6e" strokeWidth="2"/>
          <GooseSeal chest/>
        </> : <>
          <path d="M72 102L87 94H201L189 107L187 163L174 174H83Q74 173 74 164Z" fill={deluxe ? '#345840' : '#c1a06c'} stroke={deluxe ? '#3a6246' : '#a68a5d'} strokeWidth="2"/>
          <path d="M73 106H188V165Q188 172 181 173H82Q75 173 75 166Z" fill={fill('face')} stroke={deluxe ? '#3f684a' : '#ad8c58'} strokeWidth="2"/>
          <path d="M80 113H181V165H82Z" fill="none" stroke={deluxe ? '#e2c06e' : '#fff2d2'} strokeWidth="1.5" opacity=".85"/>
          <path d="M119 107H143V172H119Z" fill={fill('ribbon')} stroke={deluxe ? '#c69e4d' : '#618e65'} strokeWidth="1.2"/>
          <path d="M123 112V168" stroke="#fff3bb" opacity=".65"/>
          <path d="M188 111L198 102V157L189 165" fill="none" stroke={deluxe ? '#9abb8c' : '#fff0c6'} opacity=".4"/>
          <GooseSeal/>
        </>}
        <g className="gift-lid">
          {chest ? <>
            <path d="M61 108Q60 59 83 55H177Q200 59 201 108Z" fill={fill('lid')} stroke="#8c6138" strokeWidth="2.2"/>
            <path d="M71 99Q71 67 86 65H173Q190 66 191 100" fill="none" stroke="#ffdfa0" strokeWidth="2" opacity=".7"/>
            <path d="M72 89Q93 84 111 90M146 76Q166 72 185 79M78 72Q96 68 111 73M146 96Q172 89 191 95" fill="none" stroke="#af7c40" strokeWidth="1.5" opacity=".6"/>
            <path d="M85 55H98L97 108H84ZM164 55H177L180 108H166Z" fill={fill('gold')} stroke="#a77a40" strokeWidth="1.3"/>
            <path d="M61 101H201V113H61Z" fill={fill('gold')} stroke="#a77a40" strokeWidth="1.5"/>
            <path d="M66 104H196" stroke="#fff2bc" strokeWidth="2"/>
            <path d="M118 102H142V122Q130 132 118 122Z" fill={fill('gold')} stroke="#976a36" strokeWidth="1.7"/>
            <path d="M130 108L125 117H130L128 123L136 113H131L134 108Z" fill="#6c8e50"/>
            {[90,171].map(x => <circle key={x} cx={x} cy="62" r="2.2" fill="#fff0af" stroke="#ad7e3f"/>)}
          </> : <>
            <path d="M65 91L81 78H199L191 91Z" fill={deluxe ? '#a3bf91' : '#fff0cd'} stroke={deluxe ? '#4d7952' : '#b29562'} strokeWidth="1.8"/>
            <path d="M65 90H193V109H65Z" fill={fill('lid')} stroke={deluxe ? '#426d4c' : '#b29562'} strokeWidth="2"/>
            <path d="M69 94H189" stroke={deluxe ? '#e8d28d' : '#fff8e1'} strokeWidth="1.7" opacity=".85"/>
            <path d="M120 91H143V110H120ZM120 91L132 78H150L143 91Z" fill={fill('ribbon')} stroke={deluxe ? '#bf994b' : '#688c5e'} strokeWidth="1.2"/>
            <g className="gift-bow" fill={fill('ribbon')} stroke={deluxe ? '#b4904b' : '#658657'} strokeWidth="1.8">
              <path d="M130 81Q91 81 93 61Q94 45 111 56Q124 64 130 81Z"/>
              <path d="M132 81Q169 78 168 59Q166 44 151 57Q139 67 132 81Z"/>
              <path d="M127 78L112 99L111 87L101 91L120 73ZM136 77L151 100L151 88L161 92L144 72Z"/>
              <path d="M122 73Q131 69 140 74L137 84H124Z"/>
              <path d="M100 61Q99 69 119 76M160 60Q159 68 143 75" fill="none" stroke={deluxe ? '#fff0b4' : '#d8e4b4'} strokeWidth="2"/>
            </g>
          </>}
        </g>
      </g>
      <g className="gift-energy" transform="translate(130 92)">
        <circle r="19" fill="#f7fbdc" stroke="#a9ca84" strokeWidth="1.5"/>
        <circle r="15" fill="#e1edb6"/>
        <path d="M0-13L-9 2H-1L-4 13L10-4H2L6-13Z" fill="#5f8d4f" stroke="#4f7544" strokeWidth="1"/>
      </g>
      <g transform="translate(130 103)">
        {SPARKS.slice(0,chest ? 10 : deluxe ? 6 : 4).map(([x,y,scale],i) => <g className="gift-spark" key={i} style={{ '--spark-x': `${x}px`, '--spark-y': `${y}px`, '--spark-scale': scale } as CSSProperties}>
          <path d="M0-7L2-2L7 0L2 2L0 7L-2 2L-7 0L-2-2Z" fill={i%2 ? '#c9dda1' : '#eed18a'} stroke={i%2 ? '#87aa6e' : '#c59d55'} strokeWidth=".8"/>
        </g>)}
      </g>
    </svg>
  </div>;
}
