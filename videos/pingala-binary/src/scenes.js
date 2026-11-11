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
 {pill:'01 · DIGITAL',title:'Sirf <em>0</em> aur <em>1</em>',sub:'Phone · Laptop · Internet',tag:'BINARY'},
 {pill:'02 · HISTORY',title:'Leibniz, <em>1703</em>',sub:'Kitaabon wali kahaani',tag:'GERMANY'},
 {pill:'03 · TWIST',title:'1900 Saal <em>Pehle</em>',sub:'Bharat mein binary jaisa system',tag:'ACHARYA · PINGALA'},
 {pill:'04 · SAWAAL',title:'Computer Nahi, <em>Toh Kyun?</em>',sub:'Binary ki zaroorat kyun padi?',tag:'THE · WHY'},
 {pill:'05 · JAWAAB',title:'<em>Kavita</em>',sub:'Chhandahshastra: rhythm ka vigyaan',tag:'SANSKRIT · PROSODY'},
 {pill:'06 · DO AKSHAR',title:'Laghu & <em>Guru</em>',sub:'Chhota akshar · lamba akshar',tag:'SHORT · LONG'},
 {pill:'07 · EXAMPLE',title:'Ka vs <em>Kaa</em>',sub:'Chhoti aawaaz · lambi aawaaz',tag:'LAGHU · GURU'},
 {pill:'08 · 2 STATES',title:'Bilkul <em>0 · 1</em> Jaisa',sub:'Sirf do cheezein',tag:'BINARY · IDEA'},
 {pill:'09 · PUZZLE',title:'Kitne <em>Rhythm?</em>',sub:'4 akshar ki ek line',tag:'COUNT'},
 {pill:'10 · PRASTAAR',title:'Saare <em>Patterns</em>',sub:'Pingala ki list',tag:'16 PATTERNS'},
 {pill:'11 · MATHS',title:'2×2×2×2 = <em>16</em>',sub:'Har akshar ke do option',tag:'MULTIPLY'},
 {pill:'12 · FORMULA',title:'2 <em>to the power n</em>',sub:'n akshar → 2ⁿ rhythm',tag:'EXPONENT'},
 {pill:'13 · ALGORITHM',title:'Pattern ⇄ <em>Number</em>',sub:'Dono taraf conversion',tag:'NASHTA · UDDISHTA'},
 {pill:'14 · AAJ',title:'Decimal → <em>Binary</em>',sub:'Computer bhi yahi karta hai',tag:'SAME · LOGIC'},
 {pill:'15 · 10TH CENTURY',title:'Meru <em>Prastaar</em>',sub:'Halayudha · aaj ka Pascal\'s triangle',tag:'HALAYUDHA'},
 {pill:'16 · ASLI WHY',title:'Kavita Ke <em>Liye</em>',sub:'Computer ke liye nahi',tag:'RHYTHM'},
 {pill:'17 · AAJ',title:'Digital <em>Duniya</em>',sub:'Laghu-guru = 0-1',tag:'LEGACY'},
 {pill:'18 · AAPKI BAARI',title:'Pata <em>Tha?</em>',sub:'Comments mein batao',tag:'COMMENT · KARO'},
];
const HL=['zero','one','binary','1703','leibniz','1900','bharat','pingala','computer','kavita','chhandahshastra','rhythm','laghu','guru','ka','kaa','chaar','patterns','solah','option','power','number','pattern','decimal','halayudha','meru','prastaar','pascal\'s','digital','comments'];

// ---------- binary primitives ----------
// laghu = short beat, guru = long beat (the visual bridge to 0 and 1)
function beat(x,y,long,s,a,glow=0){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;const w=(long?110:34)*s,h=34*s;rr(x-w/2,y-h/2,w,h,h/2);ctx.fillStyle=long?'rgba(255,138,31,.85)':'rgba(243,236,228,.9)';ctx.shadowColor=long?OR:'#fff';ctx.shadowBlur=10+20*glow;ctx.fill();ctx.restore()}
function sage(x,y,s,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);bust(0,0,1,1,true);
 ctx.beginPath();ctx.ellipse(0,-150,26,22,0,0,7);ctx.fillStyle='rgba(40,28,20,.98)';ctx.fill();gs(3.5,LN);
 ctx.beginPath();ctx.moveTo(-40,-50);ctx.quadraticCurveTo(-36,10,0,30);ctx.quadraticCurveTo(36,10,40,-50);ctx.quadraticCurveTo(0,-30,-40,-50);ctx.fillStyle='rgba(243,236,228,.85)';ctx.fill();
 for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-22,-104+i*7);ctx.lineTo(22,-104+i*7);gs(2,'rgba(255,138,31,.7)')}ctx.restore()}
function leibnizBust(x,y,s,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);
 for(const d of[-1,1])for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(d*(56+i*4),-110+i*30,22,0,7);ctx.fillStyle='rgba(225,215,200,.9)';ctx.fill();gs(2,LN)}
 bust(0,0,1,1,false);ctx.beginPath();ctx.arc(0,-112,50,Math.PI*1.05,Math.PI*1.95);gs(10,'rgba(225,215,200,.9)');
 ctx.beginPath();ctx.moveTo(-16,12);ctx.lineTo(0,40);ctx.lineTo(16,12);ctx.fillStyle='#fff';ctx.fill();ctx.restore()}
function palmLeaf(x,y,s,a,t,rows){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);rr(-300,-60,600,120,26);ctx.fillStyle='rgba(214,170,100,.9)';ctx.fill();gs(3,'#ffe0a0',8);
 ctx.beginPath();ctx.arc(-200,0,10,0,7);ctx.arc(200,0,10,0,7);ctx.fillStyle='rgba(60,30,10,.9)';ctx.fill();
 const r=rng(4);for(let k=0;k<(rows||2);k++)for(let i=0;i<9;i++){const lg=r()<0.5;beat(-150+i*36,-22+k*44,lg,0.32,1)}ctx.restore()}
function slot(x,y,s,a,long,flip){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;rr(x-70*s,y-50*s,140*s,100*s,16*s);ctx.fillStyle='rgba(22,15,11,.92)';ctx.fill();gs(2.5,'rgba(255,138,31,.7)',10);ctx.restore();if(long!==null)beat(x,y,long,s*0.9,a*(flip===undefined?1:flip))}
function chipIcon(x,y,s,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);rr(-60,-60,120,120,12);ctx.fillStyle='rgba(30,22,16,.95)';ctx.fill();gs(4,LN);rr(-30,-30,60,60,6);gs(3,OR,12);
 for(let i=0;i<5;i++)for(const d of[-1,1]){ctx.beginPath();ctx.moveTo(-40+i*20,d*60);ctx.lineTo(-40+i*20,d*80);ctx.moveTo(d*60,-40+i*20);ctx.lineTo(d*80,-40+i*20);gs(3,LN)}ctx.restore()}
function noteIcon(x,y,s,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);ctx.beginPath();ctx.ellipse(0,0,13,9,-0.4,0,7);ctx.fillStyle=OR;ctx.shadowColor=OR;ctx.shadowBlur=12;ctx.fill();ctx.shadowBlur=0;ctx.beginPath();ctx.moveTo(11,-4);ctx.lineTo(11,-50);ctx.quadraticCurveTo(26,-40,30,-24);gs(4,OR);ctx.restore()}
function bigTxt(s,x,y,size,a,col=OR,glow=30){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;txt(s,x,y,`900 ${size}px M`,col,'center',glow);ctx.restore()}
function switchIcon(x,y,s,a,on){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);rr(-60,-30,120,60,30);ctx.fillStyle=on?'rgba(255,138,31,.6)':'rgba(40,30,24,.95)';ctx.fill();gs(3,LN);ctx.beginPath();ctx.arc(on?30:-30,0,22,0,7);ctx.fillStyle=WH;ctx.fill();ctx.restore()}
const PATS=Array.from({length:16},(_,i)=>[0,1,2,3].map(b=>((i>>b)&1)===0)); // Pingala starts with all-guru; true = guru (long)

// ---------- scenes ----------
function S0(t,lt){ // 3D chip; 2D tags
 [['phone','PHONE',220],['laptop','LAPTOP',540],['internet','INTERNET',860]].forEach(([e,l,x],i)=>monoTag(x,640,l,fin(t,e,0.4,-0.1+i*0.25)));
 badge(540,1255,'BINARY NUMBER SYSTEM',pop(t,'binary',0.45,0),{fs:28});
}
function S1(t,lt){ // Leibniz 1703
 const a=eo(seg(lt,0,0.5));leibnizBust(320,1000,1.15,pop(t,'leibniz',0.5,-1.2));monoTag(320,1160,'G. W. LEIBNIZ',fin(t,'leibniz',0.4,0));
 card(780,960,330,380,pop(t,'y1703',0.45,-0.3),'',null,t);const p=fin(t,'y1703',0.5,0);
 ['0','1','10','11','100','101'].forEach((s,i)=>bigTxt(s,780,820+i*52,40,cl(p*6-i),i%2?GOLD:WH,8));
 badge(540,640,'1703',pop(t,'y1703',0.45,0),{fs:34});
}
function S2(t,lt){ // 1900 years earlier: Pingala
 const tl=fin(t,'y1900',0.8,-0.3);ctx.save();ctx.globalAlpha*=tl;ctx.beginPath();ctx.moveTo(140,700);ctx.lineTo(lerp(140,940,tl),700);gs(4,LN);ctx.restore();
 monoTag(160,640,'~200 BCE',tl);monoTag(920,640,'1703 CE',tl);
 if(tl>0.5){ctx.save();ctx.globalAlpha*=cl((tl-0.5)*2);ctx.beginPath();ctx.moveTo(160,730);ctx.quadraticCurveTo(540,800,920,730);gs(3,OR,10);ctx.restore();bigTxt('~1900 SAAL',540,790,38,cl((tl-0.5)*2),GOLD,14)}
 sage(360,1020,1.0,pop(t,'bharat',0.5,-0.2));palmLeaf(790,1020,0.62,fin(t,'jaisa',0.5,0),t,2);monoTag(790,1100,'BINARY JAISA SYSTEM',fin(t,'jaisa',0.4,0.3));
 badge(540,1255,'ACHARYA PINGALA',pop(t,'pingala',0.45,0),{fs:30});
}
function S3(t,lt){ // no computer: why?
 const a=eo(seg(lt,0,0.5));sage(300,1000,1.0,a);chipIcon(780,860,1.3,pop(t,'computer',0.45,-0.1));cross(780,860,90,fin(t,'computer',0.4,0.4));
 const q=pop(t,'zaroorat',0.5,-0.3);if(q>0){ctx.save();ctx.translate(780,1120);ctx.scale(q,q);txt('?',0,0,'900 150px M',OR,'center',36);ctx.restore()}
}
function S4(t,lt){ // kavita, chhandahshastra
 const k=pop(t,'kavita',0.5,-0.1);bigTxt('KAVITA',540,720,96,cl(k));for(let i=0;i<5;i++){const ph=(t*0.4+i/5)%1;noteIcon(180+i*180,900-ph*120,1.1,cl(k)*Math.sin(ph*Math.PI))}
 palmLeaf(540,1040,1.2,fin(t,'chhand',0.5,-0.1),t,2);monoTag(540,1160,'CHHANDAHSHASTRA',fin(t,'chhand',0.4,0.2));
 const r=fin(t,'rhythm',0.5,-0.2);if(r>0){const pat=[0,1,0,0,1,1,0,1];pat.forEach((l,i)=>{const on=Math.floor(t*3)%8===i;beat(220+i*92,1240,l,0.5,r,on?1:0)})}
}
function S5(t,lt){ // laghu & guru
 const a=eo(seg(lt,0,0.5));const r=rng(3);for(let i=0;i<8;i++){const l=r()<0.5;beat(160+i*108,680,l,0.5,fin(t,'akshar',0.4,i*0.06))}monoTag(540,760,'HAR AKSHAR',fin(t,'akshar',0.4,0.3));
 const lp=pop(t,'laghu',0.45,-0.1),gp=pop(t,'guru',0.45,-0.1);
 card(290,1010,380,320,lp,'',null,t);if(lp>0){beat(290,970,false,1.6,cl(lp),0.6);bigTxt('LAGHU',290,1080,46,cl(lp),WH,10);monoTag(290,1135,'CHHOTA',cl(lp))}
 card(790,1010,380,320,gp,'',null,t);if(gp>0){beat(790,970,true,1.6,cl(gp),0.6);bigTxt('GURU',790,1080,46,cl(gp));monoTag(790,1135,'LAMBA',cl(gp))}
}
function S6(t,lt){ // ka vs kaa
 const k1=pop(t,'ka',0.45,-0.1),k2=pop(t,'kaa',0.45,-0.1);
 bigTxt('KA',300,820,120,cl(k1),WH,16);if(k1>0){const w=seg(t,E('ka'),E('ka')+0.25);ctx.save();ctx.globalAlpha*=cl(k1);rr(250,920,100*w,30,15);ctx.fillStyle=WH;ctx.fill();ctx.restore();monoTag(300,1010,'LAGHU · SHORT',fin(t,'laghu2',0.4,-0.1))}
 bigTxt('KAA',780,820,120,cl(k2));if(k2>0){const w=seg(t,E('kaa'),E('kaa')+0.8);ctx.save();ctx.globalAlpha*=cl(k2);rr(650,920,260*w,30,15);ctx.fillStyle=OR;ctx.shadowColor=OR;ctx.shadowBlur=16;ctx.fill();ctx.restore();monoTag(780,1010,'GURU · LONG',fin(t,'guru2',0.4,-0.1))}
 if(k1>0)for(let i=0;i<3;i++){const ph=(t*1.5+i/3)%1;ctx.save();ctx.globalAlpha*=cl(k1)*(1-ph)*0.6;ctx.beginPath();ctx.arc(300,820,80+ph*80,-0.5,0.5);gs(3,LN);ctx.restore()}
}
function S7(t,lt){ // two states, like 0/1
 const a=eo(seg(lt,0,0.5));beat(300,780,false,2.2,pop(t,'laghu3',0.45,-0.1),0.5);beat(780,780,true,2.2,pop(t,'guru3',0.45,-0.1),0.5);
 monoTag(300,870,'LAGHU',fin(t,'laghu3',0.4,0));monoTag(780,870,'GURU',fin(t,'guru3',0.4,0));
 const z=pop(t,'zero2',0.5,-0.2);bigTxt('0',300,1060,150,cl(z),WH,20);bigTxt('1',780,1060,150,cl(z));
 switchIcon(540,1060,1.0,cl(z),Math.sin(t*3)>0);monoTag(540,1200,'SIRF 2 STATES',fin(t,'zero2',0.4,0.3));
}
function S8(t,lt){ // 4 syllables: how many rhythms?
 const c=fin(t,'chaar',0.5,-0.2);for(let i=0;i<4;i++){const x=240+i*200;const fl=Math.floor(t*4+i*1.7)%2===0;slot(x,900,1.2,cl(c*4-i),c>0.9?fl:null)}
 monoTag(540,1010,'4 AKSHAR',c);const q=pop(t,'rhythm2',0.5,-0.2);if(q>0){ctx.save();ctx.translate(540,1150);ctx.scale(q,q);txt('KITNE?',0,0,'900 80px M',OR,'center',24);ctx.restore()}
 sage(540,700,0.55,fin(t,'kaviyon',0.4,-0.2)*0.8);
}
function S9(t,lt){ // 3D prastaar; 2D counter
 const n=Math.min(16,Math.floor(seg(t,E('patterns')-0.4,E('solah')-0.2)*16));monoTag(540,640,'PRASTAAR · '+n+' / 16',fin(t,'patterns',0.4,-0.4));
 badge(540,1255,'16 RHYTHM',pop(t,'solah',0.45,0),{fs:32});
}
function S10(t,lt){ // 2x2x2x2
 for(let i=0;i<4;i++){const x=200+i*227;const p=pop(t,'option',0.45,i*0.15);slot(x,800,0.9,cl(p),null);if(p>0){beat(x,778,false,0.6,cl(p));beat(x,822,true,0.6,cl(p))}bigTxt('2',x,920,64,fin(t,'guna',0.4,i*0.25),GOLD,12);if(i<3)bigTxt('×',x+113,920,48,fin(t,'guna',0.4,i*0.25+0.1),WH,6)}
 const s=pop(t,'solah2',0.5,-0.1);if(s>0){ctx.save();ctx.translate(540,1110);ctx.scale(s,s);txt('= 16',0,0,'900 120px M',OR,'center',36);ctx.restore()}
}
function S11(t,lt){ // 2^n
 const p=pop(t,'power',0.5,-0.8);if(p>0){ctx.save();ctx.translate(540,800);ctx.scale(p,p);txt('2',-30,0,'900 200px M',OR,'center',40);txt('n',60,-80,'900 100px M',GOLD,'center',20);ctx.restore()}
 const rows=[[1,2],[2,4],[3,8],[4,16],[5,32]];rows.forEach(([n,v],i)=>{const q=fin(t,'power',0.3,-0.6+i*0.2);ctx.save();ctx.globalAlpha*=q;txt(`n = ${n}`,380,1000+i*48,'500 30px J',WH,'left');txt(`→ ${v}`,600,1000+i*48,'800 32px M',n===4?OR:GOLD,'left');ctx.restore()});
}
function S12(t,lt){ // pattern <-> number
 const a=eo(seg(lt,0,0.5));const pat=PATS[10];pat.forEach((g,i)=>slot(230+i*130,820,0.85,a,g));
 const n=pop(t,'pnum',0.5,-0.3);card(540,1080,300,150,n,'',null,t);if(n>0)bigTxt('#11',540,1082,80,cl(n));
 arrow(420,900,470,1000,fin(t,'tareeka',0.5,0),OR,5);arrow(660,1000,710,900,fin(t,'pnum',0.5,0.6),OR,5);
 monoTag(220,1000,'PATTERN → NUMBER',fin(t,'tareeka',0.4,0.3));monoTag(860,1000,'NUMBER → PATTERN',fin(t,'pnum',0.4,0.8));
}
function S13(t,lt){ // decimal -> binary
 const d=pop(t,'decimal',0.5,-1.0);bigTxt('13',260,860,140,cl(d),WH,16);monoTag(260,980,'DECIMAL',cl(d));
 const st=[[13,1],[6,0],[3,1],[1,1]];st.forEach(([v,r],i)=>{const q=fin(t,'decimal',0.3,-0.5+i*0.35);ctx.save();ctx.globalAlpha*=q;txt(`${v} ÷ 2 → ${r}`,430,760+i*56,'500 32px J',WH,'left');ctx.restore()});
 const b=pop(t,'binary2',0.5,0.3);bigTxt('1101',760,1100,110,cl(b));monoTag(760,1200,'BINARY',cl(b));arrow(400,1000,560,1080,fin(t,'binary2',0.5,0),OR,5);
}
function S14(t,lt){ // 3D Meru prastaar; 2D tags
 monoTag(540,640,'10TH CENTURY · HALAYUDHA',fin(t,'halayudha',0.4,-0.6));
 badge(540,1255,"= PASCAL'S TRIANGLE",pop(t,'pascal',0.45,0),{fs:30});
}
function S15(t,lt){ // for poetry, not computers
 const a=eo(seg(lt,0,0.5));chipIcon(280,860,1.1,a);cross(280,860,80,fin(t,'nahi',0.4,0));monoTag(280,1000,'COMPUTER KE LIYE',a);
 palmLeaf(780,860,0.6,a,t,2);for(let i=0;i<3;i++){const ph=(t*0.5+i/3)%1;noteIcon(700+i*80,780-ph*80,0.9,a*Math.sin(ph*Math.PI))}check(780,1000,40,fin(t,'kavita2',0.6,0));monoTag(780,1080,'KAVITA KE LIYE',fin(t,'kavita2',0.4,0));
 badge(540,1255,'RHYTHM KO SAMAJHNE KE LIYE',pop(t,'kavita2',0.45,0.6),{fs:24});
}
function S16(t,lt){ // laghu/guru -> 0/1 powering the digital world
 const m=eio(seg(t,E('digital')-2.4,E('digital')-0.4));const r=rng(7);
 for(let i=0;i<14;i++){const l=r()<0.5;const x0=120+i*65,y0=700,x1=540+Math.cos(i)*240,y1=1000+Math.sin(i*1.7)*130;const x=lerp(x0,x1,m),y=lerp(y0,y1,m);
  if(m<0.5)beat(x,y,l,0.45,1-m*2);else bigTxt(l?'1':'0',x,y,44,(m-0.5)*2,l?OR:WH,12)}
 const p=pop(t,'duniya',0.5,-0.2);phone(540,1000,170,300,cl(p)*0.9,()=>{ctx.fillStyle='rgba(255,138,31,.2)';ctx.fillRect(-90,-160,180,320);const rr2=rng(Math.floor(t*6));for(let k=0;k<30;k++)txt(rr2()<0.5?'0':'1',-70+(k%6)*28,-130+Math.floor(k/6)*50,'700 22px J',GOLD)});
 monoTag(540,1200,'LAGHU · GURU = 0 · 1',fin(t,'digital',0.4,0));
}
function S17(t,lt){ // comment
 const a=eo(seg(lt,0,0.5));sage(540,1000,1.0,a);speech(780,720,1.1,pop(t,'comments',0.45,-0.6),true,t);badge(540,1255,'COMMENTS MEIN BATAO',pop(t,'comments',0.45,0),{fs:30});
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
