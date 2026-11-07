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
 {pill:'CASE 01 · PART 2',title:'Chor <em>Kaun</em> Tha?',sub:'Jawaab + the Why',tag:'REVEAL'},
 {pill:'01 · RAJU',title:'Rumaal = <em>Trap</em>',sub:'Raju shaam ko khaana dene gaya tha',tag:'BEGUNAAH'},
 {pill:'02 · VICKY',title:'Vicky <em>Sach</em> Bola',sub:'Diwali par patakhe har taraf',tag:'BEGUNAAH'},
 {pill:'03 · REVEAL',title:'Chor Thi <em>Pinky!</em>',sub:'"Main chaand ki roshni mein thi"',tag:'SUSPECT B'},
 {pill:'04 · THE CLUE',title:'Diwali = <em>No Moon</em>',sub:'Aasmaan mein chaand hi nahi',tag:'THE · WHY'},
 {pill:'05 · WHY?',title:'Kartik <em>Amavasya</em>',sub:'Diwali hamesha amavasya ko',tag:'HINDU · CALENDAR'},
 {pill:'06 · SCIENCE',title:'Chaand <em>Beech</em> Mein',sub:'Suraj · Chaand · Dharti',tag:'NEW · MOON'},
 {pill:'07 · NATEEJA',title:'<em>Impossible!</em>',sub:'Na chaand, na bijli',tag:'JHOOTH · PAKDA'},
 {pill:'08 · BONUS WHY',title:'Isliye <em>Diye</em>',sub:'Andheri raat ko roshan karna',tag:'DEEPAWALI'},
 {pill:'09 · SOLVED',title:'Case <em>Solved!</em>',sub:'Dadi ka haar wapas',tag:'CASE · CLOSED'},
 {pill:'10 · COMMENT KARO',title:'Aap <em>Sahi</em> The?',sub:'Comments mein batao',tag:'CASE 02 · SOON'},
];
const HL=['jawaab','raju','rumaal','trap','vicky','sach','patakhe','pinky','chor','chaand','diwali','kartik','amavasya','dharti','suraj','beech','peeche','andhera','bijli','impossible','diye','roshan','jhooth','haar','wapas','sahi','comments','case'];

// ---------- part 2 primitives ----------
function stamp(x,y,s,p,label){if(p<=0)return;const k=lerp(2.2,1,eo(cl(p*1.6)));ctx.save();ctx.globalAlpha*=cl(p*2);ctx.translate(x,y);ctx.rotate(-0.18);ctx.scale(s*k,s*k);
 ctx.font='900 64px M';const w=ctx.measureText(label).width+70;rr(-w/2,-56,w,112,14);gs(7,OR,22);rr(-w/2+12,-44,w-24,88,8);gs(2.5,OR);txt(label,0,4,'900 64px M',OR,'center',18);ctx.restore()}
function folder(x,y,s,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);ctx.beginPath();ctx.moveTo(-230,-140);ctx.lineTo(-90,-140);ctx.lineTo(-60,-110);ctx.lineTo(230,-110);ctx.lineTo(230,160);ctx.lineTo(-230,160);ctx.closePath();
 ctx.fillStyle='rgba(60,36,18,.95)';ctx.fill();gs(4,LN);txt('CASE 01',-150,-120,'500 22px J',GOLD,'left');
 rr(-190,-80,380,210,8);ctx.fillStyle='rgba(243,236,228,.08)';ctx.fill();ctx.strokeStyle='rgba(243,236,228,.35)';ctx.lineWidth=2;ctx.stroke();
 for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(-160,-40+i*35);ctx.lineTo(i%2?100:160,-40+i*35);gs(3,'rgba(243,236,228,.3)')}ctx.restore()}
function thali(x,y,s,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);ctx.beginPath();ctx.ellipse(0,0,110,40,0,0,7);ctx.fillStyle='rgba(200,205,210,.25)';ctx.fill();gs(4,LN);
 for(const[bx,by,c]of[[-50,-6,'rgba(255,177,92,.8)'],[0,-14,'rgba(243,236,228,.85)'],[50,-6,'rgba(220,120,40,.85)']]){ctx.beginPath();ctx.ellipse(bx,by,26,11,0,0,7);ctx.fillStyle=c;ctx.fill();gs(2.5,LN)}
 ctx.beginPath();ctx.ellipse(0,18,46,10,0,0,7);ctx.fillStyle='rgba(243,236,228,.5)';ctx.fill();ctx.restore()}
function spot(x,y,w,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;const g=ctx.createLinearGradient(0,560,0,y+150);g.addColorStop(0,'rgba(255,220,170,.0)');g.addColorStop(1,'rgba(255,200,140,.28)');
 ctx.beginPath();ctx.moveTo(x-40,560);ctx.lineTo(x+40,560);ctx.lineTo(x+w,y+150);ctx.lineTo(x-w,y+150);ctx.closePath();ctx.fillStyle=g;ctx.fill();ctx.beginPath();ctx.ellipse(x,y+150,w,30,0,0,7);ctx.fillStyle='rgba(255,200,140,.18)';ctx.fill();ctx.restore()}
function thought(x,y,s,a,inner){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);ctx.beginPath();ctx.ellipse(0,0,120,90,0,0,7);ctx.fillStyle='rgba(22,15,11,.92)';ctx.fill();gs(3,LN,8);
 for(const[cx,cy,r]of[[-90,95,16],[-120,130,9]]){ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.fillStyle='rgba(22,15,11,.92)';ctx.fill();gs(3,LN)}if(inner)inner();ctx.restore()}
// k = visible lit fraction (1 full, 0 new)
function moonK(x,y,r,k,a,ring){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fillStyle='#0d0a09';ctx.fill();
 ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.clip();ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fillStyle='rgba(243,236,228,.92)';ctx.shadowColor='#fff';ctx.shadowBlur=18;ctx.fill();ctx.shadowBlur=0;
 if(k<1){ctx.beginPath();ctx.arc(x-(k)*2*r,y,r*1.02,0,7);ctx.fillStyle='#120d0a';ctx.fill()}ctx.restore();
 ctx.beginPath();ctx.arc(x,y,r,0,7);gs(2.5,ring?OR:'rgba(243,236,228,.6)',ring?20:0);ctx.restore()}
function dashedMoon(x,y,r,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.setLineDash([10,10]);ctx.beginPath();ctx.arc(x,y,r,0,7);gs(3,'rgba(243,236,228,.55)');ctx.setLineDash([]);txt('?',x,y+4,`900 ${r}px M`,'rgba(243,236,228,.4)');ctx.restore()}
function sunDisc(x,y,r,a,t){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;const g=ctx.createRadialGradient(x,y,0,x,y,r*2.4);g.addColorStop(0,'rgba(255,170,60,.5)');g.addColorStop(1,'rgba(255,120,20,0)');ctx.fillStyle=g;ctx.fillRect(x-r*2.4,y-r*2.4,r*4.8,r*4.8);
 ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fillStyle='rgba(255,160,50,.85)';ctx.shadowColor=OR;ctx.shadowBlur=40;ctx.fill();ctx.shadowBlur=0;ctx.translate(x,y);ctx.rotate(t*0.3);for(let i=0;i<12;i++){ctx.rotate(Math.PI/6);ctx.beginPath();ctx.moveTo(r+10,0);ctx.lineTo(r+30,0);gs(4,GOLD,10)}ctx.restore()}
// moon lit on the side facing angle `toward` (radians)
function moonHalf(x,y,r,a,toward){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fillStyle='#1a1410';ctx.fill();
 ctx.beginPath();ctx.arc(x,y,r,toward-Math.PI/2,toward+Math.PI/2);ctx.closePath();ctx.fillStyle='rgba(243,236,228,.95)';ctx.shadowColor='#fff';ctx.shadowBlur=16;ctx.fill();ctx.shadowBlur=0;ctx.beginPath();ctx.arc(x,y,r,0,7);gs(2.5,LN);ctx.restore()}
function earth(x,y,r,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fillStyle='rgba(40,80,140,.55)';ctx.fill();gs(4,LN,8);ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.clip();
 ctx.fillStyle='rgba(120,180,90,.7)';ctx.beginPath();ctx.ellipse(x-20,y-25,30,22,0.4,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(x+25,y+20,24,32,-0.3,0,7);ctx.fill();ctx.restore();ctx.restore()}
function eyeIcon(x,y,s,a){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);ctx.beginPath();ctx.moveTo(-30,0);ctx.quadraticCurveTo(0,-26,30,0);ctx.quadraticCurveTo(0,26,-30,0);gs(3.5,LN);ctx.beginPath();ctx.arc(0,0,9,0,7);ctx.fillStyle=OR;ctx.fill();ctx.restore()}

// ---------- scenes ----------
function S0(t,lt,dur){ // case 01 jawaab
 const a=eo(seg(lt,0,0.5));folder(540,1040,1.0,a);
 SUS.forEach(([L,n,k],i)=>{const p=pop(t,'jawaab',0.45,-0.3+i*0.12);person(260+i*280,740,0.5,cl(p),k,false);qm(260+i*280,615,56,cl(p),t)});
 stamp(540,1080,0.85,seg(lt,dur-1.2,dur-0.8),'JAWAAB');
}
function S1(t,lt){ // raju + rumaal trap
 const a=eo(seg(lt,0,0.5));person(280,1000,1.0,a,'chef',true);monoTag(280,1160,'RAJU · COOK',a);
 const r=pop(t,'rumaal',0.5,-0.2);rumaal(780,820,1.2*cl(r),cl(r),-0.25);
 stamp(780,830,0.6,seg(t,E('trap')-0.05,E('trap')+0.35),'TRAP');
 const k=seg(t,E('khaana')-0.3,E('khaana')+0.8);thali(lerp(500,780,eio(k)),lerp(1000,1060,eio(k)),1.1,cl(k*3));monoTag(780,1150,'DADI KA KHAANA',fin(t,'dadi',0.4,0));
 check(280,760,70,fin(t,'dadi',0.6,0.2));
}
function S2(t,lt){ // vicky truthful
 const a=eo(seg(lt,0,0.5));fireworks(t,fin(t,'patakhe',0.5,-0.3),[150,560,780,160]);person(540,1000,1.05,a,'cap',true);monoTag(540,1160,'VICKY · DRIVER',a);
 check(800,830,80,fin(t,'sach',0.6,0));badge(540,1255,'SACH BOLA',pop(t,'sach',0.45,0.4),{fs:30});
}
function S3(t,lt){ // pinky reveal
 const sp=fin(t,'pinky',0.4,-0.2);spot(540,980,230,sp);person(540,990,1.25,sp,'hair',true);
 stamp(540,1230,0.8,seg(t,E('chor')-0.1,E('chor')+0.3),'CHOR!');
 thought(830,700,0.9,pop(t,'chaand',0.45,-0.2),()=>moonK(0,0,45,1,1,false));
}
function S4(t,lt){ // diwali no moon
 const a=eo(seg(lt,0,0.5));for(let i=0;i<16;i++){const r=rng(i+9);star(70+r()*940,580+r()*330,4+r()*6,a*(0.4+0.6*Math.abs(Math.sin(t*2+i))))}
 for(let i=0;i<9;i++)diya(150+i*97.5,1160,1.0,pop(t,'diwali',0.4,i*0.05),t);monoTag(540,1250,'DIWALI RAAT',fin(t,'diwali',0.4,0.2));
 dashedMoon(540,800,90,fin(t,'diwali',0.6,0.2));cross(540,800,70,fin(t,'nahi',0.4,0));
}
function S5(t,lt){ // kartik amavasya: phases strip
 const a=eo(seg(lt,0,0.5));const n=7;const sel=fin(t,'amavasya',0.6,-0.1);
 monoTag(540,650,'KARTIK MAHINA',fin(t,'kartik',0.4,-0.1));
 for(let i=0;i<n;i++){const k=1-i/(n-1);const p=pop(t,'kyun',0.45,0.1+i*0.08);const x=130+i*137;moonK(x,900,52,k,cl(p)*(i===n-1?1:lerp(1,0.45,sel)),i===n-1&&sel>0)}
 txt('POORNIMA',130,990,'500 22px J','rgba(243,236,228,.6)');ctx.save();ctx.globalAlpha*=sel;txt('AMAVASYA',952,990,'500 24px J',GOLD,'center',10);ctx.restore();
 arrow(220,1040,860,1040,fin(t,'kartik',1.2,0),'rgba(255,138,31,.7)',4);
 diya(952,1130,1.3,sel,t);badge(540,1250,'DIWALI = AMAVASYA',pop(t,'amavasya',0.45,0.5),{fs:30});
}
function S6(t,lt){ // sun - moon - earth
 const a=eo(seg(lt,0,0.5));const sx=150,mx=540,ex=900,y=930;
 sunDisc(sx,y,80,fin(t,'suraj',0.4,-0.3),t);earth(ex,y,80,fin(t,'dharti',0.4,-0.1));
 const b=eio(seg(t,E('beech')-0.6,E('beech')+0.6));const my=lerp(700,y,b);moonHalf(mx,my,46,fin(t,'chaand2',0.4,-0.2),Math.PI);
 monoTag(sx,1060,'SURAJ',fin(t,'suraj',0.4,0));monoTag(mx,1060,'CHAAND',fin(t,'chaand2',0.4,0)*b);monoTag(ex,1060,'DHARTI',fin(t,'dharti',0.4,0));
 const rp=fin(t,'roshni',0.8,-0.1);for(let i=-2;i<=2;i++)arrow(sx+95,y+i*22,lerp(sx+95,mx-55,1),y+i*22,rp,'rgba(255,177,92,.8)',3);
 const pk=pop(t,'peeche',0.45,0);if(pk>0){ctx.save();ctx.globalAlpha*=cl(pk);ctx.beginPath();ctx.arc(mx,y,62,Math.PI/2,Math.PI*1.5);gs(4,GOLD,16);ctx.restore();monoTag(mx-40,800,'ROSHNI YAHAN',cl(pk))}
 const an=pop(t,'andhera',0.45,-0.1);if(an>0){ctx.save();ctx.globalAlpha*=cl(an);ctx.setLineDash([8,8]);ctx.beginPath();ctx.arc(mx,y,62,-Math.PI/2,Math.PI/2);gs(4,'rgba(160,190,255,.9)',10);ctx.setLineDash([]);ctx.restore();
  eyeIcon(ex-100,y-90,1,cl(an));line(ex-120,y-80,mx+60,y-10,fin(t,'andhera',0.5,0),'rgba(160,190,255,.8)',3);monoTag(mx+60,1130,'HUMARI TARAF: ANDHERA',cl(an))}
 badge(540,1250,'NEW MOON',pop(t,'andhera',0.45,0.6),{fs:30});
}
function S7(t,lt){ // impossible
 const a=eo(seg(lt,0,0.5));for(let i=0;i<14;i++){const r=rng(i+21);star(70+r()*940,580+r()*200,3+r()*5,a*(0.4+0.6*Math.abs(Math.sin(t*2+i))))}
 dashedMoon(780,700,70,fin(t,'dikhta',0.5,-0.3));bulb(300,700,1.2,pop(t,'bijli',0.45,-0.1),false);cross(300,690,50,fin(t,'bijli',0.4,0.2));
 thought(540,1000,1.35,a,()=>{moonK(0,-14,36,1,1,false);txt('CHAAND KI ROSHNI',0,46,'800 15px M',WH)});cross(540,990,110,fin(t,'impossible',0.4,-0.1));
 badge(540,1250,'IMPOSSIBLE!',pop(t,'impossible',0.45,0.1),{fs:34});
}
function S8(t,lt){ // diyas
 const lit=seg(t,E('diye')-0.2,E('roshan')+0.6);
 ctx.save();ctx.globalAlpha*=0.5*lit;const g=ctx.createRadialGradient(540,1080,0,540,1080,620);g.addColorStop(0,'rgba(255,150,50,.5)');g.addColorStop(1,'rgba(255,120,20,0)');ctx.fillStyle=g;ctx.fillRect(0,500,W,900);ctx.restore();
 for(let r=0;r<2;r++)for(let i=0;i<7;i++){const k=r*7+i;const x=180+i*120+(r?60:0),y=r?1150:960;diya(x,y,1.25,cl(lit*16-k),t)}
 dashedMoon(540,700,60,eo(seg(lt,0,0.5))*(1-lit));badge(540,1255,'ANDHERI RAAT ROSHAN',pop(t,'roshan',0.45,0.2),{fs:28});
}
function S9(t,lt){ // solved
 person(300,990,0.95,eo(seg(lt,0,0.5)),'hair',false);monoTag(300,1150,'PINKY',eo(seg(lt,0,0.5)));stamp(300,900,0.55,seg(t,E('jhooth')-0.05,E('jhooth')+0.35),'JHOOTH');
 const h=seg(t,E('haar')-0.3,E('wapas')+0.3);necklace(lerp(300,760,eio(h)),lerp(1000,900,eio(h))-Math.sin(eio(h)*Math.PI)*120,0.8,cl(h*4),false,t);monoTag(760,1100,'DADI KA HAAR',fin(t,'wapas',0.4,0));
 stamp(540,1240,0.7,seg(t,E('wapas')+0.2,E('wapas')+0.6),'CASE SOLVED');
}
function S10(t,lt){ // comments
 const a=eo(seg(lt,0,0.5));commentBox(540,800,a,seg(t,E('sahi'),E('sahi')+1.6),t,'Maine pehle hi pakda tha!');
 SUS.forEach(([L],i)=>letter(380+i*160,990,40,L,a,i===1));
 const c=fin(t,'comments',0.4,-0.1);if(c>0){const by=1100+Math.abs(Math.sin(t*4))*-20;arrow(540,by-40,540,by+40,c,OR,7)}
 badge(540,1250,'CASE 02 · JALD',pop(t,'agla',0.45,0),{fs:30});
}
const SCN=[S0,S1,S2,S3,S4,S5,S6,S7,S8,S9,S10];
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
