
/**
 * Bank generator per level:
 * - Setiap pemanggilan generateQuestions(level, n) menghasilkan soal acak tidak berulang dalam satu sesi
 * - Tipe soal bervariasi sesuai level
 */
const LEVELS = {
    dasar: {
    name: 'Dasar (Pondasi Aritmetika)',
    materi: 'Bilangan cacah & bulat, pecahan, desimal, persen; operasi dasar (+ − × ÷), FPB/KPK. Fokus: kelancaran berhitung & sifat operasi.',
    contoh: () => {
      // Contoh ringkas multi-topik (HTML)
      const q = `
        <ul>
          <li><b>Bilangan cacah</b>: 0, 1, 2, 3, ...</li>
          <li><b>Bilangan bulat</b>: ..., -3, -2, -1, 0, 1, 2, 3, ...</li>
          <li><b>Pecahan</b>: 3/4</li>
          <li><b>Desimal</b>: 0,75</li>
          <li><b>Persen</b>: 75%</li>
        </ul>
        <div class="muted">Contoh operasi: 8 + 3 = ?</div>
      `;
      const s = `
        <div>Relasi ekivalen: <b>3/4 = 0,75 = 75%</b></div>
        <div>Penyelesaian contoh: 8 + 3 = <b>11</b>.</div>
      `;
      return {q, s};
    },
    generators: [
      // Penjumlahan/pengurangan bulat 0..99
      () => {
        const a = Math.floor(Math.random()*100);
        const b = Math.floor(Math.random()*100);
        return {q:`${a} + ${b} = ?`, a:a+b};
      },
      () => {
        const a = Math.floor(Math.random()*100);
        const b = Math.floor(Math.random()*100);
        return {q:`${a} − ${b} = ?`, a:a-b};
      },
      // Perkalian/pembagian 1..12
      () => {
        const a = 1+Math.floor(Math.random()*12);
        const b = 1+Math.floor(Math.random()*12);
        return {q:`${a} × ${b} = ?`, a:a*b};
      },
      () => {
        const b = 1+Math.floor(Math.random()*12);
        const a = b * (1+Math.floor(Math.random()*12));
        return {q:`${a} ÷ ${b} = ?`, a:a/b};
      },
      // Persen sederhana
      () => {
        const base = (1+Math.floor(Math.random()*20))*10; // kelipatan 10
        const p = [10,20,25,50].sort(()=>Math.random()-0.5)[0];
        return {q:`${p}% dari ${base} = ?`, a: (base*p)/100};
      }
    ]
  },

  menengah: {
    name: 'Menengah (Pra‑Aljabar & Aljabar)',
    materi: 'Variabel, persamaan/pertidaksamaan linear, fungsi linear, rasio & proporsi. Fokus: berpikir simbolik.',
    contoh: () => {
      const q = `Jika 2x + 3 = 11, berapa nilai x?`;
      const s = `2x = 11 − 3 = 8 → x = 8/2 = 4.`;
      return {q, s};
    },
    generators: [
      // Linear satu variabel ax + b = c
      () => {
        const a = 2+Math.floor(Math.random()*7);
        const x = 1+Math.floor(Math.random()*20);
        const b = Math.floor(Math.random()*15);
        const c = a*x + b;
        return {q:`${a}x + ${b} = ${c}. Nilai x = ?`, a:x};
      },
      // Proporsi
      () => {
        const a = 2+Math.floor(Math.random()*8);
        const b = 2+Math.floor(Math.random()*8);
        const k = 1+Math.floor(Math.random()*9);
        return {q:`x:${a} = ${k*b}:${b}. Nilai x = ?`, a:k*a};
      },
      // Fungsi linear
      () => {
        const m = [-3,-2,-1,1,2,3][Math.floor(Math.random()*6)];
        const c = Math.floor(Math.random()*10);
        const x = Math.floor(Math.random()*10);
        return {q:`f(x) = ${m}x + ${c}. Hitung f(${x}).`, a:m*x + c};
      }
    ]
  },
  lanjut: {
    name: 'Lanjut (Geometri, Trigonometri, Statistika)',
    materi: 'Bangun datar/ruang, sudut, trigonometri dasar, penyajian data dan ukuran pemusatan.',
    contoh: () => {
      const q = `Luas persegi panjang 8×3?`; const s = `L = p×l = 8×3 = 24.`;
      return {q, s};
    },
    generators: [
      // Geometri: luas segitiga
      () => {
        const a = 2+Math.floor(Math.random()*15);
        const t = 2+Math.floor(Math.random()*15);
        return {q:`Luas segitiga alas ${a} dan tinggi ${t}?`, a:(a*t)/2};
      },
      // Trigonometri siku-siku sederhana
      () => {
        const angle = [30,45,60][Math.floor(Math.random()*3)];
        const hyp = 10;
        // gunakan nilai pendekatan
        const values = {30:0.5,45:0.7071,60:0.8660};
        return {q:`sin(${angle}°) (4 desimal)?`, a: Number(values[angle].toFixed(4)) };
      },
      // Statistika: mean
      () => {
        const arr = Array.from({length:5},()=>1+Math.floor(Math.random()*20));
        const mean = arr.reduce((s,v)=>s+v,0)/arr.length;
        return {q:`Rata-rata dari [${arr.join(', ')}]? (2 desimal)`, a:Number(mean.toFixed(2))};
      }
    ]
  },
  mahir: {
    name: 'Mahir (Aljabar Lanjut & Analisis)',
    materi: 'Kuadrat, eksponen/logaritma, matriks/determinan, limit & turunan dasar.',
    contoh: () => {
      const q = `Faktorkan x² − 5x + 6.`;
      const s = `(x−2)(x−3) karena 2+3=5 dan 2×3=6.`;
      return {q, s};
    },
    generators: [
      // Persamaan kuadrat - akar bulat
      () => {
        const r1 = 1+Math.floor(Math.random()*9);
        const r2 = 1+Math.floor(Math.random()*9);
        const b = -(r1+r2);
        const c = r1*r2;
        return {q:`Akar-akar persamaan x² ${b>=0?'+':''}${b}x ${c>=0?'+':''}${c} = 0? (urut kecil-besar)`, a:`${Math.min(r1,r2)},${Math.max(r1,r2)}`};
      },
      // Logaritma sederhana
      () => {
        const a = 2**(1+Math.floor(Math.random()*8));
        const k = Math.log2(a);
        return {q:`log₂(${a}) = ?`, a:k};
      },
      // Limit sederhana
      () => {
        const n = 1+Math.floor(Math.random()*9);
        return {q:`Limit x→0 dari (sin x)/x (4 desimal)?`, a:1.0000};
      }
    ]
  },
  expert: {
    name: 'Expert (Matematika Tinggi)',
    materi: 'Kalkulus multivariabel, ODE/PDE dasar, aljabar linear lanjut (eigen), teori bilangan & kombinatorika, analisis real/kompleks (pengenalan).',
    contoh: () => {
      const q = `Jika A = [[2,0],[0,3]], eigenvalue-nya?`; const s = `Diagonal → eigenvalue {2,3}.`;
      return {q, s};
    },
    generators: [
      // Eigenvalue matriks diagonal
      () => {
        const a = 1+Math.floor(Math.random()*9);
        const b = 1+Math.floor(Math.random()*9);
        return {q:`Eigenvalue dari diag(${a}, ${b})? (pisah dengan koma)`, a:`${a},${b}`};
      },
      // Kombinatorika sederhana
      () => {
        const n = 5+Math.floor(Math.random()*6); // 5..10
        const r = 2+Math.floor(Math.random()*3); // 2..4
        // nCr
        function fact(x){ let f=1; for(let i=2;i<=x;i++) f*=i; return f; }
        const ans = fact(n)/(fact(r)*fact(n-r));
        return {q:`Banyak cara pilih ${r} dari ${n}?`, a:ans};
      },
      // Deret konvergen sederhana (konsep)
      () => {
        return {q:`Apakah deret ∑ (1/2ⁿ) konvergen? (ya/tidak)`, a:'ya'};
      }
    ]
  }
};

function exampleFor(level){
  const L = LEVELS[level]; if(!L) return {q:'', s:''};
  return L.contoh();
}

function generateQuestions(level, n){
  const L = LEVELS[level]; if(!L) throw new Error('Level tidak dikenal');
  const gens = L.generators.slice();
  // buat banyak variasi dengan memanggil generator acak
  const result = [];
  const used = new Set();
  let safe = 0;
  while(result.length < n && safe < 1000){
    safe++;
    const g = gens[Math.floor(Math.random()*gens.length)];
    const item = g();
    // kunci unik dari teks soal + jawaban untuk menghindari duplikat
    const key = item.q + '|' + item.a;
    if(used.has(key)) continue;
    used.add(key);
    result.push({ q: item.q, a: item.a });
  }
  return result;
}
