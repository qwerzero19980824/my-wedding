import {ACTIONS,clamp,approach,jumpHeight} from './motion.mjs';

// Original procedural placeholder. Replace this renderer with photo-derived assets.
export class CatCompanion {
  constructor(canvas,{onAction=()=>{}}={}){
    this.canvas=canvas;this.ctx=canvas.getContext('2d');this.onAction=onAction;
    this.events=new AbortController();this.state='idle';this.age=0;this.clock=0;this.x=.54;this.y=.76;
    this.pointer={x:.5,y:.5};this.direction=1;this.tool='pet';this.paused=false;this.hidden=false;this.drag=null;this.target=null;this.nextBlink=3;this.nextIdle=10;
    this.motion=matchMedia('(prefers-reduced-motion: reduce)');this.reduced=this.motion.matches;
    this.resize=new ResizeObserver(()=>{this.measure();this.paint();});this.resize.observe(canvas);
    const listen=(target,name,fn)=>target.addEventListener(name,fn,{signal:this.events.signal});
    listen(canvas,'pointermove',e=>this.move(e));listen(canvas,'pointerdown',e=>this.down(e));
    listen(canvas,'pointerup',e=>this.up(e));listen(canvas,'pointercancel',()=>this.cancel());listen(canvas,'lostpointercapture',()=>this.cancel());
    listen(canvas,'pointerleave',e=>{if(e.pointerType==='mouse'&&!this.drag&&this.target!==null){this.target=null;if(['walk','run'].includes(this.state))this.action('idle');}});
    listen(canvas,'keydown',e=>this.key(e));listen(document,'visibilitychange',()=>this.schedule());
    listen(this.motion,'change',()=>{this.reduced=this.motion.matches;this.target=null;this.action('idle');this.schedule();});
    this.visible=true;this.intersection=new IntersectionObserver(entries=>{this.visible=entries[0].isIntersecting;this.schedule();});this.intersection.observe(canvas);
    this.measure();this.paint();this.schedule();
  }
  measure(){const r=this.canvas.getBoundingClientRect();this.w=r.width;this.h=r.height;this.scale=Math.min(1.1,this.w/540);this.scale=Math.max(.65,this.scale);const dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(this.w*dpr);this.canvas.height=Math.round(this.h*dpr);this.ctx.setTransform(dpr,0,0,dpr,0,0);this.x=clamp(this.x,80*this.scale/this.w,1-80*this.scale/this.w);}
  action(name){if(!ACTIONS[name]||this.hidden||this.paused)return;this.state=name;this.age=0;if(!['walk','run'].includes(name))this.target=null;this.onAction(name,ACTIONS[name].label);this.paint();}
  setTool(tool){this.tool=tool;this.target=null;this.action('idle');this.paint();}
  setPaused(value){this.paused=value;this.drag=null;this.target=null;this.schedule();this.paint();}
  setHidden(value){this.hidden=value;this.drag=null;this.target=null;this.schedule();this.paint();}
  point(e){const r=this.canvas.getBoundingClientRect();return {x:clamp((e.clientX-r.left)/r.width,0,1),y:clamp((e.clientY-r.top)/r.height,0,1)};}
  hit(p){return Math.abs((p.x-this.x)*this.w)<82*this.scale&&Math.abs((p.y-this.y)*this.h+52*this.scale)<85*this.scale;}
  down(e){if(this.paused||this.hidden||!e.isPrimary||e.button!==0)return;const p=this.point(e);this.pointer=p;
    this.canvas.focus({preventScroll:true});
    if(this.hit(p)){this.drag={id:e.pointerId,start:p,offset:p.x-this.x,moved:false};this.canvas.setPointerCapture(e.pointerId);this.target=null;}
    else if(this.tool==='wand'){if(this.reduced){this.x=clamp(p.x,.14,.86);this.action('sit');}else this.target=p.x;}
    this.paint();
  }
  move(e){const p=this.point(e);this.pointer=p;if(this.hidden||this.paused)return;
    if(this.drag&&this.drag.id===e.pointerId){if(Math.hypot((p.x-this.drag.start.x)*this.w,(p.y-this.drag.start.y)*this.h)>6)this.drag.moved=true;
      if(this.drag.moved){const x=clamp(p.x-this.drag.offset,80*this.scale/this.w,1-80*this.scale/this.w);this.direction=x>=this.x?1:-1;this.x=x;if(this.state!=='walk')this.action('walk');}}
    else if(this.tool==='wand'&&e.pointerType==='mouse'&&!this.reduced&&this.state!=='sleep')this.target=p.x;
    if(this.reduced||this.paused)this.paint();
  }
  up(e){if(this.drag?.id!==e.pointerId)return;const moved=this.drag.moved;this.drag=null;if(this.canvas.hasPointerCapture(e.pointerId))this.canvas.releasePointerCapture(e.pointerId);this.action(moved?'idle':'happy');}
  cancel(){if(!this.drag)return;this.drag=null;this.action('idle');}
  key(e){if(this.paused||this.hidden)return;const actions={' ':'happy',j:'jump',s:'sit'};if(actions[e.key]){e.preventDefault();this.action(actions[e.key]);}
    if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const dir=e.key==='ArrowLeft'?-1:1;this.direction=dir;const x=clamp(this.x+dir*.1,.14,.86);if(this.reduced){this.x=x;this.action('sit');}else this.target=x;}
  }
  schedule(){cancelAnimationFrame(this.raf);this.raf=0;this.last=0;if(!this.paused&&!this.hidden&&!this.reduced&&!document.hidden&&this.visible)this.raf=requestAnimationFrame(t=>this.frame(t));}
  frame(t){const dt=this.last?Math.min((t-this.last)/1000,.05):0;this.last=t;this.clock+=dt;this.age+=dt;
    if(this.target!==null&&!this.drag){const target=clamp(this.target,80*this.scale/this.w,1-80*this.scale/this.w);const delta=(target-this.x)*this.w;
      if(Math.abs(delta)>4){const name=Math.abs(delta)>150?'run':'walk';if(this.state!==name){this.state=name;this.age=0;this.onAction(name,ACTIONS[name].label);}this.direction=Math.sign(delta);this.x=approach(this.x,target,(name==='run'?210:95)/this.w,dt);}
      else{this.target=null;this.action(this.tool==='wand'?'happy':'idle');}}
    const duration=ACTIONS[this.state].duration;if(duration&&this.age>duration)this.action('idle');
    if(this.clock>this.nextIdle){this.nextIdle=this.clock+12+Math.random()*12;if(this.state==='idle'&&!this.drag&&this.target===null)this.action(['sit','stretch','groom'][Math.floor(Math.random()*3)]);}
    if(this.clock>this.nextBlink+.16)this.nextBlink=this.clock+2.5+Math.random()*5;
    this.paint();this.raf=requestAnimationFrame(time=>this.frame(time));
  }
  paint(){const c=this.ctx;if(!c||!this.w)return;c.clearRect(0,0,this.w,this.h);if(this.hidden)return;
    const moving=['walk','run'].includes(this.state),sleep=this.state==='sleep',sit=['sit','groom'].includes(this.state),stretch=this.state==='stretch';
    const phase=this.reduced?0:this.clock,age=this.reduced?.5:this.age;
    const jump=this.state==='jump'&&!this.reduced?jumpHeight(age):0;
    const breath=this.reduced?0:Math.sin(phase*2.2)*1.3;
    const sx=this.x*this.w,sy=this.y*this.h;
    const ellipse=(x,y,rx,ry,color)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
    c.save();c.translate(sx,sy);c.scale(this.scale,this.scale);
    ellipse(0,7,75-jump*.2,11,'#4a403c22');c.translate(0,-jump);
    if(sleep){ellipse(0,-22,65,32,'#8c9190');ellipse(36,-28,32,27,'#a9adaa');ellipse(38,-7,23,10,'#dce0d7');c.strokeStyle='#676e6c';c.lineWidth=3;c.beginPath();c.arc(34,-29,9,.2,2.7);c.stroke();c.font='16px Georgia';c.fillStyle='#6c736a';c.fillText('z z z',48,-70);c.restore();return;}
    c.save();c.scale(this.direction,1);c.strokeStyle='#777f7d';c.lineWidth=17;c.lineCap='round';c.beginPath();c.moveTo(-49,-32);c.bezierCurveTo(-100,-33,-76,-85,-88+Math.sin(phase*1.7)*9,-96);c.stroke();c.restore();
    ellipse(0,-39+breath,stretch?74:52,sit?47:36,'#8f9692');
    const gait=moving&&!this.reduced?Math.sin(phase*(this.state==='run'?17:10))*13:0;
    [-35,-15,18,38].forEach((x,i)=>{ellipse(x+(i%2?gait:-gait),-17,12,sit?19:22,'#989e99');ellipse(x+(i%2?gait:-gait),-1,14,8,'#e0e1d5');});
    ellipse(25,-46+breath,28,30,'#d1d3c7');
    const aimX=clamp((this.pointer.x-this.x)*20,-10,10),aimY=clamp((this.pointer.y-this.y)*15,-6,6);
    c.save();c.translate(26+aimX,-85+aimY+breath+(stretch?22:0));if(this.state==='groom')c.rotate(Math.sin(phase*5)*.16+.3);
    c.fillStyle='#969d98';c.beginPath();c.moveTo(-35,-13);c.lineTo(-34,-56);c.quadraticCurveTo(-10,-49,-9,-27);c.lineTo(12,-28);c.quadraticCurveTo(25,-52,40,-54);c.lineTo(37,-10);c.fill();
    c.fillStyle='#c3aaa6';c.beginPath();c.moveTo(-29,-30);c.lineTo(-29,-47);c.lineTo(-17,-31);c.moveTo(23,-32);c.lineTo(34,-47);c.lineTo(33,-28);c.fill();
    ellipse(0,0,43,37,'#a8afa7');ellipse(0,19,30,17,'#e1e2d6');
    c.strokeStyle='#707c74';c.lineWidth=4;[-12,0,12].forEach(x=>{c.beginPath();c.moveTo(x,-29);c.lineTo(x*.6,-17);c.stroke();});
    const blink=this.state==='happy'||(!this.reduced&&phase>=this.nextBlink&&phase<this.nextBlink+.16);
    [-19,19].forEach(x=>{if(blink){c.strokeStyle='#4d5950';c.lineWidth=2.5;c.beginPath();c.arc(x,2,8,Math.PI+.3,Math.PI*2-.3);c.stroke();}else{ellipse(x,1,10,10,'#d7ce8a');ellipse(x+clamp(aimX*.5,-4,4),1+aimY*.4,3.3,8,'#39433c');ellipse(x-2,-3,2,2,'#fffcef');}});
    c.fillStyle='#a7817a';c.beginPath();c.moveTo(-5,15);c.lineTo(5,15);c.lineTo(0,20);c.fill();
    c.strokeStyle='#72776b';c.lineWidth=1.2;c.beginPath();c.moveTo(0,20);c.lineTo(0,25);c.moveTo(-9,24);c.quadraticCurveTo(-4,29,0,25);c.quadraticCurveTo(4,29,9,24);c.stroke();
    if(this.state==='yawn'){ellipse(0,27,9,12,'#71615b');ellipse(0,32,5,4,'#c29791');}
    c.strokeStyle='#eeeee3';c.lineWidth=1.2;[-1,1].forEach(dir=>{[-7,0,7].forEach(y=>{c.beginPath();c.moveTo(dir*23,17+y*.4);c.lineTo(dir*53,17+y);c.stroke();});});c.restore();
    if(this.state==='happy'){c.fillStyle='#b88d86';c.font='22px Georgia';c.fillText('♡',-35,-120-(this.reduced?0:Math.sin(age*3)*5));}c.restore();
    if(this.tool==='wand'){const px=this.pointer.x*this.w,py=this.pointer.y*this.h;c.strokeStyle='#9b8065';c.lineWidth=3;c.beginPath();c.moveTo(px+28,py-50);c.lineTo(px+8,py-13);c.stroke();c.strokeStyle='#aa8a92';c.lineWidth=1;c.beginPath();c.moveTo(px+8,py-13);c.quadraticCurveTo(px+22,py+8,px,py+18);c.stroke();ellipse(px,py+18,6,14,'#b78e92');}}
  destroy(){cancelAnimationFrame(this.raf);this.events.abort();this.resize.disconnect();this.intersection.disconnect();this.ctx.clearRect(0,0,this.w,this.h);}
}

const canvas=document.querySelector('canvas');const status=document.querySelector('#status');
const cat=new CatCompanion(canvas,{onAction:(_,label)=>{status.textContent=label;}});
const ui=new AbortController();const on=(el,type,fn)=>el.addEventListener(type,fn,{signal:ui.signal});
document.querySelectorAll('[data-tool]').forEach(button=>on(button,'click',()=>{cat.setTool(button.dataset.tool);document.querySelectorAll('[data-tool]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));status.textContent=button.dataset.tool==='wand'?'移动逗猫棒，或轻点房间引它过来':'轻点摸摸头，也可以拖动小猫';}));
document.querySelectorAll('[data-action]').forEach(button=>on(button,'click',()=>cat.action(button.dataset.action)));
on(document.querySelector('#pause'),'click',e=>{cat.setPaused(!cat.paused);e.currentTarget.textContent=cat.paused?'继续动画':'暂停动画';e.currentTarget.setAttribute('aria-pressed',String(cat.paused));status.textContent=cat.paused?'小猫暂停休息中':ACTIONS[cat.state].label;});
on(document.querySelector('#hide'),'click',e=>{cat.setHidden(!cat.hidden);canvas.tabIndex=cat.hidden?-1:0;canvas.setAttribute('aria-hidden',String(cat.hidden));e.currentTarget.textContent=cat.hidden?'让小猫回来':'隐藏小猫';e.currentTarget.setAttribute('aria-pressed',String(cat.hidden));status.textContent=cat.hidden?'小猫回窝休息了':ACTIONS[cat.state].label;});
on(document.querySelector('#scene'),'click',e=>{const night=document.querySelector('.room').classList.toggle('night');document.querySelector('.room-name').textContent=night?'安静的月夜':'午后的窗边';e.currentTarget.textContent=night?'换成午后 ☼':'换成月夜 ☾';});
on(window,'pagehide',()=>{cat.destroy();ui.abort();});
// Restore the renderer when the browser restores this page from its back-forward cache.
window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
