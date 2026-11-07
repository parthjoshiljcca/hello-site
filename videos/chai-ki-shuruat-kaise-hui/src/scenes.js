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
 {pill:'01 · CHAI',title:'Har Din <em>Chai</em>',sub:'Subah se shaam tak',tag:'CRORES · CUPS'},
 {pill:'02 · TWIST',title:'Pehle <em>Nahi</em> Peete The',sub:'Lagbhag 100 saal pehle tak',tag:'THE · WHY'},
 {pill:'03 · CHINA',title:'<em>China</em> Se Shuruat',sub:'Legend: Emperor Shen Nong',tag:'LEGEND'},
 {pill:'04 · ENGLAND',title:'British <em>Deewane</em>',sub:'Chai ka craze',tag:'ENGLAND'},
 {pill:'05 · PROBLEM',title:'Chai Ke Badle <em>Chaandi</em>',sub:'Sirf China bechta tha',tag:'TRADE · PROBLEM'},
 {pill:'06 · 1823',title:'<em>Assam</em> Ki Jungli Chai',sub:'Robert Bruce · Singpho log',tag:'ASSAM · 1823'},
 {pill:'07 · GARDENS',title:'Tea <em>Gardens</em>',sub:'Assam · Darjeeling → London',tag:'1839 · LONDON'},
 {pill:'08 · EXPORT',title:'Indians Ke Liye <em>Nahi</em>',sub:'Zyadatar chai bahar jaati thi',tag:'EXPORT'},
 {pill:'09 · CAMPAIGN',title:'Chai Ka <em>Campaign</em>',sub:'Indian Tea Association',tag:'20TH · CENTURY'},
 {pill:'10 · HAR JAGAH',title:'<em>Chai</em> Har Jagah',sub:'Railway · Factory · Bazaar',tag:'CHAI SIKHAO'},
 {pill:'11 · DESI TWIST',title:'<em>Masala</em> Chai',sub:'Doodh · Cheeni · Adrak · Elaichi',tag:'APNA TAREEKA'},
 {pill:'12 · MAZE KI BAAT',title:'Patti <em>Kam</em> Lagi!',sub:'British ko pasand nahi aaya',tag:'FUN · FACT'},
 {pill:'13 · AAJ',title:'Chai = <em>Emotion</em>',sub:'Duniya ke top producers mein',tag:'THE · WHY'},
];
const HL=['chai','india','crores','sau','nahi','china','legend','emperor','pehli','england','deewane','chaandi','source','1823','assam','jungli','singpho','gardens','darjeeling','1839','london','export','20th','campaign','railway','factories','bazaaron','doodh','cheeni','adrak','elaichi','kam','emotion','aadat','kahan'];
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


// ---------- chai primitives (line art: warm-white strokes, orange glow) ----------
const LN='rgba(243,236,228,.92)',DARK='rgba(18,12,9,.96)',TEA='#b5561c',MILKY='#d98a4a';
function steam(x,y,s,t,a,n=3,h=110){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.lineCap='round';
 for(let i=0;i<n;i++){const ox=(i-(n-1)/2)*26*s;ctx.beginPath();for(let k=0;k<=20;k++){const u=k/20;const yy=y-u*h*s;const xx=x+ox+Math.sin(u*6+t*3+i*2)*10*s*u;k?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy)}
  ctx.globalAlpha=a*(0.55+0.25*Math.sin(t*2+i));gs(4*s,'rgba(255,190,140,.75)',14)}ctx.restore()}
function kulhad(x,y,s,a,t,opt={}){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);
 ctx.beginPath();ctx.moveTo(-62,-60);ctx.lineTo(62,-60);ctx.lineTo(44,70);ctx.quadraticCurveTo(0,82,-44,70);ctx.closePath();ctx.fillStyle='rgba(60,28,12,.95)';ctx.fill();gs(5,LN);
 ctx.beginPath();ctx.ellipse(0,-60,62,14,0,0,7);ctx.fillStyle=opt.liquid||TEA;ctx.fill();gs(4,LN);
 ctx.beginPath();ctx.ellipse(0,-58,48,9,0,0,7);ctx.fillStyle='rgba(255,170,90,.35)';ctx.fill();
 ctx.beginPath();ctx.moveTo(-50,-20);ctx.lineTo(50,-20);gs(2.5,'rgba(255,138,31,.6)');ctx.restore();
 if(opt.steam!==false)steam(x,y-70*s,s,t,a)}
function teacup(x,y,s,a,t){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);
 ctx.beginPath();ctx.ellipse(0,58,110,18,0,0,7);ctx.fillStyle=DARK;ctx.fill();gs(4,LN);
 ctx.beginPath();ctx.moveTo(-75,-30);ctx.quadraticCurveTo(-72,55,0,55);ctx.quadraticCurveTo(72,55,75,-30);ctx.closePath();ctx.fillStyle=DARK;ctx.fill();gs(5,LN);
 ctx.beginPath();ctx.ellipse(0,-30,75,14,0,0,7);ctx.fillStyle=TEA;ctx.fill();gs(4,LN);
 ctx.beginPath();ctx.ellipse(92,5,22,26,0,-1.6,1.6);gs(5,LN);ctx.beginPath();ctx.moveTo(-60,10);ctx.lineTo(60,10);gs(2.5,'rgba(255,138,31,.6)');ctx.restore();steam(x,y-48*s,s*0.9,t,a)}
function teapot(x,y,s,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);
 ctx.beginPath();ctx.moveTo(-90,10);ctx.bezierCurveTo(-90,-80,90,-80,90,10);ctx.bezierCurveTo(90,70,-90,70,-90,10);ctx.fillStyle=DARK;ctx.fill();gs(5,LN);
 ctx.beginPath();ctx.moveTo(80,0);ctx.quadraticCurveTo(150,-10,165,-60);ctx.lineTo(150,-62);ctx.quadraticCurveTo(140,-20,85,25);gs(5,LN);
 ctx.beginPath();ctx.moveTo(-85,-20);ctx.bezierCurveTo(-150,-30,-150,50,-80,40);gs(5,LN);
 ctx.beginPath();ctx.ellipse(0,-58,40,10,0,0,7);gs(4,LN);ctx.beginPath();ctx.arc(0,-74,9,0,7);ctx.fillStyle=OR;ctx.fill();
 ctx.beginPath();ctx.moveTo(-80,12);ctx.lineTo(80,12);gs(3,'rgba(255,138,31,.7)',10);ctx.restore()}
function flame(x,y,s,t,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);
 for(let i=-2;i<=2;i++){const h=40+12*Math.sin(t*9+i*1.7);ctx.beginPath();ctx.moveTo(i*22-10,0);ctx.quadraticCurveTo(i*22-6,-h*0.6,i*22,-h);ctx.quadraticCurveTo(i*22+6,-h*0.6,i*22+10,0);ctx.closePath();
  ctx.fillStyle=i%2?'rgba(255,177,92,.9)':'rgba(255,110,20,.9)';ctx.shadowColor=OR;ctx.shadowBlur=24;ctx.fill()}ctx.shadowBlur=0;
 ctx.beginPath();ctx.moveTo(-90,4);ctx.lineTo(90,4);gs(5,LN);ctx.restore()}
function patila(x,y,s,a,t,liquid,boil){if(a<=0)return;flame(x,y+95*s,s,t,a);ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);
 rr(-120,-40,240,120,18);ctx.fillStyle=DARK;ctx.fill();gs(5,LN);
 ctx.beginPath();ctx.ellipse(0,-40,120,22,0,0,7);ctx.fillStyle=liquid||TEA;ctx.fill();gs(5,LN);
 ctx.beginPath();ctx.moveTo(120,-20);ctx.lineTo(210,-30);gs(7,LN);
 if(boil>0){const r=rng(5);for(let i=0;i<14;i++){const ph=(t*1.6+r())%1;const bx=-90+r()*180,by=-40+Math.sin(r()*6)*10;ctx.globalAlpha=a*boil*(1-ph);ctx.beginPath();ctx.arc(bx,by-ph*10,3+6*ph,0,7);ctx.strokeStyle='rgba(255,230,200,.9)';ctx.lineWidth=2;ctx.stroke()}}
 ctx.restore();if(boil>0)steam(x,y-60*s,s*1.2,t,a*boil,4,130)}
function leaf(x,y,s,rot,a,col=OR){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.rotate(rot);ctx.scale(s,s);
 ctx.beginPath();ctx.moveTo(-30,0);ctx.quadraticCurveTo(0,-20,30,0);ctx.quadraticCurveTo(0,20,-30,0);ctx.fillStyle='rgba(255,138,31,.25)';ctx.fill();gs(3,col,10);
 ctx.beginPath();ctx.moveTo(-26,0);ctx.lineTo(26,0);gs(1.5,'rgba(255,220,180,.8)');ctx.restore()}
function plant(x,y,s,p,t){if(p<=0)return;ctx.save();ctx.translate(x,y);ctx.scale(s,s);
 drawOn(()=>{ctx.moveTo(0,0);ctx.bezierCurveTo(-10,-90,15,-170,0,-260)},p,6,LN);
 const br=[[-0.25,-70,-1],[0.35,-120,1],[0.5,-160,-1],[0.65,-200,1],[0.8,-235,-1]];
 br.forEach(([q,yy,d],i)=>{const k=cl((p-q*0.8)/0.25);if(k<=0)return;const bx=d*70*eo(k);ctx.beginPath();ctx.moveTo(0,yy);ctx.quadraticCurveTo(d*30,yy-20,bx,yy-35*eo(k));gs(4,LN);
  leaf(bx+d*24,yy-40,1.1*back(k),d*-0.5+Math.sin(t*2+i)*0.08,1);leaf(bx*0.5,yy-12,0.8*back(k),d*0.6,0.9)});
 if(p>0.95)leaf(0,-282,1.2*back(cl((p-0.95)*20)),-1.57,1);ctx.restore()}
function coin(x,y,r,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;const g=ctx.createRadialGradient(x-r*.3,y-r*.3,1,x,y,r);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#9aa0a6');
 ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fillStyle=g;ctx.shadowColor='rgba(255,255,255,.5)';ctx.shadowBlur=12;ctx.fill();ctx.shadowBlur=0;ctx.beginPath();ctx.arc(x,y,r*0.72,0,7);ctx.strokeStyle='rgba(80,85,90,.7)';ctx.lineWidth=2;ctx.stroke();ctx.restore()}
function crate(x,y,s,a,label){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);rr(-80,-60,160,120,8);ctx.fillStyle='rgba(40,24,14,.96)';ctx.fill();gs(4,LN);
 ctx.beginPath();ctx.moveTo(-80,-20);ctx.lineTo(80,-20);ctx.moveTo(-80,20);ctx.lineTo(80,20);gs(2,'rgba(243,236,228,.4)');if(label)txt(label,0,1,'800 26px M',OR,'center',8);ctx.restore()}
function hills(y,a,rows,t){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;const H=[[y,0.0035,60,'rgba(255,138,31,.10)'],[y+70,0.005,45,'rgba(255,138,31,.16)']];
 H.forEach(([yy,f,amp,fill],k)=>{ctx.beginPath();ctx.moveTo(0,1300);for(let x=0;x<=1080;x+=10)ctx.lineTo(x,yy-Math.sin(x*f+k*2)*amp);ctx.lineTo(1080,1300);ctx.closePath();ctx.fillStyle=fill;ctx.fill();
  ctx.beginPath();for(let x=0;x<=1080;x+=10){const yy2=yy-Math.sin(x*f+k*2)*amp;x?ctx.lineTo(x,yy2):ctx.moveTo(x,yy2)}gs(3,'rgba(243,236,228,.75)');
  if(rows>0){ctx.save();ctx.beginPath();ctx.moveTo(0,1300);for(let x=0;x<=1080;x+=10)ctx.lineTo(x,yy-Math.sin(x*f+k*2)*amp);ctx.lineTo(1080,1300);ctx.closePath();ctx.clip();
   for(let r=0;r<9;r++){const ry=yy-40+r*34;ctx.beginPath();for(let x=0;x<=1080*rows;x+=12){const yy3=ry+Math.sin(x*0.02+r)*6;x?ctx.lineTo(x,yy3):ctx.moveTo(x,yy3)}ctx.setLineDash([14,10]);gs(6,'rgba(255,138,31,.55)',6);ctx.setLineDash([])}ctx.restore()}});ctx.restore()}
function ship(x,y,s,a,t){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y+Math.sin(t*2.4)*4);ctx.scale(s,s);
 ctx.beginPath();ctx.moveTo(-110,0);ctx.lineTo(110,0);ctx.lineTo(80,40);ctx.lineTo(-80,40);ctx.closePath();ctx.fillStyle=DARK;ctx.fill();gs(5,LN);
 ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-140);gs(4,LN);ctx.beginPath();ctx.moveTo(6,-130);ctx.quadraticCurveTo(80,-80,6,-20);ctx.closePath();ctx.fillStyle='rgba(255,138,31,.18)';ctx.fill();gs(3,OR,10);
 ctx.beginPath();ctx.moveTo(-6,-110);ctx.quadraticCurveTo(-60,-70,-6,-25);ctx.closePath();ctx.fillStyle='rgba(243,236,228,.08)';ctx.fill();gs(3,LN);crate(-55,-14,0.18,1);crate(55,-14,0.18,1);ctx.restore()}
function train(x,y,s,a,t){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);
 rr(-110,-60,90,70,8);ctx.fillStyle=DARK;ctx.fill();gs(4,LN);rr(-20,-40,120,50,6);ctx.fill();gs(4,LN);rr(70,-80,22,42,4);gs(4,LN);
 for(const wx of[-85,-40,10,60])ctx.beginPath(),ctx.arc(wx,20,14,0,7),ctx.fillStyle=DARK,ctx.fill(),gs(4,OR,8);
 ctx.beginPath();ctx.moveTo(-130,36);ctx.lineTo(130,36);gs(3,LN);rr(-95,-48,30,24,4);ctx.fillStyle='rgba(255,177,92,.5)';ctx.fill();
 const r=rng(8);for(let i=0;i<4;i++){const ph=(t*0.8+i/4)%1;ctx.globalAlpha=a*(1-ph)*0.7;ctx.beginPath();ctx.arc(81-ph*40,-90-ph*70,8+ph*18,0,7);gs(3,'rgba(243,236,228,.7)')}ctx.restore()}
function factory(x,y,s,a,t){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);
 ctx.beginPath();ctx.moveTo(-100,40);ctx.lineTo(-100,-20);for(let i=0;i<3;i++){ctx.lineTo(-100+i*55+55,-55);ctx.lineTo(-100+i*55+55,-20)}ctx.lineTo(100,-20);ctx.lineTo(100,40);ctx.closePath();ctx.fillStyle=DARK;ctx.fill();gs(4,LN);
 rr(60,-110,22,70,3);ctx.fill();gs(4,LN);for(let i=0;i<4;i++){rr(-80+i*42,0,24,20,3);ctx.fillStyle='rgba(255,177,92,.5)';ctx.fill()}
 for(let i=0;i<3;i++){const ph=(t*0.6+i/3)%1;ctx.globalAlpha=a*(1-ph)*0.6;ctx.beginPath();ctx.arc(71+ph*20,-120-ph*60,8+ph*14,0,7);gs(3,'rgba(243,236,228,.7)')}ctx.restore()}
function stall(x,y,s,a,t){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);
 for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(-105+i*35,-70);ctx.lineTo(-70+i*35,-70);ctx.lineTo(-70+i*35,-40);ctx.quadraticCurveTo(-87+i*35,-28,-105+i*35,-40);ctx.closePath();ctx.fillStyle=i%2?'rgba(255,138,31,.75)':'rgba(243,236,228,.85)';ctx.fill()}
 ctx.beginPath();ctx.moveTo(-100,-40);ctx.lineTo(-100,40);ctx.moveTo(100,-40);ctx.lineTo(100,40);gs(4,LN);rr(-110,10,220,30,4);ctx.fillStyle=DARK;ctx.fill();gs(4,LN);
 kulhad(-40,-4,0.18,1,t,{steam:false});kulhad(0,-4,0.18,1,t,{steam:false});kulhad(40,-4,0.18,1,t,{steam:false});ctx.restore()}
function kettlePour(x,y,s,a,p,t){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);
 ctx.save();ctx.translate(-70,-90);ctx.rotate(0.5*eo(cl(p*2)));ctx.beginPath();ctx.ellipse(0,0,60,48,0,0,7);ctx.fillStyle=DARK;ctx.fill();gs(5,LN);
 ctx.beginPath();ctx.moveTo(52,-10);ctx.lineTo(98,-34);gs(8,LN);ctx.beginPath();ctx.arc(-20,-50,30,Math.PI,0);gs(5,LN);ctx.restore();
 if(p>0.35){const k=cl((p-0.35)*3);ctx.beginPath();ctx.moveTo(4,-108);ctx.quadraticCurveTo(30,-60,40,-40+40*k);gs(6,TEA,10)}ctx.restore();kulhad(x+40*s,y+40*s,0.7*s,a,t,{steam:p>0.8})}
function heart(x,y,s,a,fill){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);ctx.beginPath();ctx.moveTo(0,30);ctx.bezierCurveTo(-60,-10,-30,-60,0,-28);ctx.bezierCurveTo(30,-60,60,-10,0,30);
 if(fill){ctx.fillStyle=fill;ctx.shadowColor=OR;ctx.shadowBlur=20;ctx.fill();ctx.shadowBlur=0}gs(4,OR,14);ctx.restore()}
function sun(x,y,r,a,t){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fillStyle='rgba(255,138,31,.3)';ctx.fill();gs(4,OR,20);
 ctx.rotate(t*0.4);for(let i=0;i<10;i++){ctx.rotate(Math.PI/5);ctx.beginPath();ctx.moveTo(r+10,0);ctx.lineTo(r+28,0);gs(4,'#ffb15c',10)}ctx.restore()}
function moon(x,y,r,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.beginPath();ctx.arc(x,y,r,-1.2,2.4,false);ctx.arc(x+r*0.45,y-r*0.25,r*0.8,2.0,-0.9,true);ctx.closePath();ctx.fillStyle='rgba(243,236,228,.18)';ctx.fill();gs(4,LN,14);
 star(x+70,y-40,10,1);star(x-60,y+50,7,0.8);ctx.restore()}
function crown(x,y,s,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);ctx.beginPath();ctx.moveTo(-50,20);ctx.lineTo(-50,-20);ctx.lineTo(-25,5);ctx.lineTo(0,-30);ctx.lineTo(25,5);ctx.lineTo(50,-20);ctx.lineTo(50,20);ctx.closePath();
 ctx.fillStyle='rgba(255,138,31,.35)';ctx.fill();gs(4,OR,14);ctx.restore()}
function megaphone(x,y,s,a,t){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);ctx.rotate(-0.2);
 ctx.beginPath();ctx.moveTo(-60,-18);ctx.lineTo(40,-60);ctx.lineTo(40,60);ctx.lineTo(-60,18);ctx.closePath();ctx.fillStyle=DARK;ctx.fill();gs(5,LN);rr(-90,-20,32,40,6);ctx.fill();gs(5,LN);
 for(let i=0;i<3;i++){const ph=(t*1.5+i/3)%1;ctx.globalAlpha=a*(1-ph);ctx.beginPath();ctx.arc(40,0,30+ph*90,-0.6,0.6);gs(4,OR,12)}ctx.restore()}
// ingredients
function milk(x,y,s,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);ctx.beginPath();ctx.moveTo(-28,-20);ctx.lineTo(-18,-50);ctx.lineTo(18,-50);ctx.lineTo(28,-20);ctx.lineTo(28,55);ctx.lineTo(-28,55);ctx.closePath();
 ctx.fillStyle='rgba(243,236,228,.85)';ctx.fill();gs(4,LN);rr(-18,-62,36,14,4);ctx.fillStyle=OR;ctx.fill();txt('DOODH',0,18,'800 13px M','#2a1a10');ctx.restore()}
function sugar(x,y,s,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);for(const[cx,cy]of[[-22,10],[22,10],[0,-28]]){rr(cx-20,cy-20,40,40,6);ctx.fillStyle='rgba(243,236,228,.92)';ctx.fill();gs(3,'rgba(255,177,92,.9)',8)}ctx.restore()}
function ginger(x,y,s,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);ctx.beginPath();ctx.moveTo(-50,10);ctx.quadraticCurveTo(-45,-25,-15,-15);ctx.quadraticCurveTo(-10,-50,15,-35);ctx.quadraticCurveTo(30,-60,45,-30);ctx.quadraticCurveTo(60,0,35,15);ctx.quadraticCurveTo(10,35,-20,25);ctx.quadraticCurveTo(-50,35,-50,10);
 ctx.fillStyle='rgba(214,160,90,.85)';ctx.fill();gs(3,'#ffb15c',8);ctx.beginPath();ctx.moveTo(-30,5);ctx.lineTo(-20,10);ctx.moveTo(5,-5);ctx.lineTo(15,0);gs(2,'rgba(90,50,20,.8)');ctx.restore()}
function elaichi(x,y,s,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);for(const[ox,r]of[[-18,-0.4],[18,0.5]]){ctx.save();ctx.translate(ox,0);ctx.rotate(r);ctx.beginPath();ctx.ellipse(0,0,14,30,0,0,7);ctx.fillStyle='rgba(150,190,90,.85)';ctx.fill();gs(3,'#d8f0a0',8);ctx.beginPath();ctx.moveTo(0,-26);ctx.lineTo(0,26);gs(1.5,'rgba(40,70,20,.8)');ctx.restore()}ctx.restore()}
function flyIn(t,ev,x0,y0,x1,y1,draw){const p=seg(t,E(ev)-0.1,E(ev)+0.65);if(p<=0)return;const e=eio(p);const x=lerp(x0,x1,e),y=lerp(y0,y1,e)-Math.sin(e*Math.PI)*90;const a=p<0.85?1:1-(p-0.85)/0.15;draw(x,y,lerp(1,0.6,e),a)}
function splash(x,y,t,ev){const p=seg(t,E(ev)+0.5,E(ev)+1.0);if(p<=0||p>=1)return;ctx.save();ctx.globalAlpha=(1-p);for(let i=0;i<8;i++){const an=-Math.PI*(0.1+0.8*i/7);ctx.beginPath();ctx.arc(x+Math.cos(an)*60*p,y+Math.sin(an)*60*p,5,0,7);ctx.fillStyle='#ffb15c';ctx.fill()}ctx.restore()}

// ---------- scenes ----------
function S0(t,lt){ // har din chai
 const a=eo(seg(lt,0,0.6));kulhad(540,980,1.7,a,t);
 sun(220,700,46,pop(t,'subah'),t);moon(860,700,44,pop(t,'shaam'));
 const n=10;for(let i=0;i<n;i++){const an=i/n*Math.PI*2-Math.PI/2;const p=back(seg(t,E('crores')-0.1+i*0.05,E('crores')+0.35+i*0.05));kulhad(540+Math.cos(an)*330,990+Math.sin(an)*230,0.42*p,cl(p),t,{steam:i%2==0})}
 badge(540,1240,'CRORES CUPS / DIN',pop(t,'crores',0.5,0.4),{fs:30});
}
function S1(t,lt){ // 100 saal pehle nahi
 const s2=fin(t,'kahan',0.5,-0.3);
 if(s2<1){ctx.save();ctx.globalAlpha*=1-s2;
  clock(540,800,120,-t*4,eo(seg(lt,0,0.5)));badge(540,615,'~100 SAAL PEHLE',pop(t,'sau'),{fs:28});
  for(let i=0;i<5;i++){const x=220+i*160;const p=pop(t,'indians1',0.4,-0.1+i*0.06);stickman(x,1180,1.6,cl(p*1.4));kulhad(x+40,1130,0.22*cl(p),cl(p),t,{steam:false});cross(x+40,1125,26,fin(t,'nahi1',0.35,i*0.05))}
  ctx.restore()}
 if(s2>0){const q=back(seg(t,E('kahan')-0.3,E('kahan')+0.2));ctx.save();ctx.translate(540,900);ctx.scale(q,q);txt('?',0,0,'900 260px M',OR,'center',40);ctx.restore();
  for(let i=0;i<6;i++){const an=i/6*Math.PI*2+t*0.7;leaf(540+Math.cos(an)*250,900+Math.sin(an)*170,1.1,an+1.5,s2*0.9)}
  const h=pop(t,'aadat');if(h>0){ctx.save();ctx.globalAlpha=cl(h);ctx.beginPath();ctx.arc(540,900,330,-0.3+t,1.8+t);gs(5,OR,14);ctx.beginPath();ctx.arc(540,900,330,2.8+t,4.9+t);gs(5,OR,14);ctx.restore();badge(540,1240,'AADAT KAISE BANI?',h,{fs:28})}}
}
function S2(t,lt){ // china legend
 const m=fin(t,'china',0.9,-0.2);
 drawOn(()=>{ctx.moveTo(60,800);ctx.lineTo(220,640);ctx.lineTo(330,760);ctx.lineTo(470,600);ctx.lineTo(620,780);ctx.lineTo(760,650);ctx.lineTo(1020,800)},m,4,'rgba(243,236,228,.55)');
 monoTag(840,600,'CHINA',fin(t,'china',0.4,0.2));badge(260,600,'LEGEND',pop(t,'legend'),{fs:26});
 const em=pop(t,'emperor');bust(300,1010,1.0,cl(em),true);crown(300,880,0.9*cl(em),cl(em));monoTag(300,1160,'SHEN NONG',fin(t,'emperor',0.4,0.3));
 const pb=fin(t,'ubalte',0.5,-0.2);const tea=fin(t,'pehli',0.6,-0.1);
 patila(720,1020,0.9,pb,t,tea>0?`rgba(${Math.round(lerp(200,181,tea))},${Math.round(lerp(210,86,tea))},${Math.round(lerp(220,28,tea))},.95)`:'rgba(200,210,220,.55)',pb);
 for(let i=0;i<5;i++){const p=seg(t,E('pattiyan')-0.2+i*0.12,E('pattiyan')+0.9+i*0.12);if(p<=0||p>=1)continue;const x=650+i*30+Math.sin(p*8+i)*40,y=lerp(640,960,eio(p));leaf(x,y,1,p*6+i,1-cl((p-0.85)*7))}
 badge(720,1230,'PEHLI CHAI',pop(t,'pehli',0.45,0.3),{fs:28});
}
function S3(t,lt){ // england
 const a=eo(seg(lt,0,0.6));teapot(330,960,1.2,a);teacup(760,1010,1.15,fin(t,'england',0.5,-0.2),t);
 monoTag(540,640,'ENGLAND · 17TH CENTURY',fin(t,'england',0.4,0));
 const d=seg(t,E('deewane')-0.1,E('deewane')+3);if(d>0){const r=rng(4);for(let i=0;i<9;i++){const ph=(d*1.6+r())%1;heart(200+r()*680,1150-ph*450,0.5+r()*0.5,(1-ph)*cl(d*4),'rgba(255,138,31,.45)')}}
}
function S4(t,lt){ // china sells for silver
 const a=eo(seg(lt,0,0.5));crate(240,930,1.2,a,'CHINA TEA');monoTag(240,1060,'CHINA',a);
 bust(840,950,0.9,a,false);monoTag(840,1100,'BRITAIN',a);
 arrow(350,880,720,880,fin(t,'bechta',0.6,-0.1),OR,5);
 const c=seg(t,E('chaandi')-0.2,E('chaandi')+2.2);if(c>0){for(let i=0;i<10;i++){const ph=((c*1.3+i/10)%1);const x=lerp(740,340,ph),y=1000+Math.sin(ph*Math.PI)*-60+ (i%3)*10;coin(x,y,18,cl(c*5)*(ph<0.9?1:(1-ph)*10))}monoTag(540,1100,'CHAANDI',cl(c*4))}
 const s=pop(t,'source',0.5,-0.2);if(s>0){ctx.save();ctx.globalAlpha=cl(s);ctx.translate(540,700);ctx.scale(s,s);ctx.beginPath();ctx.arc(0,0,55,0,7);gs(6,OR,16);ctx.beginPath();ctx.moveTo(40,40);ctx.lineTo(85,85);gs(9,OR,10);leaf(0,0,1.2,-0.6,1);ctx.restore();badge(540,1240,'APNA TEA SOURCE?',s,{fs:28})}
}
function S5(t,lt){ // assam 1823
 hills(1060,eo(seg(lt,0,0.8)),0,t);badge(540,610,'1823',pop(t,'y1823'),{fs:32});
 const br=pop(t,'bruce');stickman(230,1130,1.7,cl(br));if(br>0){ctx.save();ctx.globalAlpha=cl(br);ctx.beginPath();ctx.ellipse(230,1012,30,7,0,0,7);gs(4,LN);rr(212,994,36,18,6);gs(4,LN);ctx.restore()}monoTag(230,1180,'ROBERT BRUCE',fin(t,'bruce',0.4,0.3));
 monoTag(540,700,'ASSAM',fin(t,'assam',0.4,0));
 plant(540,1120,1.25,fin(t,'jungli',1.4,-0.3),t);
 for(let i=0;i<2;i++){const p=pop(t,'singpho',0.4,i*0.12);stickman(800+i*120,1130,1.6,cl(p));kulhad(800+i*120+38,1080,0.2*cl(p),cl(p),t,{steam:true})}monoTag(860,1180,'SINGPHO LOG',fin(t,'singpho',0.4,0.3));
}
function S6(t,lt){ // gardens -> london
 const g=fin(t,'gardens',1.2,-0.3);hills(980,eo(seg(lt,0,0.6)),g,t);
 monoTag(250,700,'ASSAM',fin(t,'gardens',0.4,0.2));monoTag(800,700,'DARJEELING',fin(t,'darjeeling',0.4,0));
 const s=seg(t,E('y1839')-0.2,E('london')+0.6);ship(lerp(150,860,eio(s)),1180,0.9,cl(s*6),t);
 badge(540,620,'1839',pop(t,'y1839'),{fs:30});monoTag(900,1060,'→ LONDON',fin(t,'london',0.4,0));
}
function S7(t,lt){ // export
 const a=eo(seg(lt,0,0.5));stickman(250,1150,2.0,a);kulhad(310,1060,0.3*a,a,t,{steam:false});cross(310,1055,40,fin(t,'indians2',0.4,0.2));monoTag(250,1210,'INDIANS',a);
 const e=seg(t,E('export')-0.2,E('export')+2.4);
 for(let i=0;i<6;i++){const ph=cl(e*1.4-i*0.12);const x=lerp(520,1180,eio(ph)),y=880+(i%2)*130;crate(x,y,0.6,cl(e*6)*(1-cl((x-1000)/150)),'CHAI')}
 arrow(480,1100,960,1100,fin(t,'export',0.6,-0.1),OR,6);badge(720,1220,'EXPORT',pop(t,'export',0.45,0.1),{fs:30});
}
function S8(t,lt){ // ITA campaign
 badge(540,620,'20TH CENTURY',pop(t,'c20'),{fs:28});
 card(540,780,640,100,pop(t,'ita',0.5,-0.2),'Indian Tea Association',(k)=>{leaf(0,0,0.9,-0.6,1)},t);
 const c=pop(t,'campaign');megaphone(330,1050,1.4,cl(c),t);
 if(c>0){ctx.save();ctx.globalAlpha=cl(c);ctx.translate(760,1040);ctx.rotate(0.04);ctx.scale(c,c);rr(-150,-140,300,280,14);ctx.fillStyle='rgba(30,18,10,.95)';ctx.fill();gs(4,LN);
  txt('CHAI',0,-80,'900 64px M',OR,'center',16);txt('PIYO!',0,-15,'900 52px M',WH);kulhad(0,75,0.45,1,t);ctx.restore()}
}
function S9(t,lt){ // railway, factories, bazaar + teach
 const it=[['railway',220,'RAILWAY',train],['factories',540,'FACTORY',factory],['bazaar',860,'BAZAAR',stall]];
 it.forEach(([e,x,l,fn])=>{const p=pop(t,e,0.5,-0.15);card(x,780,280,250,p,'',null,t);if(p>0){ctx.save();ctx.globalAlpha=cl(p);fn(x,770,0.9*cl(p),1,t);ctx.restore()}monoTag(x,945,l,fin(t,e,0.4,0.2))});
 const k=fin(t,'sikhaya',0.4,-0.2);kettlePour(540,1170,1.0,k,seg(t,E('sikhaya'),E('sikhaya')+1.6),t);
}
function S10(t,lt){ // masala chai
 const ing=['doodh','cheeni','adrak','elaichi'];const done=ing.filter(e=>t>E(e)+0.55).length;
 const milky=fin(t,'doodh',0.8,0.5);const liq=`rgb(${Math.round(lerp(181,217,milky))},${Math.round(lerp(86,138,milky))},${Math.round(lerp(28,74,milky))})`;
 patila(540,1040,1.2,eo(seg(lt,0,0.5)),t,liq,1);
 flyIn(t,'doodh',150,700,500,980,(x,y,s,a)=>milk(x,y,1.3*s,a));flyIn(t,'cheeni',930,700,580,980,(x,y,s,a)=>sugar(x,y,1.2*s,a));
 flyIn(t,'adrak',150,800,520,990,(x,y,s,a)=>ginger(x,y,1.2*s,a));flyIn(t,'elaichi',930,800,560,990,(x,y,s,a)=>elaichi(x,y,1.3*s,a));
 ing.forEach(e=>splash(540,1000,t,e));
 const lab=[['doodh','DOODH',190],['cheeni','CHEENI',415],['adrak','ADRAK',665],['elaichi','ELAICHI',890]];lab.forEach(([e,l,x])=>monoTag(x,640,l,fin(t,e,0.3,0.1)));
 badge(540,1250,'MASALA CHAI',done>=4?pop(t,'elaichi',0.5,0.7):0,{fs:30});
}
function S11(t,lt){ // british not happy: less patti
 const a=eo(seg(lt,0,0.5));for(let i=0;i<10;i++){const r=rng(i+40);star(100+r()*880,640+r()*120,6+r()*8,fin(t,'maze',0.4,0)*(0.5+0.5*Math.sin(t*4+i)))}
 teacup(300,1060,0.95,a,t);monoTag(300,1190,'BRITISH',a);kulhad(780,1060,1.0,a,t,{liquid:MILKY});monoTag(780,1190,'INDIAN',a);
 for(let i=0;i<6;i++)leaf(210+(i%3)*90,820+Math.floor(i/3)*60,0.9,0.4*i,fin(t,'pasand',0.4,-0.6+i*0.06));
 for(let i=0;i<2;i++)leaf(735+i*90,850,0.9,0.5*i,fin(t,'pasand',0.4,-0.3+i*0.08));
 const k=pop(t,'kam');badge(780,740,'KAM CHAI PATTI',k,{fs:26});if(k>0)arrow(780,790,780,860,fin(t,'kam',0.4,0.1),OR,5);
}
function S12(t,lt){ // today: emotion
 const a=eo(seg(lt,0,0.5));const em=fin(t,'emotion',0.6,-0.1);
 if(em<1){ctx.save();ctx.globalAlpha*=1-em;ctx.save();ctx.translate(540,900);ctx.scale(4.5*a,4.5*a);IC.globe();ctx.restore();
  for(let i=0;i<8;i++){const an=i/8*Math.PI*2+t*0.5;kulhad(540+Math.cos(an)*270,900+Math.sin(an)*190,0.3,fin(t,'duniya',0.4,i*0.05),t,{steam:false})}
  badge(540,1230,'TOP CHAI PRODUCERS',pop(t,'utpaadakon',0.5,0),{fs:28});ctx.restore()}
 if(em>0){kulhad(540,1040,1.6,em,t,{steam:false});const pr=1+0.06*Math.sin(t*5);heart(540,790,2.6*back(em)*pr,em,'rgba(255,138,31,.35)');
  steam(540,950,1.4,t,em*0.8);badge(540,1250,'EK EMOTION',pop(t,'emotion',0.5,0.2),{fs:30})}
}
// scenes whose illustration is rendered in 3D by ../chai-3d (Remotion); in the base render they are left empty
const S3D=new Set([0,3,4,5,6,10]);
const SCN=[S0,S1,S2,S3,S4,S5,S6,S7,S8,S9,S10,S11,S12].map((f,i)=>window.BLANK3D&&S3D.has(i)?(()=>{}):f);
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
