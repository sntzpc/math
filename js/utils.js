
// Utility helpers
const $ = (sel, parent=document) => parent.querySelector(sel);
const $$ = (sel, parent=document) => [...parent.querySelectorAll(sel)];
const fmt = (n) => new Intl.NumberFormat('id-ID').format(n);
const nowISO = () => new Date().toISOString();

function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1)); [arr[i],arr[j]] = [arr[j],arr[i]];
  }
  return arr;
}

function formatSeconds(sec){
  sec = Math.max(0, sec|0);
  const m = String(Math.floor(sec/60)).padStart(2,'0');
  const s = String(sec%60).padStart(2,'0');
  return `${m}:${s}`;
}

function downloadText(filename, text){
  const blob = new Blob([text], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
