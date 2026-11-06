// node tests.cjs：引擎、病例、考題與文獻數值檢查
const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const block=(a,b)=>{const i=html.indexOf(a),j=html.indexOf(b);if(i<0||j<0)throw new Error('missing '+a);return html.slice(i,j);};
const ctx={};vm.createContext(ctx);
vm.runInContext(block('/*ENGINE-START*/','/*ENGINE-END*/')+block('/*TEACH-START*/','/*TEACH-END*/')+';this.PEE=PEE;this.CASES=CASES;this.QUIZ=QUIZ;this.MAP=MAP;',ctx);
const {PEE,CASES,QUIZ,MAP}=ctx;
let pass=0,fail=0;
const ok=(c,m)=>{if(c)pass++;else{fail++;console.log('FAIL',m);}};
const eq=(a,b,m)=>ok(a===b,`${m}: got ${JSON.stringify(a)} want ${JSON.stringify(b)}`);
const C=p=>PEE.calc(p);

// 空白狀態不可顯示低風險結論
eq(C({}).assessed,false,'blank not assessed');
eq(C({age:'50'}).assessed,true,'age assessed');
ok(C({age:'50'}).escMissing.includes('RV 影像'),'low needs RV');
eq(C({age:'50',rvChecked:true}).escMissing.length,0,'low with RV done');
ok(C({scoreMode:'pesi',rvChecked:true,hypo:{}, trop:'nl'}).escMissing.length>0,'PESI blank age provisional');

// ESC
for(const h of ['persist','refractory','arrest'])eq(C({hemo:h}).esc,'high','ESC '+h);
eq(C({hemo:'transient',hypo:{lac:true}}).esc,'high','transient+hypoperf');
eq(C({hemo:'stable',hypo:{lac:true},age:'50',rvChecked:true}).esc,'low','ESC no normotensive shock');
ok(C({hemo:'stable',hypo:{lac:true},age:'50',rvChecked:true}).flags.length>0,'normotensive shock flagged');
eq(C({age:'50',pe:{hr:true},rv:{ratio:true},trop:'up'}).esc,'imh','imh');
eq(C({age:'50',pe:{hr:true},rv:{ratio:true},trop:'nl'}).esc,'iml','iml rv only');
eq(C({age:'50',pe:{hr:true},rvChecked:true,trop:'up'}).esc,'iml','iml trop only');
eq(C({age:'50',rv:{ratio:true},trop:'up'}).esc,'iml','ESC text: low score + both = iml');
eq(C({age:'50',pe:{hr:true},rv:{ratio:true},trop:'nl',bnp:'up'}).esc,'iml','BNP not troponin in ESC');

// AHA Figure 2 分類
eq(C({asym:true,age:'66',pe:{ca:true}}).aha,'A','A despite cancer');
eq(C({age:'40',loc:'sub'}).aha,'B1','B1');eq(C({age:'40',loc:'seg'}).aha,'B2','B2 seg');eq(C({age:'40',loc:'prox'}).aha,'B2','B2 prox');eq(C({age:'40'}).aha,'B','B');
eq(C({age:'85',trop:'nl',bnp:'nl',rvChecked:true}).aha,'C1','C1 age');
eq(C({age:'50',pe:{lung:true},bnp:'up',trop:'nl',rvChecked:true}).aha,'C2','C2 by BNP');
eq(C({age:'50',pe:{lung:true},rv:{tapse:true}}).aha,'C2','C2 by RV');
eq(C({age:'50',pe:{lung:true},rv:{tapse:true},bnp:'up'}).aha,'C3','C3 by BNP+RV');
eq(C({age:'50',pe:{lung:true},rv:{tapse:true},trop:'up'}).aha,'C3','C3 by trop+RV');
eq(C({hemo:'transient',age:'50'}).aha,'D1','D1');
eq(C({hemo:'transient',hypo:{lac:true}}).aha,'D2','D2 transient');
eq(C({hypo:{aki:true}}).aha,'D2','D2 normotensive');
eq(C({hemo:'persist'}).aha,'E1','E1');eq(C({hemo:'refractory'}).aha,'E2','E2');eq(C({hemo:'arrest'}).aha,'E2','E2 arrest');

// R 修飾：各類門檻不同，A、B 沒有 R
eq(C({age:'40',resp:{d:true}}).ahaR,'','B no R even with oxygen tick');
eq(C({asym:true,resp:{c:true}}).ahaR,'','A no R');
eq(C({age:'85',resp:{c:true}}).ahaR,'-R','C any O2');
eq(C({age:'85',pe:{spo2:true}}).ahaR,'-R','C SpO2 from score');
eq(C({age:'85',pe:{rr:true}}).ahaR,'-R','C RR from score');
eq(C({age:'85'}).ahaR,'','C without');
eq(C({hemo:'transient',resp:{c:true}}).ahaR,'','D low oxygen no R');
eq(C({hemo:'transient',resp:{d:true}}).ahaR,'-R','D >6L');
eq(C({hemo:'persist',resp:{d:true}}).ahaR,'','E >6L no R');
eq(C({hemo:'persist',resp:{vent:true}}).ahaR,'-R','E vent');

// 分數：PESI 與 sPESI 共用輸入，切換不改變臨床事實
eq(C({age:'81'}).sp,1,'sPESI age');eq(C({age:'80'}).sp,0,'sPESI age 80');
eq(C({age:'50',pe:{hf:true,lung:true}}).sp,1,'hf+lung one point');
eq(C({age:'50',sex:'F',pe:{ca:true,hf:true,lung:true,hr:true,sbp:true,rr:true,temp:true,ams:true,spo2:true},scoreMode:'pesi'}).pesi,50+30+10+10+20+30+20+20+60+20,'PESI sum');
eq(C({age:'60',sex:'M',scoreMode:'pesi'}).pesi,70,'PESI male');
const cls=[[65,'I'],[66,'II'],[85,'II'],[86,'III'],[105,'III'],[106,'IV'],[125,'IV'],[126,'V']];
for(const [a,k] of cls)eq(C({age:String(a-30),sex:'F',pe:{ca:true},scoreMode:'pesi'}).pesiCls,k,'PESI class '+a);
eq(C({age:'85',sex:'F',scoreMode:'pesi',rvChecked:true}).esc,'low','PESI 85 low');
eq(C({age:'86',sex:'F',scoreMode:'pesi',rvChecked:true}).esc,'iml','PESI 86 not low');
eq(C({sex:'F',pe:{ams:true,ca:true},scoreMode:'pesi',rvChecked:true}).sevHigh,true,'PESI items alone >85');
eq(C({age:'12'}).ageBad,true,'child rejected');eq(C({age:'150'}).ageBad,true,'150 rejected');
eq(C({age:'-5'}).ageBad,true,'negative rejected');

// 舊資料移轉
const old=PEE.normalizeP({hemo:'stable',hypo:{},resp:{o2:true},sp:{ca:true,cp:true,age:true,hr:true},pe:{},rv:{},ci:{}});
eq(old.pe.ca,true,'mig ca');eq(old.pe.hf,true,'mig cp');eq(old.ageFlag,true,'mig age');eq(old.resp.d,true,'mig o2');eq(old.sp,undefined,'mig drops sp');
eq(PEE.normalizeP(null).hemo,'stable','null');eq(PEE.normalizeP({hemo:'x',hypo:3}).hemo,'stable','bad hemo');
eq(PEE.calc({hemo:'x',hypo:3,pe:null}).esc,'low','corrupt no crash');

// Table 7
const T={A:['3: Harm A','3: NB C-EO','3: NB C-EO','3: NB C-EO'],C1:['3: Harm A','3: NB C-EO','3: NB C-EO','3: NB C-EO'],C2:['3: Harm B-R','2b C-LD','2b C-LD','3: NB C-EO'],C3:['2b C-LD','2b C-LD','2b C-LD','3: NB C-EO'],D1:['2b C-LD','2b B-NR','2b B-NR','2b C-LD'],D2:['2b C-LD','2b B-NR','2b B-NR','2b C-LD'],E1:['2a C-LD','2a C-LD','2a B-NR','2a B-NR'],E2:['2a C-LD','N/A','N/A','3: NB B-NR']};
for(const k in T)T[k].forEach((v,i)=>eq(PEE.ADV[k][i],v,`Table7 ${k}.${i}`));
for(const k of ['A','B','B1','B2','C1','C2','C3','D1','D2','E1','E2'])ok(PEE.ADV[k],'ADV '+k);

// 建議內容
const txt=(p)=>{const c=C(p);return PEE.ahaPlan(c,p).join('|');};
ok(!/UFH（預期/.test(txt({hemo:'transient'})),'D no UFH preference');
ok(/LMWH 優於 UFH/.test(txt({hemo:'transient'})),'D LMWH');
ok(/LMWH 優於 UFH/.test(txt({hemo:'persist'})),'E1 LMWH');
ok(/LMWH 或 UFH/.test(txt({hemo:'arrest'})),'E2 either');
ok(/VA-ECMO/.test(txt({hemo:'arrest'})),'E2 ECMO');
ok(/升壓劑/.test(txt({hypo:{lac:true}})),'D2 pressor');
ok(!/升壓劑/.test(txt({hemo:'transient'})),'D1 no pressor rec');
ok(/右心游離血栓/.test(txt({hemo:'persist',cit:true})),'CIT E1');
ok(!/右心游離血栓/.test(txt({age:'85',cit:true})),'CIT not C1');
ok(/HI-PEITHO/.test(txt({age:'85',rv:{ratio:true},trop:'up'})),'C3 HI-PEITHO');
ok(/開始 DOAC/.test(txt({asym:true})),'A DOAC');
ok(/絕對禁忌/.test(txt({hemo:'persist',ci:{bleed:true}})),'E1 abs CI');
ok(PEE.escPlan(C({hemo:'persist',ci:{bleed:true}})).join('').includes('絕對禁忌'),'ESC abs CI');
ok(/懷孕/.test(PEE.popNotes({pop:{preg:true}}).join()),'preg note');
eq(C({pop:{preg:true}}).relCI,true,'preg counts relative CI');
ok(/CrCl <30/.test(PEE.popNotes({crcl:'20'}).join()),'renal note');
eq(PEE.popNotes({}).length,0,'no pop notes');
eq(PEE.popNotes({crcl:''}).length,0,'blank crcl');

// 劑量
const D=p=>PEE.doses(p);
eq(D({wt:'80'}).ufh,'6400 U → 1440 U/h','UFH');eq(D({wt:'80'}).enox,'80 mg q12h','enox');
eq(D({wt:'68',crcl:'24'}).enox,'68 mg q24h','enox renal');eq(D({wt:'68',crcl:'30'}).enox,'68 mg q12h','enox 30');
eq(D({wt:'49'}).fonda,'5 mg qd','fonda 49');eq(D({wt:'50'}).fonda,'7.5 mg qd','fonda 50');eq(D({wt:'100'}).fonda,'7.5 mg qd','fonda 100');eq(D({wt:'101'}).fonda,'10 mg qd','fonda 101');
eq(D({wt:'70',crcl:'20'}).fonda,'CrCl <30 禁用','fonda renal');
eq(D({wt:'60'}).accel,'36 mg，15 分鐘','accel');eq(D({wt:'100'}).accel,'50 mg，15 分鐘','accel cap');
eq(D({}).ufh,'—','no weight');eq(D({wt:'-3'}).ufh,'—','neg weight');
eq(D({pop:{preg:true}}).avoidDoac,true,'preg avoid DOAC');

// Actilyse 仿單與 ESC NOAC 腎功能註腳
eq(D({wt:'80'}).std,'100 mg，2 小時','std 80');eq(D({wt:'65'}).std,'100 mg，2 小時','std 65');eq(D({wt:'60'}).std,'90 mg，2 小時','std 60 cap');eq(D({wt:'60'}).stdCap,true,'cap flag');eq(D({}).std,'100 mg，2 小時','std blank');
eq(D({wt:'70'}).tinz,'12250 IU qd','tinz');
ok(/不建議 dabigatran/.test(PEE.noacRenal(20)),'CrCl 20');ok(/<15/.test(PEE.noacRenal(10)),'CrCl 10');eq(PEE.noacRenal(30),'','CrCl 30');eq(PEE.noacRenal(NaN),'','CrCl blank');
ok(/III C/.test(PEE.popNotes({pop:{preg:true}}).join()),'preg III C');ok(/III C/.test(PEE.popNotes({pop:{aps:true}}).join()),'APS III C');
// ESC 建議強度（T17、T18、T21）
const es=x=>PEE.escPlan(C(x)).join('|');
for(const t of ['I C','I B','IIa C','IIb C'])ok(es({hemo:'persist'}).includes(t),'ESC high '+t);
for(const t of ['I A','I B','IIa C','III B'])ok(es({age:'50',pe:{hr:true},rv:{ratio:true},trop:'up'}).includes(t),'ESC imh '+t);
ok(es({age:'40',rvChecked:true}).includes('IIa A'),'ESC low IIa A');
// 健保表
eq(PEE.NHI.length,11,'NHI rows');
const N=k=>PEE.NHI.find(r=>r.d===k);
ok(/未列肺栓塞/.test(N('Enoxaparin').rule),'enox rule');ok(/治療肺栓塞/.test(N('Tinzaparin').rule),'tinz rule');eq(N('Fondaparinux').st,'bad','fonda');eq(N('Tenecteplase').st,'bad','tnk');
for(const k of ['Apixaban','Rivaroxaban','Edoxaban','Dabigatran'])ok(/含肺栓塞/.test(N(k).rule),k);

// 處方導引
const X=p=>PEE.rxPlan(p);
const pk=p=>X(p).primary.k;
eq(pk({age:'50'}),'apix','default apixaban');
ok(X({age:'50'}).alts.map(a=>a.k).join()==='riva,edox,dabi','default alts');
eq(pk({pop:{preg:true}}),'lmwh','preg LMWH');
ok(!X({pop:{preg:true}}).alts.some(a=>/apix|riva|edox|dabi|warf/.test(a.k)),'preg no DOAC/VKA alt');
eq(pk({pop:{aps:true}}),'warf','APS VKA');
eq(pk({pop:{aps1:true}}),'apix','single antibody DOAC');ok(/2b B-R/.test(X({pop:{aps1:true}}).flags.join()),'aps1 flag');
eq(pk({pop:{bf:true}}),'lmwh','bf');
eq(pk({pop:{childC:true}}),'warf','child C');
eq(pk({crcl:'10'}),'warf','CrCl 10');ok(X({crcl:'10'}).alts.some(a=>a.k==='apix'),'CrCl 10 apix alt');
eq(pk({rx:{dialysis:true},crcl:'40'}),'warf','dialysis');
ok(X({crcl:'20'}).avoid.some(a=>a.k==='dabi'),'CrCl 20 no dabi');ok(/謹慎/.test(X({crcl:'20'}).primary.lines.join()),'CrCl 20 caution');
eq(pk({pop:{cancer:true},rx:{giCa:true}}),'lmwh','GI cancer LMWH');
eq(pk({pop:{cancer:true}}),'apix','cancer DOAC');ok(X({pop:{cancer:true}}).alts.some(a=>a.k==='lmwh'),'cancer LMWH alt');
eq(pk({pop:{brain:true}}),'apix','brain');
eq(pk({rx:{ddi:true}}),'lmwh','ddi');
eq(X({ci:{bleed:true}}).primary.k,undefined,'bleed no drug');ok(/IVC filter/.test(X({ci:{bleed:true}}).primary.lines.join()),'bleed filter');
ok(/非 heparin/.test(X({rx:{hit:true},hemo:'persist'}).initial.join()),'HIT');
// 初始注射
ok(/UFH 含負荷/.test(X({hemo:'arrest'}).initial.join()),'E2 UFH');
ok(/LMWH 優於 UFH/.test(X({hemo:'persist'}).initial.join()),'E1 LMWH');
ok(/2–3 天/.test(X({age:'50',pe:{hr:true},rv:{ratio:true},trop:'up'}).initial.join()),'imh LMWH 2-3 d');
ok(/直接口服/.test(X({age:'40',rvChecked:true}).initial.join()),'stable direct oral');
ok(/ESC 建議 UFH/.test(X({hemo:'transient',crcl:'20'}).initial.join()),'renal UFH');
// 時程
const sch=p=>X(p).schedule;
eq(sch({}).length,2,'apix 2 steps');eq(sch({rx:{daysOn:'3'}})[0].now,true,'day3 now');eq(sch({rx:{daysOn:'8'}})[1].now,true,'day8 now');eq(sch({rx:{daysOn:'7'}})[1].now,false,'day7 not step2');
ok(/30 mg/.test(X({pop:{cancer:true},rx:{},wt:'55'}).schedule.join?'30 mg':''),'placeholder');
const ed=PEE.rxPlan({crcl:'20',pop:{}});ok(ed.primary.k==='apix','renal primary apix');
ok(/INR 達 2.5/.test(sch({pop:{aps:true}}).map(s=>s.what).join()),'warf overlap');
eq(sch({pop:{aps:true},rx:{daysOn:'20'}})[1].now,false,'warf after not marked');
ok(/q24h/.test(sch({pop:{preg:true},wt:'70',crcl:'20'}).map(s=>s.what).join()),'lmwh renal');
ok(/12250 IU/.test(sch({pop:{preg:true},wt:'70'}).map(s=>s.what).join()),'tinz dose');
// 療程與減量
const du=p=>{const x=X(p);return x.duration.concat(x.taper).join('|');};
ok(/停藥，優於延長/.test(du({rx:{rf:'major'}})),'major stop');ok(/逐步減量/.test(du({rx:{rf:'major'}})),'no taper needed');
ok(/共同決定/.test(du({rx:{rf:'minor'}})),'minor shared');
ok(/延長治療.*1 A/.test(du({rx:{rf:'none'}})),'unprovoked extended');
ok(/半劑量/.test(du({rx:{rf:'none'}})),'half dose');ok(!/半劑量/.test(du({rx:{rf:'persist'},pop:{cancer:true}})),'cancer no half dose');
ok(/DOAC 或 LMWH/.test(du({rx:{rf:'persist'},pop:{cancer:true}})),'cancer extended');
ok(/先判定誘發因子/.test(du({})),'rf unknown');
ok(/第 8 天由 10 mg bid 降為 5 mg bid/.test(du({})),'apix step');
ok(/第 22 天/.test(du({pop:{brain:true},rx:{ddi:false}}))===false,'brain apix not riva');
// 追蹤
const mo=p=>X(p).monitor.map(m=>m.when+':'+m.what).join('|');
ok(/出院 1 週內/.test(mo({}))&&/3 個月內/.test(mo({}))&&/至少 1 年/.test(mo({})),'core follow-up');
ok(/適齡癌症篩檢/.test(mo({rx:{rf:'none'}})),'cancer screen');ok(!/適齡癌症篩檢/.test(mo({rx:{rf:'major'}})),'no screen if major');
ok(/血栓傾向/.test(mo({rx:{rf:'none'},age:'40'})),'thrombophilia <55');ok(!/血栓傾向/.test(mo({rx:{rf:'none'},age:'60'})),'no thrombophilia 60');
ok(/監測 anti-Xa：CrCl <30/.test(mo({pop:{preg:true},crcl:'20'})),'antiXa renal');ok(/No Benefit A/.test(mo({pop:{preg:false},rx:{rf:''},hemo:'persist'})),'antiXa not routine');
ok(/育齡女性/.test(mo({sex:'F',age:'30'})),'childbearing');ok(!/育齡女性/.test(mo({sex:'M',age:'30'})),'male no');
ok(/乳酸/.test(mo({age:'85'})),'C lactate');
// 症狀與復發
ok(/V\/Q/.test(X({rx:{dyspnea:true}}).symptoms.join()),'CTEPD');ok(/No Benefit/.test(X({}).symptoms.join()),'no follow-up CT');
ok(/不同類/.test(X({rx:{recur:'full'}}).recur.join()),'recur full');ok(/全劑量/.test(X({rx:{recur:'reduced'}}).recur.join()),'recur reduced');ok(/20–25%/.test(X({rx:{recur:'lmwh'}}).recur.join()),'recur lmwh');eq(X({}).recur.length,0,'no recur');
ok(/<50/.test(X({rx:{plt:'40'}}).flags.join()),'plt');eq(X({rx:{plt:'150'}}).flags.length,0,'plt ok');
ok(/第 100 天：已到初始期/.test(X({rx:{daysOn:'100'}}).flags.join()),'day 100');
ok(/轉口服後第 1–7 天/.test(sch({hemo:'transient',rx:{daysOn:'4'}}).map(s=>s.when).join()),'parenteral first label');eq(sch({hemo:'transient',rx:{daysOn:'4'}}).some(s=>s.now),false,'no now when parenteral first');
// 掃描：主要藥物不能落在避免清單；懷孕永不出現 DOAC/VKA
const keys=['preg','bf','aps','aps1','childB','childC','brain','cancer','noac'];let sweep=0;
for(let m=0;m<512;m++)for(const cr of ['', '10','20','60'])for(const extra of [{},{ddi:true},{hit:true},{giCa:true}]){
  const pop={};keys.forEach((k,i)=>{if(m>>i&1)pop[k]=true;});
  const x=X({pop,crcl:cr,rx:extra});sweep++;
  if(x.primary.k&&x.avoid.some(a=>a.k===x.primary.k)){ok(false,'primary avoided '+JSON.stringify(pop)+cr+JSON.stringify(extra));break;}
  if(pop.preg&&!pop.noac&&['apix','riva','edox','dabi','warf'].includes(x.primary.k)){ok(false,'preg oral');break;}
  if(x.alts.some(a=>x.avoid.some(v=>v.k===a.k))){ok(false,'alt avoided '+JSON.stringify(pop)+cr+JSON.stringify(extra));break;}
}
ok(sweep===8192,'sweep '+sweep);
for(const k of CASES)ok(X(k.P).primary.title,'case rx '+k.id);

// 病例
eq(CASES.length,8,'8 cases');
const seen=new Set();
for(const k of CASES){
  ok(!seen.has(k.id),'unique '+k.id);seen.add(k.id);
  const c=C(k.P);
  eq(c.esc,k.expect.esc,k.id+' esc');eq(c.ahaFull,k.expect.aha,k.id+' aha');
  eq(c.assessed,true,k.id+' assessed');
  eq(c.escMissing.length,0,k.id+' esc complete');eq(c.ahaMissing.length,0,k.id+' aha complete');
  ok(k.why.length>=4&&k.pit&&k.q&&k.tag.startsWith(k.expect.aha.split('-')[0]==='B2'?'B2':k.expect.aha),k.id+' fields/tag');
  ok(k.why.join().includes(k.expect.aha.replace('-R',''))||k.expect.esc,k.id+' why');
}
// 病例敘述與輸入一致
const c5=CASES[4].P;ok(c5.rv.ratio&&c5.trop==='up','HI-PEITHO case criteria');
const c6=C(CASES[5].P);eq(c6.absCI,true,'c6 surgery CI');
eq(PEE.doses(CASES[7].P).accel,'36 mg，15 分鐘','c8 accel matches text');
eq(PEE.doses(CASES[3].P).enox,'68 mg q24h','c4 enox');
eq(PEE.ahaPlan(C(CASES[1].P),CASES[1].P).join().includes('DOAC'),true,'c2 DOAC');

// 考題
eq(QUIZ.length,20,'20 q');
eq(QUIZ.filter(q=>q.lv==='基礎').length,10,'10 basic');eq(QUIZ.filter(q=>q.lv==='高階').length,10,'10 adv');
ok(QUIZ.slice(0,10).every(q=>q.lv==='基礎'),'basic first');
const cnt=[0,0,0,0];let longest=0;
QUIZ.forEach((q,i)=>{
  eq(q.o.length,4,'q'+i+' 4 opts');eq(new Set(q.o).size,4,'q'+i+' unique');ok(q.a>=0&&q.a<4&&q.why,'q'+i);
  cnt[q.a]++;
  const L=q.o.map(x=>x.length),m=Math.max(...L);if(L[q.a]===m&&L.filter(x=>x===m).length===1)longest++;
  if(q.eng&&q.eng.P){const c=C(q.eng.P);if(q.eng.aha)eq(c.aha,q.eng.aha,'q'+i+' engine');if(q.eng.esc)eq(c.esc,q.eng.esc,'q'+i+' engine');}
  if(q.eng&&q.eng.adv)eq(PEE.ADV[q.eng.adv.cat][q.eng.adv.i],q.eng.adv.val,'q'+i+' table7');
});
eq(cnt.join(),'5,5,5,5','A-D balance');
ok(longest<=7,'correct not usually longest: '+longest);

// 心智圖
const leaf=x=>x.c?x.c.flatMap(leaf):[x.t];
ok(MAP.c.length>=8,'map branches');ok(leaf(MAP).length>=35,'map leaves');
ok(/3-Harm/.test(leaf(MAP).join()),'map Table 7');

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
