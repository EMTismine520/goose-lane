/** One vector at every size, with no font glyph or downloaded art dependency. */
export function SpeedTicket({ size = 28, className = '' }: { size?: number; className?: string }) {
  return <svg className={`speed-ticket ${className}`} width={size} height={size} viewBox="0 0 64 48" fill="none" aria-hidden="true">
    <path d="M9 7h46a4 4 0 0 1 4 4v7a6 6 0 0 0 0 12v7a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4v-7a6 6 0 0 0 0-12v-7a4 4 0 0 1 4-4Z" fill="#FFF0C8" stroke="#A27746" strokeWidth="2"/>
    <path d="M12 12h29v24H12v-7a6 6 0 0 0 0-10Z" fill="#76A99A"/>
    <path d="m21 18 6 6-6 6m9-12 6 6-6 6" stroke="#FFFBED" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M45 10v28" stroke="#BB9B69" strokeWidth="2" strokeDasharray="2 4"/>
    <path d="M50 16h3m-3 8h3m-3 8h3" stroke="#C5A578" strokeWidth="2" strokeLinecap="round"/>
    <path d="M11 9h29" stroke="#FFFDF0" strokeWidth="2" strokeLinecap="round"/>
  </svg>;
}
