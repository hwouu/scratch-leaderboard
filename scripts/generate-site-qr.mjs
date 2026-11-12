import QRCode from 'qrcode';
import {writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
// Canonical public root: phones choose their own score/nearest view.
const url='https://scratch-leaderboard-omega.vercel.app/';
const options={errorCorrectionLevel:'M',margin:4,color:{dark:'#000000',light:'#ffffff'}};
await writeFile(new URL('../public/assets/site-qr.svg',import.meta.url),await QRCode.toString(url,{...options,type:'svg'}));
await mkdir(new URL('../qa/',import.meta.url),{recursive:true});
await QRCode.toFile(fileURLToPath(new URL('../qa/site-qr.png',import.meta.url)),url,{...options,width:492});
