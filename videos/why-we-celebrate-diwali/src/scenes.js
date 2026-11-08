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
 {pill:'DIWALI · THE WHY',title:'Diwali <em>Kyun?</em>',sub:'Diye · Mithai · Patakhe',tag:'THE · QUESTION'},
 {pill:'01 · SAWAAL',title:'Parth Ka <em>Sawaal</em>',sub:'Bargad ke ped ke neeche',tag:'DADAJI & PARTH'},
 {pill:'02 · VANVAS',title:'14 Saal <em>Vanvas</em>',sub:'Prabhu Ram ka jungle safar',tag:'RAMAYAN'},
 {pill:'03 · LANKA',title:'Lanka Par <em>Chadhai</em>',sub:'Hanuman + Vanar Sena',tag:'RAM SETU'},
 {pill:'04 · VIJAY',title:'Sach Ki <em>Jeet</em>',sub:'Dharma ka raasta',tag:'RAVAN · HAAR'},
 {pill:'05 · WAPSI',title:'Ayodhya <em>Wapsi</em>',sub:'Pushpak Vimaan',tag:'RAM · SITA · LAKSHMAN'},
 {pill:'06 · THE NIGHT',title:'Kartik <em>Amavasya</em>',sub:'Saal ki sabse andheri raat',tag:'NO · MOON'},
 {pill:'07 · THE ANSWER',title:'Laakhon <em>Diye</em>',sub:'Ram ke raaste mein roshni',tag:'AYODHYA'},
 {pill:'08 · NAAM KA WHY',title:'Deep + <em>Aavali</em>',sub:'Diyon ki qataar',tag:'DEEPAVALI'},
 {pill:'09 · POOJA',title:'Maa <em>Lakshmi</em>',sub:'Saaf ghar, swagat',tag:'LAKSHMI · POOJA'},
 {pill:'10 · LIFE LESSONS',title:'Teen <em>Seekh</em>',sub:'Dadaji ki baat',tag:'LESSONS · MORALS'},
 {pill:'11 · UPANISHAD',title:'Andhakaar Se <em>Prakaash</em>',sub:'Tamaso maa jyotirgamaya',tag:'BRIHADARANYAKA'},
 {pill:'12 · READ MORE',title:'Ramayana <em>Reimagined</em>',sub:'The Eternal Legacy · Parth D. Joshi',tag:'AVAILABLE · NOW'},
 {pill:'13 · WISHES',title:'Shubh <em>Deepavali!</em>',sub:'The Why Spaces ki taraf se',tag:'HAPPY · DIWALI'},
];
const HL=['diye','diwali','kyun','parth','dadaji','bargad','jawaab','ramayan','chaudah','vanvas','lanka','ravan','sita','hanuman','vanar','dharma','haraaya','jeet','sach','pushpak','ayodhya','kartik','amavasya','andheri','chaand','laakhon','andhera','deep','aavali','qataar','deepavali','lakshmi','swagat','teen','pehli','doosri','teesri','jagmaga','tamaso','prakaash','andhakaar','ramayana','reimagined','notion','amazon','flipkart','shubh'];

// ---------- diwali 2D primitives ----------
function moonK(x,y,r,k,a,ring){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fillStyle='#0d0a09';ctx.fill();
 ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.clip();ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fillStyle='rgba(243,236,228,.92)';ctx.shadowColor='#fff';ctx.shadowBlur=18;ctx.fill();ctx.shadowBlur=0;
 if(k<1){ctx.beginPath();ctx.arc(x-(k)*2*r,y,r*1.02,0,7);ctx.fillStyle='#120d0a';ctx.fill()}ctx.restore();
 ctx.beginPath();ctx.arc(x,y,r,0,7);gs(2.5,ring?OR:'rgba(243,236,228,.6)',ring?20:0);ctx.restore()}
function dashedMoon(x,y,r,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.setLineDash([10,10]);ctx.beginPath();ctx.arc(x,y,r,0,7);gs(3,'rgba(243,236,228,.55)');ctx.setLineDash([]);txt('?',x,y+4,`900 ${r}px M`,'rgba(243,236,228,.4)');ctx.restore()}
function sunDisc(x,y,r,a,t){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;const g=ctx.createRadialGradient(x,y,0,x,y,r*2.4);g.addColorStop(0,'rgba(255,170,60,.5)');g.addColorStop(1,'rgba(255,120,20,0)');ctx.fillStyle=g;ctx.fillRect(x-r*2.4,y-r*2.4,r*4.8,r*4.8);
 ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fillStyle='rgba(255,160,50,.85)';ctx.shadowColor=OR;ctx.shadowBlur=40;ctx.fill();ctx.shadowBlur=0;ctx.translate(x,y);ctx.rotate(t*0.3);for(let i=0;i<12;i++){ctx.rotate(Math.PI/6);ctx.beginPath();ctx.moveTo(r+10,0);ctx.lineTo(r+30,0);gs(4,GOLD,10)}ctx.restore()}
function stars(n,seed,y0,h,a,t){for(let i=0;i<n;i++){const r=rng(i+seed);star(70+r()*940,y0+r()*h,3+r()*6,a*(0.35+0.65*Math.abs(Math.sin(t*2+i))))}}
// banyan tree line art; p = draw progress
function banyan(x,y,s,p,t){if(p<=0)return;ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.lineCap='round';ctx.lineJoin='round';
 drawOn(()=>{ctx.moveTo(-40,300);ctx.bezierCurveTo(-30,180,-60,80,-20,-20);ctx.moveTo(40,300);ctx.bezierCurveTo(30,180,60,80,20,-20)},p,5,LN,6);
 drawOn(()=>{ctx.moveTo(-20,-10);ctx.bezierCurveTo(-120,-60,-260,-40,-330,-10);ctx.moveTo(20,-10);ctx.bezierCurveTo(120,-70,250,-50,330,-20)},cl(p*1.4-0.2),5,LN,6);
 // canopy cloud
 drawOn(()=>{ctx.moveTo(-380,-40);for(let i=0;i<=12;i++){const a=Math.PI+i/12*Math.PI;const R=i%2?300:340;ctx.quadraticCurveTo(Math.cos(a-0.13)*R*1.25,-60+Math.sin(a-0.13)*R*0.7,Math.cos(a)*380,-60+Math.sin(a)*240)}},cl(p*1.3-0.3),4,'rgba(255,177,92,.85)',12);
 // aerial roots
 ctx.globalAlpha*=cl(p*2-1);for(const rx of[-300,-240,-180,180,240,300]){ctx.beginPath();ctx.moveTo(rx,-20+Math.abs(rx)*0.02);ctx.lineTo(rx+Math.sin(t*1.2+rx)*3,90+Math.abs(rx)*0.3);gs(2.5,'rgba(243,236,228,.45)')}
 ctx.restore()}
function swingSeat(x,y,w,a,t){if(a<=0)return;const sw=Math.sin(t*1.3)*0.025;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y-260);ctx.rotate(sw);ctx.beginPath();ctx.moveTo(-w/2,0);ctx.lineTo(-w/2,260);ctx.moveTo(w/2,0);ctx.lineTo(w/2,260);gs(3,'rgba(243,236,228,.7)');rr(-w/2-20,256,w+40,18,6);ctx.fillStyle=DARK;ctx.fill();gs(3.5,LN);ctx.restore()}
// line-art grandfather / child (sitting)
function dadaji(x,y,s,a,t,talk){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);ctx.lineCap='round';ctx.lineJoin='round';
 ctx.beginPath();ctx.moveTo(-70,40);ctx.quadraticCurveTo(-75,-80,-30,-95);ctx.lineTo(30,-95);ctx.quadraticCurveTo(75,-80,70,40);ctx.closePath();ctx.fillStyle=DARK;ctx.fill();gs(4,LN);
 ctx.beginPath();ctx.moveTo(-45,-92);ctx.lineTo(40,30);gs(6,OR,10); // shawl
 ctx.beginPath();ctx.arc(0,-150,46,0,7);ctx.fillStyle=DARK;ctx.fill();gs(4,LN);
 ctx.beginPath();ctx.moveTo(-38,-140);ctx.quadraticCurveTo(-40,-80,0,-70);ctx.quadraticCurveTo(40,-80,38,-140);gs(4,LN); // beard
 ctx.beginPath();ctx.arc(-16,-158,9,0,7);ctx.moveTo(25,-158);ctx.arc(16,-158,9,0,7);gs(2.5,GOLD); // specs
 const m=talk?3+5*Math.abs(Math.sin(t*12)):2;ctx.beginPath();ctx.ellipse(0,-122,9,m,0,0,7);gs(2.5,LN);
 ctx.beginPath();ctx.moveTo(-40,40);ctx.lineTo(-45,120);ctx.moveTo(40,40);ctx.lineTo(45,120);gs(4,LN);ctx.restore()}
function parthKid(x,y,s,a,t,talk){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);ctx.lineCap='round';ctx.lineJoin='round';
 ctx.beginPath();ctx.moveTo(-45,40);ctx.quadraticCurveTo(-48,-50,-20,-60);ctx.lineTo(20,-60);ctx.quadraticCurveTo(48,-50,45,40);ctx.closePath();ctx.fillStyle=DARK;ctx.fill();gs(4,GOLD,8);
 ctx.beginPath();ctx.arc(0,-105,38,0,7);ctx.fillStyle=DARK;ctx.fill();gs(4,LN);
 ctx.beginPath();ctx.moveTo(-38,-112);ctx.quadraticCurveTo(-20,-150,10,-142);ctx.quadraticCurveTo(36,-140,38,-112);gs(5,LN); // hair
 ctx.fillStyle=LN;ctx.beginPath();ctx.arc(-13,-104,4,0,7);ctx.arc(13,-104,4,0,7);ctx.fill();
 const m=talk?3+5*Math.abs(Math.sin(t*14)):2;ctx.beginPath();ctx.ellipse(0,-84,7,m,0,0,7);gs(2.5,LN);
 ctx.beginPath();ctx.moveTo(-25,40);ctx.lineTo(-30,100);ctx.moveTo(25,40);ctx.lineTo(30,100);gs(4,LN);ctx.restore()}
function openBook(x,y,s,a,label){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);ctx.beginPath();ctx.moveTo(0,-50);ctx.quadraticCurveTo(-60,-70,-120,-50);ctx.lineTo(-120,50);ctx.quadraticCurveTo(-60,30,0,50);ctx.quadraticCurveTo(60,30,120,50);ctx.lineTo(120,-50);ctx.quadraticCurveTo(60,-70,0,-50);ctx.closePath();ctx.fillStyle=DARK;ctx.fill();gs(4,GOLD,14);
 ctx.beginPath();ctx.moveTo(0,-50);ctx.lineTo(0,50);gs(3,LN);for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-100,-22+i*22);ctx.lineTo(-20,-22+i*22);ctx.moveTo(20,-22+i*22);ctx.lineTo(100,-22+i*22);gs(2,'rgba(243,236,228,.35)')}
 if(label)txt(label,0,-95,'800 26px M',OR,'center',14);ctx.restore()}
function tree(x,y,s,p){if(p<=0)return;ctx.save();ctx.translate(x,y);ctx.scale(s,s);drawOn(()=>{ctx.moveTo(0,0);ctx.lineTo(0,-60);ctx.moveTo(-45,-50);ctx.lineTo(0,-150);ctx.lineTo(45,-50);ctx.closePath();ctx.moveTo(-35,-100);ctx.lineTo(0,-190);ctx.lineTo(35,-100)},p,4,LN,4);ctx.restore()}
function foot(x,y,r,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.rotate(r);ctx.beginPath();ctx.ellipse(0,0,9,15,0,0,7);ctx.fillStyle='rgba(255,138,31,.6)';ctx.fill();ctx.restore()}
function fort(x,y,s,a,t){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);ctx.beginPath();ctx.ellipse(0,40,190,40,0,0,7);ctx.fillStyle='rgba(60,30,15,.6)';ctx.fill();gs(3,'rgba(243,236,228,.5)');
 for(const[tx,h]of[[-110,140],[-40,200],[40,170],[110,130]]){rr(tx-28,40-h,56,h,4);ctx.fillStyle=DARK;ctx.fill();gs(3.5,LN);ctx.beginPath();ctx.moveTo(tx-32,40-h);ctx.lineTo(tx,40-h-40);ctx.lineTo(tx+32,40-h);gs(3.5,'rgba(255,90,40,.9)',12)}
 ctx.restore()}
function lessonRow(y,n,head,sub,p){if(p<=0)return;ctx.save();ctx.globalAlpha*=cl(p*1.5);ctx.translate(lerp(-120,0,eo(cl(p))),0);rr(110,y-62,860,124,26);ctx.fillStyle='rgba(22,15,11,.92)';ctx.fill();gs(2.5,'rgba(255,138,31,.75)',16);
 ctx.beginPath();ctx.arc(190,y,40,0,7);ctx.fillStyle=OR;ctx.shadowColor=OR;ctx.shadowBlur=24;ctx.fill();ctx.shadowBlur=0;txt(String(n),190,y+3,'900 44px M','#1a0f06');
 txt(head,260,y-16,'800 38px M',WH,'left');txt(sub,260,y+28,'500 24px J','#ff9b3d','left');ctx.restore()}
function bigWord(s,x,y,size,a,col=OR,glow=30){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;txt(s,x,y,`900 ${size}px M`,col,'center',glow);ctx.restore()}

// ---------- scenes ----------
function S0(t,lt,dur){ // hook (3D diya in layer)
 const a=eo(seg(lt,0,0.5));
 [['DIYE','diye0',250],['MITHAI','mithaiyan',540],['PATAKHE','patakhe',830]].forEach(([w,k,x])=>{const p=pop(t,k,0.4,-0.1);badge(x,640,w,cl(p)*(1-seg(t,E('socha')-0.3,E('socha'))),{fs:30})});
 const q=pop(t,'kyun',0.5,-0.15);bigWord('WHY?',540,640,150,cl(q)*1,OR,40);
 fireworks(t,fin(t,'patakhe',0.4,-0.1)*(1-seg(t,E('socha')-0.3,E('socha'))),[120,560,840,120]);
}
function S1(t,lt,dur){ // banyan, Dadaji & Parth
 banyan(540,820,0.95,eo(seg(lt,0,1.4)),t);stars(12,40,560,90,eo(seg(lt,0,.8)),t);
 swingSeat(540,1150,330,eo(seg(lt,0.4,1)),t);
 const ta=E('dadaji')-0.2,tb=E('muskuraaye')-0.1;
 parthKid(450,1080,0.9,fin(t,'parth',0.5,-0.3),t,t>ta&&t<tb);dadaji(640,1060,0.95,fin(t,'dadaji',0.5,-0.3),t,t>tb);
 qm(450,880,60,pop(t,'parth',0.45,0.1)*(1-seg(t,tb,tb+0.4)),t);
 openBook(800,760,0.9,pop(t,'ramayan',0.45,-0.1),'RAMAYAN');
}
function S2(t,lt,dur){ // vanvas 14 years
 for(let i=0;i<7;i++){const r=rng(i+3);tree(130+i*137,1180-r()*40,0.9+r()*0.4,eo(seg(lt,0.05*i,0.6+0.05*i)))}
 for(let i=0;i<10;i++)foot(250+i*62,1240-(i%2)*20,Math.PI/2,seg(lt,0.2+i*0.12,0.4+i*0.12));
 const n=Math.round(lerp(1,14,eo(seg(t,E('chaudah')-0.3,E('vanvas')+0.2))));bigWord(String(n),540,800,220,eo(seg(lt,0,.4)),OR,40);txt('SAAL',540,930,'800 40px M',WH);
}
function S3(t,lt,dur){ // lanka + ram setu + sena
 fort(830,880,1.0,fin(t,'lanka',0.5,-0.2),t);monoTag(830,1010,'LANKA · RAVAN',fin(t,'ravan',0.4,0));
 const sp=pop(t,'sita',0.45,0);if(sp>0){ctx.save();ctx.globalAlpha*=cl(sp);txt('SITA MAA',830,610,'800 30px M',GOLD,'center',12);ctx.restore()}
 const b=eio(seg(t,E('hanuman')-0.4,E('chadhai')+0.3));
 ctx.save();for(let i=0;i<14;i++){const p=cl(b*14-i);if(p<=0)continue;ctx.globalAlpha=p;const x=140+i*45,y=1120-i*6;rr(x-20,y-12,40,24,10);ctx.fillStyle='rgba(60,40,25,.9)';ctx.fill();gs(2.5,LN)}ctx.restore();
 monoTag(400,1180,'RAM SETU',cl(b*2));
 for(let i=0;i<12;i++){const r=rng(i+77);const p=seg(t,E('sena')-0.3+i*0.05,E('sena')+1.8+i*0.05);if(p<=0)continue;const x=lerp(120,600,p)+r()*30,y=lerp(1110,1050,p)-4-Math.abs(Math.sin(t*9+i))*10;ctx.beginPath();ctx.arc(x,y-14,7,0,7);ctx.moveTo(x,y-7);ctx.lineTo(x,y+6);gs(3,i===0?OR:LN,i===0?12:0)}
 badge(260,760,'HANUMAN',pop(t,'hanuman',0.45,0),{fs:28});
}
function S4(t,lt,dur){ // 3D ravana + arrow
 badge(540,640,'DHARMA',pop(t,'dharma',0.45,-0.1),{fs:30});
 badge(540,1250,'SACH KI JEET',pop(t,'jeet',0.45,0),{fs:32});
}
function S5(t,lt,dur){monoTag(540,640,'14 SAAL BAAD',eo(seg(lt,0.2,0.6)))}
function S6(t,lt,dur){ // amavasya phases
 const a=eo(seg(lt,0,0.5));stars(18,9,580,200,a,t);const sel=fin(t,'amavasya',0.6,-0.1);
 monoTag(540,640,'KARTIK MAHINA',fin(t,'kartik',0.4,-0.1));
 for(let i=0;i<7;i++){const k=1-i/6;const p=pop(t,'kartik',0.45,0.1+i*0.08);moonK(130+i*137,900,50,k,cl(p)*(i===6?1:lerp(1,0.4,sel)),i===6&&sel>0)}
 txt('POORNIMA',130,985,'500 22px J','rgba(243,236,228,.6)');ctx.save();ctx.globalAlpha*=sel;txt('AMAVASYA',952,985,'500 24px J',GOLD,'center',10);ctx.restore();
 arrow(220,1035,860,1035,fin(t,'kartik',1.2,0),'rgba(255,138,31,.7)',4);
 dashedMoon(540,1150,60,fin(t,'chaand',0.4,-0.1));cross(540,1150,48,fin(t,'nahi',0.4,0));
}
function S7(t,lt,dur){badge(540,1255,'LAAKHON DIYE',pop(t,'laakhon',0.45,0.2),{fs:30})}
function S8(t,lt,dur){ // deep + aavali
 const d=pop(t,'deep',0.45,-0.1),q=pop(t,'aavali',0.45,-0.1);
 diya(250,720,2.2,cl(d),t);txt('DEEP',250,820,'900 52px M',WH);txt('= DIYA',250,875,'500 26px J','#ff9b3d');
 bigWord('+',540,740,90,cl(q),WH,0);
 if(q>0){for(let i=0;i<5;i++)diya(720+i*60,720,1.0,cl(q*3-i*0.4),t)}txt('AAVALI',840,820,'900 52px M',WH);ctx.save();ctx.globalAlpha*=cl(q);txt('= QATAAR',840,875,'500 26px J','#ff9b3d');ctx.restore();
 const k=seg(t,E('deepavali')-0.8,E('deepavali')+0.4);for(let i=0;i<11;i++)diya(140+i*80,1120,1.15,cl(k*11-i),t);
 bigWord('DEEPAVALI',540,1020,104,pop(t,'deepavali',0.45,0),OR,40);
}
function S9(t,lt,dur){monoTag(540,640,'MAA LAKSHMI',fin(t,'lakshmi',0.4,-0.1));badge(540,1255,'GHAR SAAF · SWAGAT',pop(t,'swagat',0.45,0),{fs:28})}
function S10(t,lt,dur){ // three lessons
 badge(540,640,'3 SEEKH',pop(t,'teen',0.45,-0.1),{fs:30});
 lessonRow(800,1,'Ek diya kaafi hai','ANDHERE KO HARAO',fin(t,'pehli',0.5,-0.1));
 lessonRow(970,2,'Mann ki safai','GHAR + MANN',fin(t,'doosri',0.5,-0.1));
 lessonRow(1140,3,'Milkar roshni','POORI AYODHYA JAGMAGA',fin(t,'teesri',0.5,-0.1));
}
function S11(t,lt,dur){ // shloka sunrise
 const k=eo(seg(lt,0,1.6));sunDisc(540,lerp(1300,980,k),90*k+10,k,t);
 bigWord('TAMASO MAA',540,660,92,fin(t,'tamaso',0.5,-0.15),WH,20);bigWord('JYOTIRGAMAYA',540,755,84,fin(t,'tamaso',0.5,0.2),OR,30);
 const p=fin(t,'andhakaar',0.5,-0.1);monoTag(250,1180,'ANDHAKAAR',p);arrow(370,1180,700,1180,fin(t,'prakaash',0.5,-0.2),OR,5);monoTag(820,1180,'PRAKAASH',fin(t,'prakaash',0.4,0));
}
function S12(t,lt,dur){ // book promo (3D book in layer)
 [['NOTION PRESS','notion',230],['AMAZON.IN','amazon',540],['FLIPKART','flipkart',850]].forEach(([w,k,x])=>badge(x,1250,w,pop(t,k,0.45,-0.05),{fs:24}));
 monoTag(540,640,'BY PARTH D. JOSHI',fin(t,'kitaab',0.4,-0.1));
}
function S13(t,lt,dur){ // shubh deepavali
 const a=eo(seg(lt,0,0.5));fireworks(t,a,[120,560,840,240]);for(let i=0;i<9;i++)diya(150+i*97.5,1160,1.2,cl(a*9-i*0.6),t);
 bigWord('SHUBH',540,880,110,pop(t,'shubh',0.45,-0.2),WH,20);bigWord('DEEPAVALI',540,1000,110,pop(t,'shubh',0.45,0.1),OR,40);
}
const SCN=[S0,S1,S2,S3,S4,S5,S6,S7,S8,S9,S10,S11,S12,S13];

// ---------- mystery primitives (line art: warm-white strokes, orange glow) ----------
const LN='rgba(243,236,228,.92)',DARK='rgba(18,12,9,.96)',GOLD='#ffb15c';
function darkness(k){if(k<=0)return;ctx.save();ctx.globalAlpha*=k*0.62;ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);ctx.restore()}
function flash(k){if(k<=0)return;ctx.save();ctx.globalAlpha*=k*0.5;ctx.fillStyle='#fff3e6';ctx.fillRect(0,0,W,H);ctx.restore()}
function nightMoon(x,y,r,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.beginPath();ctx.arc(x,y,r,-1.2,2.4,false);ctx.arc(x+r*0.45,y-r*0.25,r*0.8,2.0,-0.9,true);ctx.closePath();ctx.fillStyle='rgba(243,236,228,.18)';ctx.fill();gs(4,LN,14);
 star(x+70,y-30,9,1);star(x-70,y+40,6,0.8);ctx.restore()}
function note(x,y,s,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);ctx.beginPath();ctx.ellipse(0,0,13,9,-0.4,0,7);ctx.fillStyle=OR;ctx.shadowColor=OR;ctx.shadowBlur=12;ctx.fill();ctx.shadowBlur=0;
 ctx.beginPath();ctx.moveTo(11,-4);ctx.lineTo(11,-50);ctx.quadraticCurveTo(26,-40,30,-24);gs(4,OR);ctx.restore()}
// haveli: lights = 0..1 (windows + string lights)
function haveli(x,y,s,a,L,t){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);
 // central onion dome + chhatris
 ctx.beginPath();ctx.moveTo(-95,-120);ctx.bezierCurveTo(-120,-190,-40,-230,0,-290);ctx.bezierCurveTo(40,-230,120,-190,95,-120);ctx.closePath();ctx.fillStyle=DARK;ctx.fill();gs(4,LN);
 ctx.beginPath();ctx.moveTo(0,-290);ctx.lineTo(0,-330);gs(4,LN);ctx.beginPath();ctx.arc(0,-334,6,0,7);ctx.fillStyle=OR;ctx.fill();
 for(const sx of[-240,240]){ctx.beginPath();ctx.moveTo(sx-48,-150);ctx.bezierCurveTo(sx-52,-190,sx-10,-200,sx,-225);ctx.bezierCurveTo(sx+10,-200,sx+52,-190,sx+48,-150);ctx.closePath();ctx.fillStyle=DARK;ctx.fill();gs(4,LN);
  ctx.beginPath();ctx.moveTo(sx-40,-150);ctx.lineTo(sx-40,-120);ctx.moveTo(sx+40,-150);ctx.lineTo(sx+40,-120);ctx.moveTo(sx-52,-150);ctx.lineTo(sx+52,-150);gs(4,LN)}
 // body
 ctx.beginPath();ctx.rect(-300,-120,600,280);ctx.fillStyle=DARK;ctx.fill();gs(5,LN);
 ctx.beginPath();ctx.moveTo(-315,-120);ctx.lineTo(315,-120);ctx.moveTo(-310,20);ctx.lineTo(310,20);gs(4,LN);
 // upper windows + lower arches
 for(let i=-2;i<=2;i++){const wx=i*112;
  ctx.beginPath();ctx.moveTo(wx-24,-10);ctx.lineTo(wx-24,-60);ctx.arc(wx,-60,24,Math.PI,0);ctx.lineTo(wx+24,-10);ctx.closePath();
  ctx.fillStyle=`rgba(255,170,80,${0.08+0.62*L})`;ctx.shadowColor=OR;ctx.shadowBlur=30*L;ctx.fill();ctx.shadowBlur=0;gs(3,LN);
  ctx.beginPath();ctx.moveTo(wx-38,160);ctx.lineTo(wx-38,90);ctx.arc(wx,90,38,Math.PI,0);ctx.lineTo(wx+38,160);
  if(i===0){ctx.fillStyle=`rgba(255,150,60,${0.06+0.4*L})`;ctx.fill()}gs(3.5,LN)}
 // string lights
 const pts=[];for(let k=0;k<=24;k++){const u=k/24;const xx=-300+600*u;const seg2=(u*4)%1;pts.push([xx,-120+Math.sin(seg2*Math.PI)*26])}
 ctx.beginPath();pts.forEach(([px,py],k)=>k?ctx.lineTo(px,py):ctx.moveTo(px,py));gs(1.5,'rgba(243,236,228,.4)');
 pts.forEach(([px,py],k)=>{const on=L*(0.55+0.45*Math.sin(t*6+k*1.3));ctx.beginPath();ctx.arc(px,py+4,5,0,7);ctx.fillStyle=k%2?`rgba(255,138,31,${0.15+0.85*on})`:`rgba(255,230,190,${0.15+0.85*on})`;ctx.shadowColor=OR;ctx.shadowBlur=18*on;ctx.fill();ctx.shadowBlur=0});
 ctx.beginPath();ctx.moveTo(-340,162);ctx.lineTo(340,162);gs(4,LN);ctx.restore()}
function clockAt(x,y,r,min,a){clock(x,y,r,-4*Math.PI+min/60*Math.PI*2,a)} // 10:min
function battery(x,y,s,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);rr(-55,-28,100,56,10);ctx.fillStyle=DARK;ctx.fill();gs(4,LN);rr(47,-12,10,24,3);ctx.fillStyle=LN;ctx.fill();
 rr(-45,-18,18,36,4);ctx.fillStyle='rgba(255,138,31,.5)';ctx.fill();ctx.restore()}
function bulb(x,y,s,a,on){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);ctx.beginPath();ctx.arc(0,-20,34,Math.PI*0.8,Math.PI*0.2);ctx.lineTo(14,22);ctx.lineTo(-14,22);ctx.closePath();
 ctx.fillStyle=on?'rgba(255,177,92,.6)':'rgba(30,22,16,.9)';if(on){ctx.shadowColor=OR;ctx.shadowBlur=40}ctx.fill();ctx.shadowBlur=0;gs(4,LN);
 rr(-15,24,30,20,4);gs(3.5,LN);ctx.beginPath();ctx.moveTo(-8,8);ctx.lineTo(-4,-12);ctx.lineTo(4,-12);ctx.lineTo(8,8);gs(2.5,on?'#fff':'rgba(243,236,228,.4)');ctx.restore()}
// safe / tijori: open 0..1
function safe(x,y,s,a,open){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);
 rr(-160,-170,320,330,18);ctx.fillStyle=DARK;ctx.fill();gs(5,LN);
 rr(-130,-140,260,270,8);ctx.fillStyle='#070504';ctx.fill();ctx.strokeStyle='rgba(243,236,228,.35)';ctx.lineWidth=2;ctx.stroke();
 // interior: velvet shelf + empty stand
 ctx.beginPath();ctx.moveTo(-130,60);ctx.lineTo(130,60);gs(3,'rgba(255,138,31,.5)');
 ctx.beginPath();ctx.moveTo(-40,60);ctx.lineTo(-30,-10);ctx.quadraticCurveTo(0,-60,30,-10);ctx.lineTo(40,60);ctx.fillStyle='rgba(120,30,20,.45)';ctx.fill();gs(3,'rgba(243,236,228,.45)');
 // door (hinged left)
 const c=Math.cos(open*1.35),w=260*c,lift=26*Math.sin(open*1.35);
 if(w>2){ctx.beginPath();ctx.moveTo(-130,-140);ctx.lineTo(-130+w,-140-lift);ctx.lineTo(-130+w,130+lift);ctx.lineTo(-130,130);ctx.closePath();ctx.fillStyle='rgba(34,25,19,.98)';ctx.fill();gs(4,LN);
  ctx.save();ctx.translate(-130+w/2,-5);ctx.scale(c,1);ctx.beginPath();ctx.arc(0,0,46,0,7);gs(4,OR,12);for(let i=0;i<12;i++){const an=i/12*Math.PI*2;ctx.beginPath();ctx.moveTo(Math.cos(an)*34,Math.sin(an)*34);ctx.lineTo(Math.cos(an)*42,Math.sin(an)*42);gs(2,LN)}
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-30);gs(4,LN);ctx.beginPath();ctx.moveTo(70,-10);ctx.lineTo(70,40);gs(6,LN);ctx.restore()}
 else{ctx.beginPath();ctx.moveTo(-130,-140);ctx.lineTo(-150-80*(open-0.9),-150);ctx.lineTo(-150-80*(open-0.9),140);ctx.lineTo(-130,130);ctx.closePath();ctx.fillStyle='rgba(34,25,19,.98)';ctx.fill();gs(4,LN)}
 ctx.beginPath();ctx.moveTo(-130,165);ctx.lineTo(-130,190);ctx.moveTo(130,165);ctx.lineTo(130,190);gs(6,LN);ctx.restore()}
function diamond(x,y,r,fill){ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x+r*0.75,y);ctx.lineTo(x,y+r);ctx.lineTo(x-r*0.75,y);ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}}
function necklace(x,y,s,a,ghost,t){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);
 const P=[];for(let k=0;k<=12;k++){const an=Math.PI*(0.08+0.84*k/12);P.push([Math.cos(an)*130,Math.sin(an)*95-40])}
 if(ghost)ctx.setLineDash([8,10]);
 ctx.beginPath();P.forEach(([px,py],k)=>k?ctx.lineTo(px,py):ctx.moveTo(px,py));gs(3,ghost?'rgba(243,236,228,.5)':GOLD,ghost?0:10);
 P.forEach(([px,py],k)=>{if(k===0||k===12)return;diamond(px,py,13,ghost?null:'rgba(243,236,228,.85)');gs(2.5,ghost?'rgba(243,236,228,.5)':'#fff',ghost?0:12)});
 diamond(0,105,34,ghost?null:'rgba(255,177,92,.35)');gs(4,ghost?'rgba(243,236,228,.5)':OR,ghost?0:20);ctx.setLineDash([]);
 if(!ghost)for(let i=0;i<4;i++){const ph=(t*0.9+i/4)%1;star(Math.cos(i*2.1)*110,Math.sin(i*1.7)*60+20,14*Math.sin(ph*Math.PI),1)}
 ctx.restore()}
// people: bust + identity (hat / hair). kind: chef | hair | cap | police | none
function person(x,y,s,a,kind,glow){if(a<=0)return;bust(x,y,s,a,glow);ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);
 if(kind==='chef'){ctx.beginPath();ctx.arc(-34,-150,30,Math.PI*0.6,Math.PI*1.7);ctx.arc(0,-172,34,Math.PI*1.1,Math.PI*1.9);ctx.arc(34,-150,30,Math.PI*1.3,Math.PI*0.4);ctx.lineTo(-44,-122);ctx.closePath();ctx.fillStyle='rgba(243,236,228,.9)';ctx.fill();gs(3,LN);
  rr(-46,-132,92,22,4);ctx.fillStyle='rgba(243,236,228,.95)';ctx.fill();gs(3,OR,8)}
 if(kind==='hair'){ctx.beginPath();ctx.arc(0,-74,62,Math.PI*1.05,Math.PI*1.95);ctx.lineTo(64,-20);ctx.quadraticCurveTo(80,20,58,30);ctx.moveTo(-60,-90);ctx.lineTo(-64,-20);ctx.quadraticCurveTo(-80,20,-58,30);gs(6,OR,12);
  ctx.beginPath();ctx.arc(0,-140,22,0,7);ctx.fillStyle='rgba(255,138,31,.35)';ctx.fill();gs(4,OR,12);ctx.beginPath();ctx.arc(0,-82,4,0,7);ctx.fillStyle=OR;ctx.fill()}
 if(kind==='cap'){ctx.beginPath();ctx.moveTo(-58,-100);ctx.quadraticCurveTo(-50,-150,0,-152);ctx.quadraticCurveTo(50,-150,58,-100);ctx.closePath();ctx.fillStyle='rgba(40,30,24,.98)';ctx.fill();gs(4,LN);
  ctx.beginPath();ctx.moveTo(-60,-100);ctx.quadraticCurveTo(10,-88,96,-98);gs(6,OR,10)}
 if(kind==='police'){ctx.beginPath();ctx.moveTo(-64,-108);ctx.lineTo(-74,-160);ctx.quadraticCurveTo(0,-182,74,-160);ctx.lineTo(64,-108);ctx.closePath();ctx.fillStyle='rgba(40,30,24,.98)';ctx.fill();gs(4,LN);
  ctx.beginPath();ctx.ellipse(0,-106,80,13,0,0,7);ctx.fillStyle='rgba(20,14,10,.98)';ctx.fill();gs(4,LN);star(0,-140,16,1);
  ctx.beginPath();ctx.moveTo(-70,40);ctx.lineTo(-40,40);ctx.moveTo(40,40);ctx.lineTo(70,40);gs(5,OR,10)}
 ctx.restore()}
function qm(x,y,sz,a,t){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y+Math.sin(t*3+x)*6);txt('?',0,0,`900 ${sz}px M`,OR,'center',30);ctx.restore()}
function candleFlame(x,y,s,t){const h=34+5*Math.sin(t*13)+3*Math.sin(t*7.3);ctx.save();ctx.translate(x,y);ctx.scale(s,s);
 const g=ctx.createRadialGradient(0,-20,0,0,-20,160);g.addColorStop(0,'rgba(255,170,70,.35)');g.addColorStop(1,'rgba(255,120,20,0)');ctx.fillStyle=g;ctx.fillRect(-170,-180,340,340);
 ctx.beginPath();ctx.moveTo(-11,0);ctx.quadraticCurveTo(-12,-h*0.55,Math.sin(t*5)*3,-h);ctx.quadraticCurveTo(12,-h*0.55,11,0);ctx.quadraticCurveTo(0,8,-11,0);ctx.fillStyle='rgba(255,190,90,.95)';ctx.shadowColor=OR;ctx.shadowBlur=26;ctx.fill();ctx.shadowBlur=0;
 ctx.beginPath();ctx.ellipse(0,-6,4,9,0,0,7);ctx.fillStyle='#fff';ctx.fill();ctx.restore()}
function candle(x,y,s,a,t){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;candleFlame(x,y-66*s,s,t);ctx.translate(x,y);ctx.scale(s,s);
 rr(-22,-60,44,120,6);ctx.fillStyle='rgba(243,236,228,.9)';ctx.fill();gs(3,LN);ctx.beginPath();ctx.moveTo(0,-60);ctx.lineTo(0,-68);gs(3,'#222');
 ctx.beginPath();ctx.moveTo(-14,-60);ctx.quadraticCurveTo(-18,-40,-12,-30);gs(5,'rgba(243,236,228,.95)');
 ctx.beginPath();ctx.ellipse(0,62,46,10,0,0,7);ctx.fillStyle=DARK;ctx.fill();gs(3,LN);ctx.restore()}
function stovePot(x,y,s,a,t){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);
 for(let i=-2;i<=2;i++){const h=22+8*Math.sin(t*10+i*1.7);ctx.beginPath();ctx.moveTo(i*16-7,70);ctx.quadraticCurveTo(i*16,70-h,i*16+7,70);ctx.closePath();ctx.fillStyle=i%2?'rgba(120,170,255,.85)':'rgba(255,150,60,.9)';ctx.shadowColor=OR;ctx.shadowBlur=14;ctx.fill()}ctx.shadowBlur=0;
 ctx.beginPath();ctx.moveTo(-70,74);ctx.lineTo(70,74);gs(4,LN);
 rr(-70,-10,140,70,12);ctx.fillStyle=DARK;ctx.fill();gs(4,LN);ctx.beginPath();ctx.ellipse(0,-10,70,14,0,0,7);ctx.fillStyle='rgba(200,110,40,.8)';ctx.fill();gs(3,LN);
 ctx.beginPath();ctx.moveTo(70,5);ctx.lineTo(120,0);gs(6,LN);ctx.restore();steam(x,y-20*s,s*0.7,t,a,3,80)}
function steam(x,y,s,t,a,n=3,h=110){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.lineCap='round';
 for(let i=0;i<n;i++){const ox=(i-(n-1)/2)*26*s;ctx.beginPath();for(let k=0;k<=20;k++){const u=k/20;const yy=y-u*h*s;const xx=x+ox+Math.sin(u*6+t*3+i*2)*10*s*u;k?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy)}
  ctx.globalAlpha=a*(0.55+0.25*Math.sin(t*2+i));gs(4*s,'rgba(255,190,140,.75)',14)}ctx.restore()}
function beam(x,y,ang,len,spread,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.rotate(ang);const g=ctx.createLinearGradient(0,0,0,-len);g.addColorStop(0,'rgba(255,240,210,.55)');g.addColorStop(1,'rgba(255,240,210,0)');
 ctx.beginPath();ctx.moveTo(-8,0);ctx.lineTo(-len*spread,-len);ctx.lineTo(len*spread,-len);ctx.lineTo(8,0);ctx.closePath();ctx.fillStyle=g;ctx.fill();ctx.restore()}
function railing(y,x0,x1,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(x1,y);ctx.moveTo(x0,y+110);ctx.lineTo(x1,y+110);for(let x=x0;x<=x1;x+=34){ctx.moveTo(x,y);ctx.lineTo(x,y+110)}gs(4,LN);ctx.restore()}
function acUnit(x,y,s,a,t,on){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);
 rr(-170,-55,340,110,22);ctx.fillStyle=DARK;ctx.fill();gs(4,LN);ctx.beginPath();ctx.moveTo(-140,25);ctx.lineTo(140,25);ctx.moveTo(-140,38);ctx.lineTo(140,38);gs(2.5,'rgba(243,236,228,.55)');
 ctx.beginPath();ctx.arc(130,-25,6,0,7);ctx.fillStyle=on>0?OR:'#333';ctx.shadowColor=OR;ctx.shadowBlur=on>0?14:0;ctx.fill();ctx.shadowBlur=0;txt('AC',-120,-20,'800 26px M','rgba(243,236,228,.7)');
 if(on>0){for(let i=0;i<5;i++){const ph=(t*0.9+i/5)%1;ctx.globalAlpha=a*on*(1-ph)*0.9;ctx.beginPath();for(let k=0;k<=16;k++){const u=k/16;const xx=-120+u*240;const yy=70+ph*140+Math.sin(u*8+t*4+i)*8;k?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy)}gs(3,'rgba(160,210,255,.9)',10)}
  ctx.globalAlpha=a*on;ctx.save();ctx.translate(200,-10);ctx.rotate(t*0.6);for(let i=0;i<6;i++){ctx.rotate(Math.PI/3);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-26);ctx.moveTo(0,-16);ctx.lineTo(-7,-22);ctx.moveTo(0,-16);ctx.lineTo(7,-22);gs(3,'rgba(160,210,255,.95)',10)}ctx.restore()}
 ctx.restore()}
function bed(x,y,s,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);
 rr(-180,-10,360,60,10);ctx.fillStyle=DARK;ctx.fill();gs(4,LN);ctx.beginPath();ctx.moveTo(-180,-70);ctx.lineTo(-180,90);ctx.moveTo(180,0);ctx.lineTo(180,90);gs(6,LN);
 rr(-160,-45,80,38,16);ctx.fillStyle='rgba(243,236,228,.85)';ctx.fill();
 ctx.beginPath();ctx.moveTo(-90,-10);ctx.quadraticCurveTo(0,-60,170,-12);ctx.lineTo(170,-8);ctx.lineTo(-90,-8);ctx.closePath();ctx.fillStyle='rgba(255,138,31,.3)';ctx.fill();gs(3,OR,8);ctx.restore()}
function zzz(x,y,t,a){if(a<=0)return;for(let i=0;i<3;i++){const ph=(t*0.6+i/3)%1;ctx.save();ctx.globalAlpha*=a*Math.sin(ph*Math.PI);txt('Z',x+ph*60+i*8,y-ph*120,`900 ${30+ph*30}px M`,GOLD,'center',12);ctx.restore()}}
function bubble(x,y,s,a,t){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);rr(-70,-40,140,80,24);ctx.fillStyle='rgba(255,138,31,.16)';ctx.fill();gs(3,OR,12);ctx.beginPath();ctx.moveTo(-40,40);ctx.lineTo(-55,65);ctx.lineTo(-15,40);gs(3,OR);
 for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(-30+i*30,0+Math.sin(t*8+i)*4,8,0,7);ctx.fillStyle=GOLD;ctx.fill()}ctx.restore()}
function magnifier(x,y,r,a,t){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fillStyle='rgba(255,138,31,.08)';ctx.fill();gs(8,LN,0);ctx.beginPath();ctx.arc(0,0,r,0,7);gs(3,OR,24);
 ctx.beginPath();ctx.arc(0,0,r*0.75,-2.6,-1.9);gs(5,'rgba(255,255,255,.6)');ctx.rotate(0.8);rr(r-4,-14,r*1.1,28,12);ctx.fillStyle=DARK;ctx.fill();gs(5,LN);ctx.restore()}
function letter(x,y,r,L,a,hl){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fillStyle=hl?OR:'rgba(255,138,31,.15)';ctx.fill();gs(3,OR,hl?24:10);txt(L,x,y+2,`900 ${r*1.15}px M`,hl?'#1a0f06':GOLD);ctx.restore()}
function optCard(x,y,w,h,p,L,name,kind,hl,compact){if(p<=0)return;ctx.save();ctx.globalAlpha*=cl(p*1.4);ctx.translate(x,y);const k=p*(hl?1.05:1);ctx.scale(k,k);
 rr(-w/2,-h/2,w,h,h*0.3);ctx.fillStyle=hl?'rgba(60,30,10,.95)':'rgba(22,15,11,.92)';ctx.fill();gs(hl?4:2.5,hl?OR:'rgba(255,138,31,.7)',hl?30:14);
 letter(-w/2+h*0.55,0,h*0.32,L,1,hl);if(!compact){ctx.save();rr(-w/2,-h/2,w,h,h*0.3);ctx.clip();person(-w/2+h*1.45,h*0.12,h*0.0032,1,kind,false);ctx.restore()}
 txt(name,-w/2+h*(compact?1.15:2.1),2,`900 ${Math.round(h*0.34)}px M`,hl?GOLD:WH,'left');ctx.restore()}
function commentBox(x,y,a,typed,t,full='Chor hai ___ kyunki...'){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);
 rr(-440,-95,880,190,30);ctx.fillStyle='rgba(22,15,11,.95)';ctx.fill();gs(3,'rgba(255,138,31,.75)',18);
 ctx.beginPath();ctx.arc(-370,0,40,0,7);ctx.fillStyle='rgba(255,138,31,.25)';ctx.fill();gs(3,OR);stickHead(-370,0);
 const s=full.slice(0,Math.floor(full.length*typed));
 if(typed<=0)txt('Add a comment...',-300,0,'500 38px M','rgba(154,142,131,.8)','left');else txt(s,-300,0,'800 42px M',WH,'left');
 if(typed>0&&Math.sin(t*10)>0){ctx.font='800 42px M';const wd=ctx.measureText(s).width;ctx.fillStyle=OR;ctx.fillRect(-296+wd,-24,4,48)}
 ctx.save();ctx.translate(380,0);ctx.beginPath();ctx.moveTo(-22,-20);ctx.lineTo(24,0);ctx.lineTo(-22,20);ctx.lineTo(-14,0);ctx.closePath();ctx.fillStyle=OR;ctx.shadowColor=OR;ctx.shadowBlur=14;ctx.fill();ctx.restore();ctx.restore()}
function stickHead(x,y){ctx.beginPath();ctx.arc(x,y-10,12,0,7);gs(3,WH);ctx.beginPath();ctx.arc(x,y+26,22,Math.PI*1.1,Math.PI*1.9);gs(3,WH)}
function panel(x,y,w,h,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;rr(x-w/2,y-h/2,w,h,26);ctx.fillStyle='rgba(16,11,8,.85)';ctx.fill();gs(2.5,'rgba(255,138,31,.45)',14);ctx.restore()}

function diya(x,y,s,a,t){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;candleFlame(x,y-10*s,s*0.55,t+x);ctx.translate(x,y);ctx.scale(s,s);ctx.beginPath();ctx.moveTo(-26,-8);ctx.quadraticCurveTo(0,22,26,-8);ctx.closePath();ctx.fillStyle='rgba(150,60,20,.95)';ctx.fill();gs(3,GOLD,8);ctx.restore()}
function burst(x,y,r,ph,a,col){if(a<=0||ph<=0||ph>=1)return;ctx.save();ctx.globalAlpha*=a*(1-ph)*(ph<0.15?ph/0.15:1);const R=r*eo(ph);for(let i=0;i<16;i++){const an=i/16*Math.PI*2;ctx.beginPath();ctx.moveTo(x+Math.cos(an)*R*0.6,y+Math.sin(an)*R*0.6+ph*30);ctx.lineTo(x+Math.cos(an)*R,y+Math.sin(an)*R+ph*30);ctx.lineCap='round';gs(4,i%2?col:'#fff3e0',16)}ctx.restore()}
function fireworks(t,a,area){if(a<=0)return;const [x0,y0,w,h]=area;for(let k=0;k<4;k++){const per=1.6,ph=((t+k*0.43)%per)/per;const cyc=Math.floor((t+k*0.43)/per);const r=rng(cyc*7+k);burst(x0+r()*w,y0+r()*h,70+r()*60,ph,a,k%2?OR:GOLD)}}
function gateBars(x,y,s,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);rr(-190,-150,30,300,4);ctx.fillStyle=DARK;ctx.fill();gs(4,LN);rr(160,-150,30,300,4);ctx.fill();gs(4,LN);
 ctx.beginPath();for(let i=0;i<9;i++){const bx=-140+i*35;ctx.moveTo(bx,150);ctx.lineTo(bx,-90+Math.sin(i/8*Math.PI)*-30)}ctx.moveTo(-160,-40);ctx.lineTo(160,-40);ctx.moveTo(-160,100);ctx.lineTo(160,100);gs(4,LN);ctx.restore()}
function rumaal(x,y,s,a,rot){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.rotate(rot);ctx.scale(s,s);ctx.beginPath();ctx.moveTo(-60,-50);ctx.quadraticCurveTo(0,-62,60,-50);ctx.quadraticCurveTo(70,0,58,50);ctx.quadraticCurveTo(0,40,-58,52);ctx.quadraticCurveTo(-70,0,-60,-50);ctx.closePath();
 ctx.fillStyle='rgba(243,236,228,.9)';ctx.fill();gs(3,LN);ctx.setLineDash([6,6]);rr(-46,-38,92,78,6);gs(2.5,OR);ctx.setLineDash([]);txt('R',22,18,'900 30px M',OR);ctx.restore()}
const SUS=[['A','RAJU','chef'],['B','PINKY','hair'],['C','VICKY','cap']];

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


// ---------- 3D layer (three.js r149), masked to the illustration band ----------
const R3D=(function(){
 const cv=document.getElementById('g3');
 const ren=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true,preserveDrawingBuffer:true});
 ren.setPixelRatio(1);ren.setSize(W,H,false);ren.setClearColor(0x000000,0);ren.outputEncoding=THREE.sRGBEncoding;ren.toneMapping=THREE.ACESFilmicToneMapping;
 let sd=99;const rnd=()=>{sd|=0;sd=sd+0x6D2B79F5|0;let q=Math.imul(sd^sd>>>15,1|sd);q=q+Math.imul(q^q>>>7,61|q)^q;return((q^q>>>14)>>>0)/4294967296};
 const gc=document.createElement('canvas');gc.width=gc.height=128;{const g=gc.getContext('2d');const r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.2,'rgba(255,214,150,.8)');r.addColorStop(.5,'rgba(255,138,31,.25)');r.addColorStop(1,'rgba(255,100,0,0)');g.fillStyle=r;g.fillRect(0,0,128,128)}
 const GLOW=new THREE.CanvasTexture(gc);
 const sprite=(c,s,o=1)=>{const m=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:c,transparent:true,opacity:o,blending:THREE.AdditiveBlending,depthWrite:false}));m.scale.set(s,s,1);return m};
 const VS=`attribute float aSize;attribute float aOn;attribute vec3 aColor;attribute float aSeed;attribute vec3 aVel;uniform float uTime;uniform float uMode;varying vec3 vC;varying float vA;
 void main(){vec3 p=position;float on=smoothstep(aOn,aOn+.4,uTime);
 if(uMode==1.){float h=mod(aSeed*30.+uTime*aVel.y,aVel.z);p.y+=h;p.x+=sin(uTime*1.3+aSeed*20.)*aVel.x;on*=smoothstep(0.,.15*aVel.z,h)*(1.-smoothstep(.7*aVel.z,aVel.z,h));}
 if(uMode==2.){float dt=max(uTime-aOn,0.);p+=aVel*(1.-exp(-dt*1.6))+vec3(0.,-.5*dt*dt,0.);on=step(aOn,uTime)*clamp(1.-dt/2.,0.,1.);}
 vec4 mv=modelViewMatrix*vec4(p,1.);float tw=.75+.25*sin(uTime*(2.5+aSeed*6.)+aSeed*50.);gl_PointSize=aSize*on*tw*900./(-mv.z);vC=aColor;vA=on;gl_Position=projectionMatrix*mv;}`;
 const FS=`uniform float uGain;varying vec3 vC;varying float vA;void main(){float d=length(gl_PointCoord-.5);float a=pow(smoothstep(.5,0.,d),1.3);gl_FragColor=vec4(vC*a*vA*uGain,a*vA);}`;
 function pts(arr,mode=0){const n=arr.length,P=new Float32Array(n*3),C=new Float32Array(n*3),S=new Float32Array(n),O=new Float32Array(n),D=new Float32Array(n),V=new Float32Array(n*3);
  arr.forEach((o,i)=>{P.set(o.p,i*3);C.set(o.c,i*3);S[i]=o.s;O[i]=o.on??-99;D[i]=rnd();V.set(o.v||[0,0,0],i*3)});const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('aColor',new THREE.BufferAttribute(C,3));g.setAttribute('aSize',new THREE.BufferAttribute(S,1));g.setAttribute('aOn',new THREE.BufferAttribute(O,1));g.setAttribute('aSeed',new THREE.BufferAttribute(D,1));g.setAttribute('aVel',new THREE.BufferAttribute(V,3));
  const m=new THREE.ShaderMaterial({vertexShader:VS,fragmentShader:FS,uniforms:{uTime:{value:0},uMode:{value:mode},uGain:{value:1.6}},transparent:true,depthWrite:false,blending:THREE.CustomBlending,blendSrc:THREE.OneFactor,blendDst:THREE.OneFactor});const o=new THREE.Points(g,m);o.frustumCulled=false;return o}
 const sparks=(n,box,c,h,sp,sz)=>pts(Array.from({length:n},()=>({p:[(rnd()-.5)*box[0],box[1],(rnd()-.5)*box[2]],s:sz*(.5+rnd()),c,v:[.15+rnd()*.2,sp*(.5+rnd()),h]})),1);
 const flameMat=()=>new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uTime:{value:0},uOn:{value:1}},
  vertexShader:`uniform float uTime;varying float vy;void main(){vec3 p=position;vy=p.y;p.x+=sin(uTime*9.+p.y*4.)*.06*max(p.y,0.);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
  fragmentShader:`uniform float uOn;varying float vy;void main(){float y=clamp(vy*.5+.5,0.,1.);vec3 c=mix(vec3(1.,1.,.9),vec3(1.,.54,.12),smoothstep(.15,.85,y));float a=(1.-smoothstep(.55,1.,y))*.95+.05;gl_FragColor=vec4(c*a*1.8*uOn,a*uOn);}`});
 function diya(light=true){const g=new THREE.Group();const pr=[];for(let i=0;i<=12;i++){const q=i/12;pr.push(new THREE.Vector2(.08+.92*Math.sin(q*Math.PI/2),-.32+.42*(1-Math.cos(q*Math.PI/2))))}pr.push(new THREE.Vector2(.95,.1),new THREE.Vector2(.85,.06));for(let i=10;i>=0;i--){const q=i/10;pr.push(new THREE.Vector2(.85*Math.sin(q*Math.PI/2),-.2+.26*(1-Math.cos(q*Math.PI/2))))}
  const mat=new THREE.MeshStandardMaterial({color:0x9a4520,roughness:.7});const b=new THREE.Mesh(new THREE.LatheGeometry(pr,48),mat);b.scale.set(1,1,.82);g.add(b);
  const sp=new THREE.Mesh(new THREE.ConeGeometry(.22,.6,24,1,true),mat);sp.rotation.z=Math.PI/2;sp.position.set(.95,.02,0);sp.scale.set(1,1,.7);g.add(sp);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.9,.035,8,64),new THREE.MeshStandardMaterial({color:0xffb15c,metalness:.9,roughness:.3,emissive:0x552200}));rim.rotation.x=Math.PI/2;rim.position.y=.08;rim.scale.set(1,.82,1);g.add(rim);
  const fl=new THREE.Mesh(new THREE.SphereGeometry(.16,24,16),flameMat());fl.geometry.translate(0,.75,0);fl.scale.set(1,2.6,1);fl.position.set(.95,-.28,0);g.add(fl);
  const ha=sprite(0xff8a1f,2.4,.9);ha.position.set(.95,.35,0);g.add(ha);let L=null;if(light){L=new THREE.PointLight(0xff9a3c,6,8,1.6);L.position.set(.95,.6,0);g.add(L)}
  g.userData.set=(t,on=1)=>{const f=.88+.12*Math.sin(t*13+g.id)*Math.sin(t*7.3+g.id*2);fl.material.uniforms.uTime.value=t;fl.material.uniforms.uOn.value=on;fl.scale.set(on,2.6*f*on+.001,on);ha.material.opacity=.85*f*on;fl.visible=ha.visible=on>.01;if(L)L.intensity=6*f*on};return g}
 function vimana(){const g=new THREE.Group();const gold=new THREE.MeshStandardMaterial({color:0xffb15c,metalness:.9,roughness:.3,emissive:0x2a1200});const iv=new THREE.MeshStandardMaterial({color:0xf3ece4,roughness:.5});const red=new THREE.MeshStandardMaterial({color:0xff5a1f,side:THREE.DoubleSide,emissive:0x401000});
  const base=new THREE.Mesh(new THREE.CylinderGeometry(1.7,1.25,.36,16),gold);g.add(base);const dk=new THREE.Mesh(new THREE.CylinderGeometry(1.55,1.6,.08,16),iv);dk.position.y=.22;g.add(dk);
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2;const p=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.7,8),gold);p.position.set(Math.cos(a)*1.35,.6,Math.sin(a)*1.35);g.add(p)}
  const rf=new THREE.Mesh(new THREE.CylinderGeometry(1.45,1.5,.12,16),gold);rf.position.y=.98;g.add(rf);
  [[1.05,.42,iv],[.8,.38,gold],[.58,.34,iv],[.4,.3,gold]].forEach(([r,h,m],i)=>{const q=new THREE.Mesh(new THREE.CylinderGeometry(r*.85,r,h,8),m);q.position.y=1.2+i*.36;g.add(q)});
  const dm=new THREE.Mesh(new THREE.SphereGeometry(.34,24,12,0,Math.PI*2,0,Math.PI/2),gold);dm.position.y=2.55;g.add(dm);const k=new THREE.Mesh(new THREE.ConeGeometry(.08,.45,12),gold);k.position.y=3.05;g.add(k);
  const flags=[];for(let i=0;i<4;i++){const a=i/4*Math.PI*2+.4;const pl=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,.9,6),gold);pl.position.set(Math.cos(a)*1.3,1.4,Math.sin(a)*1.3);g.add(pl);const s=new THREE.Shape();s.moveTo(0,0);s.lineTo(.5,-.12);s.lineTo(0,-.28);const f=new THREE.Mesh(new THREE.ShapeGeometry(s),red);f.position.set(Math.cos(a)*1.3,1.85,Math.sin(a)*1.3);g.add(f);flags.push(f)}
  [[-.35,0x3b5bdb],[0,0xff5a1f],[.35,0x2f9e44]].forEach(([x,c])=>{const b=new THREE.Mesh(new THREE.CylinderGeometry(.07,.12,.36,10),new THREE.MeshStandardMaterial({color:c}));b.position.set(x,.44,.95);g.add(b);const h=new THREE.Mesh(new THREE.SphereGeometry(.07,12,12),new THREE.MeshStandardMaterial({color:0xc58c63}));h.position.set(x,.68,.95);g.add(h)});
  const u=sprite(0xff8a1f,4.5,.9);u.position.y=-.4;g.add(u);const L=new THREE.PointLight(0xffa050,8,10,1.5);L.position.y=-.2;g.add(L);g.userData.flags=flags;return g}
 const mk=()=>{const sc=new THREE.Scene();const cam=new THREE.PerspectiveCamera(40,W/H,.05,500);sc.add(new THREE.HemisphereLight(0xffe0c0,0x1a0c06,.7));return {sc,cam}};
 const S={};
 // 0 hook: hero diya
 {const {sc,cam}=mk();const d=diya();d.scale.setScalar(1.25);sc.add(d);const orbs=[];for(let i=0;i<6;i++){const o=diya(false);o.scale.setScalar(.38);sc.add(o);orbs.push(o)}
  const sp=sparks(180,[6,-.5,6],[1,.6,.2],5,.45,.07);sc.add(sp);
  S[0]={sc,cam,mats:[sp.material],up(t,lt){cam.position.set(Math.sin(lt*.3)*1.2,2.4-lt*.05,13.5-lt*.2);cam.lookAt(0,.9,0);d.rotation.y=lt*.4;d.userData.set(t,seg(t,E('diye0')-.3,E('diye0')+.3));
   orbs.forEach((o,i)=>{const a=i/6*Math.PI*2+lt*.5;o.position.set(Math.cos(a)*2.9,.1+Math.sin(lt*1.5+i)*.25,Math.sin(a)*2.9);o.rotation.y=-a;o.userData.set(t,seg(t,E('mithaiyan')+i*.15,E('mithaiyan')+.4+i*.15))})}}}
 // 4 ravana heads + golden arrow
 {const {sc,cam}=mk();const dl=new THREE.DirectionalLight(0xff8a50,1.2);dl.position.set(3,5,6);sc.add(dl);
  const rav=new THREE.Group();sc.add(rav);rav.position.z=-6;const hm=new THREE.MeshStandardMaterial({color:0x241812,roughness:.4,metalness:.5,flatShading:true});const cm=new THREE.MeshStandardMaterial({color:0x8a5a10,metalness:1,roughness:.35});const ey=new THREE.MeshBasicMaterial({color:0xff3a00});
  const heads=[];for(let i=0;i<10;i++){const a=(i-4.5)/4.5;const h=new THREE.Group();h.add(new THREE.Mesh(new THREE.IcosahedronGeometry(.62,1),hm));const c=new THREE.Mesh(new THREE.ConeGeometry(.45,.7,6),cm);c.position.y=.75;h.add(c);[-.2,.2].forEach(x=>{const e=new THREE.Mesh(new THREE.SphereGeometry(.07,8,8),ey);e.position.set(x,.08,.55);h.add(e)});
   h.position.set(a*3.6,2.4+(1-a*a)*1.2,-Math.abs(a)*1.2);h.scale.setScalar(i==4||i==5?1.2:.9);rav.add(h);heads.push(h)}
  const body=new THREE.Mesh(new THREE.ConeGeometry(2.8,5,8,1,true),hm);body.position.y=-1;rav.add(body);const ev=sprite(0xff2200,12,.4);ev.position.set(0,2.6,-2);rav.add(ev);
  const ar=new THREE.Group();const gm=new THREE.MeshStandardMaterial({color:0xffd36b,emissive:0xff8a1f,emissiveIntensity:2,metalness:.8,roughness:.2});ar.add(new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,3,12),gm));const tp=new THREE.Mesh(new THREE.ConeGeometry(.14,.5,12),gm);tp.position.y=1.7;ar.add(tp);const ah=sprite(0xffb15c,3,1);ah.position.y=1.6;ar.add(ah);const tr=sparks(220,[.3,0,.3],[1,.7,.3],1.5,2.5,.12);ar.add(tr);sc.add(ar);
  let ex=null,sun=sprite(0xffb15c,0,1);sun.position.set(0,2.6,-6);sc.add(sun);
  S[4]={sc,cam,mats:[tr.material],up(t,lt){const T1=E('haraaya')+.15,T0=T1-.9;if(!ex){const a=[];heads.forEach(h=>{const hp=h.position.clone();hp.z-=6;for(let i=0;i<60;i++){const v=new THREE.Vector3(rnd()-.5,rnd()-.3,rnd()-.5).normalize().multiplyScalar(2+rnd()*4);a.push({p:[hp.x,hp.y,hp.z],s:.12+rnd()*.15,on:T1,c:rnd()<.5?[1,.7,.3]:[1,.45,.12],v:[v.x,v.y,v.z]})}});ex=pts(a,2);sc.add(ex);this.mats.push(ex.material)}
   cam.position.set(Math.sin(lt*.15),.6,17-lt*.15);cam.lookAt(0,1.4,-6);const hit=t>=T1;heads.forEach((h,i)=>{h.visible=!hit;h.rotation.y=Math.sin(t*.8+i)*.3});body.visible=!hit;ev.material.opacity=hit?0:.4+.15*Math.sin(t*3);
   const k=cl((t-T0)/(T1-T0));ar.visible=t>=T0-.05&&!hit;const st=new THREE.Vector3(-2.5,-3,7),en=new THREE.Vector3(0,3,-6);ar.position.copy(st.clone().lerp(en,k));ar.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),en.clone().sub(st).normalize());
   const s2=seg(t,T1,T1+1.2)*9;sun.scale.set(s2,s2,1);sun.material.opacity=hit?.75:0}}}
 // 5 vimana flight
 {const {sc,cam}=mk();const dl=new THREE.DirectionalLight(0xffd0a0,.8);dl.position.set(-5,8,4);sc.add(dl);const v=vimana();sc.add(v);const sp=sparks(140,[2.4,-.6,2.4],[1,.6,.25],2.5,-1.4,.07);v.add(sp);
  const cl2=pts(Array.from({length:120},()=>({p:[(rnd()-.5)*40,-3-rnd()*3,-20+rnd()*20],s:.5+rnd()*.6,c:[.25,.16,.1]})));sc.add(cl2);
  S[5]={sc,cam,mats:[sp.material,cl2.material],up(t,lt,dur){const k=lt/dur;const p=new THREE.Vector3(lerp(-5,4,k),Math.sin(lt*.9)*.25+lerp(.6,-.2,k),lerp(-6,0,k));v.position.copy(p);v.rotation.set(Math.sin(lt*.7)*.06,.6+lt*.15,-.08);v.userData.flags.forEach((f,i)=>f.rotation.y=Math.sin(t*6+i)*.4);
   cam.position.set(p.x-2.5+lt*.3,p.y+2.6,p.z+14);cam.lookAt(p.x,p.y+2.3,p.z)}}}
 // 7 ayodhya lights up
 {const {sc,cam}=mk();const warm=new THREE.PointLight(0xff9a40,0,60,1.2);warm.position.set(0,8,-6);sc.add(warm);
  const gr=new THREE.Mesh(new THREE.PlaneGeometry(120,120),new THREE.MeshStandardMaterial({color:0x1a110c,roughness:.9}));gr.rotation.x=-Math.PI/2;sc.add(gr);
  const L=[],hs=[];for(let z=-20;z<30;z+=1.8)for(let x=-20;x<=20;x+=1.8){if(Math.abs(x)<2.2&&z>-4)continue;if(Math.hypot(x,z+8)<5.5)continue;if(rnd()<.18)continue;const w=.9+rnd()*.6,h=.7+rnd()*1.6,d=.9+rnd()*.6,px=x+(rnd()-.5)*.4,pz=z+(rnd()-.5)*.4;hs.push([px,pz,w,h,d]);
   const on=Math.hypot(px,pz-30)*.11+Math.abs(px)*.04+rnd()*.4;for(let k=0;k<4;k++)L.push({p:[px+(k%2?1:-1)*w*.6,h+.03,pz+(k<2?1:-1)*d*.6],s:.75,on,c:[1,.5,.12]});L.push({p:[px,h*.45,pz+d/2+.02],s:.85,on:on+.2,c:[1,.55,.15]})}
  const hb=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:0x6a4a34,roughness:.8}),hs.length);const hr=new THREE.InstancedMesh(new THREE.ConeGeometry(.75,.6,4),new THREE.MeshStandardMaterial({color:0x8a3a1a,roughness:.7}),hs.length);
  const M=new THREE.Matrix4(),q=new THREE.Quaternion(),q2=new THREE.Quaternion().setFromEuler(new THREE.Euler(0,Math.PI/4,0));hs.forEach(([x,z,w,h,d],i)=>{M.compose(new THREE.Vector3(x,h/2,z),q,new THREE.Vector3(w,h,d));hb.setMatrixAt(i,M);M.compose(new THREE.Vector3(x,h+.3,z),q2,new THREE.Vector3(w*.95,1,d*.95));hr.setMatrixAt(i,M)});sc.add(hb,hr);
  const pm=new THREE.MeshStandardMaterial({color:0x9a7a5a,roughness:.6}),pg=new THREE.MeshStandardMaterial({color:0xffb15c,metalness:.8,roughness:.3});const pal=new THREE.Group();
  const add=(geo,m,x,y,z,ry=0)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.rotation.y=ry;pal.add(o);return o};
  add(new THREE.BoxGeometry(9,2.2,5),pm,0,1.1,0);add(new THREE.BoxGeometry(9.4,.25,5.4),pg,0,2.3,0);
  [[0,1.15],[-2.9,.8],[2.9,.8]].forEach(([x,k])=>{[[2.6,.7],[2.0,.6],[1.4,.55],[.85,.5]].forEach(([w,h],i)=>{add(new THREE.BoxGeometry(w*k,h*k,w*k),i%2?pg:pm,x,2.4+(.35+i*.6)*k,0)});add(new THREE.ConeGeometry(.5*k,1.2*k,4),pg,x,2.4+3.0*k,0,Math.PI/4);add(new THREE.ConeGeometry(.08,.5,8),pg,x,2.4+3.85*k,0)});
  for(const x of[-4.2,-1.5,1.5,4.2]){add(new THREE.BoxGeometry(.7,.6,.7),pm,x,2.75,2.2);add(new THREE.ConeGeometry(.5,.5,4),pg,x,3.3,2.2,Math.PI/4)}
  const arch=new THREE.Mesh(new THREE.TorusGeometry(.9,.12,8,24,Math.PI),pg);arch.position.set(0,1.0,2.52);pal.add(arch);
  pal.position.z=-8;sc.add(pal);
  for(let i=0;i<60;i++)L.push({p:[-4.5+i/60*9,2.45,-5.25],s:.6,on:1.6+Math.abs(i/60-.5)*1.5,c:[1,.6,.25]});for(let z=-4;z<30;z+=.55)[-1.25,1.25].forEach(x=>L.push({p:[x,.05,z],s:.9,on:(30-z)*.05,c:[1,.5,.12]}));
  const LP=pts(L);LP.material.uniforms.uGain.value=3.2;sc.add(LP);
  S[7]={sc,cam,mats:[LP.material],tOff:0,up(t,lt,dur){const t0=E('laakhon')-.4;LP.material.uniforms.uTime.value=t-t0;const k=eio(cl(lt/dur));cam.position.set(lerp(8,3,k),lerp(15,8,k),lerp(42,32,k));cam.lookAt(0,lerp(0,1.5,k),lerp(8,-4,k));
   const g=seg(t,t0,t0+5);sc.children[0].intensity=.12+g*.18;warm.intensity=g*5},own:true}}
 // 9 lakshmi lotus + coins
 {const {sc,cam}=mk();const L1=new THREE.PointLight(0xffc080,10,20,1.4);L1.position.set(0,3,2);sc.add(L1);const lotus=new THREE.Group();sc.add(lotus);const pet=[];const pg=new THREE.SphereGeometry(1,24,12);pg.translate(0,1,0);
  [[8,0,0xff7a3d,1.05],[8,Math.PI/8,0xff9b5c,.85],[6,0,0xffd0a0,.62]].forEach(([n,off,c,s],ri)=>{const m=new THREE.MeshStandardMaterial({color:c,roughness:.45,emissive:c,emissiveIntensity:.08,side:THREE.DoubleSide});for(let i=0;i<n;i++){const pv=new THREE.Group();pv.rotation.y=i/n*Math.PI*2+off;const p=new THREE.Mesh(pg,m);p.scale.set(.32*s,.85*s,.1*s);pv.add(p);lotus.add(pv);pet.push({p,ri})}});
  const pod=new THREE.Mesh(new THREE.CylinderGeometry(.28,.22,.18,24),new THREE.MeshStandardMaterial({color:0xffd23f,emissive:0xff8a00,emissiveIntensity:.8}));pod.position.y=.25;lotus.add(pod);const halo=sprite(0xff8a1f,0,1);halo.position.set(0,1.4,-1);sc.add(halo);
  const coins=new THREE.InstancedMesh(new THREE.CylinderGeometry(.13,.13,.025,24),new THREE.MeshStandardMaterial({color:0xffc83d,metalness:1,roughness:.25,emissive:0x3a2000}),70);sc.add(coins);const cs=Array.from({length:70},()=>[(rnd()-.5)*6,rnd(),(rnd()-.5)*3-1,.8+rnd()*.8,rnd()*6]);
  const sp=sparks(200,[5,-.2,3],[1,.75,.35],6,.6,.07);sc.add(sp);
  S[9]={sc,cam,mats:[sp.material],up(t,lt){cam.position.set(Math.sin(lt*.2)*1.2,2.6-lt*.06,9.5-lt*.2);cam.lookAt(0,1.1,0);const op=eo(cl((t-E('lakshmi')+.4)/3));pet.forEach(({p,ri})=>p.rotation.x=lerp(.12,[1.25,.95,.55][ri],op));lotus.rotation.y=lt*.15;const h=seg(lt,.5,5)*8;halo.scale.set(h,h,1);
   const M=new THREE.Matrix4(),q=new THREE.Quaternion(),one=new THREE.Vector3(1,1,1),z=new THREE.Vector3(0,0,0);const on=t>E('pooja');cs.forEach(([x,y0,zz,s,ph],i)=>{q.setFromEuler(new THREE.Euler(t*2+ph,t*3+ph,0));M.compose(new THREE.Vector3(x,5.5-((y0*7+lt*s*1.4)%7),zz),q,on?one:z);coins.setMatrixAt(i,M)});coins.instanceMatrix.needsUpdate=true}}}
 // 12 the book
 {const {sc,cam}=mk();const dl=new THREE.DirectionalLight(0xffffff,1.6);dl.position.set(2,3,6);sc.add(dl);const rim=new THREE.PointLight(0xff8a1f,40,20,1.5);rim.position.set(-3,1,-2);sc.add(rim);
  const tex=new THREE.TextureLoader().load(window.COVER);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=8;
  const side=new THREE.MeshStandardMaterial({color:0x1f3a2a,roughness:.6}),pages=new THREE.MeshStandardMaterial({color:0xf3ece4,roughness:.9}),front=new THREE.MeshStandardMaterial({map:tex,roughness:.45}),back=new THREE.MeshStandardMaterial({color:0x2a1a10,roughness:.6});
  const book=new THREE.Mesh(new THREE.BoxGeometry(2.6,4.2,.42),[pages,side,pages,pages,front,back]);sc.add(book);const ha=sprite(0xff8a1f,9,.55);ha.position.z=-1.5;sc.add(ha);const sp=sparks(200,[5,-2.5,3],[1,.7,.3],6,.5,.07);sc.add(sp);
  S[12]={sc,cam,mats:[sp.material],up(t,lt){cam.position.set(0,0,17);cam.lookAt(0,.15,0);const e=eo(cl(lt/1.2));book.position.set(0,lerp(-4,0,e),0);book.rotation.set(Math.sin(lt*.6)*.06,lerp(-2.4,0,e)+Math.sin(lt*.7)*.32,Math.sin(lt*.5)*.03);ha.material.opacity=.45+.15*Math.sin(lt*2)}}}
 return function(i,t,lt,dur,a){const o=S[i];cv.style.opacity=o?a:0;if(!o)return;o.up(t,lt,dur);if(!o.own)o.mats.forEach(m=>m.uniforms.uTime.value=t);else o.mats.forEach((m,k)=>{if(k>0)m.uniforms.uTime.value=t});ren.render(o.sc,o.cam)};
})();

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
 SCN[i](t,lt,dur);ctx.restore();R3D(i,t,lt,dur,a);ctx.globalAlpha=1;
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
