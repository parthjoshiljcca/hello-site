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

// ================= Internet India sample: three.js globe + GSAP =================
const SC=[
 {pill:'01 · SAWAAL',title:'Internet <em>India</em> Kaise Pahuncha?',sub:'Satellite? Wi-Fi? Ya kuch aur...',tag:'THE · WHY'},
 {pill:'02 · UNDERSEA CABLE',title:'Samundar Ke <em>Neeche</em>',sub:'Cable ke andar: glass fibre + light',tag:'DATA = LIGHT'},
];
const HL=['internet','india','hawa','nahi','samundar','neeche','hazaaron','kilometre','undersea','cables','data','light','daudta'];

// ---------- geo helpers ----------
const RAD=Math.PI/180;
const v3=(lon,lat,r=1)=>new THREE.Vector3(r*Math.cos(lat*RAD)*Math.sin(lon*RAD),r*Math.sin(lat*RAD),r*Math.cos(lat*RAD)*Math.cos(lon*RAD));
function route(pts,r=1.014,steps=24){const out=[];for(let i=0;i<pts.length-1;i++){const a=v3(...pts[i]).normalize(),b=v3(...pts[i+1]).normalize();
 for(let s=0;s<steps;s++){const q=new THREE.Vector3().copy(a).lerp(b,s/steps).normalize().multiplyScalar(r);out.push(q)}}out.push(v3(...pts[pts.length-1],r));return new THREE.CatmullRomCurve3(out)}
// approximate real routes (SEA-ME-WE style): Marseille -> Med -> Suez -> Red Sea -> Arabian Sea -> Mumbai ; Singapore -> Malacca -> Bay of Bengal -> Chennai
const MUM=[72.83,19.0],CHE=[80.27,13.08];
const R1=[[5.4,43.3],[11,38.5],[20,34.5],[29,32.2],[32.4,30.5],[34.5,26],[38.5,20],[42.5,13.5],[46,12],[52,13.5],[60,16.5],[68,18.5],MUM];
const R2=[[103.8,1.3],[100.5,4],[97.5,6.5],[93.5,8.5],[87,11.5],CHE];

// ---------- three.js scene (offscreen WebGL, composited into the 2D canvas) ----------
let GL=null;
const G={lon:8,lat:24,dist:6.4,scale:0.7,dots:0,c1:0,c2:0,tilt:0,alpha:1,grid:0};
function setupGlobe(){
 const cv=document.createElement('canvas');cv.width=cv.height=1080;
 const rd=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true,preserveDrawingBuffer:true});rd.setPixelRatio(1);rd.setSize(1080,1080,false);rd.setClearColor(0x000000,0);
 const scene=new THREE.Scene();const cam=new THREE.PerspectiveCamera(30,1,0.01,50);
 const outer=new THREE.Group(),globe=new THREE.Group();outer.add(globe);scene.add(outer);
 globe.add(new THREE.Mesh(new THREE.SphereGeometry(0.995,96,64),new THREE.MeshBasicMaterial({color:0x140d08})));
 // lat/long grid
 const gm=new THREE.LineBasicMaterial({color:0xff8a1f,transparent:true,opacity:0.0});const grid=new THREE.Group();
 for(let la=-60;la<=75;la+=15){const p=[];for(let lo=0;lo<=360;lo+=4)p.push(v3(lo,la,1.002));grid.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(p),gm))}
 for(let lo=0;lo<360;lo+=15){const p=[];for(let la=-90;la<=90;la+=4)p.push(v3(lo,la,1.002));grid.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(p),gm))}
 globe.add(grid);
 // land dots (India in orange)
 const dc=document.createElement('canvas');dc.width=dc.height=32;const dx=dc.getContext('2d');const gr=dx.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,'#fff');gr.addColorStop(.55,'rgba(255,255,255,.9)');gr.addColorStop(1,'rgba(255,255,255,0)');dx.fillStyle=gr;dx.fillRect(0,0,32,32);
 const tex=new THREE.CanvasTexture(dc);
 const pos=[],col=[];const L=window.LAND;const cW=new THREE.Color('#e9ddd0'),cO=new THREE.Color('#ff8a1f');
 for(let i=0;i<L.length;i+=3){const p=v3(L[i],L[i+1],1.004);pos.push(p.x,p.y,p.z);const c=L[i+2]?cO:cW;col.push(c.r,c.g,c.b)}
 const dg=new THREE.BufferGeometry();dg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));dg.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
 const dm=new THREE.PointsMaterial({size:0.022,map:tex,vertexColors:true,transparent:true,opacity:0,depthWrite:false});globe.add(new THREE.Points(dg,dm));
 // cables (tubes revealed with drawRange) + glowing heads
 const mkCable=(pts)=>{const curve=route(pts);const seg=480,rs=6;const geo=new THREE.TubeGeometry(curve,seg,0.0075,rs,false);
  const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:0xffa040}));geo.setDrawRange(0,0);globe.add(m);
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.02,16,12),new THREE.MeshBasicMaterial({color:0xfff1dc}));globe.add(head);
  return {curve,geo,seg,rs,head,set(p){geo.setDrawRange(0,Math.floor(p*seg)*rs*6);head.visible=p>0.001&&p<0.999;if(p>0)head.position.copy(curve.getPointAt(Math.min(p,1)))}}};
 const c1=mkCable(R1),c2=mkCable(R2);
 GL={cv,rd,scene,cam,outer,globe,gm,dm,c1,c2};
}
function project(lon,lat){const p=v3(lon,lat,1.01).applyMatrix4(GL.globe.matrixWorld);const n=p.clone().normalize();const toCam=GL.cam.position.clone().sub(p).normalize();
 const s=p.clone().project(GL.cam);return {x:(s.x+1)/2*1080,y:(1-s.y)/2*1080+390,vis:n.dot(toCam)}}
function drawGlobe(){
 const g=GL;g.outer.rotation.set(G.lat*RAD,0,0);g.globe.rotation.set(0,-G.lon*RAD,0);g.outer.scale.setScalar(G.scale);
 g.cam.position.set(0,0,G.dist);g.cam.lookAt(0,0,0);g.cam.rotation.z=G.tilt;
 g.dm.opacity=G.dots;g.gm.opacity=0.16*G.grid;g.c1.set(G.c1);g.c2.set(G.c2);
 g.scene.updateMatrixWorld(true);g.rd.render(g.scene,g.cam);
 ctx.save();ctx.globalAlpha*=G.alpha;
 // atmosphere halo
 const rpx=540/(Math.tan(15*RAD)*G.dist)*G.scale;
 if(rpx<1500){const h=ctx.createRadialGradient(540,930,rpx*0.92,540,930,rpx*1.35);h.addColorStop(0,'rgba(255,138,31,0.35)');h.addColorStop(.3,'rgba(255,110,20,0.10)');h.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=h;ctx.beginPath();ctx.arc(540,930,rpx*1.35,0,7);ctx.fill()}
 ctx.drawImage(g.cv,0,390);
 ctx.globalCompositeOperation='lighter';ctx.filter='blur(9px)';ctx.globalAlpha*=0.7;ctx.drawImage(g.cv,0,390);ctx.filter='none';
 ctx.restore();
 // rim line
 if(rpx<1500){ctx.save();ctx.globalAlpha*=G.alpha*0.8;ctx.beginPath();ctx.arc(540,930,rpx,0,7);gs(2.5,'rgba(255,160,70,.55)',18);ctx.restore()}
}
function pin(lon,lat,label,p,side,t){if(p<=0)return;const s=project(lon,lat);if(s.vis<0.05)return;ctx.save();ctx.globalAlpha*=cl(p*2)*cl(s.vis*4);
 const pr=(t*1.4)%1;ctx.beginPath();ctx.arc(s.x,s.y,10+pr*40,0,7);ctx.strokeStyle=`rgba(255,138,31,${(1-pr)*0.8})`;ctx.lineWidth=3;ctx.stroke();
 ctx.beginPath();ctx.arc(s.x,s.y,9*back(cl(p)),0,7);ctx.fillStyle='#fff1dc';ctx.shadowColor=OR;ctx.shadowBlur=24;ctx.fill();ctx.shadowBlur=0;
 const lx=s.x+side*120,ly=s.y-70;ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(lerp(s.x,lx,eo(cl(p*1.5))),lerp(s.y,ly,eo(cl(p*1.5))));ctx.strokeStyle='rgba(255,138,31,.7)';ctx.lineWidth=2;ctx.stroke();
 monoTag(lx+side*60,ly,label,cl(p*2-0.6));ctx.restore()}
function satellite(x,y,s,a,t){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y+Math.sin(t*2)*8);ctx.rotate(-0.35);ctx.scale(s,s);
 rr(-34,-26,68,52,8);ctx.fillStyle='rgba(22,15,11,.95)';ctx.fill();gs(4,'rgba(243,236,228,.92)');
 for(const d of[-1,1]){rr(d>0?50:-150,-22,100,44,4);ctx.fillStyle='rgba(255,138,31,.12)';ctx.fill();gs(3,'rgba(243,236,228,.9)');ctx.beginPath();for(let k=1;k<4;k++){const xx=(d>0?50:-150)+k*25;ctx.moveTo(xx,-22);ctx.lineTo(xx,22)}gs(2,'rgba(255,138,31,.7)');ctx.beginPath();ctx.moveTo(d*34,0);ctx.lineTo(d*50,0);gs(4,WH)}
 ctx.beginPath();ctx.moveTo(0,26);ctx.lineTo(0,46);gs(4,WH);ctx.beginPath();ctx.arc(0,60,16,Math.PI*1.15,Math.PI*1.85,true);gs(4,OR,12);ctx.restore()}

// ---------- SVG cable cross-section (drawn by GSAP DrawSVG) ----------
const XC=[540,860];
function buildFx(){
 const NS='http://www.w3.org/2000/svg';const fx=$('fx');
 const lab=(id,x,y,s,al='left')=>`<div id="${id}" style="position:absolute;left:${x}px;top:${y}px;transform:translateX(${al==='right'?'-100%':al==='center'?'-50%':'0'});font-family:J;font-size:24px;letter-spacing:3px;color:#ff9b3d;border:1.5px solid rgba(255,138,31,.6);border-radius:8px;padding:8px 16px;background:rgba(20,12,8,.85);white-space:nowrap;opacity:0">${s}</div>`;
 const[cx,cy]=XC;let wires='';for(let k=0;k<22;k++){const a=k/22*Math.PI*2;wires+=`<circle class="wire" cx="${cx+Math.cos(a)*200}" cy="${cy+Math.sin(a)*200}" r="13"/>`}
 let fib=`<circle class="fib" cx="${cx}" cy="${cy}" r="16"/>`;for(let k=0;k<6;k++){const a=k/6*Math.PI*2-Math.PI/2;fib+=`<circle class="fib" cx="${cx+Math.cos(a)*44}" cy="${cy+Math.sin(a)*44}" r="16"/>`}
 fx.innerHTML=`<svg width="1080" height="1920" viewBox="0 0 1080 1920" style="position:absolute;left:0;top:0;overflow:visible">
 <defs><filter id="gl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
 <g id="xs" fill="none" stroke-linecap="round">
  <circle id="xsBg" cx="${cx}" cy="${cy}" r="236" fill="rgba(18,12,9,.94)" stroke="none" opacity="0"/>
  <circle class="ring" cx="${cx}" cy="${cy}" r="236" stroke="#f3ece4" stroke-width="5" filter="url(#gl)"/>
  <circle class="ring" cx="${cx}" cy="${cy}" r="222" stroke="rgba(243,236,228,.45)" stroke-width="2"/>
  <g stroke="#f3ece4" stroke-width="3">${wires}</g>
  <circle class="ring" id="copper" cx="${cx}" cy="${cy}" r="176" stroke="#ff8a1f" stroke-width="9" filter="url(#gl)"/>
  <circle class="ring" cx="${cx}" cy="${cy}" r="156" stroke="rgba(243,236,228,.55)" stroke-width="2"/>
  <circle class="ring" cx="${cx}" cy="${cy}" r="96" stroke="#f3ece4" stroke-width="4"/>
  <g id="fibs" stroke="#ff8a1f" stroke-width="3.5" fill="rgba(255,138,31,0)" filter="url(#gl)">${fib}</g>
 </g>
 <g fill="none" stroke="rgba(255,138,31,.75)" stroke-width="2.5" stroke-linecap="round">
  <path class="lead" id="l1" d="M ${cx-167} ${cy-167} L 250 640"/>
  <path class="lead" id="l2" d="M ${cx+141} ${cy-141} L 830 640"/>
  <path class="lead" id="l3" d="M ${cx-124} ${cy+124} L 250 1075"/>
  <path class="lead" id="l4" d="M ${cx+44} ${cy} L 830 1075"/>
 </g>
 <g id="tube" fill="none" filter="url(#gl)"><path id="tubeP" d="M 120 1182 L 960 1182 A 26 26 0 0 1 960 1234 L 120 1234 A 26 26 0 0 1 120 1182" stroke="#f3ece4" stroke-width="4"/></g>
 </svg>
 ${lab('t1',70,615,'PLASTIC')}${lab('t2',1010,615,'STEEL WIRES','right')}${lab('t3',70,1050,'COPPER')}${lab('t4',1010,1050,'GLASS FIBRE','right')}
 ${lab('km',540,572,'..........','center')}${lab('bits',540,1120,'................','center')}`;
}
let TL=null;
function buildTL(){
 gsap.registerPlugin(DrawSVGPlugin,ScrambleTextPlugin);
 const e=D.ev,T1=D.scenes[1].start;const tl=gsap.timeline({paused:true,defaults:{ease:'power2.inOut'}});
 // --- scene 1: globe in, rotate to India, satellite busted, cables drawn under the sea
 tl.to(G,{scale:1,dist:5.6,duration:1.0,ease:'power3.out'},0)
   .to(G,{dots:1,duration:0.9,ease:'power1.out'},0.15)
   .to(G,{grid:1,duration:1.0},0.2)
   .to(G,{lon:44,lat:20,duration:1.6},e.india-0.3)
   .to(G,{lon:76,lat:14,tilt:-0.08,duration:1.6},e.samundar-0.5)
   .to(G,{c1:1,duration:1.0,ease:'power1.inOut'},e.samundar-0.25)
   .to(G,{c2:1,duration:0.6,ease:'power1.inOut'},e.neeche-0.2)
 // --- scene 2: dive into Mumbai, then the cable cross-section draws itself
   .to(G,{lon:MUM[0],lat:MUM[1]+2,dist:2.2,tilt:0,duration:0.9,ease:'power3.in'},T1-0.35)
   .to(G,{alpha:0,duration:0.35,ease:'none'},T1+0.35)
   .set('.ring,.wire,.fib,.lead,#tubeP',{drawSVG:'0%'},0)
   .fromTo('#xs',{scale:0.25,svgOrigin:`${XC[0]} ${XC[1]}`,rotation:-40},{scale:1,rotation:0,svgOrigin:`${XC[0]} ${XC[1]}`,duration:1.0,ease:'power3.out'},T1+0.2)
   .to('#xsBg',{opacity:1,duration:0.4},T1+0.25)
   .to('.ring',{drawSVG:'100%',duration:0.8,stagger:0.08,ease:'power2.out'},T1+0.2)
   .to('.wire',{drawSVG:'100%',duration:0.35,stagger:0.018},T1+0.45)
   .to('.fib',{drawSVG:'100%',duration:0.4,stagger:0.05},T1+0.75)
   .to('#km',{opacity:1,duration:0.2},e.km-0.15)
   .to('#km',{duration:0.7,scrambleText:{text:'1000s OF KM',chars:'0123456789',speed:0.6}},e.km-0.15)
   .to('#l1,#l2',{drawSVG:'100%',duration:0.35,stagger:0.08},e.cables-0.25)
   .to('#t1,#t2',{opacity:1,duration:0.25,stagger:0.08},e.cables)
   .to('#l3',{drawSVG:'100%',duration:0.35},e.cables+0.2).to('#t3',{opacity:1,duration:0.25},e.cables+0.4)
   .to('#l4',{drawSVG:'100%',duration:0.35},e.andar-0.2).to('#t4',{opacity:1,duration:0.25},e.andar)
   .to('#fibs',{attr:{fill:'rgba(255,177,92,.85)'},duration:0.4},e.andar)
   .to('#xs',{scale:1.04,svgOrigin:`${XC[0]} ${XC[1]}`,duration:0.5,yoyo:true,repeat:1,ease:'sine.inOut'},e.andar)
   .to('#tubeP',{drawSVG:'100%',duration:0.6,ease:'power2.out'},e.data-0.3)
   .to('#bits',{opacity:1,duration:0.2},e.data-0.1)
   .to('#bits',{duration:0.8,scrambleText:{text:'0 1 1 0 1 → LIGHT',chars:'01',speed:0.5}},e.data-0.1);
 TL=tl;
}
// light pulses racing through the fibre tube (canvas)
function pulses(t,on,fast){if(on<=0)return;ctx.save();ctx.globalAlpha*=on;ctx.beginPath();ctx.roundRect(122,1186,876,44,22);ctx.clip();
 const sp=lerp(500,1300,fast);const r=rng(9);for(let i=0;i<16;i++){const ph=r();const x=120+((t*sp*(0.8+0.4*r())+ph*900)%1000)-40;const w=40+r()*70;
  const g=ctx.createLinearGradient(x-w,0,x,0);g.addColorStop(0,'rgba(255,138,31,0)');g.addColorStop(1,'rgba(255,220,170,.95)');ctx.fillStyle=g;ctx.shadowColor=OR;ctx.shadowBlur=18;ctx.fillRect(x-w,1197+r()*14,w,8)}
 ctx.restore()}

// ---------- scenes ----------
function pins(t){pin(MUM[0],MUM[1],'MUMBAI',fin(t,'samundar',0.5,0.62),-1,t);pin(CHE[0],CHE[1],'CHENNAI',fin(t,'neeche',0.5,0.3),1,t)}
function S0(t,lt){
 $('fx').style.opacity=0;TL.seek(t,false);drawGlobe();
 const hw=fin(t,'hawa',0.4,-0.1),nh=fin(t,'nahi',0.4,-0.05),sd=fin(t,'samundar',0.4,0);
 satellite(800,610,1,hw*(1-sd),t);
 if(hw>0&&sd<1){ctx.save();ctx.globalAlpha*=hw*(1-sd);ctx.setLineDash([8,10]);ctx.beginPath();ctx.moveTo(800,680);ctx.lineTo(640,800);ctx.strokeStyle='rgba(255,138,31,.6)';ctx.lineWidth=3;ctx.stroke();ctx.setLineDash([]);ctx.restore();ctx.save();ctx.globalAlpha*=1-sd;cross(800,620,70,nh);ctx.restore()}
 pins(t);
 badge(540,1236,'UNDERSEA CABLES',pop(t,'neeche',0.45,0.2),{fs:28});
}
function S1(t,lt){
 TL.seek(t,false);if(G.alpha>0){drawGlobe();ctx.save();ctx.globalAlpha*=G.alpha*cl(1-(t-D.scenes[1].start)*3);pins(t);ctx.restore()}
 $('fx').style.opacity=ctx.globalAlpha;
 pulses(t,fin(t,'light',0.4,-0.3),fin(t,'daudta',0.6,-0.1));
}
const SCN=[S0,S1];
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
const _init0=window.init;window.init=async d=>{await _init0(d);buildFx();setupGlobe();buildTL();return true};
