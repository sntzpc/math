
Belajar Matematika - Offline PWA
================================

Fitur Utama
-----------
- PWA offline (service worker + cache)
- IndexedDB untuk menyimpan progres per level
- Ringkasan materi + contoh + penyelesaian
- Generator soal acak (tanpa duplikasi dalam sesi)
- Timer latihan opsional
- Statistik & riwayat sesi
- Cetak laporan: A4 dan thermal 58mm
- Export progres ke JSON

Cara Pakai
----------
1. Buka `index.html` di browser modern (Chrome/Edge/Firefox).
2. Klik "Install App" untuk memasang sebagai PWA (opsional).
3. Pilih level dan Mode (Materi / Latihan / Report).
4. Saat Latihan, atur jumlah soal dan timer → Mulai.
5. Setelah selesai, skor otomatis tersimpan di IndexedDB.
6. Cetak report (A4 atau 58mm) dari menu Report.

Catatan Thermal 58mm
--------------------
- Gunakan `Ctrl+P` dan pilih printer thermal.
- Pastikan *Scale 100%* dan margin "Default" atau "None".
- CSS `@page { size: 58mm auto }` diaktifkan saat klik "Cetak 58mm".

Struktur
--------
- index.html
- css/styles.css
- css/print-a4.css
- css/print-58.css
- js/utils.js
- js/db.js
- js/questions.js
- js/app.js
- service-worker.js
- manifest.webmanifest
- icons/icon-192.png, icon-512.png
