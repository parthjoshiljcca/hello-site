const W=1080,H=1920,CX=540;
const P={moon:'#ece6d6',warm:'255,196,110',or:'#f07c1e',orS:'240,124,30',ink:'#f3ece2',skin:'#8d5b3d',hair:'#16120f',hood:'#d68a2c',hoodS:'#b06f1e',pants:'#262c33',shoe:'#a3abb3'};
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
let TL=null,LOGO=null,GRAIN=[];
// ---------------- utils ----------------
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const seg=(t,a,b)=>clamp((t-a)/(b-a));
const eo=x=>1-Math.pow(1-x,3),eio=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
const lerp=(a,b,p)=>a+(b-a)*p;
function rng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function bez(p0,p1,p2,p3,n=40){const o=[];for(let i=0;i<=n;i++){const t=i/n,u=1-t;o.push([u*u*u*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t*t*t*p3[0],u*u*u*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t*t*t*p3[1]])}return o}

function fillPoly(pts,c){ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(...pts[0]);for(const q of pts.slice(1))ctx.lineTo(...q);ctx.closePath();ctx.fill()}
function rr(x,y,w,h,r,c){ctx.fillStyle=c;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
function circ(x,y,r,c){ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill()}
function ell(x,y,rx,ry,c){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,7);ctx.fill()}
function limb(x1,y1,x2,y2,w,c){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
function limb3(a,b,c2,w,c){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.lineTo(...c2);ctx.stroke()}
function vgrad(y0,y1,stops,x0=0,x1=W){const g=ctx.createLinearGradient(0,y0,0,y1);stops.forEach(([o,c])=>g.addColorStop(o,c));ctx.fillStyle=g;ctx.fillRect(x0,y0,x1-x0,y1-y0)}
function glow(x,y,r,rgb,a=1){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${rgb},${a})`);g.addColorStop(1,`rgba(${rgb},0)`);ctx.fillStyle=g;ctx.fillRect(x-r,y-r,2*r,2*r)}
function beam(x,y,x2,y2,spread,rgb,a){const ang=Math.atan2(y2-y,x2-x),L=Math.hypot(x2-x,y2-y),n=[-Math.sin(ang),Math.cos(ang)];
  const g=ctx.createLinearGradient(x,y,x2,y2);g.addColorStop(0,`rgba(${rgb},${a})`);g.addColorStop(1,`rgba(${rgb},0)`);ctx.fillStyle=g;
  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2+n[0]*spread,y2+n[1]*spread);ctx.lineTo(x2-n[0]*spread,y2-n[1]*spread);ctx.closePath();ctx.fill()}
function stars(seed,n,y1,t,a=1){const r=rng(seed);for(let i=0;i<n;i++){const x=r()*W,y=r()*y1,s=.8+r()*2.2,ph=r()*6;ctx.globalAlpha=a*(.35+.65*Math.abs(Math.sin(t*1.5+ph)));circ(x,y,s,'#dfe6f0')}ctx.globalAlpha=1}
function skyline(seed,y,col,win,hmin,hmax,t){const r=rng(seed);let x=-20;while(x<W+20){const w=60+r()*110,h=hmin+r()*(hmax-hmin);rr(x,y-h,w,h+400,2,col);
  for(let wy=y-h+20;wy<y-10;wy+=34)for(let wx=x+12;wx<x+w-16;wx+=26){if(r()<win){ctx.globalAlpha=.55+.45*r();rr(wx,wy,12,18,1,'#e8b860');ctx.globalAlpha=1}}x+=w+4}}
const QM=(()=>{const a=bez([-95,-90],[-95,-210],[110,-215],[105,-95]),b=bez([105,-95],[100,-20],[0,-15],[0,60]);return a.concat(b.slice(1))})();

// ---------------- characters ----------------
const HAIR=(()=>{const o=[];for(let i=0;i<=14;i++){const a=Math.PI+Math.PI*i/14,r=i%2?21:30;o.push([Math.cos(a)*r,-172+Math.sin(a)*r])}o.push([20,-168],[-20,-168]);return o})();
const HAIRB=(()=>{const o=[];for(let i=0;i<=18;i++){const a=Math.PI*.9+Math.PI*1.2*i/18,r=i%2?21:28;o.push([Math.cos(a)*r,-170+Math.sin(a)*r])}return o})();
function person(x,y,s,o={}){
  const pose=o.pose||'stand',t=o.t||0,c=o.gray?{skin:'#4f4239',hood:o.gray,hoodS:'rgba(0,0,0,.18)',pants:'#1c2127',shoe:'#5d656e',hair:'#14110f'}
    :o.sil?{skin:o.sil,hood:o.sil,hoodS:'rgba(0,0,0,0)',pants:o.sil,shoe:o.sil,hair:o.sil}:{skin:P.skin,hood:o.col||P.hood,hoodS:P.hoodS,pants:P.pants,shoe:P.shoe,hair:P.hair};
  ctx.save();ctx.translate(x,y);ctx.scale(s*(o.dir||1),s);
  const head=(hx,hy,back)=>{circ(hx,hy,20,c.skin);ctx.save();ctx.translate(hx,hy+172);fillPoly(back?HAIRB:HAIR,c.hair);ctx.restore()};
  const torso=(tx,ty,w=60,h=80)=>{rr(tx-w/2,ty,w,h,16,c.hood);ctx.save();ctx.beginPath();ctx.roundRect(tx-w/2,ty,w,h,16);ctx.clip();ctx.fillStyle=c.hoodS;ctx.fillRect(tx+w*.18,ty,w,h);ctx.restore();
    rr(tx-14,ty-6,28,14,7,c.hood)};
  if(pose==='stand'||pose==='walk'||pose==='phone'||pose==='walkPhone'||pose==='back'||pose==='torch'){
    const sw=(pose==='walk'||pose==='walkPhone')?Math.sin(t*7):0;
    limb3([-8,-78],[-8+sw*14,-42],[-9+sw*24,-8],15,c.pants);limb3([8,-78],[8-sw*14,-42],[9-sw*24,-8],15,c.pants);
    rr(-22+sw*24,-12,20,10,5,c.shoe);rr(2-sw*24,-12,20,10,5,c.shoe);
    if(o.pack)rr(-34,-150,68,70,14,'#4a3324');
    torso(0,-152);
    limb(-27,-138,-34-sw*8,-90,14,c.hood);circ(-34-sw*8,-87,7,c.skin);
    if(pose==='phone'||pose==='walkPhone'){limb3([27,-138],[30,-110],[12,-118],14,c.hood);circ(12,-118,7,c.skin);rr(2,-140,16,26,3,'#0c0f13');rr(4,-138,12,21,2,'#cfe3ff');if(!o.gray||1)glow(10,-135,60,'190,215,255',.35)}
    else if(pose==='torch'){limb(27,-138,62,-122,14,c.hood);circ(64,-121,7,c.skin);rr(60,-128,24,12,4,'#555')}
    else{limb(27,-138,34+sw*8,-90,14,c.hood);circ(34+sw*8,-87,7,c.skin)}
    head(0,-172,pose==='back');
    if(o.lookUp){}
  }else if(pose==='sitBack'){ // back view, cut at ledge (y=0)
    torso(0,-82,66,90);limb(-30,-70,-40,-6,15,c.hood);limb(30,-70,40,-6,15,c.hood);head(0,-104,true);
  }else if(pose==='sitSide'){ // facing right, hip at 0,0
    limb3([0,-4],[46,-4],[48,40],17,c.pants);rr(40,34,26,10,5,c.shoe);
    ctx.save();ctx.rotate(.12);torso(-4,-84,54,84);ctx.restore();
    limb3([8,-70],[30,-40],[62,-40],14,c.hood);circ(64,-40,7,c.skin);
    head(14,-104,false);
  }else if(pose==='crouch'){ // facing right, feet at 0
    limb3([-14,-48],[18,-46],[14,-6],16,c.pants);rr(6,-12,24,10,5,c.shoe);rr(-22,-12,22,10,5,c.shoe);
    ctx.save();ctx.translate(-14,-48);ctx.rotate(.45);torso(0,-76,54,78);ctx.restore();
    limb3([18,-104],[46,-70],[80,-40],14,c.hood);circ(82,-38,7,c.skin);
    head(32,-128,false);
  }
  ctx.restore();
}
function dadi(x,y,s,col='#6e3530'){ctx.save();ctx.translate(x,y);ctx.scale(s,s);
  fillPoly([[-26,-165],[26,-165],[52,-60],[58,0],[-58,0],[-52,-60]],col);
  circ(0,-168,24,col);circ(0,-162,15,'#7a5038');fillPoly([[-24,-170],[24,-170],[30,-120],[-30,-120]],col);
  limb(-30,-110,-14,-80,12,col);limb(30,-110,14,-80,12,col);ctx.restore()}

// ---------------- captions (chunks) ----------------
function chunks(cap){const w=cap.toUpperCase().split(' '),o=[];let cur=[];for(const x of w){cur.push(x);const len=cur.join(' ').length;if(cur.length>=3||len>=14||/[,.?]$/.test(x)){o.push(cur);cur=[]}}if(cur.length)o.push(cur);return o}
function caption(l,t,cy=1400){
  const cs=chunks(l.cap),tot=cs.reduce((s,c)=>s+c.join(' ').length+1,0);let acc=0,cur=null,cst=0;
  for(const c of cs){const s=l.start+l.dur*acc/tot;acc+=c.join(' ').length+1;if(t>=s-.04){cur=c;cst=s}}
  if(!cur)return;const k=eo(seg(t,cst-.04,cst+.1));
  ctx.save();ctx.font='800 92px M';ctx.textBaseline='alphabetic';ctx.textAlign='left';const sp=ctx.measureText(' ').width;
  const lines=[[]];let lw=0;cur.forEach(w=>{const ww=ctx.measureText(w).width;if(lw+ww>860&&lines[lines.length-1].length){lines.push([]);lw=0}lines[lines.length-1].push(w);lw+=ww+sp});
  const y0=cy,sc=lerp(1.12,1,k);ctx.translate(CX,y0);ctx.scale(sc,sc);ctx.translate(-CX,-y0);
  lines.forEach((ln,i)=>{const ws=ln.map(w=>ctx.measureText(w).width),tw=ws.reduce((a,b)=>a+b,0)+sp*(ln.length-1);let x=CX-tw/2;
    ln.forEach((w,j)=>{const key=KEY.includes(w.replace(/[,]/g,''))||KEY.includes(w);ctx.globalAlpha=k;ctx.shadowColor='rgba(0,0,0,.7)';ctx.shadowBlur=24;ctx.shadowOffsetY=4;
      ctx.fillStyle=key?P.or:'#ffffff';ctx.fillText(w,x,y0+i*104);x+=ws[j]+sp})});
  ctx.restore();
}

// ---------------- end card ----------------
function endcard(t,L10,L11){
  rr(0,0,W,H,0,'#050505');const t0=L10.start-.1,e=eo(seg(t,t0,t0+.55));
  glow(CX,820,700,P.orS,.22*e);
  const r=rng(5);for(let i=0;i<60;i++){const x=r()*W,y=((r()*H-t*30*(.5+r()))%H+H)%H;ctx.globalAlpha=.3*r();circ(x,y,1+r()*2,i%3?P.ink:P.or)}ctx.globalAlpha=1;
  const lw=1320,s=lerp(1.3,1,e)*(1+.03*seg(t,t0+.55,TL.total));
  ctx.save();ctx.globalAlpha=e;ctx.filter=`blur(${(1-e)*18}px)`;ctx.translate(CX,820);ctx.scale(s,s);ctx.drawImage(LOGO,-lw/2,-lw/2,lw,lw);ctx.restore();ctx.filter='none';
  const words='Because every WHY deserves a story.'.split(' '),tot=words.join(' ').length;let acc=0;
  ctx.save();ctx.font='500 54px M';const sp=ctx.measureText(' ').width;const ws=words.map(w=>{ctx.font=(w==='WHY'?'800':'500')+' 54px M';return ctx.measureText(w).width});
  let X=CX-(ws.reduce((a,b)=>a+b,0)+sp*(words.length-1))/2;
  words.forEach((w,i)=>{const s0=L11.start+L11.dur*acc/tot*.95;acc+=w.length+1;const q=eo(seg(t,s0-.04,s0+.14));ctx.globalAlpha=q;ctx.font=(w==='WHY'?'800':'500')+' 54px M';
    ctx.fillStyle=w==='WHY'?P.or:P.ink;ctx.fillText(w,X,1230+(1-q)*20);X+=ws[i]+sp});ctx.restore();
  const f=eo(seg(t,L11.start+L11.dur*.7,L11.start+L11.dur*.7+.35));if(f>0){ctx.save();ctx.globalAlpha=f;ctx.font='700 40px M';const txt='Follow  @thewhyspaces',w=ctx.measureText(txt).width+80;
    rr(CX-w/2,1340+(1-f)*20,w,84,42,P.or);ctx.fillStyle='#120a04';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(txt,CX,1383+(1-f)*20);ctx.restore()}
}

// ---------------- frame ----------------
function makeGrain(){for(let k=0;k<6;k++){const c=document.createElement('canvas');c.width=540;c.height=960;const x=c.getContext('2d'),im=x.createImageData(540,960),r=rng(100+k);
  for(let i=0;i<im.data.length;i+=4){const v=r()*255;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=255}x.putImageData(im,0,0);GRAIN.push(c)}}
function cam(z,fx,fy,fn){ctx.save();ctx.translate(fx,fy);ctx.scale(z,z);ctx.translate(-fx,-fy);fn();ctx.restore()}
