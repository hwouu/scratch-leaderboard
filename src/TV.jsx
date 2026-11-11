import {useEffect,useRef,useState} from 'react';
import {ArrowClockwiseIcon,ArrowLeftIcon,ArrowUpRightIcon,GearSixIcon,MonitorIcon,PauseIcon,PlayIcon,XIcon} from '@phosphor-icons/react';
import {ROUNDS,POSTED_SHOP,shortCourse,scoreText,kstDate,kstTime} from './event';
import {buildTickerItems} from './ticker.mjs';
import './tv.css';

function TVRows({entries=[],limit=8,nearest=false,status,loading}) {
  return <div className="tv-table" role="table" aria-label={nearest?'니어 순위':'성적 순위'} style={{'--rows':limit}}>
    <div className="tv-table-head" role="row"><span role="columnheader">순위</span><span role="columnheader">닉네임</span><span role="columnheader">{nearest?'거리':'최종성적'}</span></div>
    <div className="tv-table-body">{Array.from({length:limit},(_,i)=>{
      const p=entries[i];
      return <div key={p?.id??`empty-${i}`} role="row" className={`tv-row ${p&&i===0?'tv-row-leader':''} ${!p?'tv-row-empty':''} ${nearest&&i===4?'tv-prize-divider':''}`}>
        <span role="cell" className="tv-rank">{p?`${p.tie?'T':''}${p.rank??'—'}`:'—'}</span>
        <span role="cell" className="tv-nickname">{p?p.nickname:i===entries.length?(loading?'불러오는 중':status==='error'?'기록 연결 확인 중':'기록 대기'):''}</span>
        <span role="cell" className="tv-score">{p?(nearest?`${p.distance?.toFixed(2)??'—'} m`:scoreText(p.score)):''}</span>
      </div>;
    })}</div>
  </div>;
}

function RecordTicker({data,nearest,paused,onToggle}) {
  const items=buildTickerItems(data,nearest);
  return <section className={`record-ticker ${paused?'ticker-paused':''}`} aria-label="대회 기록 바">
    <div className="ticker-label">대회 기록</div>
    <div className="ticker-window" tabIndex={0} aria-label="상위 참가자 기록. 마우스를 올리거나 초점을 두면 이동이 멈춥니다.">
      {items.length?<div className="ticker-track" style={{'--ticker-duration':`${Math.max(38,items.length*7)}s`}}>{[0,1].map(copy=><div className="ticker-group" key={copy} aria-hidden={copy===1?true:undefined}>{items.map(item=><div className="ticker-item" key={item.id}><span className="ticker-scope">{item.scope}</span><span className="ticker-rank">{item.rank}위</span><span>{item.nickname}</span><span className="ticker-value" key={item.value}>{item.value}</span></div>)}</div>)}</div>:<p className="ticker-empty">기록 대기</p>}
    </div>
    <button className="ticker-toggle" aria-label={paused?'기록 바 재생':'기록 바 일시정지'} onClick={onToggle}>{paused?<PlayIcon/>:<PauseIcon/>}</button>
  </section>;
}

export function TVScreen({nearest,round,setRound,shop,data,loading,error,refresh,isDesign}) {
  const [controls,setControls]=useState(false),[paused,setPaused]=useState(false),settingsRef=useRef(null);
  useEffect(()=>{if(!controls)return;const onKey=e=>{if(e.key==='Escape'){setControls(false);settingsRef.current?.focus();}};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);},[controls]);
  const r=data?.round??ROUNDS[round==='2'?1:0];
  const resources=nearest?(data?.courses.map(c=>c.nearest)??[]):[data?.total,...(data?.courses.map(c=>c.standings)??[])];
  const dates=resources.map(s=>s?.fetchedAt).filter(Boolean).sort();
  const bad=error||data?.metadataStatus==='stale'||resources.some(s=>s?.status==='error'||s?.status==='stale');
  return <main className={`tv-screen ${nearest?'tv-nearest':'tv-standings'}`}>
    <header className="tv-header">
      <div className="tv-event"><span>골목대장 나야나</span><span>Goodbye 2026</span></div>
      <div className="tv-heading"><h1>{nearest?'니어리스트 (통합)':'순위 (화전 스크래치)'}</h1><div className="tv-context"><span>{r.name}</span><span>{kstDate(r.start)} — {kstDate(r.end)}</span></div>
      <button ref={settingsRef} className="tv-settings-trigger" aria-label="TV 화면 설정" aria-controls="tv-controls" aria-expanded={controls} onClick={()=>setControls(v=>!v)}><GearSixIcon/></button></div>
    {controls&&<div id="tv-controls" className="tv-controls"><div className="tv-controls-heading"><span>화면 설정</span><button aria-label="설정 닫기" onClick={()=>setControls(false)}><XIcon size={20}/></button></div><label>차전<select aria-label="TV 차전" value={round} onChange={e=>setRound(e.target.value)}><option value="1">1차전</option><option value="2">2차전</option></select></label><button onClick={refresh}>기록 새로고침</button><button onClick={()=>document.documentElement.requestFullscreen?.()}>전체화면</button><a href="/tv">다른 TV 화면 선택<ArrowUpRightIcon size={16}/></a></div>}
    </header>
    {isDesign&&<div className="preview-label">예시 기록</div>}
    <div className="tv-content">
      {!nearest&&<section className="tv-total-panel"><div className="tv-panel-title"><h2>합산</h2><span>상위 15명</span></div><TVRows entries={data?.total.entries} limit={15} status={data?.total.status} loading={loading}/></section>}
      <div className="tv-course-grid">{r.courses.map((c,i)=>{
        const actual=data?.courses[i],resource=nearest?actual?.nearest:actual?.standings;
        return <section className="tv-course-panel" key={c.id}>
          <div className="tv-panel-title"><h2><span className="tv-course-letter">{c.label}</span>{shortCourse(c.name)}</h2>{nearest&&resource?.hole>0&&<span>{resource.courseName} {resource.hole}H</span>}{!nearest&&<span>상위 15명</span>}</div>
          <TVRows entries={resource?.entries} limit={nearest?8:15} nearest={nearest} status={resource?.status} loading={loading}/>
        </section>;
      })}</div>
    </div>
    <footer className="tv-footer"><div className="tv-schedule">{(data?.event.rounds??ROUNDS).map(stage=><span key={stage.no}>{stage.name}<time>{kstDate(stage.start)} — {kstDate(stage.end)}</time></span>)}<span>결선<time>별도 일반대회</time></span></div><div className={`tv-update ${bad?'warning':''}`}><ArrowClockwiseIcon className={loading?'spin':''}/><span>{loading?'기록 확인 중':bad?'연결 지연. 최근 기록 표시':`업데이트 ${kstTime(dates[0])}`}</span><span className="tv-refresh-interval">60초 간격</span></div></footer>
    <RecordTicker data={data} nearest={nearest} paused={paused} onToggle={()=>setPaused(p=>!p)}/>
  </main>;
}

function MiniTable({nearest=false,total=false}) {
  return <div className={`launch-preview ${nearest?'launch-preview-nearest':'launch-preview-standings'}`} aria-hidden="true">{Array.from({length:nearest?3:4},(_,i)=><div className="launch-mini-panel" key={i}><span>{nearest?`${'ABC'[i]}코스`:i===0?'합산':`${'ABC'[i-1]}코스`}</span>{Array.from({length:total&&i===0?8:5},(_,j)=><i key={j}><em>{j+1}</em><b/><b/></i>)}</div>)}<div className="launch-mini-ticker"/></div>;
}

export function TVLauncher({round,shop}) {
  const r=round==='2'?'2':'1';
  return <main className="tv-launcher"><header><a href="/"><ArrowLeftIcon size={17}/>순위로 돌아가기</a><span>골목대장 나야나</span></header><div className="tv-launcher-intro"><MonitorIcon size={26}/><h1>TV 화면 선택</h1><p>두 대의 TV에 각각 다른 화면을 열어 주세요.</p></div><div className="tv-launch-options"><a className="tv-launch-card" href={`/tv/nearest?round=${r}`}><MiniTable nearest/><div className="launch-card-copy"><span className="launch-number">화면 1</span><h2>니어리스트 (통합)<ArrowUpRightIcon/></h2><p>A, B, C코스 각 8위까지</p><small>전체 매장 통합</small></div></a><a className="tv-launch-card" href={`/tv/standings?round=${r}&shop=${POSTED_SHOP.id}`}><MiniTable total/><div className="launch-card-copy"><span className="launch-number">화면 2</span><h2>순위 (화전 스크래치)<ArrowUpRightIcon/></h2><p>합산, A, B, C코스 각 15위</p><small>{POSTED_SHOP.name}</small></div></a></div><p className="tv-launch-note">16:9 화면에 맞춰 표시됩니다. 순위 화면은 화전 스크래치 기준입니다. 차전은 각 화면의 설정에서 변경할 수 있습니다.</p></main>;
}
