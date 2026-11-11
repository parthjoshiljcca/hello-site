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

const SC=[
 {pill:'01 · FEEL',title:'Dil <em>Dhak Dhak</em>',sub:'Exam se pehle aisa kyun?',tag:'ANXIETY'},
 {pill:'02 · DIMAAG',title:'<em>Amygdala</em>',sub:'Baadaam jitna chhota alarm',tag:'BUILT-IN · ALARM'},
 {pill:'03 · FLASHBACK',title:'Khatra = <em>Sher</em>',sub:'Hazaaron saal pehle',tag:'JUNGLE · ERA'},
 {pill:'04 · ALARM',title:'Hormones <em>Release</em>',sub:'Adrenaline · Cortisol',tag:'STRESS · HORMONES'},
 {pill:'05 · RESPONSE',title:'Fight or <em>Flight</em>',sub:'Ladne ya bhaagne ki taiyaari',tag:'SURVIVAL · MODE'},
 {pill:'06 · BUTTERFLIES',title:'Pet Mein <em>Titliyan</em>',sub:'Blood pet se muscles ki taraf',tag:'BLOOD · FLOW'},
 {pill:'07 · PROBLEM',title:'Sher <em>Nahi</em>, Alarm On',sub:'Purana system, naya zamaana',tag:'FALSE · ALARM'},
 {pill:'08 · AAJ KE SHER',title:'Naye <em>Khatre</em>',sub:'Exam · Interview · Deadline · Message',tag:'MODERN · THREATS'},
 {pill:'09 · SACH',title:'Kamzori <em>Nahi</em>',sub:'Aapko bachaane wala system',tag:'PROTECTION'},
 {pill:'10 · SHAANT KARO',title:'Lambi <em>Saans</em>',sub:'Saans chhodne mein zyada time',tag:'BREATHE · OUT'},
 {pill:'11 · HELP',title:'Baat <em>Karo</em>',sub:'Expert se baat karna sahi hai',tag:'YOU · ARE · OK'},
];
const HL=['exam','dil','haath','titliyan','anxiety','amygdala','baadaam','alarm','sher','adrenaline','cortisol','saansein','muscles','fight','flight','blood','pet','problem','interview','deadline','message','khatra','kamzori','purana','shaant','dheere','chhodne','safe','signal','expert','bilkul','kyun'];

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

// ---------- scenes ----------
function S0(t,lt){ // hook: exam, dil, haath, titliyan -> kyun?
 const q=fin(t,'kyun',0.5,-0.4);
 if(q<1){ctx.save();ctx.globalAlpha*=1-q;
  examPaper(540,760,0.8,eo(seg(lt,0,0.5)),t);
  const dp=pop(t,'dil',0.45,-0.15);heartShape(220,1060,1.15,cl(dp),null,beatAt(t,150));ecg(110,1180,220,t,2.6,fin(t,'dil',0.5,0));monoTag(220,1240,'DIL TEZ',cl(dp));
  const hp=pop(t,'haath',0.45,-0.15);hand(540,1070,1.0,cl(hp),Math.sin(t*40)*3*cl(hp));snow(610,990,22,fin(t,'haath',0.4,0.1),t);monoTag(540,1240,'HAATH THANDE',cl(hp));
  const sp=pop(t,'titliyan',0.45,-0.15);stomach(860,1080,1.1,cl(sp));for(let i=0;i<4;i++){const an=t*2+i*1.6;butterfly(860+Math.cos(an)*30,1080+Math.sin(an*1.3)*30,0.55,fin(t,'titliyan',0.4,0.1+i*0.08),t,i)}monoTag(860,1240,'PET MEIN TITLIYAN',cl(sp));
  ctx.restore()}
 if(q>0){const k=back(q);ctx.save();ctx.translate(540,900);ctx.scale(k,k);txt('?',0,0,'900 280px M',OR,'center',44);ctx.restore();badge(540,1210,'WHY ANXIETY?',pop(t,'anxiety',0.45,0.1),{fs:32})}
}
function S1(t,lt){ // 3D: brain + amygdala (labels only in 2D)
 badge(540,1250,'BUILT-IN ALARM',pop(t,'alarm',0.45,0.1),{fs:30});
}
function S2(t,lt){ // jungle, sher
 const a=eo(seg(lt,0,0.6));tree(140,1180,1.1,a);tree(950,1170,1.0,a);tree(300,1200,0.7,a*0.7);
 monoTag(540,640,'HAZAARON SAAL PEHLE',fin(t,'hazaaron',0.4,0));
 const lp=pop(t,'jungle',0.5,0.7);lion(700,950,1.05,cl(lp),t);caveman(270,1150,2.2,fin(t,'jungle',0.4,-0.2),lp>0.5);
 badge(700,1210,'KHATRA!',pop(t,'sher',0.45,-0.3),{fs:30});
}
function S3(t,lt){ // 3D: alarm + hormones (labels only)
 badge(260,1240,'ADRENALINE',pop(t,'adrenaline',0.45,0),{fs:26});badge(820,1240,'CORTISOL',pop(t,'cortisol',0.45,0),{fs:26});
}
function S4(t,lt){ // fight or flight
 const ff=fin(t,'fight',0.4,-0.3);
 if(ff<1){ctx.save();ctx.globalAlpha*=1-ff;
  const d=pop(t,'dil2',0.45,-0.2);heartShape(220,900,1.2,cl(d),null,beatAt(t,170));ecg(110,1030,220,t,3,cl(d));monoTag(220,1100,'HEART RATE ↑',cl(d));
  const s=pop(t,'saansein',0.45,-0.2);lungs(540,920,1.25,cl(s),Math.abs(Math.sin(t*7)));monoTag(540,1100,'FAST BREATHING',cl(s));
  const m=pop(t,'muscles',0.45,-0.2);arm(860,940,1.1,cl(m),0.5+0.5*Math.sin(t*5));monoTag(860,1100,'MUSCLES READY',cl(m));
  ctx.restore()}
 if(ff>0){const fp=pop(t,'fight',0.45,-0.1),lp=pop(t,'flight',0.45,-0.1);
  card(300,900,380,420,fp,'',null,t);fist(300,860,1.5,cl(fp));if(fp>0)txt('FIGHT',300,1040,'900 52px M',OR,'center',18);
  card(780,900,380,420,lp,'',null,t);runner(780,890,2.2,cl(lp),t);if(lp>0)txt('FLIGHT',780,1040,'900 52px M',OR,'center',18);
  badge(540,1250,'SURVIVAL RESPONSE',pop(t,'flight',0.45,0.5),{fs:28})}
}
function S5(t,lt){ // blood from pet to muscles
 const a=eo(seg(lt,0,0.5));bodyOutline(540,960,1.15,a);stomach(540,990,0.45,a);
 const f=seg(t,E('blood')-0.2,E('blood')+4);if(f>0){const r=rng(5);for(let i=0;i<26;i++){const tg=[[-130,10],[130,10],[-50,240],[50,240]][i%4];const ph=(f*1.2+r())%1;const x=540+lerp(0,tg[0]*1.15,eio(ph)),y=990+lerp(0,(tg[1]-30)*1.15,eio(ph));ctx.save();ctx.globalAlpha=cl(f*5)*(1-ph*0.6);ctx.beginPath();ctx.arc(x,y,7,0,7);ctx.fillStyle=RED;ctx.shadowColor=RED;ctx.shadowBlur=12;ctx.fill();ctx.restore()}}
 monoTag(830,1150,'PET → MUSCLES',fin(t,'muscles2',0.4,0));
 for(let i=0;i<4;i++){const an=t*2.2+i*1.6;butterfly(540+Math.cos(an)*70,990+Math.sin(an*1.3)*40,0.6,fin(t,'ajeeb',0.4,i*0.08),t,i)}
 monoTag(820,760,'AJEEB FEELING',fin(t,'ajeeb',0.4,0.1));monoTag(260,760,'BLOOD',fin(t,'blood',0.4,0));
}
function S6(t,lt){ // no sher, alarm still
 const a=eo(seg(lt,0,0.5));lion(300,880,0.75,a*(1-0.5*fin(t,'aaj',0.4,0)),t);cross(300,890,90,fin(t,'sher3',0.4,-0.1));monoTag(300,1080,'AAJ SHER NAHI',fin(t,'sher3',0.4,0.1));
 const b=fin(t,'bajta',0.5,-0.4);bell(780,900,1.3,pop(t,'problem',0.45,0),t,b);monoTag(780,1080,'ALARM STILL ON',b);
 badge(540,1250,'FALSE ALARM',pop(t,'bajta',0.45,0.3),{fs:30});
}
function S7(t,lt){ // modern threats
 const a=eo(seg(lt,0,0.5));ctx.save();ctx.translate(540,930);const pulse=1+0.06*Math.sin(t*8)*fin(t,'khatra',0.4,0);ctx.scale(4.2*a*pulse,4.2*a*pulse);IC.brain();ctx.restore();
 const it=[['exam2','EXAM','A+',300,700],['interview','INTERVIEW','?',780,760],['deadline','DEADLINE','⏰',290,1110],['message','1 MESSAGE','✉',790,1160]];
 it.forEach(([e,l,ic,x,y])=>{const p=pop(t,e,0.5,-0.15);notif(x,y+Math.sin(t*2+x)*6,1,cl(p),l,ic==='⏰'?'!':ic==='✉'?'@':ic);if(p>0)line(x,y,540,930,fin(t,'khatra',0.5,-0.1),'rgba(255,90,60,.7)',3)});
 badge(540,1250,'DIMAAG: KHATRA!',pop(t,'khatra',0.45,0.2),{fs:30});
}
function S8(t,lt){ // not weakness
 const a=eo(seg(lt,0,0.5));const k=pop(t,'kamzori',0.45,-0.2);
 if(k>0){ctx.save();ctx.globalAlpha*=cl(k);txt('KAMZORI',540,660,'900 64px M',WH,'center');ctx.restore();cross(540,660,70,fin(t,'kamzori',0.4,0.3))}
 const s=pop(t,'bachaane',0.5,-0.2);shield(540,960,1.6,cl(s));heartShape(540,955,1.0,cl(s),'rgba(255,138,31,.45)',beatAt(t,70));
 monoTag(540,1170,'PURANA PROTECTION SYSTEM',fin(t,'purana',0.4,0));
}
function S9(t,lt){ // 3D breath orb (labels only)
 const ip=fin(t,'dheere',0.4,-0.1),ep=fin(t,'chhodne',0.4,-0.1);
 monoTag(250,1180,'INHALE · 4s',ip);monoTag(830,1180,'EXHALE · 6s',ep);
 badge(540,1250,'SAB SAFE HAI',pop(t,'safe',0.45,0.1),{fs:30});
}
function S10(t,lt){ // talk to expert
 const a=eo(seg(lt,0,0.5));bust(330,1000,1.0,a,false);bust(760,1000,1.0,pop(t,'expert',0.5,-0.3),true);
 if(pop(t,'expert',0.5,-0.3)>0){ctx.save();ctx.globalAlpha*=cl(pop(t,'expert',0.5,-0.3));ctx.beginPath();ctx.moveTo(730,1010);ctx.quadraticCurveTo(700,1080,740,1090);ctx.moveTo(790,1010);ctx.quadraticCurveTo(820,1080,780,1090);gs(4,OR,10);ctx.beginPath();ctx.arc(760,1095,12,0,7);gs(4,OR,10);ctx.restore()}
 speech(450,760,1,pop(t,'roz',0.45,0),false,t);speech(650,740,1,fin(t,'expert',0.4,0.3),true,t);
 monoTag(330,1160,'AAP',a);monoTag(760,1160,'EXPERT',fin(t,'expert',0.4,0));
 badge(540,1255,'BAAT KARNA BILKUL SAHI',pop(t,'bilkul',0.45,0),{fs:28});
}
// scenes whose illustration is drawn by the 3D layer (why-anxiety-3d)
const SCN=[S0,S1,S2,S3,S4,S5,S6,S7,S8,S9,S10];
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
 ctx.save();ctx.globalAlpha=a;const z=1+0.03*lt/dur;ctx.translate(540,990);ctx.scale(z,z);ctx.translate(-540,-990);
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
