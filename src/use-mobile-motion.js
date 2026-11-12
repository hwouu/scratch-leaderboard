import {useEffect,useRef} from 'react';
import {motionDuration,shouldDismissSheet} from './mobile-motion.mjs';

const mobile=()=>window.matchMedia('(max-width:699px)').matches;
const reduced=()=>window.matchMedia('(prefers-reduced-motion:reduce)').matches;
const easing='cubic-bezier(.22,1,.36,1)';
const lockedDialogs=new Set();
let previousOverflow='';
function lockBackground(el){
  if(!mobile()||lockedDialogs.has(el))return;
  if(!lockedDialogs.size){previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';}
  lockedDialogs.add(el);
}
function unlockBackground(el){
  if(lockedDialogs.delete(el)&&!lockedDialogs.size)document.body.style.overflow=previousOverflow;
}

export function useMobileModal(open,onClose,type='sheet') {
  const ref=useRef(null),onCloseRef=useRef(onClose),animation=useRef(null),closing=useRef(false),gesture=useRef(null);
  onCloseRef.current=onClose;
  const reset=el=>{el.style.removeProperty('transform');el.style.removeProperty('--sheet-scrim');delete el.dataset.dragging;delete el.dataset.closing;};
  useEffect(()=>{
    const el=ref.current;if(!el)return;
    if(open)lockBackground(el);
    if(open&&!el.open){
      closing.current=false;reset(el);el.showModal();
      const duration=motionDuration(reduced(),!mobile());
      if(duration)animation.current=el.animate([{transform:type==='search'?'translateX(24px)':'translateY(100%)',opacity:type==='search'?.4:1},{transform:'translate(0,0)',opacity:1}],{duration,easing});
      el.querySelector('[data-modal-heading]')?.focus({preventScroll:true});
    }else if(!open&&el.open){animation.current?.cancel();el.close();reset(el);closing.current=false;unlockBackground(el);}
    return()=>{animation.current?.cancel();unlockBackground(el);};
  },[open,type]);

  const close=after=>{
    const el=ref.current;if(!el?.open||closing.current)return;
    closing.current=true;gesture.current=null;animation.current?.cancel();
    el.dataset.closing='true';
    const finish=()=>{el.close();reset(el);closing.current=false;unlockBackground(el);onCloseRef.current?.();if(typeof after==='function')after();};
    const duration=motionDuration(reduced(),!mobile(),true);
    if(!duration){finish();return;}
    const from=getComputedStyle(el).transform;
    animation.current=el.animate([{transform:from==='none'?'translate(0,0)':from,opacity:1},{transform:type==='search'?'translateX(24px)':'translateY(100%)',opacity:type==='search'?0:1}],{duration,easing,fill:'forwards'});
    animation.current.finished.then(finish,()=>{});
  };
  const snapBack=el=>{
    const from=el.style.transform||'translateY(0)';reset(el);
    if(!reduced())animation.current=el.animate([{transform:from},{transform:'translateY(0)'}],{duration:220,easing});
  };
  const drag={
    onPointerDown:e=>{
      if(type!=='sheet'||!mobile()||e.button!==0||closing.current||e.target.closest('button,a,input,select'))return;
      animation.current?.cancel();gesture.current={id:e.pointerId,x:e.clientX,y:e.clientY,t:performance.now(),dx:0,dy:0};
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove:e=>{
      const g=gesture.current,el=ref.current;if(!g||g.id!==e.pointerId||!el)return;
      g.dx=e.clientX-g.x;g.dy=Math.max(0,e.clientY-g.y);
      if(g.dy>Math.abs(g.dx)*1.2){el.dataset.dragging='true';el.style.transform=`translateY(${g.dy}px)`;el.style.setProperty('--sheet-scrim',String(Math.max(.05,.4*(1-g.dy/el.clientHeight))));}
    },
    onPointerUp:e=>{
      const g=gesture.current,el=ref.current;if(!g||g.id!==e.pointerId||!el)return;
      gesture.current=null;
      if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
      if(shouldDismissSheet({...g,elapsed:performance.now()-g.t,height:el.clientHeight}))close();else snapBack(el);
    },
    onPointerCancel:()=>{gesture.current=null;if(ref.current)snapBack(ref.current);}
  };
  return {ref,close,drag,onCancel:e=>{e.preventDefault();close();}};
}

export function useRecordMotion(ref,keys) {
  const previous=useRef(null);
  useEffect(()=>{
    const prior=previous.current;previous.current=keys;
    const el=ref.current;if(!el||reduced()||!mobile())return;
    const order=['total','A','B','C'];
    const reverse=prior&&((keys[0]===prior[0]&&order.indexOf(keys[1])<order.indexOf(prior[1]))||(keys[0]==='/'&&prior[0]==='/nearest'));
    const a=el.animate([{opacity:.35,transform:`translateX(${reverse?-10:10}px)`},{opacity:1,transform:'translateX(0)'}],{duration:180,easing});
    return()=>a.cancel();
  },keys);
}
