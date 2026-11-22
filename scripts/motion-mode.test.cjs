const {readFileSync}=require('node:fs');
const {runInNewContext}=require('node:vm');
const assert=require('node:assert/strict');
const script=readFileSync('index.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
function check(search='',saved=null,storageFails=false){
  const window={},classes={};let stored=saved;
  const context={window,URLSearchParams,location:{search},matchMedia:()=>({matches:true}),sessionStorage:{getItem(){if(storageFails)throw Error('unavailable');return stored;},setItem(k,v){if(storageFails)throw Error('unavailable');stored=v;}},document:{documentElement:{classList:{toggle(k,v){classes[k]=v;}}}}};
  runInNewContext(script,context);
  return {mode:window.patchMotionMode,reduced:window.patchShouldReduceMotion(),fullClass:classes['motion-full']};
}
assert.deepEqual(check(),{mode:'full',reduced:false,fullClass:true});
assert.equal(check('?motion=system').reduced,true);
assert.equal(check('?motion=reduce').reduced,true);
assert.equal(check('?motion=full','reduce').reduced,false);
assert.equal(check('','reduce').reduced,true);
assert.equal(check('',null,true).reduced,false);
assert.equal(check('?motion=reduce',null,true).reduced,true);
console.log('Full-motion default and explicit reduced/system preferences passed.');
