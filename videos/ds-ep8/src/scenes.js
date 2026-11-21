const W=1080,H=1920,FPS=30;
let D=null,TOT=30;
const OR='#ff8a1f',WH='#f3ece4',CARD='#f3ece4',INK='#0d0a08';
const cl=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const seg=(t,a,b)=>cl((t-a)/(b-a));
const eo=x=>1-Math.pow(1-x,3);
const eio=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
const back=x=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2)};
const lerp=(a,b,t)=>a+(b-a)*t;
function rng(s){return function(){s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const ctx=document.getElementById('c').getContext('2d');
const E=n=>D.ev[n];
const pop=(t,n,d=0.45,off=-0.08)=>back(seg(t,E(n)+off,E(n)+off+d));
const fin=(t,n,d=0.5,off=-0.08)=>eo(seg(t,E(n)+off,E(n)+off+d));

// ---------- background ----------
const grains=[];for(let k=0;k<4;k++){const g=document.createElement('canvas');g.width=g.height=256;const gx=g.getContext('2d');const id=gx.createImageData(256,256);const r=rng(k+7);for(let i=0;i<id.data.length;i+=4){const v=r()*255;id.data[i]=id.data[i+1]=id.data[i+2]=v;id.data[i+3]=14}gx.putImageData(id,0,0);grains.push(gx.createPattern(g,'repeat'))}
function bg(t){
 ctx.fillStyle='#0a0807';ctx.fillRect(0,0,W,H);
 ctx.strokeStyle='rgba(255,170,110,0.028)';ctx.lineWidth=1;ctx.beginPath();
 for(let x=0;x<=W;x+=60){ctx.moveTo(x+.5,0);ctx.lineTo(x+.5,H)}for(let y=0;y<=H;y+=60){ctx.moveTo(0,y+.5);ctx.lineTo(W,y+.5)}ctx.stroke();
 const gx=540+Math.sin(t*.4)*60, gy=1000+Math.cos(t*.3)*40;
 let g=ctx.createRadialGradient(gx,gy,0,gx,gy,620);g.addColorStop(0,'rgba(255,120,20,0.20)');g.addColorStop(.5,'rgba(255,100,10,0.06)');g.addColorStop(1,'rgba(0,0,0,0)');
 ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 g=ctx.createRadialGradient(540,300,0,540,300,500);g.addColorStop(0,'rgba(255,120,20,0.07)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 const r=rng(3);for(let i=0;i<60;i++){const x=(r()*W+t*(10+r()*20))%W,y=(r()*H-t*(15+r()*25)+H*50)%H;ctx.fillStyle=`rgba(255,190,140,${0.15+0.35*r()*(0.5+0.5*Math.sin(t*2+i))})`;ctx.beginPath();ctx.arc(x,y,1+r()*2,0,7);ctx.fill()}
}
function grain(f){ctx.save();ctx.fillStyle=grains[f%4];ctx.translate((f*37)%256,(f*91)%256);ctx.fillRect(-256,-256,W+512,H+512);ctx.restore();
 const v=ctx.createRadialGradient(540,960,500,540,960,1200);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,0.65)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H)}

// ---------- primitives ----------
function gs(w,col,blur){ctx.lineWidth=w;ctx.strokeStyle=col;ctx.shadowColor=col;ctx.shadowBlur=blur||0;ctx.stroke();ctx.shadowBlur=0}
function rr(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
function txt(s,x,y,font,col,align='center',glow){ctx.font=font;ctx.fillStyle=col;ctx.textAlign=align||'center';ctx.textBaseline='middle';if(glow){ctx.shadowColor=col;ctx.shadowBlur=glow}ctx.fillText(s,x,y);ctx.shadowBlur=0}
function badge(x,y,s,p,opt={}){if(p<=0)return;ctx.save();ctx.globalAlpha*=cl(p*1.5);ctx.translate(x,y);ctx.scale(p,p);const fs=opt.fs||32;ctx.font=`800 ${fs}px M`;const w=ctx.measureText(s).width+fs*1.5;rr(-w/2,-fs,w,fs*2,fs);ctx.fillStyle=opt.fill||'rgba(255,138,31,.14)';ctx.fill();gs(2.5,OR,16);txt(s,0,2,`800 ${fs}px M`,opt.col||'#ffb15c');ctx.restore()}
function monoTag(x,y,s,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.font='500 22px J';const w=ctx.measureText(s).width+30;rr(x-w/2,y-20,w,40,8);ctx.fillStyle='rgba(255,138,31,.10)';ctx.fill();ctx.strokeStyle='rgba(255,138,31,.6)';ctx.lineWidth=1.5;ctx.stroke();txt(s,x,y+1,'500 22px J','#ff9b3d');ctx.restore()}

// ---------- anxiety primitives (line art: warm-white strokes, orange glow) ----------
const LN='rgba(243,236,228,.92)',DARK='rgba(18,12,9,.96)',GOLD='#ffb15c',RED='#ff5a3c';
function heartShape(x,y,s,a,fill,beat){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);const k=s*(1+0.12*(beat||0));ctx.scale(k,k);ctx.beginPath();ctx.moveTo(0,32);ctx.bezierCurveTo(-64,-8,-34,-62,0,-30);ctx.bezierCurveTo(34,-62,64,-8,0,32);
 ctx.fillStyle=fill||'rgba(255,90,60,.35)';ctx.shadowColor=OR;ctx.shadowBlur=24;ctx.fill();ctx.shadowBlur=0;gs(4,OR,14);ctx.restore()}
const beatAt=(t,bpm)=>{const ph=(t*bpm/60)%1;return Math.max(0,1-ph*6)+0.5*Math.max(0,1-Math.abs(ph-0.22)*12)};
function ecg(x,y,w,t,speed,a,col=OR){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.beginPath();for(let i=0;i<=w;i+=3){const u=((i/w)*speed*2-t*speed)%1;const v=(u+1)%1;let h=0;if(v>0.42&&v<0.46)h=-10;else if(v>=0.46&&v<0.5)h=60;else if(v>=0.5&&v<0.54)h=-30;else if(v>0.6&&v<0.7)h=Math.sin((v-0.6)/0.1*Math.PI)*-10;i?ctx.lineTo(x+i,y-h):ctx.moveTo(x,y-h)}
 ctx.lineJoin='round';gs(4,col,14);ctx.restore()}
function butterfly(x,y,s,a,t,i=0){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);const f=0.35+0.65*Math.abs(Math.sin(t*14+i));
 for(const d of[-1,1]){ctx.save();ctx.scale(d*f,1);ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(10,-30,40,-34,34,-6);ctx.bezierCurveTo(40,10,16,24,0,6);ctx.closePath();ctx.fillStyle=i%2?'rgba(255,138,31,.55)':'rgba(255,177,92,.5)';ctx.fill();gs(2.5,GOLD,10);ctx.restore()}
 ctx.beginPath();ctx.moveTo(0,-10);ctx.lineTo(0,14);gs(3,LN);ctx.restore()}
function snow(x,y,r,a,t){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.rotate(t*0.5);for(let i=0;i<6;i++){ctx.rotate(Math.PI/3);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-r);ctx.moveTo(0,-r*0.6);ctx.lineTo(-r*0.25,-r*0.85);ctx.moveTo(0,-r*0.6);ctx.lineTo(r*0.25,-r*0.85);gs(3,'rgba(160,210,255,.95)',10)}ctx.restore()}
function hand(x,y,s,a,shake){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x+(shake||0),y);ctx.scale(s,s);ctx.beginPath();ctx.moveTo(-34,70);ctx.lineTo(-38,0);
 for(let i=0;i<4;i++){const fx=-30+i*20,h=[60,78,74,58][i];ctx.lineTo(fx,-h+10);ctx.quadraticCurveTo(fx+8,-h-4,fx+16,-h+10);ctx.lineTo(fx+16,-2)}ctx.lineTo(50,10);ctx.quadraticCurveTo(66,-14,58,-34);ctx.quadraticCurveTo(80,-26,72,6);ctx.lineTo(44,70);ctx.closePath();
 ctx.fillStyle=DARK;ctx.fill();gs(4,LN);ctx.restore()}
function stomach(x,y,s,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);ctx.beginPath();ctx.moveTo(-10,-70);ctx.quadraticCurveTo(-14,-40,-30,-30);ctx.bezierCurveTo(-80,0,-60,70,0,60);ctx.bezierCurveTo(50,52,70,10,50,-20);ctx.quadraticCurveTo(30,-40,10,-40);ctx.quadraticCurveTo(4,-54,8,-70);
 ctx.fillStyle='rgba(255,138,31,.16)';ctx.fill();gs(4,LN);ctx.beginPath();ctx.moveTo(40,52);ctx.quadraticCurveTo(50,70,70,72);gs(4,LN);ctx.restore()}
function examPaper(x,y,s,a,t){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.rotate(-0.05);ctx.scale(s,s);rr(-130,-160,260,320,14);ctx.fillStyle='rgba(243,236,228,.92)';ctx.fill();gs(3,LN);
 txt('EXAM',0,-115,'900 40px M','#1a0f06');for(let i=0;i<6;i++){rr(-100,-70+i*36,i%2?150:200,10,5);ctx.fillStyle='rgba(26,15,6,.35)';ctx.fill()}
 ctx.beginPath();ctx.arc(80,110,26,0,7);gs(4,OR);txt('?',80,112,'900 30px M',OR);ctx.restore()}
function lion(x,y,s,a,t){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);
 ctx.beginPath();for(let i=0;i<=28;i++){const an=i/28*Math.PI*2;const R=i%2?118:148+6*Math.sin(t*3+i);ctx.lineTo(Math.cos(an)*R,Math.sin(an)*R+10)}ctx.closePath();ctx.fillStyle='rgba(255,138,31,.28)';ctx.fill();gs(4,OR,16);
 ctx.beginPath();ctx.ellipse(0,10,88,96,0,0,7);ctx.fillStyle=DARK;ctx.fill();gs(4,LN);
 for(const d of[-1,1]){ctx.beginPath();ctx.arc(d*70,-70,22,0,7);ctx.fillStyle=DARK;ctx.fill();gs(4,LN);
  ctx.beginPath();ctx.moveTo(d*22,-24);ctx.lineTo(d*50,-34);ctx.lineTo(d*44,-14);ctx.closePath();ctx.fillStyle=GOLD;ctx.shadowColor=OR;ctx.shadowBlur=16;ctx.fill();ctx.shadowBlur=0}
 ctx.beginPath();ctx.moveTo(-18,20);ctx.lineTo(18,20);ctx.lineTo(0,40);ctx.closePath();ctx.fillStyle=LN;ctx.fill();
 const ro=0.5+0.5*Math.sin(t*4);ctx.beginPath();ctx.moveTo(-34,60);ctx.quadraticCurveTo(0,60+30*ro,34,60);gs(4,LN);
 for(const d of[-1,1])for(let k=0;k<3;k++){ctx.beginPath();ctx.moveTo(d*26,40+k*8);ctx.lineTo(d*70,32+k*12);gs(2,'rgba(243,236,228,.5)')}ctx.restore()}
function caveman(x,y,s,a,scared){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);ctx.lineCap='round';
 ctx.beginPath();ctx.arc(0,-62,13,0,7);gs(4,LN);ctx.beginPath();ctx.moveTo(0,-49);ctx.lineTo(0,-14);ctx.moveTo(0,-38);ctx.lineTo(-18,-24);ctx.moveTo(0,-38);ctx.lineTo(20,-50);ctx.moveTo(0,-14);ctx.lineTo(-14,10);ctx.moveTo(0,-14);ctx.lineTo(16,10);gs(4,LN);
 ctx.beginPath();ctx.moveTo(14,-80);ctx.lineTo(36,-20);gs(3,'rgba(214,160,90,.95)');ctx.beginPath();ctx.moveTo(10,-92);ctx.lineTo(18,-78);ctx.lineTo(8,-76);ctx.closePath();ctx.fillStyle=LN;ctx.fill();
 if(scared){ctx.beginPath();ctx.moveTo(-16,-84);ctx.lineTo(-24,-96);ctx.moveTo(0,-90);ctx.lineTo(0,-104);ctx.moveTo(16,-84);ctx.lineTo(24,-96);gs(3,OR,10)}ctx.restore()}
function tree(x,y,s,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(-8,-120);ctx.lineTo(8,-120);ctx.lineTo(10,0);gs(4,LN);
 for(const[cx,cy,r]of[[-40,-140,50],[30,-160,56],[0,-210,52]]){ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.fillStyle='rgba(255,138,31,.10)';ctx.fill();gs(3,'rgba(243,236,228,.7)')}ctx.restore()}
function lungs(x,y,s,a,br){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);const k=s*(1+0.1*br);ctx.scale(k,k);ctx.beginPath();ctx.moveTo(0,-70);ctx.lineTo(0,-20);ctx.moveTo(0,-20);ctx.lineTo(-20,-6);ctx.moveTo(0,-20);ctx.lineTo(20,-6);gs(4,LN);
 for(const d of[-1,1]){ctx.beginPath();ctx.moveTo(d*14,-30);ctx.bezierCurveTo(d*70,-60,d*80,30,d*60,60);ctx.quadraticCurveTo(d*30,70,d*14,50);ctx.closePath();ctx.fillStyle='rgba(255,138,31,.2)';ctx.fill();gs(4,OR,12)}ctx.restore()}
function arm(x,y,s,a,flex){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);ctx.beginPath();ctx.moveTo(-70,60);ctx.quadraticCurveTo(-60,-10,-20,-30);ctx.quadraticCurveTo(10,-70-20*flex,30,-40);ctx.lineTo(40,-90);ctx.quadraticCurveTo(60,-110,74,-86);ctx.lineTo(60,-30);
 ctx.quadraticCurveTo(40,20,-10,30);ctx.lineTo(-20,60);ctx.closePath();ctx.fillStyle='rgba(255,138,31,.2)';ctx.fill();gs(4,LN,6);ctx.beginPath();ctx.moveTo(-28,-28);ctx.quadraticCurveTo(0,-56-16*flex,22,-36);gs(3,OR,12);ctx.restore()}
function fist(x,y,s,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);rr(-44,-40,88,80,22);ctx.fillStyle=DARK;ctx.fill();gs(4,LN);for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-44+22*(i+1),-40);ctx.lineTo(-44+22*(i+1),-6);gs(3,'rgba(243,236,228,.6)')}
 ctx.beginPath();ctx.moveTo(-44,6);ctx.quadraticCurveTo(-10,-2,8,14);gs(4,LN);rr(-34,40,68,40,6);gs(4,LN);ctx.restore()}
function runner(x,y,s,a,t){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);ctx.lineCap='round';const p=Math.sin(t*12);ctx.beginPath();ctx.arc(10,-66,12,0,7);gs(4,LN);
 ctx.beginPath();ctx.moveTo(6,-54);ctx.lineTo(-4,-18);ctx.moveTo(4,-44);ctx.lineTo(-18+14*p,-34);ctx.moveTo(4,-44);ctx.lineTo(26-14*p,-30);ctx.moveTo(-4,-18);ctx.lineTo(-22+18*p,8);ctx.moveTo(-4,-18);ctx.lineTo(16-18*p,6);gs(4,LN);
 for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-40-i*14,-50+i*16);ctx.lineTo(-60-i*14,-50+i*16);gs(3,OR,8)}ctx.restore()}
function bodyOutline(x,y,s,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);ctx.beginPath();ctx.arc(0,-250,46,0,7);gs(4,LN);
 ctx.beginPath();ctx.moveTo(-20,-205);ctx.lineTo(-24,-190);ctx.quadraticCurveTo(-90,-185,-100,-140);ctx.lineTo(-130,20);ctx.lineTo(-108,26);ctx.lineTo(-76,-110);ctx.lineTo(-70,40);ctx.lineTo(-60,240);ctx.lineTo(-20,240);ctx.lineTo(0,60);
 ctx.lineTo(20,240);ctx.lineTo(60,240);ctx.lineTo(70,40);ctx.lineTo(76,-110);ctx.lineTo(108,26);ctx.lineTo(130,20);ctx.lineTo(100,-140);ctx.quadraticCurveTo(90,-185,24,-190);ctx.lineTo(20,-205);ctx.fillStyle='rgba(18,12,9,.85)';ctx.fill();gs(4,LN);ctx.restore()}
function bell(x,y,s,a,t,ring){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.rotate(ring*0.35*Math.sin(t*28));ctx.scale(s,s);ctx.beginPath();ctx.moveTo(-70,50);ctx.quadraticCurveTo(-60,40,-56,-10);ctx.bezierCurveTo(-52,-80,52,-80,56,-10);ctx.quadraticCurveTo(60,40,70,50);ctx.closePath();
 ctx.fillStyle='rgba(255,138,31,.3)';ctx.fill();gs(4,OR,18);ctx.beginPath();ctx.arc(0,62,12,0,7);ctx.fillStyle=GOLD;ctx.fill();ctx.beginPath();ctx.arc(0,-72,8,0,7);gs(4,LN);ctx.restore();
 if(ring>0)for(let i=0;i<3;i++){const ph=(t*1.6+i/3)%1;ctx.save();ctx.globalAlpha*=a*ring*(1-ph);for(const d of[-1,1]){ctx.beginPath();ctx.arc(x,y,90*s+ph*90,d>0?-0.6:Math.PI-0.6,d>0?0.6:Math.PI+0.6);gs(4,OR,12)}ctx.restore()}}
function shield(x,y,s,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);ctx.beginPath();ctx.moveTo(0,-110);ctx.quadraticCurveTo(60,-80,100,-84);ctx.quadraticCurveTo(110,40,0,120);ctx.quadraticCurveTo(-110,40,-100,-84);ctx.quadraticCurveTo(-60,-80,0,-110);
 ctx.fillStyle='rgba(255,138,31,.15)';ctx.fill();gs(5,OR,22);ctx.restore()}
function speech(x,y,s,a,flip,t){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s*(flip?-1:1),s);rr(-80,-50,160,90,30);ctx.fillStyle='rgba(255,138,31,.14)';ctx.fill();gs(3,OR,12);ctx.beginPath();ctx.moveTo(-40,40);ctx.lineTo(-60,70);ctx.lineTo(-10,40);gs(3,OR);
 ctx.scale(flip?-1:1,1);for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(-30+i*30,-5+Math.sin(t*6+i)*4,8,0,7);ctx.fillStyle=GOLD;ctx.fill()}ctx.restore()}
function notif(x,y,s,a,label,icon){if(a<=0)return;ctx.save();ctx.globalAlpha*=cl(a*1.4);ctx.translate(x,y);ctx.scale(s*a,s*a);rr(-150,-46,300,92,26);ctx.fillStyle='rgba(22,15,11,.95)';ctx.fill();gs(3,OR,16);
 ctx.beginPath();ctx.arc(-104,0,26,0,7);ctx.fillStyle='rgba(255,138,31,.25)';ctx.fill();gs(2.5,OR);txt(icon,-104,2,'900 26px M',GOLD);txt(label,-64,2,'900 30px M',WH,'left');
 ctx.beginPath();ctx.arc(138,-40,14,0,7);ctx.fillStyle=RED;ctx.fill();txt('!',138,-39,'900 18px M','#fff');ctx.restore()}

// ---------- DS primitives (line art, warm-white strokes, orange glow) ----------
function keyIcon(x,y,s,a,rot=0,glow=0){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.rotate(rot);ctx.scale(s,s);ctx.beginPath();ctx.arc(-26,0,18,0,7);ctx.moveTo(-8,0);ctx.lineTo(40,0);ctx.moveTo(26,0);ctx.lineTo(26,12);ctx.moveTo(36,0);ctx.lineTo(36,10);ctx.lineCap='round';gs(6,GOLD,8+20*glow);ctx.restore()}
function clutter(t,a,seed=5){if(a<=0)return;const r=rng(seed);ctx.save();ctx.globalAlpha*=a;
 for(let i=0;i<26;i++){const x=110+r()*860,y=640+r()*560,k=Math.floor(r()*5),rot=(r()-0.5)*1.4,s=0.7+r()*0.6;ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(s,s);
  if(k===0){rr(-40,-26,80,52,6);ctx.fillStyle='rgba(30,22,16,.95)';ctx.fill();gs(3,'rgba(243,236,228,.6)')}
  else if(k===1){rr(-34,-8,68,16,4);ctx.fillStyle='rgba(255,138,31,.35)';ctx.fill();gs(2.5,'rgba(243,236,228,.6)')}
  else if(k===2){ctx.beginPath();ctx.moveTo(-30,10);ctx.quadraticCurveTo(0,-30,30,10);gs(5,'rgba(160,190,230,.6)')}
  else if(k===3){ctx.beginPath();ctx.arc(0,0,18,0,7);gs(3,'rgba(243,236,228,.5)')}
  else{rr(-22,-30,44,60,4);gs(3,'rgba(214,160,90,.6)')}ctx.restore()}ctx.restore()}
function keyHolder(x,y,s,a,hasKey,t){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);rr(-120,-40,240,80,14);ctx.fillStyle='rgba(60,32,16,.92)';ctx.fill();gs(4,LN);txt('KEYS',0,-12,'800 22px M',GOLD);
 for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(-75+i*50,18,6,0,7);ctx.fillStyle=LN;ctx.fill()}ctx.restore();if(hasKey)keyIcon(x-75*s+4,y+70*s,1.0*s,a,Math.PI/2+Math.sin(t*2)*0.08,1)}
function shelf(x,y,s,a,t){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);for(let r=0;r<3;r++){ctx.beginPath();ctx.moveTo(-200,-80+r*90);ctx.lineTo(200,-80+r*90);gs(4,LN);
 for(let i=0;i<5;i++){rr(-180+i*76,-80+r*90-60,56,56,6);ctx.fillStyle=(r+i)%2?'rgba(255,138,31,.35)':'rgba(243,236,228,.15)';ctx.fill();gs(2.5,'rgba(243,236,228,.6)');txt(String.fromCharCode(65+r*5+i),-152+i*76,-80+r*90-32,'800 22px M',WH)}}ctx.restore()}
function avatar(x,y,r,a,i){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fillStyle=['rgba(255,138,31,.35)','rgba(243,236,228,.18)','rgba(255,177,92,.3)'][i%3];ctx.fill();gs(2,'rgba(243,236,228,.6)');ctx.beginPath();ctx.arc(x,y-r*0.2,r*0.35,0,7);ctx.arc(x,y+r*0.75,r*0.55,Math.PI*1.15,Math.PI*1.85);gs(2,LN);ctx.restore()}
function trainMini(x,y,s,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);for(let i=0;i<3;i++){rr(-90+i*62,-22,56,40,6);ctx.fillStyle=DARK;ctx.fill();gs(3,LN);txt(String(i),-62+i*62,-2,'800 18px M',GOLD)}for(let i=0;i<6;i++){ctx.beginPath();ctx.arc(-80+i*31,24,6,0,7);gs(2.5,OR)}ctx.restore()}
function chest(x,y,s,a,open=0){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);if(open>0){const g=ctx.createRadialGradient(0,-20,0,0,-20,120);g.addColorStop(0,`rgba(255,200,80,${0.6*open})`);g.addColorStop(1,'rgba(255,140,20,0)');ctx.fillStyle=g;ctx.fillRect(-130,-150,260,200)}
 rr(-60,-10,120,60,8);ctx.fillStyle='rgba(120,60,20,.95)';ctx.fill();gs(3.5,GOLD);ctx.save();ctx.translate(-60,-10);ctx.rotate(-1.1*open);rr(0,-36,120,36,14);ctx.fillStyle='rgba(140,70,24,.95)';ctx.fill();gs(3.5,GOLD);ctx.restore();rr(-10,0,20,20,3);ctx.fillStyle=GOLD;ctx.fill();ctx.restore()}
function note(x,y,s,a,label,rot=0){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.rotate(rot);ctx.scale(s,s);rr(-60,-42,120,84,6);ctx.fillStyle='rgba(243,236,228,.92)';ctx.fill();gs(2,LN);txt(label,0,-12,'900 22px M','#1a0f06');txt('→ next',0,16,'800 16px J',OR);ctx.restore()}
function plates2D(x,y,s,a,n){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);for(let i=0;i<n;i++){ctx.beginPath();ctx.ellipse(0,-i*16,60,14,0,0,7);ctx.fillStyle='rgba(243,236,228,.9)';ctx.fill();gs(2.5,OR,6)}ctx.restore()}
function cup(x,y,s,a,t,steamOn=true){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);ctx.beginPath();ctx.moveTo(-30,-30);ctx.lineTo(30,-30);ctx.lineTo(22,30);ctx.quadraticCurveTo(0,36,-22,30);ctx.closePath();ctx.fillStyle='rgba(120,56,24,.95)';ctx.fill();gs(3.5,LN);ctx.beginPath();ctx.ellipse(0,-30,30,7,0,0,7);ctx.fillStyle='#b5561c';ctx.fill();gs(2.5,LN);
 if(steamOn)for(let i=0;i<2;i++){ctx.beginPath();for(let k=0;k<=12;k++){const u=k/12;const xx=-8+i*16+Math.sin(u*6+t*3+i)*5,yy=-40-u*50;k?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy)}gs(3,'rgba(255,190,140,.6)',8)}ctx.restore()}
function treeNodes(cx,cy,s,a,p,labels){if(a<=0)return;const N=[[0,-150],[-170,0],[170,0],[-250,150],[-90,150],[90,150],[250,150]];const E=[[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]];
 ctx.save();ctx.globalAlpha*=a;E.forEach(([i,j],k)=>{const q=cl(p*7-k-0.5);if(q<=0)return;ctx.beginPath();ctx.moveTo(cx+N[i][0]*s,cy+N[i][1]*s);ctx.lineTo(cx+lerp(N[i][0],N[j][0],q)*s,cy+lerp(N[i][1],N[j][1],q)*s);gs(3.5,'rgba(255,138,31,.75)',8)});
 N.forEach(([x,y],i)=>{const q=back(cl(p*7-i));if(q<=0)return;ctx.save();ctx.translate(cx+x*s,cy+y*s);ctx.scale(q,q);ctx.beginPath();ctx.arc(0,0,44*s,0,7);ctx.fillStyle='rgba(22,15,11,.95)';ctx.fill();gs(3.5,i===0?OR:LN,i===0?16:4);txt(labels[i]||'',0,2,`800 ${Math.round(18*s)}px M`,i===0?GOLD:WH);ctx.restore()});ctx.restore()}
function metroMini(x,y,s,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);const P=[[-50,-30],[0,-40],[50,-20],[-30,20],[30,30]];[[0,1],[1,2],[0,3],[1,4],[3,4],[2,4]].forEach(([i,j],k)=>{ctx.beginPath();ctx.moveTo(...P[i]);ctx.lineTo(...P[j]);gs(4,k%2?OR:'rgba(124,196,255,.9)')});P.forEach(p=>{ctx.beginPath();ctx.arc(p[0],p[1],7,0,7);ctx.fillStyle=WH;ctx.fill()});ctx.restore()}
function locker(x,y,w,h,a,label,open=0,glow=0){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;rr(x-w/2,y-h/2,w,h,6);ctx.fillStyle='rgba(30,22,16,.95)';ctx.fill();gs(2.5,glow?OR:'rgba(243,236,228,.55)',glow*24);
 if(open>0){ctx.save();ctx.translate(x-w/2,y);ctx.scale(1-0.85*open,1);rr(0,-h/2,w,h,6);ctx.fillStyle='rgba(60,40,26,.98)';ctx.fill();gs(2.5,LN);ctx.restore()}
 txt(label,x,y-h*0.25,'800 18px J',glow?GOLD:'rgba(243,236,228,.75)');ctx.beginPath();ctx.arc(x+w*0.3,y+4,4,0,7);ctx.fillStyle=GOLD;ctx.fill();ctx.restore()}
function editor(x,y,s,a,lines,t){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);rr(-220,-150,440,300,16);ctx.fillStyle='rgba(22,15,11,.95)';ctx.fill();gs(3,LN);rr(-220,-150,440,40,16);ctx.fillStyle='rgba(255,138,31,.25)';ctx.fill();
 for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(-196+i*22,-130,6,0,7);ctx.fillStyle=['#ff5a3c','#ffb15c','#7cc46b'][i];ctx.fill()}
 lines.forEach((l,i)=>txt(l,-190,-80+i*44,'800 28px M',WH,'left'));if(Math.sin(t*8)>0){ctx.font='800 28px M';const w=ctx.measureText(lines[lines.length-1]||'').width;ctx.fillStyle=OR;ctx.fillRect(-188+w,-96+(lines.length-1)*44,4,32)}ctx.restore()}
function stackBox(x,y,w,a,items,top){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.beginPath();ctx.moveTo(x-w/2,y-320);ctx.lineTo(x-w/2,y);ctx.lineTo(x+w/2,y);ctx.lineTo(x+w/2,y-320);gs(4,LN);
 items.forEach((l,i)=>{rr(x-w/2+10,y-10-(i+1)*58,w-20,50,10);ctx.fillStyle=i===items.length-1?'rgba(255,138,31,.5)':'rgba(243,236,228,.15)';ctx.fill();gs(2,'rgba(243,236,228,.6)');txt(l,x,y-10-(i+1)*58+25,'800 24px M',WH)});ctx.restore()}
function chaiStall(x,y,s,a,t){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(-100+i*40,-150);ctx.lineTo(-60+i*40,-150);ctx.lineTo(-60+i*40,-122);ctx.quadraticCurveTo(-80+i*40,-110,-100+i*40,-122);ctx.closePath();ctx.fillStyle=i%2?'rgba(255,138,31,.8)':'rgba(243,236,228,.85)';ctx.fill()}
 ctx.beginPath();ctx.moveTo(-96,-122);ctx.lineTo(-96,60);ctx.moveTo(96,-122);ctx.lineTo(96,60);gs(4,LN);rr(-110,0,220,40,6);ctx.fillStyle=DARK;ctx.fill();gs(4,LN);txt('CHAI',0,-60,'900 34px M',OR,'center',12);ctx.restore();cup(x,y-20*s,0.6*s,a,t)}
function growth(x,y,w,h,p,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.beginPath();ctx.moveTo(x,y-h);ctx.lineTo(x,y);ctx.lineTo(x+w,y);gs(3,LN);for(let i=0;i<10;i++){const v=Math.pow(1.45,i)/Math.pow(1.45,9);const q=cl(p*10-i);rr(x+12+i*(w/10),y-h*v*q,w/10-14,h*v*q,4);ctx.fillStyle=i>6?'rgba(255,90,60,.8)':'rgba(255,138,31,.7)';ctx.fill()}ctx.restore()}
function recapCard(x,y,p,ds,ico,t){if(p<=0)return;ctx.save();ctx.globalAlpha*=cl(p*1.4);ctx.translate(x,y);ctx.scale(p,p);rr(-150,-85,300,170,22);ctx.fillStyle='rgba(22,15,11,.94)';ctx.fill();gs(2.5,'rgba(255,138,31,.75)',14);ctx.translate(0,-22);ico(t);ctx.translate(0,22);txt(ds,0,58,'900 30px M',OR,'center',10);ctx.restore()}
const ICO={train:t=>trainMini(0,0,0.95,1),hunt:t=>{note(-50,0,0.45,1,'1',-0.1);note(30,0,0.45,1,'2',0.1);chest(90,10,0.35,1,0.5)},plates:t=>plates2D(0,24,0.9,1,4),chai:t=>{for(let i=0;i<3;i++)stickman(-60+i*40,30,0.7,1);cup(70,0,0.6,1,t)},
 tree:t=>treeNodes(0,0,0.26,1,1,[]),metro:t=>metroMini(0,0,1.0,1),locker:t=>{for(let i=0;i<4;i++)locker(-66+i*44,0,38,60,1,'',i===2?0.7:0,i===2?1:0)}};

const SC=[
 {pill:'THE WHY SPACES · DS SERIES · EP 08',title:'Lagbhag <em>Turant</em> Search',sub:'Kaise?',tag:'THE · WHY'},
 {pill:'EP 08',title:'<em>Hash Table</em>',sub:'Aaj poora samjhenge',tag:'DEEP · DIVE'},
 {pill:'01 · ANALOGY',title:'Gym <em>Locker</em> Room',sub:'Har member ka locker tay',tag:'LOCKERS'},
 {pill:'01 · ANALOGY',title:'Naam Bolo, <em>Seedhe</em> Jao',sub:'Koi dhoondhna nahi',tag:'DIRECT'},
 {pill:'02 · TERMS',title:'Key + <em>Value</em>',sub:'Naam = key · saamaan = value',tag:'KEY → VALUE'},
 {pill:'03 · JAADU',title:'Hash <em>Function</em>',sub:'Key → locker number',tag:'HASH(KEY)'},
 {pill:'03 · JAADU',title:'Riya → <em>Locker 3</em>',sub:'53 % 10 = 3',tag:'SUM % 10'},
 {pill:'04 · SPEED',title:'Teeno <em>O(1)</em>',sub:'Average case',tag:'AUSATAN'},
 {pill:'05 · DIKKAT',title:'<em>Collision</em>',sub:'Kiran bhi 53 → locker 3',tag:'SAME · LOCKER'},
 {pill:'06 · HAL 1',title:'<em>Chaining</em>',sub:'Locker mein linked list',tag:'CHAIN'},
 {pill:'07 · HAL 2',title:'Open <em>Addressing</em>',sub:'Agla khaali locker',tag:'PROBE'},
 {pill:'08 · RESIZE',title:'Dugna <em>Locker Room</em>',sub:'Sab nayi jagah',tag:'REHASH'},
 {pill:'09 · REAL LIFE',title:'Contact <em>Search</em>',sub:'Itna tez kyun?',tag:'PHONE'},
 {pill:'10 · REAL LIFE',title:'Username <em>Taken?</em>',sub:'Ek pal mein jawab',tag:'INSTAGRAM'},
 {pill:'11 · CODE',title:'Dictionary + <em>Object</em>',sub:'Python · JavaScript',tag:'HASH · MAPS'},
 {pill:'RECAP',title:'Key → <em>Seedha</em> Locker',sub:'Sab average O(1)',tag:'YAAD · RAKHO'},
 {pill:'SERIES COMPLETE',title:'7 Data <em>Structures</em>',sub:'Array se Hash Table tak',tag:'DS · SERIES'},
 {pill:'AAPKI BAARI',title:'Agli <em>Series</em>?',sub:'Comments mein batao',tag:'COMMENT · KARO'},
];
const HL=['graph','turant','hash','table','gym','locker','naam','seedhe','key','value','jaadu','function','number','riya','53','3','das','bacha','ausatan','big','o','1','dikkat','kiran','collision','chaining','linked','list','khaali','open','addressing','dugna','contact','tez','instagram','username','python','dictionary','javascript','object','seedha','saaton','array','stack','queue','tree','series','comments'];

// ---------- Ep 8 primitives ----------
function lockerRow(x0,y,n,a,opt={}){for(let i=0;i<n;i++){const hot=opt.hot===i;locker(x0+i*(opt.gap||90),y,opt.w||76,opt.h||130,a,String(i),hot?(opt.open||0):0,hot?1:0)}}
function hashBox(x,y,a,t,spin){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);rr(-150,-90,300,180,24);const g=ctx.createLinearGradient(0,-90,0,90);g.addColorStop(0,'rgba(40,24,14,.98)');g.addColorStop(1,'rgba(22,15,11,.98)');ctx.fillStyle=g;ctx.fill();gs(3,OR,22);
 gear(-95,12,32,t*2*spin,12);gear(-52,-28,20,-t*3*spin,10);txt('HASH()',55,0,'900 34px J',GOLD,'center',12);ctx.restore()}

// ---------- scenes ----------
function S0(t,lt){badge(300,1255,'GRAPH ✓',pop(t,'graph',0.45,0),{fs:28});badge(780,1255,'LAGBHAG TURANT',pop(t,'turant',0.45,0),{fs:28})}
function S1(t,lt){ // title
 const p=pop(t,'hash',0.5,-0.4);if(p>0){ctx.save();ctx.translate(540,770);ctx.scale(p,p);txt('HASH TABLE',0,0,'900 130px M',OR,'center',44);ctx.restore()}
 lockerRow(180,1060,5,eo(seg(lt,0,0.5)),{gap:180,w:130,h:170,hot:3,open:eo(seg(lt,0.6,1.2))});
 monoTag(540,650,'THE WHY SPACES · DS SERIES · EP 08',fin(t,'hash',0.4,-0.6));
}
function S2(t,lt){badge(540,1255,'HAR MEMBER KA LOCKER TAY',pop(t,'tay',0.45,0),{fs:26})}
function S3(t,lt){badge(540,1255,'NAAM → SEEDHA LOCKER',pop(t,'seedhe',0.45,0),{fs:28})}
function S4(t,lt){badge(540,1255,'KEY → VALUE',pop(t,'value',0.45,0),{fs:30})}
function S5(t,lt){ // the hash function machine
 const a=eo(seg(lt,0,0.5));const run=seg(t,E('hashfn')-0.2,E('number')+0.8);hashBox(540,920,a,t,run>0&&run<1?1:0.15);
 const kin=eo(seg(run,0,0.35)),out=eo(seg(run,0.55,1));
 if(a>0){ctx.save();ctx.globalAlpha*=a*kin;rr(lerp(40,250,kin)-80,890,160,60,14);ctx.fillStyle='rgba(124,196,255,.25)';ctx.fill();gs(2.5,'#7cc4ff',12);txt('"Riya"',lerp(40,250,kin),921,'800 30px J',WH);ctx.restore();
  ctx.save();ctx.globalAlpha*=a*out;rr(lerp(690,830,out)-70,890,140,60,14);ctx.fillStyle='rgba(255,138,31,.3)';ctx.fill();gs(2.5,OR,14);txt('3',lerp(690,830,out),921,'900 40px J',WH);ctx.restore()}
 monoTag(540,700,'KEY → HASH() → LOCKER NUMBER',fin(t,'jaadu',0.4,0));badge(540,1255,'HASH FUNCTION',pop(t,'hashfn',0.45,0),{fs:30});
}
function S6(t,lt){ // Riya -> 53 -> 53 % 10 = 3
 const a=eo(seg(lt,0,0.5));const L=[['R',18],['I',9],['Y',25],['A',1]];const p=seg(t,E('riya')-0.2,E('jodo')+0.6);
 L.forEach(([c,n],i)=>{const q=back(cl(p*4-i));if(q<=0)return;const x=270+i*180;ctx.save();ctx.globalAlpha*=a*cl(q);rr(x-64,700,128,128,18);ctx.fillStyle='rgba(22,15,11,.96)';ctx.fill();gs(2.5,'rgba(243,236,228,.6)');txt(c,x,750,'900 52px M',WH);txt(String(n),x,805,'800 26px J',GOLD);if(i<3)txt('+',x+90,764,'900 40px M',OR);ctx.restore()});
 const s=pop(t,'n53',0.45,-0.1);if(s>0){ctx.save();ctx.globalAlpha*=cl(s);txt('= 53',540,900,'900 70px M',OR,'center',22);ctx.restore()}
 const m=pop(t,'bacha',0.45,-0.4);if(m>0){ctx.save();ctx.globalAlpha*=cl(m);txt('53 % 10 = 3',540,990,'900 54px J',WH);ctx.restore()}
 lockerRow(135,1150,10,a*0.9,{gap:90,w:74,h:110,hot:3,open:fin(t,'locker3',0.5,-0.1)});
 badge(540,1255,'RIYA → LOCKER 3',pop(t,'locker3',0.45,0),{fs:30});
}
function S7(t,lt){ // O(1) average
 const ops=[['DHOONDHO','GET'],['JODO','PUT'],['HATAO','DELETE']];const a=eo(seg(lt,0,0.5));
 ops.forEach(([h,e],i)=>{const p=pop(t,'ausatan',0.45,-1.0+i*0.25);const x=200+i*340;card(x,900,300,320,p,'',null,t);if(p>0){ctx.save();ctx.globalAlpha*=cl(p);txt(h,x,820,'900 34px M',WH);txt(e,x,870,'500 22px J','rgba(243,236,228,.6)');txt('O(1)',x,960,'900 64px M',OR,'center',20);ctx.restore()}});
 monoTag(540,690,'AUSATAN · AVERAGE CASE',fin(t,'ausatan',0.4,0));badge(540,1255,'TEENO ≈ 1 STEP',pop(t,'bigo',0.45,0),{fs:30});
}
function S8(t,lt){badge(540,1255,'COLLISION: DONO → LOCKER 3',pop(t,'collision',0.45,0),{fs:26})}
function S9(t,lt){badge(540,1255,'CHAINING',pop(t,'chaining',0.45,0),{fs:32})}
function S10(t,lt){badge(540,1255,'OPEN ADDRESSING',pop(t,'open',0.45,0),{fs:30})}
function S11(t,lt){badge(540,1255,'DUGNA LOCKER ROOM · REHASH',pop(t,'dugna',0.45,0.3),{fs:26})}
function S12(t,lt){ // contacts
 const a=eo(seg(lt,0,0.5));const q='Riya';const n=Math.min(4,Math.floor(seg(t,E('contact')-0.4,E('contact')+0.8)*4+0.001)+(t>E('contact')-0.4?1:0));
 phone(540,930,330,560,a,()=>{rr(-130,-230,260,50,25);ctx.fillStyle='rgba(243,236,228,.1)';ctx.fill();txt('🔍 '+q.slice(0,n),-110,-204,'800 24px M',WH,'left');
  const found=n>=4;['Aman','Kabir','Neha','Riya','Zoya'].forEach((c,i)=>{const hot=found&&c==='Riya';rr(-130,-160+i*70,260,58,12);ctx.fillStyle=hot?'rgba(255,138,31,.45)':'rgba(243,236,228,.06)';ctx.fill();if(hot)gs(2,OR,14);txt(c,-100,-130+i*70,'800 24px M',WH,'left')});
  if(found)txt('0.001 sec',0,220,'800 22px J',GOLD)});
 badge(540,1255,'CONTACT SEARCH = HASH TABLE',pop(t,'tez',0.45,0),{fs:24});
}
function S13(t,lt){ // username taken?
 const a=eo(seg(lt,0,0.5));const u1=fin(t,'username',0.4,-0.2),u2=fin(t,'username',0.4,1.4);
 card(540,900,760,420,a,'',null,t);if(a>0){ctx.save();ctx.globalAlpha*=a;txt('NAYA USERNAME',540,750,'500 24px J',GOLD);
  rr(240,800,600,80,40);ctx.fillStyle='rgba(243,236,228,.08)';ctx.fill();gs(2,'rgba(243,236,228,.5)');txt(u2>0?'@thewhyspaces_2':'@thewhyspaces',270,842,'800 32px M',WH,'left');ctx.restore();
  if(u1>0&&u2<=0){ctx.save();ctx.globalAlpha*=u1;txt('✕ PEHLE SE LIYA GAYA',540,960,'900 34px M','#ff5a3c');ctx.restore()}
  if(u2>0){ctx.save();ctx.globalAlpha*=u2;txt('✓ AVAILABLE',540,960,'900 34px M','#7cc46b');ctx.restore()}}
 badge(540,1255,'EK PAL MEIN JAWAB',pop(t,'username',0.45,0.4),{fs:28});
}
function S14(t,lt){ // Python dict / JS object
 const a=eo(seg(lt,0,0.5));const py=fin(t,'python',0.5,-0.3),js=fin(t,'js',0.5,-0.3);
 editor(540,800,0.9,a*py,['# Python','lockers = {"Riya": 3}','lockers["Riya"]  # 3'],t);
 editor(540,1075,0.72,a*js,['// JavaScript','const lockers = { Riya: 3 }'],t);
 badge(540,1255,'ANDAR SE HASH TABLE',pop(t,'js',0.45,0.6),{fs:28});
}
function S15(t,lt){ // recap
 const rows=[['GET (dhoondho)','O(1)*','TEZ',1,'yaad',0.3],['PUT (jodo)','O(1)*','TEZ',1,'yaad',0.9],['DELETE (hatao)','O(1)*','TEZ',1,'big2',-0.6],['COLLISION','CHAIN · PROBE','',1,'big2',0.2]];
 monoTag(540,640,'* AUSATAN · AVERAGE CASE',fin(t,'yaad',0.4,0));
 rows.forEach(([n,o,s,good,e,off],i)=>{const p=pop(t,e,0.45,off);const y=760+i*125;card(540,y,860,105,p,'',null,t);if(p>0){ctx.save();ctx.globalAlpha*=cl(p);txt(n,150,y+2,'800 30px M',WH,'left');txt(o,650,y+2,`900 ${o.length>5?28:40}px M`,OR,'center',16);txt(s,880,y+2,'800 28px M',GOLD,'center');ctx.restore()}});
}
function S16(t,lt){ // series wrap-up: all 7
 const D7=[['ARRAY','train'],['LINKED LIST','hunt'],['STACK','plates'],['QUEUE','chai'],['TREE','tree'],['GRAPH','metro'],['HASH TABLE','locker']];const t0=E('arr')-0.2,t1=E('ht2')+0.3;
 D7.forEach(([n,ic],i)=>{const p=back(seg(t,t0+(t1-t0)*i/6-0.1,t0+(t1-t0)*i/6+0.35));const x=i<4?195+i*230:310+(i-4)*230,y=i<4?820:1050;if(p<=0)return;ctx.save();ctx.translate(x,y);ctx.scale(0.72,0.72);recapCard(0,0,p,n,ICO[ic],t);ctx.restore()});
 monoTag(540,670,'THE WHY SPACES · DS SERIES · COMPLETE',fin(t,'saaton',0.4,-0.2));badge(540,1255,'7 / 7 POORE ✓',pop(t,'ht2',0.45,0.6),{fs:30});
}
function S17(t,lt){ // comments
 const a=eo(seg(lt,0,0.5));lockerRow(225,1080,5,a,{gap:160,w:120,h:160,hot:Math.floor(t*1.5)%5,open:0.6});
 speech(540,760,1.2,pop(t,'comments',0.45,-0.8),false,t);badge(540,1255,'COMMENTS MEIN BATAO',pop(t,'comments',0.45,0),{fs:30});
}
const SCN=[S0,S1,S2,S3,S4,S5,S6,S7,S8,S9,S10,S11,S12,S13,S14,S15,S16,S17];
// ---------- extra primitives ----------
function gear(x,y,r,rot,teeth=16,fill='#2a201a'){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.beginPath();for(let i=0;i<teeth*2;i++){const a=i/(teeth*2)*Math.PI*2;const R=i%2?r*0.8:r;ctx.lineTo(Math.cos(a)*R,Math.sin(a)*R)}ctx.closePath();ctx.fillStyle=fill;ctx.fill();gs(3,'rgba(243,236,228,.85)');ctx.beginPath();ctx.arc(0,0,r*0.3,0,7);gs(3,OR,8);ctx.restore()}
function star(x,y,r,a){ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.beginPath();for(let i=0;i<8;i++){const rr2=i%2?r*.28:r;const an=i/8*Math.PI*2;ctx.lineTo(Math.cos(an)*rr2,Math.sin(an)*rr2)}ctx.closePath();ctx.fillStyle='#ffb15c';ctx.shadowColor=OR;ctx.shadowBlur=20;ctx.fill();ctx.restore()}
function check(x,y,s,p,col=OR){if(p<=0)return;ctx.save();ctx.translate(x,y);ctx.beginPath();const L1=[-0.5*s,0,-0.15*s,0.35*s],L2=[-0.15*s,0.35*s,0.55*s,-0.4*s];const q1=cl(p*2),q2=cl(p*2-1);ctx.moveTo(L1[0],L1[1]);ctx.lineTo(lerp(L1[0],L1[2],q1),lerp(L1[1],L1[3],q1));if(q2>0)ctx.lineTo(lerp(L2[0],L2[2],q2),lerp(L2[1],L2[3],q2));ctx.lineCap='round';ctx.lineJoin='round';gs(s*0.14,col,20);ctx.restore()}
function cross(x,y,s,p,col=OR){if(p<=0)return;ctx.save();ctx.translate(x,y);ctx.lineCap='round';const q1=cl(p*2),q2=cl(p*2-1);ctx.beginPath();ctx.moveTo(-s,-s);ctx.lineTo(lerp(-s,s,q1),lerp(-s,s,q1));if(q2>0){ctx.moveTo(s,-s);ctx.lineTo(lerp(s,-s,q2),lerp(-s,s,q2))}gs(s*0.22,col,30);ctx.restore()}
function line(x1,y1,x2,y2,p,col='rgba(255,138,31,.6)',w=2.5){if(p<=0)return;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(lerp(x1,x2,p),lerp(y1,y2,p));ctx.setLineDash([6,8]);ctx.strokeStyle=col;ctx.lineWidth=w;ctx.stroke();ctx.setLineDash([])}
function arrow(x1,y1,x2,y2,p,col=OR,w=4){if(p<=0)return;const x=lerp(x1,x2,p),y=lerp(y1,y2,p);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x,y);ctx.lineCap='round';gs(w,col,12);const an=Math.atan2(y2-y1,x2-x1);ctx.save();ctx.translate(x,y);ctx.rotate(an);ctx.beginPath();ctx.moveTo(4,0);ctx.lineTo(-14,-11);ctx.lineTo(-14,11);ctx.closePath();ctx.fillStyle=col;ctx.fill();ctx.restore()}
// draw-on stroke helper: path fn, progress
function drawOn(pathFn,p,w,col,blur){if(p<=0)return;ctx.save();ctx.beginPath();pathFn();ctx.setLineDash([3000*p,3000]);gs(w,col,blur);ctx.restore()}
function monitor(cx,cy,w,h,a,screenFn,drawP=1){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(cx,cy);
 if(drawP<1){drawOn(()=>{ctx.roundRect(-w/2,-h/2,w,h,24)},drawP,5,'rgba(243,236,228,.92)',8);drawOn(()=>{ctx.moveTo(-40,h/2);ctx.lineTo(-60,h/2+90);ctx.lineTo(60,h/2+90);ctx.lineTo(40,h/2)},drawP,5,'rgba(243,236,228,.92)');ctx.restore();return}
 rr(-w/2,-h/2,w,h,24);ctx.fillStyle='rgba(16,12,9,.96)';ctx.fill();gs(5,'rgba(243,236,228,.92)');
 rr(-w/2+18,-h/2+18,w-36,h-36,12);ctx.fillStyle='#120d0a';ctx.fill();ctx.strokeStyle='rgba(255,138,31,.3)';ctx.lineWidth=2;ctx.stroke();
 if(screenFn){ctx.save();rr(-w/2+18,-h/2+18,w-36,h-36,12);ctx.clip();screenFn();ctx.restore()}
 ctx.beginPath();ctx.moveTo(-40,h/2);ctx.lineTo(-60,h/2+90);ctx.lineTo(60,h/2+90);ctx.lineTo(40,h/2);gs(5,'rgba(243,236,228,.92)');
 ctx.beginPath();ctx.moveTo(-130,h/2+92);ctx.lineTo(130,h/2+92);ctx.lineCap='round';gs(6,'rgba(243,236,228,.92)');ctx.restore()}
function phone(cx,cy,w,h,a,screenFn){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(cx,cy);const R=Math.min(w,h)*0.14;
 rr(-w/2,-h/2,w,h,R);ctx.fillStyle='rgba(16,12,9,.96)';ctx.fill();gs(Math.max(2,w/80),'rgba(243,236,228,.9)');
 rr(-w/2+w*0.05,-h/2+w*0.05,w*0.9,h-w*0.1,R*0.75);ctx.fillStyle='#120d0a';ctx.fill();ctx.strokeStyle='rgba(255,138,31,.25)';ctx.lineWidth=2;ctx.stroke();
 if(screenFn){ctx.save();rr(-w/2+w*0.05,-h/2+w*0.05,w*0.9,h-w*0.1,R*0.75);ctx.clip();screenFn();ctx.restore()}
 rr(-w*0.12,-h/2+w*0.08,w*0.24,w*0.055,w*0.03);ctx.fillStyle='#000';ctx.fill();ctx.restore()}
// icons (centered at 0,0, ~44px, scale with k)
const IC={
 play:(k=1)=>{ctx.save();ctx.scale(k,k);ctx.beginPath();ctx.arc(0,0,22,0,7);gs(3,OR,8);ctx.beginPath();ctx.moveTo(-6,-11);ctx.lineTo(12,0);ctx.lineTo(-6,11);ctx.closePath();ctx.fillStyle=OR;ctx.fill();ctx.restore()},
 pad:(k=1)=>{ctx.save();ctx.scale(k,k);rr(-26,-14,52,30,15);gs(3.5,OR,8);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-16,1);ctx.lineTo(-6,1);ctx.moveTo(-11,-4);ctx.lineTo(-11,6);gs(3,OR);ctx.fillStyle=OR;ctx.beginPath();ctx.arc(10,-2,3,0,7);ctx.arc(17,4,3,0,7);ctx.fill();ctx.restore()},
 code:(k=1)=>{ctx.save();ctx.scale(k,k);txt('</>',0,2,'700 30px J',OR);ctx.restore()},
 globe:(k=1)=>{ctx.save();ctx.scale(k,k);ctx.strokeStyle=OR;ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,20,0,7);ctx.stroke();ctx.beginPath();ctx.ellipse(0,0,9,20,0,0,7);ctx.stroke();ctx.beginPath();ctx.moveTo(-20,0);ctx.lineTo(20,0);ctx.stroke();ctx.restore()},
 atom:(k=1,t=0)=>{ctx.save();ctx.scale(k,k);ctx.strokeStyle=OR;ctx.lineWidth=2.5;for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(0,0,24,9,i*Math.PI/3+t*0.6,0,7);ctx.stroke()}ctx.fillStyle=OR;ctx.beginPath();ctx.arc(0,0,4.5,0,7);ctx.fill();ctx.restore()},
 planet:(k=1,t=0)=>{ctx.save();ctx.scale(k,k);ctx.beginPath();ctx.arc(0,0,14,0,7);ctx.fillStyle='rgba(255,138,31,.25)';ctx.fill();gs(3,OR,8);ctx.beginPath();ctx.ellipse(0,0,27,8,-0.4,0,7);gs(2.5,WH);star(Math.cos(t)*30,-22,5,1);ctx.restore()},
 compass:(k=1,t=0)=>{ctx.save();ctx.scale(k,k);ctx.beginPath();ctx.arc(0,0,22,0,7);gs(3,WH);ctx.rotate(Math.sin(t*2)*0.5);ctx.beginPath();ctx.moveTo(0,-17);ctx.lineTo(6,0);ctx.lineTo(-6,0);ctx.closePath();ctx.fillStyle=OR;ctx.fill();ctx.beginPath();ctx.moveTo(0,17);ctx.lineTo(6,0);ctx.lineTo(-6,0);ctx.closePath();ctx.fillStyle='rgba(243,236,228,.7)';ctx.fill();ctx.restore()},
 gearI:(k=1,t=0)=>{ctx.save();ctx.scale(k,k);gear(0,0,22,t,10);ctx.restore()},
 bolt:(k=1)=>{ctx.save();ctx.scale(k,k);ctx.beginPath();ctx.moveTo(5,-24);ctx.lineTo(-12,4);ctx.lineTo(0,4);ctx.lineTo(-5,24);ctx.lineTo(12,-4);ctx.lineTo(0,-4);ctx.closePath();ctx.fillStyle=OR;ctx.shadowColor=OR;ctx.shadowBlur=14;ctx.fill();ctx.restore()},
 brain:(k=1)=>{ctx.save();ctx.scale(k,k);ctx.strokeStyle=OR;ctx.lineWidth=3;ctx.beginPath();ctx.arc(-7,-4,12,Math.PI*0.6,Math.PI*1.9);ctx.arc(7,-4,12,Math.PI*1.1,Math.PI*2.4);ctx.stroke();ctx.beginPath();ctx.moveTo(0,-16);ctx.lineTo(0,14);ctx.stroke();ctx.beginPath();ctx.arc(-7,8,8,Math.PI*0.5,Math.PI*1.3);ctx.arc(7,8,8,Math.PI*1.7,Math.PI*0.5);ctx.stroke();ctx.restore()},
 target:(k=1)=>{ctx.save();ctx.scale(k,k);for(const r of[22,14,6]){ctx.beginPath();ctx.arc(0,0,r,0,7);gs(3,r===6?OR:WH,r===6?10:0)}ctx.restore()},
};
function card(x,y,w,h,p,label,icon,t){if(p<=0)return;ctx.save();ctx.globalAlpha*=cl(p*1.4);ctx.translate(x,y);ctx.scale(p,p);rr(-w/2,-h/2,w,h,22);ctx.fillStyle='rgba(22,15,11,.92)';ctx.fill();gs(2.5,'rgba(255,138,31,.75)',18);
 if(icon){ctx.save();ctx.translate(-w/2+50,0);icon(1,t||0);ctx.restore()}txt(label,icon?-w/2+92:0,2,'800 30px M',WH,icon?'left':'center');ctx.restore()}
// person bust silhouette (line art)
function bust(cx,cy,s,a,glow){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(cx,cy);ctx.scale(s,s);
 ctx.beginPath();ctx.arc(0,-70,58,0,7);ctx.fillStyle='rgba(22,15,11,.95)';ctx.fill();gs(4,'rgba(243,236,228,.92)',glow?20:0);
 // sideburns / hair suggestion
 ctx.beginPath();ctx.moveTo(-58,-78);ctx.quadraticCurveTo(-62,-40,-48,-28);ctx.moveTo(58,-78);ctx.quadraticCurveTo(62,-40,48,-28);gs(4,'rgba(243,236,228,.5)');
 ctx.beginPath();ctx.moveTo(-120,110);ctx.quadraticCurveTo(-120,10,-40,0);ctx.lineTo(0,30);ctx.lineTo(40,0);ctx.quadraticCurveTo(120,10,120,110);ctx.closePath();ctx.fillStyle='rgba(22,15,11,.95)';ctx.fill();gs(4,'rgba(243,236,228,.92)',glow?20:0);
 ctx.beginPath();ctx.moveTo(-14,10);ctx.lineTo(0,30);ctx.lineTo(14,10);ctx.moveTo(0,30);ctx.lineTo(0,80);gs(3,OR,10);
 ctx.restore()}
function stickman(x,y,s,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);ctx.lineCap='round';ctx.beginPath();ctx.arc(0,-62,10,0,7);gs(3,WH);ctx.beginPath();ctx.moveTo(0,-52);ctx.lineTo(0,-18);ctx.moveTo(-14,-42);ctx.lineTo(0,-34);ctx.lineTo(14,-42);ctx.moveTo(-10,0);ctx.lineTo(0,-18);ctx.lineTo(10,0);gs(3,WH);ctx.restore()}
function clock(x,y,r,spin,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fillStyle='rgba(22,15,11,.92)';ctx.fill();gs(4,'rgba(243,236,228,.9)');
 for(let i=0;i<12;i++){const an=i/12*Math.PI*2;ctx.beginPath();ctx.moveTo(Math.cos(an)*r*0.8,Math.sin(an)*r*0.8);ctx.lineTo(Math.cos(an)*r*0.9,Math.sin(an)*r*0.9);gs(3,i%3?'rgba(243,236,228,.5)':OR)}
 ctx.lineCap='round';ctx.save();ctx.rotate(spin/12);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-r*0.45);gs(6,WH);ctx.restore();ctx.save();ctx.rotate(spin);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-r*0.72);gs(4,OR,12);ctx.restore();ctx.restore()}
// a counting dial/wheel (Pascaline)
function dial(x,y,r,rot,digit){ctx.save();ctx.translate(x,y);ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fillStyle='#1d1510';ctx.fill();gs(3,'rgba(255,177,92,.9)',8);ctx.rotate(rot);for(let i=0;i<10;i++){const an=i/10*Math.PI*2;ctx.beginPath();ctx.moveTo(Math.cos(an)*r*0.35,Math.sin(an)*r*0.35);ctx.lineTo(Math.cos(an)*r*0.85,Math.sin(an)*r*0.85);gs(2,'rgba(243,236,228,.45)')}ctx.beginPath();ctx.arc(0,0,r*0.2,0,7);ctx.fillStyle=OR;ctx.fill();ctx.restore()}

// cinematic 2D camera per scene: push-in / pull-out / pan left / pan right, eased, with a slight roll drift and an entry settle
function CAM2D(i,lt,dur){const u=eio(cl(lt/dur));const ent=1-eo(seg(lt,0,0.6));const k=i%4;let z,x=0,y=0;
 if(k===0)z=lerp(1.0,1.09,u);else if(k===1)z=lerp(1.09,1.0,u);else{z=1.06;x=(k===2?1:-1)*lerp(-34,34,u)}
 y=lerp(10,-10,u);z+=0.05*ent;const r=(i%2?1:-1)*0.006*Math.sin(u*Math.PI);return{z,x,y,r}}
// ---------- DOM ----------
const $=id=>document.getElementById(id);
let cur=-1,curChunk=-1;const waveEls=[];
const clean=w=>w.toLowerCase().replace(/[^a-z0-9]/g,'');
const mmss=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}`;
function render(t){
 const f=Math.round(t*FPS);
 let i=0;for(let k=0;k<D.scenes.length;k++)if(t>=D.scenes[k].start)i=k;
 const s=D.scenes[i],lt=t-s.start,dur=s.end-s.start;
 bg(t);
 const a=seg(lt,0,0.3)*(1-seg(lt,dur-0.25,dur));
 ctx.save();ctx.globalAlpha=a;const cm=CAM2D(i,lt,dur);ctx.translate(540,990);ctx.rotate(cm.r);ctx.scale(cm.z,cm.z);ctx.translate(-540+cm.x,-990+cm.y);
 SCN[i](t,lt,dur);ctx.restore();ctx.globalAlpha=1;
 grain(f);
 // header DOM
 const c=SC[i];
 if(cur!==i){cur=i;$('pill').firstChild.textContent=c.pill;$('title').innerHTML=c.title;$('sub').textContent=c.sub;$('tag').firstChild.textContent=c.tag;let fs=96;$('title').style.fontSize=fs+'px';while($('title').offsetHeight>130&&fs>60){fs-=4;$('title').style.fontSize=fs+'px'}$('sub').style.top=($('title').offsetTop+$('title').offsetHeight+18)+'px'}
 const out=1-seg(lt,dur-0.25,dur);
 const ent=d=>{const p=eo(seg(lt,d,d+0.45));return[p*out,(1-p)*40]};
 let [o,y]=ent(0);$('pill').style.opacity=o;$('pill').style.transform=`translateY(${y}px) scale(${lerp(.8,1,back(seg(lt,0,.4)))})`;
 [o,y]=ent(0.08);$('title').style.opacity=o;$('title').style.transform=`translateY(${y}px)`;$('title').style.filter=`blur(${(1-seg(lt,.08,.4))*10}px)`;
 [o,y]=ent(0.2);$('sub').style.opacity=o;$('sub').style.transform=`translateY(${y}px)`;
 [o,y]=ent(0.35);$('tag').style.opacity=o*0.95;$('tag').style.transform=`translateY(${y*.5}px)`;
 // captions
 let ci=-1;for(let k=0;k<D.chunks.length;k++){if(t>=D.chunks[k].t0-0.05)ci=k}
 const ch=ci>=0?D.chunks[ci]:null;const vis=ch&&t<ch.t1;
 if(ci!==curChunk){curChunk=ci;if(ch){const se=D.sent[ch.s];$('cap').innerHTML=ch.idx.map(k=>{const w=se.words[k];const cw=clean(w);const hl=HL.includes(cw)&&!(cw==='qr'&&false);return `<span class="w${hl?' o':''}">${w}</span>`}).join(' ')}else $('cap').innerHTML=''}
 if(ch){const se=D.sent[ch.s];const sp=$('cap').children;const fo=vis?1-seg(t,ch.t1-0.15,ch.t1):0;
  for(let k=0;k<sp.length;k++){const wt=se.wt[ch.idx[k]];const p=seg(t,wt-0.04,wt+0.26);const e=eo(p);sp[k].style.opacity=(p<=0?0:Math.min(1,p*2.5))*fo;
   const nx=k+1<sp.length?se.wt[ch.idx[k+1]]:wt+0.5;const act=t>=wt&&t<nx+0.1;
   sp[k].style.transform=`translateY(${(1-e)*50}px) rotateX(${(1-e)*-95}deg) scale(${lerp(0.6,1,back(p))*(act?1.06:1)})`}}
 const amp=D.amp[Math.min(f,D.amp.length-1)]||0;
 waveEls.forEach((e,k)=>{const r=rng(k*7+f);const h=8+amp*44*(0.35+0.65*Math.abs(Math.sin(k*0.9+t*9)))*(0.7+0.3*r())+3*Math.sin(t*3+k);e.style.height=Math.max(6,h)+'px';e.style.opacity=0.45+amp*0.55});
 $('time').textContent=`${mmss(Math.min(t,TOT))} / ${mmss(TOT)}`;
 $('prog').style.width=(t/TOT*1080)+'px';
}
window.init=async(d)=>{D=d;TOT=d.TOT;
 for(let i=0;i<13;i++){const e=document.createElement('i');$('wave').appendChild(e);waveEls.push(e)}
 await document.fonts.load('800 72px M');await document.fonts.load('900 96px M');await document.fonts.load('500 30px J');await document.fonts.load('700 30px J');await document.fonts.ready;return true};
window.render=render;
