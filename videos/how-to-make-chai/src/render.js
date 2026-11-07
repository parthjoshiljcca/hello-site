const {chromium}=require('playwright');const fs=require('fs');const {spawn}=require('child_process');
(async()=>{
 const dir=process.argv[2], mode=process.argv[3];
 const b=await chromium.launch({args:['--allow-file-access-from-files']});
 const p=await b.newPage({viewport:{width:1080,height:1920}});
 p.on('console',m=>console.log('PAGE',m.text()));p.on('pageerror',e=>console.log('ERR',e.message));
 await p.goto('file://'+dir+'/index.html');
 await p.evaluate(d=>window.init(d),JSON.parse(fs.readFileSync(dir+'/data.json')));
 if(mode==='stills'){
  const ts=process.argv[4].split(',').map(Number);
  for(const t of ts){await p.evaluate(t=>render(t),t);await p.screenshot({path:`${dir}/prev/s_${t}.jpg`,type:'jpeg',quality:80});}
 } else {
  const ff=spawn('ffmpeg',['-y','-v','error','-f','image2pipe','-framerate','30','-c:v','mjpeg','-i','-','-c:v','libx264','-pix_fmt','yuv420p','-crf','17','-preset','medium',dir+'/video.mp4'],{stdio:['pipe','inherit','inherit']});
  for(let f=0;f<900;f++){await p.evaluate(t=>render(t),f/30);const buf=await p.screenshot({type:'jpeg',quality:93});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(f%100==0)console.log('frame',f);}
  ff.stdin.end();await new Promise(r=>ff.on('close',r));
 }
 await b.close();
})();
