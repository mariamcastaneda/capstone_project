// Inline SVG sticker registry
// Each sticker is a { name, category, svg } object.
// SVGs are self-contained viewBox="0 0 32 32" strings.

const academic = [
  { name: 'star',        svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><polygon points="16,2 20,12 31,12 22,19 25,30 16,23 7,30 10,19 1,12 12,12" fill="#FFD700" stroke="#E6B800" stroke-width="1"/></svg>' },
  { name: 'checkmark',   svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><polyline points="4,16 12,24 28,8" fill="none" stroke="#27AE60" stroke-width="3" stroke-linecap="round"/></svg>' },
  { name: 'lightbulb',   svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="13" r="8" fill="#FFE082"/><rect x="12" y="21" width="8" height="3" rx="1" fill="#FFA000"/><rect x="13" y="24" width="6" height="2" rx="1" fill="#FFA000"/></svg>' },
  { name: 'book',        svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="24" height="24" rx="2" fill="#FF8A65"/><rect x="4" y="4" width="12" height="24" rx="2" fill="#FFCCBC"/><line x1="16" y1="4" x2="16" y2="28" stroke="#FF8A65" stroke-width="1.5"/></svg>' },
  { name: 'pencil',      svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect x="13" y="3" width="6" height="22" rx="2" transform="rotate(45 16 16)" fill="#FFF176"/><polygon points="16,28 13,22 19,22" fill="#795548"/></svg>' },
  { name: 'calculator',  svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="4" width="20" height="24" rx="3" fill="#90CAF9"/><rect x="9" y="7" width="14" height="6" rx="1" fill="#fff"/><circle cx="11" cy="18" r="2" fill="#fff"/><circle cx="16" cy="18" r="2" fill="#fff"/><circle cx="21" cy="18" r="2" fill="#fff"/><circle cx="11" cy="24" r="2" fill="#fff"/><circle cx="16" cy="24" r="2" fill="#fff"/><circle cx="21" cy="24" r="2" fill="#EF5350"/></svg>' },
  { name: 'clock',       svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="12" fill="#E1F5FE" stroke="#0288D1" stroke-width="2"/><line x1="16" y1="16" x2="16" y2="8"  stroke="#0288D1" stroke-width="2" stroke-linecap="round"/><line x1="16" y1="16" x2="22" y2="20" stroke="#0288D1" stroke-width="2" stroke-linecap="round"/></svg>' },
  { name: 'trophy',      svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M10,4 h12 v10 a6,6 0 0,1-12,0 Z" fill="#FFD700"/><rect x="13" y="20" width="6" height="5" fill="#FFB300"/><rect x="9" y="25" width="14" height="3" rx="1" fill="#A1887F"/></svg>' },
  { name: 'magnifier',   svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="13" cy="13" r="8" fill="none" stroke="#5C6BC0" stroke-width="3"/><line x1="19" y1="19" x2="27" y2="27" stroke="#5C6BC0" stroke-width="3" stroke-linecap="round"/></svg>' },
  { name: 'formula',     svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><text x="4" y="22" font-size="18" font-family="serif" fill="#E91E8C">∑x²</text></svg>' },
];

const emotions = [
  { name: 'smile',    svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="13" fill="#FFE082"/><circle cx="11" cy="13" r="2" fill="#5D4037"/><circle cx="21" cy="13" r="2" fill="#5D4037"/><path d="M10,20 Q16,26 22,20" fill="none" stroke="#5D4037" stroke-width="2" stroke-linecap="round"/></svg>' },
  { name: 'heart',    svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16,28 L4,16 a7,7 0 0,1 12,-6 a7,7 0 0,1 12,6 Z" fill="#E91E8C"/></svg>' },
  { name: 'thumbsup', svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M6,14 h6 L14,6 a3,3 0 0,1 6,0 L18,14 h8 v14 H6 Z" fill="#42A5F5"/></svg>' },
  { name: 'fire',     svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16,2 C10,10 6,14 9,20 C11,24 14,26 16,30 C18,26 21,24 23,20 C26,14 22,10 16,2Z" fill="#FF7043"/><path d="M16,14 C14,18 15,22 16,24 C17,22 18,18 16,14Z" fill="#FFE082"/></svg>' },
  { name: 'idea',     svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="14" r="9" fill="#FFF176" stroke="#FBC02D" stroke-width="1.5"/><rect x="13" y="23" width="6" height="2" rx="1" fill="#FBC02D"/><rect x="14" y="25" width="4" height="2" rx="1" fill="#FBC02D"/></svg>' },
  { name: 'question', svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="13" fill="#CE93D8"/><text x="11" y="22" font-size="18" font-family="sans-serif" font-weight="bold" fill="#fff">?</text></svg>' },
  { name: 'warning',  svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><polygon points="16,3 31,28 1,28" fill="#FDD835" stroke="#F9A825" stroke-width="1.5"/><rect x="15" y="12" width="2" height="9" rx="1" fill="#5D4037"/><circle cx="16" cy="24" r="1.5" fill="#5D4037"/></svg>' },
  { name: 'sleep',    svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="13" fill="#B3E5FC"/><text x="8" y="21" font-size="12" font-family="sans-serif" font-weight="bold" fill="#0277BD">ZZZ</text></svg>' },
  { name: 'party',    svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="13" fill="#F48FB1"/><path d="M8,20 Q16,12 24,20" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><circle cx="11" cy="13" r="2" fill="#fff"/><circle cx="21" cy="13" r="2" fill="#fff"/></svg>' },
  { name: 'cool',     svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="13" fill="#FFE082"/><rect x="6" y="11" width="20" height="7" rx="3" fill="#212121"/><circle cx="11" cy="14" r="3" fill="#fff"/><circle cx="21" cy="14" r="3" fill="#fff"/><path d="M10,22 Q16,27 22,22" fill="none" stroke="#5D4037" stroke-width="2" stroke-linecap="round"/></svg>' },
];

const symbols = [
  { name: 'arrow-right', svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><line x1="4" y1="16" x2="26" y2="16" stroke="#5C6BC0" stroke-width="3"/><polygon points="24,10 32,16 24,22" fill="#5C6BC0"/></svg>' },
  { name: 'arrow-up',    svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><line x1="16" y1="28" x2="16" y2="6"  stroke="#5C6BC0" stroke-width="3"/><polygon points="10,8 16,0 22,8" fill="#5C6BC0"/></svg>' },
  { name: 'flag',        svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="4" width="2" height="24" fill="#795548"/><polygon points="10,4 26,10 10,16" fill="#E53935"/></svg>' },
  { name: 'pin',         svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="12" r="6" fill="#E91E8C"/><line x1="16" y1="18" x2="16" y2="30" stroke="#E91E8C" stroke-width="2"/></svg>' },
  { name: 'tag',         svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M4,4 h14 l10,12 -10,12 H4 Z" fill="#AB47BC"/><circle cx="9" cy="12" r="2" fill="#fff"/></svg>' },
  { name: 'clock2',      svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="12" fill="none" stroke="#FF5722" stroke-width="2.5"/><line x1="16" y1="16" x2="16" y2="7"  stroke="#FF5722" stroke-width="2.5" stroke-linecap="round"/><line x1="16" y1="16" x2="23" y2="16" stroke="#FF5722" stroke-width="2.5" stroke-linecap="round"/></svg>' },
  { name: 'diamond',     svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><polygon points="16,2 30,16 16,30 2,16" fill="#26C6DA"/></svg>' },
  { name: 'note',        svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="4" width="20" height="24" rx="2" fill="#FFF9C4"/><line x1="10" y1="10" x2="22" y2="10" stroke="#F9A825" stroke-width="1.5"/><line x1="10" y1="15" x2="22" y2="15" stroke="#F9A825" stroke-width="1.5"/><line x1="10" y1="20" x2="18" y2="20" stroke="#F9A825" stroke-width="1.5"/></svg>' },
  { name: 'bolt',        svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><polygon points="18,2 8,18 16,18 14,30 24,14 16,14" fill="#FDD835"/></svg>' },
  { name: 'crown',       svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><polygon points="4,24 4,10 10,16 16,6 22,16 28,10 28,24" fill="#FFD700" stroke="#F9A825" stroke-width="1.5"/></svg>' },
];

export const stickerRegistry = { academic, emotions, symbols };
export default stickerRegistry;
