export const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
export const ACTIONS = Object.freeze({idle:{label:'小猫正在晒太阳'},walk:{label:'慢慢走到你身边'},run:{label:'抓住那根逗猫棒！'},happy:{duration:1.7,label:'呼噜呼噜，好舒服'},jump:{duration:1,label:'扑！'},stretch:{duration:2.7,label:'伸个大大的懒腰'},groom:{duration:3,label:'要做一只干净的小猫'},yawn:{duration:2.3,label:'啊呜，有点困了'},sit:{duration:6,label:'乖乖坐在你身边'},sleep:{duration:30,label:'嘘，小猫睡着了'}});
export function approach(x,target,speed,dt){const delta=target-x;return Math.abs(delta)<=speed*dt?target:x+Math.sign(delta)*speed*dt;}
export function jumpHeight(progress){return Math.sin(clamp(progress,0,1)*Math.PI)*85;}
