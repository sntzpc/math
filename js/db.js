
// IndexedDB wrapper
const DB_NAME = 'math-learning-db';
const DB_VER = 1;
const STORE_PROGRESS = 'progress';
// progress key: level
// { level, attempts, correct, totalTimeSec, sessions: [{dateISO, count, correct, timeSec}] }

function openDB(){
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = (e) => {
      const db = req.result;
      if(!db.objectStoreNames.contains(STORE_PROGRESS)){
        db.createObjectStore(STORE_PROGRESS, { keyPath:'level' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getProgress(level){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(STORE_PROGRESS,'readonly');
    const st = tx.objectStore(STORE_PROGRESS);
    const g = st.get(level);
    g.onsuccess = () => resolve(g.result || {level, attempts:0, correct:0, totalTimeSec:0, sessions:[]});
    g.onerror = () => reject(g.error);
  });
}

async function setProgress(data){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(STORE_PROGRESS,'readwrite');
    const st = tx.objectStore(STORE_PROGRESS);
    const p = st.put(data);
    p.onsuccess = () => resolve(true);
    p.onerror = () => reject(p.error);
  });
}

async function addSession(level, session){
  const p = await getProgress(level);
  p.attempts += session.count;
  p.correct += session.correct;
  p.totalTimeSec += session.timeSec;
  p.sessions.push(session);
  await setProgress(p);
  return p;
}

async function getAllProgress(){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(STORE_PROGRESS,'readonly');
    const st = tx.objectStore(STORE_PROGRESS);
    const arr = [];
    st.openCursor().onsuccess = (e)=>{
      const cur = e.target.result;
      if(cur){ arr.push(cur.value); cur.continue(); }
      else resolve(arr);
    };
    tx.onerror = () => reject(tx.error);
  });
}
