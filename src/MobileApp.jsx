import {useEffect,useMemo,useRef,useState} from 'react';
import {ArrowClockwiseIcon,ArrowLeftIcon,CaretDownIcon,FlagIcon,InfoIcon,MagnifyingGlassIcon,MinusIcon,WarningCircleIcon,XIcon} from '@phosphor-icons/react';
import {ROUNDS,SHOPS,shortCourse,scoreText,kstTime} from './event';
import {mobileSearchPlayers} from './mobile-records.mjs';
import './mobile.css';
import {ShopFooter} from './SiteAccess';
import {useMobileModal,useRecordMotion} from './use-mobile-motion';

function MobileStatus({resource,loading,error,onRefresh}) {
  const failed=error||resource?.status==='error',stale=resource?.status==='stale';
  return <button className={`m-status ${failed||stale?'m-status-warning':''}`} onClick={onRefresh} aria-label="기록 새로고침"><ArrowClockwiseIcon size={15} className={loading?'spin':''}/><span>{loading?'확인 중':failed?'다시 확인':stale?`저장 ${kstTime(resource?.fetchedAt)}`:`${kstTime(resource?.fetchedAt)} 기준`}</span></button>;
}
function MobileEmpty({loading,error,search,onRefresh}) {
  return <div className="m-empty" role="status">{loading?<ArrowClockwiseIcon className="spin" size={24}/>:error?<WarningCircleIcon size={25}/>:search?<MagnifyingGlassIcon size={25}/>:<FlagIcon size={25}/>}<p>{loading?'기록 확인 중':error?'기록 연결 확인 필요':search?'검색 결과 없음':'등록된 기록 없음'}</p>{error&&<button onClick={onRefresh}>다시 확인</button>}</div>;
}
function MobileTable({entries=[],nearest,onSelect,resource,loading,error,onRefresh,showShop}) {
  const failed=error||resource?.status==='error';
  return <div className="m-table-wrap"><table className="m-table"><thead><tr><th scope="col">순위</th><th scope="col">닉네임</th><th scope="col">{nearest?'거리':'최종성적'}</th></tr></thead><tbody>{entries.map(p=><tr key={p.id} className={p.excluded?'m-excluded':''}><td className="m-rank">{p.rank==null?'—':`${p.tie?'T':''}${p.rank}`}</td><td><button className="m-player-button" onClick={()=>onSelect(p)}>{p.nickname}</button>{showShop&&p.shopName&&<small>{p.shopName}</small>}{p.excluded&&<small>순위 제외</small>}</td><td className="m-value">{nearest?<>{p.distance==null?'—':p.distance.toFixed(2)}<small>m</small></>:scoreText(p.score)}</td></tr>)}</tbody></table>{!entries.length&&<MobileEmpty loading={loading} error={failed} onRefresh={onRefresh}/>}</div>;
}
function ScopeDialog({open,onClose,shop,onApply}) {
  const {ref,close,drag,onCancel}=useMobileModal(open,onClose),[draftShop,setDraftShop]=useState(shop);
  useEffect(()=>{if(open)setDraftShop(shop);},[open,shop]);
  return <dialog className="m-sheet" ref={ref} aria-labelledby="m-scope-title" onCancel={onCancel} onClose={onClose} onClick={e=>{if(e.target===ref.current)close();}}><div className="m-sheet-top m-drag-zone" {...drag}><h2 id="m-scope-title" data-modal-heading tabIndex={-1}>매장 선택</h2><button aria-label="범위 설정 닫기" onClick={()=>close()}><XIcon size={23}/></button></div><fieldset><legend className="sr-only">매장</legend><div className="m-options">{[...SHOPS,{id:0,name:'전체 매장'}].map(s=><button key={s.id} aria-pressed={draftShop===s.id} onClick={()=>setDraftShop(s.id)}>{s.name}</button>)}</div></fieldset><button className="m-apply" onClick={()=>{onApply(draftShop);close();}}>적용</button></dialog>;
}
function MobileRoundPicker({round,onChange}) {
  return <label className="m-round"><select aria-label="차전 선택" value={round} onChange={e=>onChange(e.target.value)}><option value="1">1차전</option><option value="2">2차전</option></select><CaretDownIcon size={18}/></label>;
}
function SearchDialog({open,onClose,data,round,shop,nearest,onSelect,loading,error,onRefresh}) {
  const {ref,close,onCancel}=useMobileModal(open,onClose,'search'),[query,setQuery]=useState('');
  useEffect(()=>{if(open)setQuery('');},[open]);
  const results=useMemo(()=>mobileSearchPlayers(data,query,{includeNearest:nearest}),[data,query,nearest]);
  const scope=nearest?'전체 매장':SHOPS.find(s=>s.id===shop)?.name??'전체 매장';
  const choose=p=>close(()=>onSelect(p));
  return <dialog ref={ref} className="m-search-dialog" aria-labelledby="m-search-title" onCancel={onCancel} onClose={onClose}><div className="m-search-top"><button aria-label="검색 닫기" onClick={()=>close()}><ArrowLeftIcon size={23}/></button><h2 id="m-search-title" data-modal-heading tabIndex={-1}>기록 찾기</h2></div><label className="m-search-input"><MagnifyingGlassIcon size={21}/><input type="search" aria-label="닉네임 검색" placeholder="닉네임 검색" value={query} onChange={e=>setQuery(e.target.value)} autoComplete="off" autoCapitalize="none" spellCheck={false}/>{query&&<button aria-label="검색어 지우기" onClick={()=>setQuery('')}><XIcon size={19}/></button>}</label><div className="m-search-scope"><span>{scope}</span><span>{round}차전</span></div>{query.trim()?<>{results.length?<div className="m-search-results">{results.map(p=><button key={p.id} onClick={()=>choose(p)}><span><b>{p.nickname}</b><small>{p.aggregateUnavailable?'합산 확인 필요':p.incomplete?'합산 미등록':p.distance!=null?p.viewLabel:`${p.tie?'T':''}${p.rank}위`}{nearest&&p.shopName?` / ${p.shopName}`:''}</small></span><strong>{p.incomplete||p.aggregateUnavailable?'':p.distance!=null?`${p.distance.toFixed(2)}m`:scoreText(p.score)}</strong></button>)}</div>:<MobileEmpty loading={loading} error={error||data?.total?.status==='error'} search onRefresh={onRefresh}/>}</>:<div className="m-search-start"><MagnifyingGlassIcon size={25}/><p>닉네임으로 기록 찾기</p></div>}</dialog>;
}
export function MobilePlayer({player,data,onClose}) {
  const {ref,close,drag,onCancel}=useMobileModal(Boolean(player),onClose);
  if(!player)return <dialog ref={ref} className="m-player-dialog" onClose={onClose}/>;
  const near=player.distance!=null,incomplete=player.incomplete||player.rank==null;
  const adjustments=[['원성적',player.rawScore!=null?scoreText(player.rawScore):null],['등급 보정',player.adjustments?.grade],['여성 보정',player.adjustments?.gender],['다라운드 보정',player.adjustments?.rounds],['시스템 보정',player.adjustments?.system]].filter(([label,v])=>v!=null&&(label==='원성적'||v!==0));
  const courses=data?.courses??[];
  const hasNear=courses.some(c=>c.nearest?.entries?.some(p=>p.id===player.id));
  return <dialog ref={ref} className="m-player-dialog" aria-labelledby="m-player-title" onCancel={onCancel} onClose={onClose} onClick={e=>{if(e.target===ref.current)close();}}>
    <div className="m-player-handle m-drag-zone" {...drag} aria-hidden="true"><MinusIcon size={38} weight="bold"/></div>
    <div className="m-sheet-top m-drag-zone" {...drag}><span>선수 기록</span><button aria-label="선수 기록 닫기" onClick={()=>close()}><XIcon size={24}/></button></div>
    <div className="m-player-identity"><div className="m-player-person"><h2 id="m-player-title" data-modal-heading tabIndex={-1}>{player.nickname}</h2><div className="m-player-meta">{!incomplete&&<span>{player.tie?'T':''}{player.rank}위</span>}{player.shopName&&<span>{player.shopName}</span>}{player.rounds!=null&&<span>{player.rounds}라운드</span>}</div></div><div className="m-player-result"><span>{near?player.viewLabel??'니어 거리':player.viewLabel&&player.viewLabel!=='합산'?`${player.viewLabel} 성적`:'최종성적'}</span>{incomplete?<p className="m-player-state">{player.aggregateUnavailable?'합산 확인 필요':'합산 미등록'}</p>:<strong>{near?<>{player.distance.toFixed(2)}<small>m</small></>:scoreText(player.score)}</strong>}</div></div>
    {courses.length>0&&<table className="m-player-records"><thead><tr><th scope="col">코스</th>{!near&&<th scope="col">최종성적</th>}{hasNear&&<th scope="col">니어</th>}</tr></thead><tbody>{courses.map(c=>{const score=c.standings?.entries?.find(e=>e.id===player.id),pin=c.nearest?.entries?.find(e=>e.id===player.id);return <tr key={c.id}><th scope="row"><span>{c.label}</span>{shortCourse(c.name)}</th>{!near&&<td>{score?scoreText(score.score):c.standings?.status==='error'?'확인 필요':'미등록'}</td>}{hasNear&&<td>{pin?.distance!=null?`${pin.distance.toFixed(2)}m`:c.nearest?.status==='error'?'확인 필요':'—'}</td>}</tr>;})}</tbody></table>}
    {adjustments.length>0&&<dl className="m-adjustments">{adjustments.map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>}
  </dialog>;
}

export function MobileApp({path,navigate,round,changeRound,shop,setShop,course,setCourse,data,loading,error,refresh,player,setPlayer,eventView,isDesign}) {
  const nearest=path==='/nearest',event=path==='/event';
  const lastRecordPath=useRef(nearest?'/nearest':'/');
  const [nearCourse,setNearCourse]=useState('A'),[scopeOpen,setScopeOpen]=useState(false),[searchOpen,setSearchOpen]=useState(false);
  useEffect(()=>{if(path==='/'||path==='/nearest')lastRecordPath.current=path;if(path==='/search'){navigate('/',{replace:true});setSearchOpen(true);}},[path]);
  const chosen=nearest?nearCourse:course;
  const recordsRef=useRef(null),eventRef=useRef(null);
  useRecordMotion(recordsRef,[path,chosen,round,shop]);
  useRecordMotion(eventRef,[path]);
  const courses=data?.courses??ROUNDS[round==='2'?1:0].courses;
  const selectedCourse=courses.find(c=>c.label===chosen);
  const resource=nearest?selectedCourse?.nearest:course==='total'?data?.total:selectedCourse?.standings;
  const entries=resource?.entries??[];
  const scope=nearest?'전체 매장 통합':SHOPS.find(s=>s.id===shop)?.name??'전체 매장';
  const onSelect=p=>setPlayer({...p,viewLabel:nearest?`니어 ${nearCourse}코스`:course==='total'?'합산':`${course}코스`});
  return <div className="mobile-app"><header className="m-header"><span>골목대장 나야나</span><img className="m-header-logo" src="/assets/branding/golfzon-park.png" width="186" height="62" alt="GOLFZON PARK"/></header>{isDesign&&<div className="m-preview">예시 기록</div>}<main>{event?<><div className="m-event-back"><a href={lastRecordPath.current} aria-label="기록으로 돌아가기" onClick={e=>{e.preventDefault();navigate(lastRecordPath.current);}}><ArrowLeftIcon size={20}/>기록</a></div><div className="m-event" ref={eventRef}>{eventView}</div></>:<><div className="m-record-toolbar"><nav className="m-mode" aria-label="기록 종류" style={{'--mode-index':nearest?1:0}}><a href="/" aria-current={!nearest?'page':undefined} className={!nearest?'active':''} onClick={e=>{e.preventDefault();navigate('/');}}>스코어</a><a href="/nearest" aria-current={nearest?'page':undefined} className={nearest?'active':''} onClick={e=>{e.preventDefault();navigate('/nearest');}}>니어</a></nav><div className="m-record-actions"><a className="m-info-trigger" href="/event" aria-label="대회 안내" onClick={e=>{e.preventDefault();navigate('/event');}}><InfoIcon size={23}/></a><button className="m-search-trigger" aria-label="기록 검색" onClick={()=>setSearchOpen(true)}><MagnifyingGlassIcon size={23}/></button></div></div><div className="m-scope-row">{nearest?<span>{scope}</span>:<button className="m-shop-trigger" aria-label="매장 선택" onClick={()=>setScopeOpen(true)}>{scope}<CaretDownIcon size={16}/></button>}<MobileRoundPicker round={round} onChange={r=>{changeRound(r);setPlayer(null);}}/></div><div className="m-courses" role="group" aria-label="코스 선택" style={{'--course-count':nearest?3:4,'--course-index':(nearest?['A','B','C']:['total','A','B','C']).indexOf(chosen)}}>{(nearest?['A','B','C']:['total','A','B','C']).map(c=><button key={c} aria-pressed={chosen===c} className={chosen===c?'active':''} onClick={()=>{nearest?setNearCourse(c):setCourse(c);setPlayer(null);}}>{c==='total'?'합산':`${c}코스`}</button>)}</div><section className="m-record-panel" ref={recordsRef} aria-label="순위 기록"><div className="m-record-title"><div><h1 className={chosen==='total'?'sr-only':undefined}>{chosen==='total'?'합산 순위':shortCourse(selectedCourse?.name??'')}</h1>{chosen==='total'&&<span className="m-record-count">총 {resource?.total??(loading?'—':entries.length)}명</span>}{nearest&&selectedCourse?.nearest?.hole>0&&<span>{selectedCourse.nearest.courseName} {selectedCourse.nearest.hole}H</span>}</div><MobileStatus resource={resource} loading={loading} error={error} onRefresh={refresh}/></div>{error&&data&&<div className="m-connection" role="status">연결 지연 / 저장 기록</div>}<MobileTable entries={entries} nearest={nearest} resource={resource} onSelect={onSelect} loading={loading} error={error} onRefresh={refresh} showShop={!nearest&&shop===0}/></section></>}</main><ShopFooter/><ScopeDialog open={scopeOpen} onClose={()=>setScopeOpen(false)} shop={shop} onApply={setShop}/><SearchDialog open={searchOpen} onClose={()=>setSearchOpen(false)} data={data} round={round} shop={shop} nearest={nearest} loading={loading} error={error} onRefresh={refresh} onSelect={setPlayer}/><MobilePlayer player={player} data={data} onClose={()=>setPlayer(null)}/></div>;
}
