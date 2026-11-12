import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';
const page=await readFile(new URL('../dist/client/index.html',import.meta.url),'utf8');
const property=name=>page.match(new RegExp(`<meta (?:property|name)="${name}" content="([^"]+)"`))?.[1];
test('social crawlers receive complete static metadata and an actual optimized image',async()=>{
 for(const key of ['og:title','og:description','og:type','og:url','og:image','og:image:alt','twitter:card','twitter:image'])assert.ok(property(key),key);
 const url=new URL(property('og:image'));assert.equal(url.origin,'https://scratch-leaderboard-omega.vercel.app');
 assert.equal(property('twitter:card'),'summary_large_image');assert.equal(property('twitter:image'),url.href);
 const file=new URL('../dist/client'+url.pathname,import.meta.url),meta=await sharp(fileURLToPath(file)).metadata();
 assert.equal(meta.width,Number(property('og:image:width')));assert.equal(meta.height,Number(property('og:image:height')));assert.equal(meta.format,'jpeg');
 assert.ok((await readFile(file)).length<400_000);
});
test('home-screen icons have real declared dimensions and opaque maskable backgrounds',async()=>{
 const manifest=JSON.parse(await readFile(new URL('../dist/client/manifest.webmanifest',import.meta.url),'utf8'));
 assert.ok(manifest.icons.some(i=>i.purpose?.includes('maskable')));
 for(const icon of manifest.icons){const p=fileURLToPath(new URL('../dist/client'+icon.src,import.meta.url));const m=await sharp(p).metadata();assert.equal(`${m.width}x${m.height}`,icon.sizes);assert.equal((await sharp(p).stats()).isOpaque,true);}
 const apple=await sharp(fileURLToPath(new URL('../dist/client/apple-touch-icon.png',import.meta.url))).metadata();assert.equal(apple.width,180);assert.equal(apple.height,180);
});
test('favicon contains 16/32/48px representations in a valid ICO container',async()=>{
 const ico=await readFile(new URL('../dist/client/favicon.ico',import.meta.url));assert.equal(ico.readUInt16LE(2),1);assert.equal(ico.readUInt16LE(4),3);
 for(let i=0;i<3;i++){const at=6+i*16;assert.equal(ico[at],[16,32,48][i]);const size=ico.readUInt32LE(at+8),offset=ico.readUInt32LE(at+12);assert.ok(offset+size<=ico.length);assert.equal(ico.subarray(offset,offset+8).toString('hex'),'89504e470d0a1a0a');}
});
