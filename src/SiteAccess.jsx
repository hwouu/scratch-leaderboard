import {ArrowSquareOutIcon,MapPinIcon,PhoneIcon} from '@phosphor-icons/react';
import './site-access.css';

export const SITE_URL='https://scratch-leaderboard-omega.vercel.app/';
const SHOP_URL='https://m.golfzon.com/shop/#/main/14859';
const MAP_URL='https://map.naver.com/p/search/'+encodeURIComponent('골프존파크 화전 스크래치');

export function SiteQR({tv=false}) {
  return <a className={`site-qr ${tv?'site-qr-tv':'site-qr-pc'}`} href={SITE_URL} aria-label="모바일 순위 사이트 열기">
    <img src="/assets/site-qr.svg" alt="골목대장 나야나 순위 사이트 접속 QR 코드" width="164" height="164"/>
    <span>모바일 순위</span>
  </a>;
}

export function ShopFooter() {
  return <footer className="m-shop-footer" aria-label="화전 스크래치 매장 정보">
    <div className="m-shop-brands"><a href={SHOP_URL} target="_blank" rel="noreferrer" aria-label="골프존 화전 스크래치 매장 페이지"><img src="/assets/branding/golfzon-park.png" width="186" height="62" alt="GOLFZON PARK"/></a><a href="https://www.golfzon.com/guide/nxp" target="_blank" rel="noreferrer" aria-label="투비전 NX PLUS 제품 안내"><img src="/assets/branding/twovisionnx-plus.png" width="440" height="80" alt="TWOVISION NX PLUS"/></a></div>
    <h2>화전 스크래치</h2>
    <p>경기 고양시 덕양구 중앙로 151</p>
    <a className="m-shop-phone" href="tel:0231580753"><PhoneIcon size={16}/>02-3158-0753</a>
    <div className="m-shop-links"><a href={MAP_URL} target="_blank" rel="noreferrer"><MapPinIcon size={16}/>매장 위치</a><a href={SHOP_URL} target="_blank" rel="noreferrer">골프존 매장 정보<ArrowSquareOutIcon size={15}/></a></div>
  </footer>;
}
