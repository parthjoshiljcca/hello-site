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

const SC=[
 {pill:'THE WHY SPACES · DS SERIES · EP 01',title:'Contact <em>Instant</em> Kaise?',sub:'Hazaaron photos · contacts · messages',tag:'THE · WHY'},
 {pill:'EP 01',title:'Data <em>Structures</em>',sub:'Iska raaz',tag:'DATA · STRUCTURES'},
 {pill:'01 · SAWAAL',title:'Bikhra <em>Kamra</em>',sub:'Mummy: "Meri chaabi dhoondho!"',tag:'REAL · LIFE'},
 {pill:'02 · PROBLEM',title:'Har Kona <em>Check</em>',sub:'Ek ek cheez uthao…',tag:'SLOW'},
 {pill:'03 · SOLUTION',title:'Key <em>Holder</em>',sub:'Chaabi hamesha ek jagah',tag:'1 · SECOND'},
 {pill:'04 · DEFINITION',title:'Data <em>Structure</em> =',sub:'Data ko aise rakhna ki kaam tez ho',tag:'MEANING'},
 {pill:'05 · COMPUTER',title:'Crore <em>Users</em>',sub:'Instagram ka search',tag:'SCALE'},
 {pill:'06 · SPEED',title:'Slow vs <em>Instant</em>',sub:'Ek ek check vs sahi structure',tag:'SEARCH'},
 {pill:'07 · REAL LIFE',title:'Har Kaam Ka <em>Tareeka</em>',sub:'Chalo real life mein dekhte hain',tag:'7 · STRUCTURES'},
 {pill:'08 · ARRAY',title:'Array = <em>Train</em>',sub:'Numbered dibbe · seedha pahuncho',tag:'INDEX'},
 {pill:'09 · LINKED LIST',title:'Linked List = <em>Treasure Hunt</em>',sub:'Har clue agle ka pata',tag:'POINTERS'},
 {pill:'10 · STACK',title:'Stack = <em>Plates</em>',sub:'Aakhir mein rakhi, pehle uthi',tag:'LAST IN · FIRST OUT'},
 {pill:'10 · STACK',title:'Undo = <em>Stack</em>',sub:'Ctrl + Z',tag:'LIFO'},
 {pill:'11 · QUEUE',title:'Queue = <em>Chai Line</em>',sub:'Pehle aao, pehle chai',tag:'FIRST IN · FIRST OUT'},
 {pill:'12 · TREE',title:'Tree = <em>Family</em>',sub:'Dada ji → Papa → Aap',tag:'HIERARCHY'},
 {pill:'13 · GRAPH',title:'Graph = <em>Metro</em>',sub:'Har station kai stations se juda',tag:'CONNECTIONS'},
 {pill:'13 · GRAPH',title:'Google <em>Maps</em>',sub:'Raasta = graph mein path',tag:'SHORTEST · PATH'},
 {pill:'14 · HASH TABLE',title:'Hash Table = <em>Locker</em>',sub:'Naam bolo → seedha locker',tag:'KEY → VALUE'},
 {pill:'15 · THE WHY',title:'Data <em>Badhta</em> Gaya',sub:'Isliye zaroorat padi',tag:'DATA · BOOM'},
 {pill:'15 · THE WHY',title:'Sahi Cheez, Sahi <em>Speed</em>',sub:'Sahi jagah par',tag:'GOAL'},
 {pill:'RECAP',title:'Yaad <em>Rakhne</em> Ka Trick',sub:'Array · Linked List · Stack',tag:'LIFETIME · YAAD'},
 {pill:'RECAP',title:'Kabhi <em>Bhoolna</em> Nahi',sub:'Queue · Tree · Graph · Hash',tag:'LIFETIME · YAAD'},
 {pill:'NEXT · EP 02',title:'Next: <em>Array</em>',sub:'Gehraai se samjhenge',tag:'FOLLOW · SERIES'},
 {pill:'AAPKI BAARI',title:'Favourite <em>Kaunsa?</em>',sub:'Comments mein batao',tag:'COMMENT · KARO'},
];
const HL=['data','structures','structure','chaabi','key','second','instagram','crore','slow','array','linked','list','stack','undo','queue','tree','graph','hash','table','train','treasure','plates','chai','family','metro','locker','folders','google','speed','trick','follow','comments','kaise'];

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

// ---------- scenes ----------
function S0(t,lt){ // 3D phone hook; 2D labels
 [['photos','PHOTOS',220,650],['contacts','CONTACTS',860,650],['messages','MESSAGES',220,1210],['apps','APPS',860,1210]].forEach(([e,l,x,y])=>monoTag(x,y,l,fin(t,e,0.4,-0.1)));
 badge(540,1255,'KAISE?',pop(t,'kaise',0.45,-0.1),{fs:34});
}
function S1(t,lt){ // title card
 const p=pop(t,'ds',0.5,-0.3);if(p>0){ctx.save();ctx.translate(540,930);ctx.scale(p,p);txt('DATA',0,-70,'900 120px M',WH,'center',20);txt('STRUCTURES',0,60,'900 110px M',OR,'center',40);ctx.restore()}
 monoTag(540,1150,'THE WHY SPACES · DS SERIES · EP 01',fin(t,'ds',0.4,0.2));
}
function S2(t,lt){ // messy room, mummy
 const a=eo(seg(lt,0,0.6));clutter(t,a,5);keyIcon(760,1120,0.7,a*0.6,0.6);
 bust(200,760,0.7,pop(t,'sawaal',0.5,-0.1),true);speech(380,640,1.0,pop(t,'chaabi',0.45,-0.6),false,t);badge(540,1255,'"MERI CHAABI DHOONDHO!"',pop(t,'chaabi',0.45,0),{fs:26});
}
function S3(t,lt){ // search every corner
 const a=eo(seg(lt,0,0.5));clutter(t,a,5);const r=rng(11);const ph=(lt*0.55)%1;const pts=[[180,700],[860,760],[300,1140],[700,900],[920,1150],[480,700]];const k=Math.floor(lt*0.55*6)%6;const q=eio((lt*0.55*6)%1);
 const p0=pts[k],p1=pts[(k+1)%6];const mx=lerp(p0[0],p1[0],q),my=lerp(p0[1],p1[1],q);ctx.save();ctx.globalAlpha*=a;ctx.beginPath();ctx.arc(mx,my,70,0,7);ctx.fillStyle='rgba(255,138,31,.08)';ctx.fill();gs(6,LN);ctx.beginPath();ctx.moveTo(mx+50,my+50);ctx.lineTo(mx+100,my+100);gs(10,LN);ctx.restore();
 clock(920,660,56,lt*9,fin(t,'time',0.4,-0.2));badge(540,1255,'BAHUT TIME LAGEGA',pop(t,'time',0.45,0.2),{fs:28});
}
function S4(t,lt){ // key holder
 const a=eo(seg(lt,0,0.5));doorFrame2(380,960,1.0,a);keyHolder(760,760,1.1,pop(t,'keyholder',0.5,-0.2),true,t);
 if(fin(t,'second',0.4,-0.4)>0){const q=fin(t,'second',0.4,-0.4);check(760,980,50,q);monoTag(760,1080,'MIL GAYI!',q)}
 badge(540,1255,'SIRF 1 SECOND',pop(t,'second',0.45,0),{fs:30});
}
function doorFrame2(x,y,s,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);rr(-130,-260,260,500,10);ctx.fillStyle='rgba(60,32,16,.9)';ctx.fill();gs(5,LN);ctx.beginPath();ctx.arc(90,10,10,0,7);ctx.fillStyle=GOLD;ctx.fill();rr(-90,-210,180,180,6);gs(3,'rgba(243,236,228,.4)');rr(-90,30,180,170,6);gs(3,'rgba(243,236,228,.4)');ctx.restore()}
function S5(t,lt){ // definition
 const a=eo(seg(lt,0,0.5));shelf(540,950,1.2,a,t);
 const d=pop(t,'tezi',0.5,-0.3);if(d>0){ctx.save();ctx.globalAlpha*=cl(d);txt('DATA + SAHI TAREEKA = TEZ KAAM',540,650,'900 40px M',OR,'center',16);ctx.restore()}
}
function S6(t,lt){ // crore users
 const a=eo(seg(lt,0,0.5));const r=rng(3);const n=Math.floor(fin(t,'crore',1.2,-0.3)*120);for(let i=0;i<n;i++){avatar(90+r()*900,620+r()*620,10+r()*16,0.8,i)}
 phone(540,930,240,430,a,()=>{ctx.fillStyle='rgba(255,138,31,.15)';ctx.fillRect(-120,-215,240,430);rr(-90,-150,180,36,18);ctx.fillStyle='rgba(243,236,228,.15)';ctx.fill();txt('search…',-70,-131,'500 18px M',WH,'left')});
 badge(540,1255,'CRORE USERS',pop(t,'crore',0.45,0),{fs:32});
}
function S7(t,lt){ // slow vs instant
 const s=seg(t,E('username')-0.2,E('slow')+1.0);const names=['amit_01','riya.k','zaid99','neha_s','arjun.x','meera_j','kabir.t','priya_m'];
 card(300,930,420,520,eo(seg(lt,0,0.5)),'',null,t);monoTag(300,640,'EK EK CHECK',eo(seg(lt,0,0.5)));
 names.forEach((nm,i)=>{const hit=Math.floor(s*30)%8===i;ctx.save();ctx.globalAlpha*=eo(seg(lt,0,0.5));txt(nm,170,740+i*52,'500 26px J',hit?OR:'rgba(243,236,228,.6)','left');ctx.restore();if(hit)cross(420,740+i*52,12,1)});
 clock(300,1240,34,t*10,fin(t,'slow',0.4,0));
 const f=pop(t,'sahi',0.5,-0.2);card(780,930,360,520,f,'',null,t);if(f>0){monoTag(780,640,'SAHI STRUCTURE',cl(f));txt('meera_j',780,900,'900 40px M',OR,'center',16);check(780,1010,50,fin(t,'palak2',0.5,0));bigFlash(780,930,seg(t,E('palak2')-0.1,E('palak2')+0.5))}
}
function bigFlash(x,y,p){if(p<=0||p>=1)return;ctx.save();ctx.globalAlpha*=1-p;ctx.beginPath();ctx.arc(x,y,60+200*p,0,7);gs(6,OR,30);ctx.restore()}
function S8(t,lt){ // preview of 7
 const ic=[['ARRAY',ICO.train],['LINKED LIST',ICO.hunt],['STACK',ICO.plates],['QUEUE',ICO.chai],['TREE',ICO.tree],['GRAPH',ICO.metro],['HASH TABLE',ICO.locker]];
 ic.forEach(([n,f],i)=>{const x=i<4?195+i*230:310+(i-4)*230,y=i<4?780:1020;const p=pop(t,'alag',0.45,-0.2+i*0.1);ctx.save();ctx.translate(x,y);ctx.scale(0.72,0.72);ctx.translate(-x,-y);recapCard(x,y,p,n,f,t);ctx.restore()});
 badge(540,1255,'CHALO REAL LIFE MEIN',pop(t,'reallife',0.45,0),{fs:28});
}
function S9(t,lt){ // 3D array train; 2D labels
 badge(540,1255,'ARRAY',pop(t,'array',0.45,0),{fs:34});monoTag(540,640,'INDEX SE SEEDHA ACCESS',fin(t,'seedhe',0.4,0));
}
function S10(t,lt){ // linked list: treasure hunt
 const a=eo(seg(lt,0,0.5));const P=[[180,760],[460,880],[260,1100],[620,1120],[880,900]];const p=seg(t,E('clue')-0.4,E('linked')+0.4);
 ctx.save();ctx.globalAlpha*=a*0.35;ctx.beginPath();for(let x=80;x<1000;x+=40){ctx.moveTo(x,600);ctx.lineTo(x+20,1240)}gs(1,'rgba(214,160,90,.3)');ctx.restore();
 P.slice(0,4).forEach(([x,y],i)=>{const q=back(cl(p*5-i));note(x,y,0.95*q,cl(q),'CLUE '+(i+1),(i%2?0.08:-0.08));if(i<3){const n=P[i+1];arrow(x+60,y,n[0]-60,n[1],cl(p*5-i-0.5),OR,4)}});
 arrow(680,1100,820,940,cl(p*5-3.5),OR,4);chest(880,900,1.1,cl(p*5-4),fin(t,'linked',0.6,0.2));
 badge(540,1255,'LINKED LIST',pop(t,'linked',0.45,0),{fs:32});
}
function S11(t,lt){ // 3D plates; 2D badge
 badge(540,1255,'STACK · LIFO',pop(t,'pehle',0.45,0.3),{fs:30});
}
function S12(t,lt){ // undo = stack
 const a=eo(seg(lt,0,0.5));const acts=['Hello','Hello World','Hello World!'];const u=fin(t,'undo',0.5,-0.2);const n=u>0.5?2:3;
 editor(330,930,0.85,a,[acts[n-1]],t);stackBox(820,1180,240,a,['type','type','type !'].slice(0,n),true);monoTag(820,820,'UNDO STACK',a);
 if(u>0){const k=pop(t,'undo',0.45,-0.2);badge(330,1190,'CTRL + Z',k,{fs:30});if(u<1){ctx.save();ctx.globalAlpha*=1-u;rr(710,1180-10-3*58-u*120,220,50,10);ctx.fillStyle='rgba(255,138,31,.6)';ctx.fill();txt('type !',820,1180-10-3*58+25-u*120,'800 24px M',WH);ctx.restore()}}
}
function S13(t,lt){ // queue: chai line
 const a=eo(seg(lt,0,0.5));chaiStall(180,1000,1.2,a,t);const sh=seg(t,E('pehleaaya')-0.2,E('queue')+1.2);
 for(let i=0;i<5;i++){const pos=i-sh*1.0;const x=320+pos*150;if(pos<-0.6)continue;stickman(x,1120,2.0,a*cl(1+pos*1.5),1)}
 const nj=fin(t,'pehleaaya',0.6,0.3);stickman(lerp(1100,320+4*150,nj),1120,2.0,nj);
 monoTag(330,1210,'FRONT',fin(t,'chai',0.4,0.3));monoTag(900,1210,'REAR',fin(t,'chai',0.4,0.5));if(sh>0.3)cup(320,940,0.7,1,t);
 badge(540,640,'PEHLE AAO, PEHLE CHAI',pop(t,'pehleaaya',0.45,0),{fs:28});badge(540,1260,'QUEUE · FIFO',pop(t,'queue',0.45,0),{fs:30});
}
function S14(t,lt){ // tree: family, then folders
 const f=fin(t,'folders',0.5,-0.3);const p=seg(t,E('family')-0.2,E('tree')+0.2);
 if(f<1){ctx.save();ctx.globalAlpha*=1-f;treeNodes(540,930,1.0,1,p,['DADA JI','PAPA','CHACHA','AAP','DIDI','BHAI','BEHEN']);badge(540,1255,'TREE',pop(t,'tree',0.45,0),{fs:34});ctx.restore()}
 if(f>0){treeNodes(540,930,1.0,f,1,['Phone','Photos','Docs','2024','2025','PDF','Notes']);monoTag(540,640,'FOLDERS BHI TREE',f)}
}
function S15(t,lt){ // 3D metro graph; 2D badge
 badge(540,1255,'GRAPH',pop(t,'graph',0.45,0),{fs:34});
}
function S16(t,lt){ // google maps: path in a graph
 const a=eo(seg(lt,0,0.5));const P=[[160,760],[420,680],[700,760],[920,700],[260,980],[540,920],[820,1000],[380,1180],[680,1160]];const Ed=[[0,1],[1,2],[2,3],[0,4],[1,5],[2,6],[3,6],[4,5],[5,6],[4,7],[5,7],[5,8],[6,8],[7,8]];
 ctx.save();ctx.globalAlpha*=a;Ed.forEach(([i,j])=>{ctx.beginPath();ctx.moveTo(...P[i]);ctx.lineTo(...P[j]);gs(4,'rgba(243,236,228,.35)')});ctx.restore();
 const path=[0,4,5,8];const pp=fin(t,'raasta',1.2,-0.4);for(let k=0;k<path.length-1;k++){const q=cl(pp*3-k);const A=P[path[k]],B=P[path[k+1]];if(q>0){ctx.beginPath();ctx.moveTo(...A);ctx.lineTo(lerp(A[0],B[0],q),lerp(A[1],B[1],q));gs(9,OR,20)}}
 P.forEach(([x,y],i)=>{ctx.save();ctx.globalAlpha*=a;ctx.beginPath();ctx.arc(x,y,16,0,7);ctx.fillStyle=path.includes(i)&&pp>0?OR:'rgba(243,236,228,.85)';ctx.fill();ctx.restore()});
 pin(160,720,a);pin(680,1120,fin(t,'raasta',0.4,-0.2));badge(540,1255,'SHORTEST PATH',pop(t,'raasta',0.45,0.8),{fs:30});
}
function pin(x,y,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.beginPath();ctx.arc(x,y-30,22,Math.PI*0.85,Math.PI*2.15);ctx.lineTo(x,y);ctx.closePath();ctx.fillStyle='#ff5a3c';ctx.fill();ctx.beginPath();ctx.arc(x,y-30,8,0,7);ctx.fillStyle='#fff';ctx.fill();ctx.restore()}
function S17(t,lt){ // hash table: locker room
 const a=eo(seg(lt,0,0.5));const op=fin(t,'kholo',0.5,-0.1);const hl=fin(t,'naam2',0.4,0.3);
 for(let r=0;r<3;r++)for(let c=0;c<6;c++){const i=r*6+c;locker(400+c*100,760+r*150,86,130,a,String(i),i===7?op:0,i===7?hl:0)}
 const n=pop(t,'naam2',0.45,-0.2);if(n>0){badge(170,760,'"RIYA"',n,{fs:28});arrow(170,800,170,880,fin(t,'naam2',0.4,0.2),OR,4);card(170,950,200,110,n,'',null,t);if(n>0){ctx.save();ctx.globalAlpha*=cl(n);txt('hash()',170,935,'800 26px J',GOLD);txt('= 7',170,970,'900 30px M',OR);ctx.restore()}arrow(270,950,490,920,fin(t,'kholo',0.5,-0.3),OR,4)}
 badge(540,1255,'HASH TABLE',pop(t,'hash',0.45,0),{fs:32});
}
function S18(t,lt){ // data growth
 growth(170,1180,740,480,fin(t,'badhta',1.4,-0.6),eo(seg(lt,0,0.5)));monoTag(540,640,'ZAROORAT KYUN PADI?',fin(t,'zaroorat',0.4,0));badge(540,1255,'DATA BADHTA GAYA',pop(t,'badhta',0.45,0.2),{fs:28});
}
function S19(t,lt){ // sahi cheez, jagah, speed
 [['SAHI CHEEZ',220],['SAHI JAGAH',540],['SAHI SPEED',860]].forEach(([l,x],i)=>{const p=pop(t,i===2?'speed':'sahi2',0.45,i===2?-0.1:-0.1+i*0.45);card(x,930,280,260,p,'',null,t);if(p>0){check(x,890,46,cl(p));txt(l,x,1000,'900 30px M',OR,'center',10)}});
}
function S20(t,lt){ // recap 1
 [['ARRAY','r_array',ICO.train,'TRAIN'],['LINKED LIST','r_linked',ICO.hunt,'TREASURE HUNT'],['STACK','r_stack',ICO.plates,'PLATES']].forEach(([n,e,f,an],i)=>{const y=720+i*200;const p=pop(t,e,0.45,-0.15);recapCard(330,y,p,n,f,t);if(p>0){arrow(500,y,600,y,cl(p),OR,4);txt('= '+an,630,y+4,'900 38px M',WH,'left')}});
}
function S21(t,lt){ // recap 2
 [['QUEUE','r_queue',ICO.chai,'CHAI LINE'],['TREE','r_tree',ICO.tree,'FAMILY'],['GRAPH','r_graph',ICO.metro,'METRO'],['HASH TABLE','r_hash',ICO.locker,'LOCKER']].forEach(([n,e,f,an],i)=>{const y=680+i*160;const p=pop(t,e,0.45,-0.15);ctx.save();ctx.translate(330,y);ctx.scale(0.85,0.85);ctx.translate(-330,-y);recapCard(330,y,p,n,f,t);ctx.restore();if(p>0){arrow(480,y,580,y,cl(p),OR,4);txt('= '+an,610,y+4,'900 36px M',WH,'left')}});
}
function S22(t,lt){ // next episode
 const a=eo(seg(lt,0,0.5));card(540,900,600,420,a,'',null,t);if(a>0){ctx.save();ctx.globalAlpha*=a;txt('EP 02',540,760,'900 40px J',GOLD);txt('ARRAY',540,850,'900 110px M',OR,'center',30);ctx.restore();trainMini(540,1000,2.0,a)}
 badge(540,1255,'SERIES FOLLOW KARO',pop(t,'follow',0.45,0),{fs:30});
}
function S23(t,lt){ // comments
 const a=eo(seg(lt,0,0.5));const ic=[ICO.train,ICO.hunt,ICO.plates,ICO.chai,ICO.tree,ICO.metro,ICO.locker];ic.forEach((f,i)=>{const an=i/7*Math.PI*2+t*0.3;ctx.save();ctx.globalAlpha*=a*0.85;ctx.translate(540+Math.cos(an)*300,930+Math.sin(an)*240);ctx.scale(0.8,0.8);f(t);ctx.restore()});
 speech(540,930,1.3,pop(t,'comments',0.45,-0.8),false,t);badge(540,1255,'COMMENTS MEIN BATAO',pop(t,'comments',0.45,0),{fs:30});
}
const SCN=[S0,S1,S2,S3,S4,S5,S6,S7,S8,S9,S10,S11,S12,S13,S14,S15,S16,S17,S18,S19,S20,S21,S22,S23];
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
