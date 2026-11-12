import sharp from 'sharp';
import {fileURLToPath} from 'node:url';
import {mkdir,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url),file=p=>fileURLToPath(new URL(p,root));
await mkdir(file('public/assets/meta/'),{recursive:true});
const icon=file('branding/source/app-icon.png');
for (const [size,path] of [[16,'favicon-16x16.png'],[32,'favicon-32x32.png'],[180,'apple-touch-icon.png'],[192,'assets/meta/icon-192.png'],[512,'assets/meta/icon-512.png']]) {
  await sharp(icon).resize(size,size,{fit:'contain'}).png().toFile(file(`public/${path}`));
}
// Standard ICO container with three lossless PNG representations.
const sizes=[16,32,48],images=await Promise.all(sizes.map(n=>sharp(icon).resize(n,n).png().toBuffer()));
const header=Buffer.alloc(6);header.writeUInt16LE(1,2);header.writeUInt16LE(images.length,4);
let offset=6+16*images.length;
const entries=images.map((image,i)=>{const b=Buffer.alloc(16);b[0]=sizes[i];b[1]=sizes[i];b.writeUInt16LE(1,4);b.writeUInt16LE(32,6);b.writeUInt32LE(image.length,8);b.writeUInt32LE(offset,12);offset+=image.length;return b;});
await writeFile(file('public/favicon.ico'),Buffer.concat([header,...entries,...images]));
await sharp(file('branding/source/share-card.png')).resize(1200,630,{fit:'cover',position:'centre'}).jpeg({quality:88,mozjpeg:true}).toFile(file('public/assets/meta/og-season-2026-v1.jpg'));
console.log('Exported favicon, Apple/PWA icons, and 1200x630 social card.');
