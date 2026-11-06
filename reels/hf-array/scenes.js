const txt=(s,x,y,size,col,w=800,al='center')=>{ctx.font=`${w} ${size}px Montserrat`;ctx.textAlign=al;ctx.textBaseline='middle';ctx.fillStyle=col;ctx.fillText(s,x,y)};
function tag(label,big,a=1,y=250){if(a<=0)return;ctx.save();ctx.globalAlpha=a;ctx.font='800 46px Montserrat';const w=Math.max(ctx.measureText(big).width,200)+60;
  rr(CX-w/2,y,w,112,14,'#ece6d6');txt(label,CX,y+28,22,'#6b4a2a',700);txt(big,CX,y+72,46,'#141820');ctx.restore()}
function pop(t0,t,d=.25){return eo(seg(t,t0,t0+d))}
function nightSky(seed=3,lt=0,top='#0c1119',bot='#1b2636'){vgrad(0,H,[[0,top],[.7,bot],[1,'#10151c']]);stars(seed,150,1200,lt)}
function plain(){vgrad(0,H,[[0,'#10151d'],[1,'#1a212b']])}
// one array cell: value box + optional index under it
function cell(x,y,w,h,val,o={}){
  const a=o.a??1;if(a<=0)return;ctx.save();ctx.globalAlpha=a;
  if(o.hi)glow(x+w/2,y+h/2,w*1.1,P.orS,.45*o.hi);
  rr(x,y,w,h,14,o.fill||'#232c38');ctx.strokeStyle=o.hi?`rgba(${P.orS},${.5+.5*o.hi})`:'rgba(243,236,226,.35)';ctx.lineWidth=o.hi?5:3;ctx.beginPath();ctx.roundRect(x,y,w,h,14);ctx.stroke();
  if(val!==''&&val!=null)txt(String(val),x+w/2,y+h/2+2,o.fs||Math.round(w*.36),o.vc||P.ink);
  if(o.idx!=null){ctx.globalAlpha=a*(o.ia??1);txt(String(o.idx),x+w/2,y+h+42,34,o.ic||'#8fb6ea',800)}
  if(o.addr!=null){ctx.globalAlpha=a*(o.aa??1);txt(String(o.addr),x+w/2,y-30,24,'#9aa3ad',700)}
  ctx.restore()}
const VALS=[78,92,65,88,71,95],BW=140,GAP=12,X0=(W-(6*BW+5*GAP))/2,bx=i=>X0+i*(BW+GAP);

function hook(lt,p,b){ // flood of variables
  nightSky(41,lt,'#0d121a','#18212c');
  rr(140,1180,800,26,6,'#2d333b');glow(540,1100,500,'150,190,255',.12);
  rr(330,860,420,300,16,'#0e1218');rr(346,876,388,268,10,'#1d2a3c');rr(300,1150,480,26,8,'#2a3038');
  person(540,1500,2.2,{pose:'back'});
  const r=rng(7),n=Math.floor(lerp(0,90,eo(seg(lt,.3,b(1)+1.2))));
  for(let i=0;i<n;i++){const x=60+r()*960,y=480+r()*640,s=.7+r()*.5,q=pop(.3+i*.03,lt,.3);ctx.save();ctx.globalAlpha=q*.92;ctx.translate(x,y);ctx.rotate((r()-.5)*.5);ctx.scale(s,s);
    rr(-80,-24,160,48,10,'#ece6d6');txt('marks'+(i+1),0,1,24,'#141820',800);ctx.restore()}
  const c=pop(b(1),lt,.3);if(c>0){ctx.save();ctx.globalAlpha=c;rr(CX-250,1250,500,110,20,'rgba(20,24,32,.92)');txt('1,00,000 variables?',CX,1305,44,'#e0533a');ctx.restore()}
}
function intro(lt,p){ // tags collapse into one array
  plain();const k=eio(seg(lt,.15,1.3)),r=rng(7);
  for(let i=0;i<24;i++){const sx=60+r()*960,sy=480+r()*640,j=i%6,tx=bx(j)+BW/2,ty=860;const q=1-seg(k,.6,1);
    if(q>0){ctx.save();ctx.globalAlpha=q;ctx.translate(lerp(sx,tx,k),lerp(sy,ty,k));ctx.scale(lerp(1,.4,k),lerp(1,.4,k));rr(-80,-24,160,48,10,'#ece6d6');ctx.restore()}}
  const a=seg(k,.55,1);VALS.forEach((v,i)=>cell(bx(i),790,BW,140,v,{a}));
  const t=pop(1.2,lt,.4);if(t>0){ctx.save();ctx.globalAlpha=t;glow(CX,600,380,P.orS,.35);txt('ARRAY',CX,600,170,P.or);txt('[ 78, 92, 65, 88, 71, 95 ]',CX,1080,40,'#9aa3ad',700);ctx.restore()}
}
function train(lt,p,b){ // coaches -> memory blocks
  nightSky(23,lt,'#0c111a','#1c2533');skyline(93,1150,'#151b24',.12,60,220,lt);
  rr(0,1150,W,770,0,'#141920');limb(0,1262,W,1262,6,'#5a5f68');limb(0,1292,W,1292,6,'#5a5f68');
  const off=-lerp(0,260,eio(seg(lt,0,b(2)))),cw=200,cy=1050;
  for(let i=0;i<6;i++){const x=40+off+i*(cw+16)+260;rr(x,cy,cw,190,16,'#2c4a6e');rr(x,cy+150,cw,14,0,'#1d3550');for(let k=0;k<3;k++)rr(x+18+k*60,cy+40,44,56,6,'#f2c26b');
    circ(x+40,cy+200,22,'#111');circ(x+cw-40,cy+200,22,'#111');if(i<5)rr(x+cw,cy+120,16,14,2,'#444')}
  fillPoly([[off+60,cy+190],[off+60,cy+40],[off+190,cy+20],[off+290,cy+80],[off+290,cy+190]],'#1e3a5c');glow(off+80,cy+110,120,P.warm,.6);
  const m=eo(seg(lt,b(2),b(2)+.8));
  VALS.forEach((v,i)=>{cell(bx(i),640,BW,130,v,{a:m,addr:1000+i*4,aa:pop(b(2)+.9+i*.12,lt)})});
  if(m>0){ctx.save();ctx.globalAlpha=m;txt('MEMORY · ek ke baad ek',CX,850,30,'#9aa3ad',700);ctx.restore()}
  tag('ANALOGY','TRAIN',pop(.15,lt,.3));
}
function indexScene(lt,p,b){
  plain();const one=b(1);
  VALS.forEach((v,i)=>{const ia=pop(.4+i*.15,lt);const z=i===0?seg(lt,one+.8,one+1.6):0;cell(bx(i),760,BW,150,v,{idx:i,ia,ic:i===0&&z>0?P.or:'#8fb6ea',hi:i===0?z:0})});
  const k=pop(.2,lt);if(k>0){ctx.save();ctx.globalAlpha=k;txt('INDEX',X0-10,1000,26,'#8fb6ea',800,'left');ctx.restore()}
  const s=pop(one+1.6,lt,.35);if(s>0){ctx.save();ctx.globalAlpha=s;rr(CX-250,1100,500,130,22,'rgba(20,24,32,.92)');txt('0',CX-110,1165,90,P.or);txt('1',CX+110,1165,90,'#6b7380');
    const x2=seg(lt,one+2,one+2.35);ctx.strokeStyle='#e0533a';ctx.lineWidth=10;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(CX+70,1125);ctx.lineTo(CX+70+80*x2,1125+80*x2);ctx.stroke();ctx.restore()}
}
function access(lt,p,b){
  plain();const j=b(1)+.6,q=eo(seg(lt,j,j+.5));
  VALS.forEach((v,i)=>cell(bx(i),760,BW,150,v,{idx:i,addr:1000+i*4,hi:i===4?q:0}));
  // arrow jumps straight to index 4 (no scanning)
  if(lt>j-.2){const x=lerp(bx(0)+BW/2,bx(4)+BW/2,q),y=600-Math.sin(q*Math.PI)*160;ctx.save();ctx.globalAlpha=pop(j-.2,lt);fillPoly([[x-26,y-40],[x+26,y-40],[x,y+10]],P.or);glow(x,y-15,70,P.orS,.6);ctx.restore()}
  const f=pop(b(2),lt,.4);if(f>0){ctx.save();ctx.globalAlpha=f;rr(110,1000,860,170,24,'rgba(20,24,32,.94)');txt('address = base + index × size',CX,1050,36,'#9aa3ad',700);
    const parts=[['1000',P.ink],[' + ','#9aa3ad'],['4',P.or],[' × ','#9aa3ad'],['4',P.ink],[' = ','#9aa3ad'],['1016',P.or]];ctx.font='800 58px Montserrat';let w=0;parts.forEach(([s])=>w+=ctx.measureText(s).width);let x=CX-w/2;
    parts.forEach(([s,c],i)=>{const a=pop(b(2)+.3+i*.15,lt);ctx.globalAlpha=f*a;ctx.textAlign='left';ctx.fillStyle=c;ctx.fillText(s,x,1125);x+=ctx.measureText(s).width});ctx.restore()}
  const o=pop(b(3)+1.2,lt,.35);if(o>0){ctx.save();ctx.globalAlpha=o;ctx.translate(CX,1255);ctx.scale(.7+.3*o,.7+.3*o);glow(0,0,220,P.orS,.4);rr(-150,-70,300,140,30,P.or);txt('O(1)',0,4,80,'#120a04');ctx.restore()}
}
function insert(lt,p,b){
  plain();const s0=b(1)+1.2,arr=[78,92,65,88,71,''];
  // shift 71,88,65 right one by one, then 50 drops into index 2
  const sh=[4,3,2].map((i,k)=>eio(seg(lt,s0+k*.7,s0+k*.7+.5)));
  for(let i=0;i<6;i++)cell(bx(i),780,BW,150,'',{idx:i,fill:'#1a2029'});
  [0,1].forEach(i=>cell(bx(i),780,BW,150,arr[i],{}));
  [4,3,2].forEach((i,k)=>{const x=lerp(bx(i),bx(i+1),sh[k]),y=780-Math.sin(sh[k]*Math.PI)*90;cell(x,y,BW,150,arr[i],{hi:sh[k]>0&&sh[k]<1?1:0})});
  const d=eio(seg(lt,s0+2.2,s0+2.8));cell(bx(2),lerp(420,780,d),BW,150,50,{fill:'#3a2a1a',hi:1-d*.6,vc:P.or});
  const c=Math.round(sh.reduce((a,x)=>a+(x>=1?1:0),0));ctx.save();ctx.globalAlpha=pop(s0,lt);txt(`shifts: ${c}`,CX,1060,40,'#9aa3ad',700);ctx.restore();
  const o=pop(b(2)+1.6,lt,.35);if(o>0){ctx.save();ctx.globalAlpha=o;ctx.translate(CX,1230);ctx.scale(.7+.3*o,.7+.3*o);rr(-150,-70,300,140,30,'#e0533a');txt('O(n)',0,4,80,'#fff');ctx.restore()}
}
function sizeScene(lt,p,b){
  plain();const lockA=pop(.6,lt);
  VALS.forEach((v,i)=>cell(bx(i),560,BW,130,v,{}));
  if(lockA>0){ctx.save();ctx.globalAlpha=lockA*(1-.6*seg(lt,b(1),b(1)+.5));rr(CX-200,740,400,70,35,'#2b3038');txt('SIZE = 6 · FIXED',CX,776,32,'#e0533a');ctx.restore()}
  const w2=66,g2=6,x2=(W-(12*w2+11*g2))/2,on=pop(b(1)+.4,lt,.4);
  for(let i=0;i<12;i++)cell(x2+i*(w2+g2),980,w2,100,'',{a:on,fill:'#1a2029'});
  VALS.forEach((v,i)=>{const k=eio(seg(lt,b(1)+1+i*.35,b(1)+1.5+i*.35));if(k<=0)return;const sx=bx(i)+BW/2,sy=625,tx=x2+i*(w2+g2)+w2/2,ty=1030;
    ctx.save();ctx.globalAlpha=k;txt(String(v),lerp(sx,tx,k),lerp(sy,ty,k)-Math.sin(k*Math.PI)*80,lerp(50,30,k),k<1?P.or:P.ink);ctx.restore()});
  if(on>0){ctx.save();ctx.globalAlpha=on;txt('naya array · size 12',CX,1150,30,'#8fb6ea',700);txt('Python list · Java ArrayList',CX,1210,30,'#9aa3ad',700);ctx.restore()}
}
function uses(lt,p){
  plain();const pan=(i,y,label,fn)=>{const a=pop(.2+i*.6,lt,.35);if(a<=0)return;ctx.save();ctx.globalAlpha=a;rr(120,y,840,270,24,'#1d2530');fn(y);txt(label,700,y+135,40,P.ink,800,'left');ctx.restore()};
  pan(0,470,'PIXELS',y=>{for(let r=0;r<6;r++)for(let c=0;c<6;c++){const d=Math.hypot(c-2.5,r-2.5);rr(160+c*36,y+30+r*36,32,32,4,d<1.8?'#f2a33a':r>3?'#3d6b45':'#3a5f8f')}});
  pan(1,770,'GAME BOARD',y=>{for(let r=0;r<3;r++)for(let c=0;c<3;c++){rr(170+c*72,y+30+r*72,66,66,8,'#2b3644');const m=[[0,0,'X'],[1,1,'O'],[2,2,'X'],[0,2,'O']].find(q=>q[0]==r&&q[1]==c);if(m)txt(m[2],170+c*72+33,y+30+r*72+35,40,m[2]=='X'?P.or:'#8fb6ea')}});
  pan(2,1060,'PLAYLIST',y=>{for(let k=0;k<4;k++){rr(160,y+34+k*54,340,42,8,k==1?'#3a2a1a':'#2b3644');txt(`${k}`,184,y+55+k*54,22,'#8fb6ea',800);rr(214,y+50+k*54,180+(k*37)%90,10,5,k==1?P.or:'#6b7380')}});
}
function ending(lt,p,b){
  vgrad(0,H,[[0,'#0c1119'],[.55,'#1b2636'],[.7,'#2a3448'],[1,'#141a22']]);stars(4,170,1150,lt);
  const k=eo(seg(lt,.4,2.5));for(let i=0;i<6;i++){const q=seg(k,i*.12,i*.12+.4);if(q<=0)continue;const x=180+i*130,y=720;const sc=k>=1?Math.max(0,1-Math.abs(((lt*1.5)%7)-i-.5)):0;if(sc>0){glow(x+55,y+55,110,P.orS,.7*sc)}ctx.save();ctx.globalAlpha=q;ctx.strokeStyle=`rgba(${P.orS},.85)`;ctx.lineWidth=4;ctx.strokeRect(x,y,110,110);glow(x+55,y+55,80,P.orS,.3);
    if(i<5){ctx.strokeStyle=`rgba(${P.orS},.4)`;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+110,y+55);ctx.lineTo(x+130,y+55);ctx.stroke()}txt(String(i),x+55,y+150,26,'#ffd7a8',800);ctx.restore()}
  const t=pop(b(1)+1.5,lt,.5);if(t>0){ctx.save();ctx.globalAlpha=t;glow(CX,600,300,P.orS,.3);txt('ARRAY',CX,600,110,P.or);ctx.restore()}
  skyline(11,1180,'#1a2230',.18,120,380,lt);skyline(12,1260,'#121820',.12,60,240,lt);
  rr(-10,1240,W+20,700,0,'#1f2731');rr(-10,1240,W+20,16,0,'#3a4656');person(600,1248,2.3,{pose:'sitBack'});
}
const SC={hook,intro,train,index:indexScene,access,insert,size:sizeScene,uses,ending};
const FOC={hook:[540,900],intro:[540,860],train:[540,900],index:[540,860],access:[540,860],insert:[540,860],size:[540,860],uses:[540,900],ending:[600,1000]};
window.render=function(t,f=0){
  const Ls=TL.lines,N=Ls.length;ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;
  if(t>=Ls[N-2].start-.1){endcard(t,Ls[N-2],Ls[N-1])}
  else{let i=0;for(let k=0;k<N-2;k++)if(t>=Ls[k].start-.08)i=k;
    const sc=Ls[i].scene;let s0=i;while(s0>0&&Ls[s0-1].scene===sc)s0--;let e=i;while(e<N-1&&Ls[e+1].scene===sc)e++;
    const a0=Ls[s0].start-.08,a1=Ls[e+1].start-.08,lt=t-a0,p=seg(t,a0,a1),b=k=>(Ls[s0+k]?Ls[s0+k].start-a0:a1-a0),g={dur:a1-a0};
    cam(lerp(1,1.08,eio(p)),...FOC[sc],()=>SC[sc](lt,p,b,g));
    }
  const v=ctx.createRadialGradient(CX,H/2,520,CX,H/2,1250);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.7)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
  ctx.globalAlpha=.06;ctx.drawImage(GRAIN[f%6],0,0,W,H);ctx.globalAlpha=1;
  const fo=Math.max(1-seg(t,0,.1),seg(t,TL.total-.3,TL.total));if(fo>0){ctx.fillStyle=`rgba(0,0,0,${fo})`;ctx.fillRect(0,0,W,H)}
};
