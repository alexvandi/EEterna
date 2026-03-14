import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

// Define the 5 real codes we just inserted in the DB
const codes = ['ET-0001', 'ET-0002', 'ET-0003', 'ET-0004', 'ET-0005'];
const baseUrl = 'https://eeterna.netlify.app/qr'; // The final production URL

const outDir = path.join(process.cwd(), 'qr_generati');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir);
}

console.log('Generazione di 5 codici QR reali per la stampa in corso...\n');

const generateQRs = async () => {
  for (const code of codes) {
    const url = `${baseUrl}/${code}`;
    const filePath = path.join(outDir, `${code}.png`);
    
    try {
      await QRCode.toFile(filePath, url, {
        color: {
          dark: '#000000',  // Black QR
          light: '#ffffff' // White background
        },
        width: 1000,
        margin: 2
      });
      console.log(`✅ Generato: ${code}.png -> Punta a: ${url}`);
    } catch (err) {
      console.error(`❌ Errore nella generazione di ${code}:`, err);
    }
  }
  
  console.log(`\n🎉 Finito! Trovi i file PNG pronti per la stampa nella cartella: ${outDir}`);
};

generateQRs();
