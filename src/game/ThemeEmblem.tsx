/** Small hand-drawn keepsakes shared by the room and its progress album. */
export function ThemeMotif({stage}:{stage:number}) {
  const line = {stroke:'#72523b',strokeWidth:2,strokeLinejoin:'round' as const,strokeLinecap:'round' as const};
  switch(stage) {
    case 1:return <g {...line}><path d="M12 32h40l-5 22H18Z" fill="#d6a261"/><path d="M18 30Q32 6 47 30" fill="none"/><path d="m21 37 3 12m8-12v12m10-12-3 12" stroke="#ae7744"/><circle cx="24" cy="29" r="9" fill="#dc7756"/><circle cx="40" cy="29" r="10" fill="#e9b354"/><path d="M25 18q0-8 8-9-1 9-8 9m14 1q-4-7-10-7 2 8 10 7" fill="#75995b"/></g>;
    case 2:return <g {...line}><path d="M14 29h36l-3 22q-15 8-30 0Z" fill="#c77751"/><path d="M13 32H7v10h9m34-10h7v10h-9" fill="none"/><ellipse cx="32" cy="28" rx="20" ry="6" fill="#e3a66f"/><path d="M13 26q19-21 38 0Z" fill="#edc38b"/><path d="M28 14h8v6h-8Z" fill="#769170"/><path className="bistro-steam" d="M23 7q-4-4 0-7m18 7q-4-4 0-7" stroke="#b9a58a" fill="none"/></g>;
    case 3:return <g {...line}><ellipse cx="31" cy="52" rx="24" ry="5" fill="#e4d2ad"/><path d="M15 27h29l-3 20q-13 10-23 0Z" fill="#f8edd4"/><path d="M44 30h6q12 8-8 14" fill="none" strokeWidth="4"/><ellipse cx="29" cy="27" rx="14" ry="4" fill="#aa7850"/><path d="M20 38h18" stroke="#82a28d"/><path className="bistro-steam" d="M22 19q-5-6 0-12m12 12q-5-6 0-12" fill="none" stroke="#b5a991"/></g>;
    case 4:return <g {...line}><ellipse cx="32" cy="51" rx="26" ry="6" fill="#d9bd8b"/><path d="M9 39q0-19 21-22 25-3 26 21 0 16-24 15Q9 53 9 39Z" fill="#e9b568"/><path d="m21 25-4 15m15-18-4 16m16-14-4 15" stroke="#f9dfaa" strokeWidth="5"/><path d="M13 45q19 10 39 0" stroke="#c68b4c" fill="none"/></g>;
    case 5:return <g {...line}><path d="m15 57 28-44m-12 45 22-37" stroke="#b79764" strokeWidth="3"/><path d="m29 22 11 6-8 12-11-7Zm10-14 11 7-8 11-10-7Z" fill="#bf6e44"/><path d="m42 27 10 6-7 12-11-7Z" fill="#e1a852"/><path d="m25 27 11 6m1-18 10 7m-10 18 11 6" stroke="#8e543b"/><path d="m14 23 4-3 4 3-4 4Z" fill="#d8b662" stroke="none"/></g>;
    case 6:return <g {...line}><path d="M10 25v23q22 13 44 0V25" fill="#dcb477"/><ellipse cx="32" cy="25" rx="22" ry="9" fill="#f2d3a0"/><path d="M11 35q21 13 42 0M11 42q21 13 42 0" fill="none" stroke="#b68a56"/><path d="M18 27q1-15 12-4l-2 8Zm18 1q2-16 12-4l-2 8Z" fill="#fff5dc"/><path className="bistro-steam" d="M23 11q-4-5 0-10m15 10q-4-5 0-10" fill="none" stroke="#baa58c"/></g>;
    case 7:return <g {...line}><path d="M9 48q23 8 46 0v5q-23 8-46 0Z" fill="#b6c9bf"/><path d="M13 46V29q0-21 19-21t19 21v17" fill="#e5f1e9" fillOpacity=".6"/><circle cx="32" cy="7" r="3" fill="#d9bb7b"/><path d="M20 31h24v16H20Z" fill="#eaaab0"/><path d="M20 37h24m-24 6h24" stroke="#fff2d3" strokeWidth="3"/><path d="M21 30q11-15 22 0Z" fill="#fff4db"/><circle cx="32" cy="24" r="4" fill="#c96059"/><path d="M19 18q-3 5-3 10" stroke="#fff9e7" strokeWidth="3" fill="none"/></g>;
    default:return <g {...line}><path d="M16 19h32L35 39v14h9m-9 0H22m10-14v14" fill="#e9b1a3"/><path d="M20 25h24L33 39Z" fill="#d98671" stroke="none"/><path d="m36 27 8-20" stroke="#769182"/><path d="M47 13a10 10 0 1 0-16-9Z" fill="#edc769"/><path d="m38 5 7 6" stroke="#fff1bf"/><path d="m12 13 2-5 2 5 5 2-5 2-2 5-2-5-5-2Z" fill="#c4a766" stroke="none"/></g>;
  }
}

export function ThemeEmblem({stage,size=48}:{stage:number;size?:number}) {
  return <svg className="theme-emblem" viewBox="0 0 64 64" width={size} height={size} aria-hidden="true"><ThemeMotif stage={stage}/></svg>;
}
