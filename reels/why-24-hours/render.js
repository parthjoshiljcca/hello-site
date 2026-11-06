// usage: node render.js preview t1,t2,...  |  node render.js video out.mp4
const {chromium}=require('playwright');const fs=require('fs');const {spawn}=require('child_process');const path=require('path');
(async()=>{
  const [mode,arg]=process.argv.slice(2);const tl=JSON.parse(fs.readFileSync(path.join(__dirname,'timeline.json')));
  const b=await chromium.launch({args:['--allow-file-access-from-files']});const pg=await b.newPage({viewport:{width:1080,height:1920}});
  await pg.goto('file://'+path.join(__dirname,process.env.PAGE||'index.html'));await pg.evaluate(tl=>init(tl),tl);
  const grab=async(t,f)=>{const d=await pg.evaluate(([t,f])=>{render(t,f);return document.getElementById('c').toDataURL('image/jpeg',.93)},[t,f]);return Buffer.from(d.split(',')[1],'base64')};
  if(mode==='preview'){fs.mkdirSync('preview',{recursive:true});for(const t of arg.split(',').map(Number)){fs.writeFileSync(`preview/t${t.toFixed(1).padStart(5,'0')}.jpg`,await grab(t,0))}}
  else{const fps=30,n=Math.round(tl.total*fps);
    const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate',String(fps),'-c:v','mjpeg','-i','-','-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-preset','medium',arg||'out/video_noaudio.mp4'],{stdio:['pipe','inherit','inherit']});
    for(let f=0;f<n;f++){const buf=await grab(f/fps,f);if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(f%150===0)console.log('frame',f,'/',n)}
    ff.stdin.end();await new Promise(r=>ff.on('close',r))}
  await b.close();
})();
