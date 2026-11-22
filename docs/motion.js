(() => {
  'use strict';
  const query = (s,root=document) => root.querySelector(s);
  const all = (s,root=document) => [...root.querySelectorAll(s)];
  const systemMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const reduce = {
    get matches(){return window.patchShouldReduceMotion?window.patchShouldReduceMotion():systemMotion.matches;},
    addEventListener:(...args)=>systemMotion.addEventListener(...args)
  };
  const finePointer = matchMedia('(pointer:fine)');
  const limit = (n,min=0,max=1) => Math.max(min,Math.min(max,n));
  const originalText = new WeakMap();
  let lenis = null, context = null, refreshTimer = null, initialized = false;

  // The reference's normal cursor is a 16px orange square with eased tracking.
  const cursor = document.createElement('div');
  cursor.id = 'square-cursor';
  cursor.setAttribute('aria-hidden','true');
  cursor.innerHTML = '<span class="square-cursor-shape"></span>';
  document.body.append(cursor);
  const cursorTopLayer=typeof cursor.showPopover==='function';
  if(cursorTopLayer)cursor.setAttribute('popover','manual');
  function promoteCursor() {
    if(!cursorTopLayer||!cursorShown)return;
    try {
      if(cursor.matches(':popover-open'))cursor.hidePopover();
      cursor.showPopover();
    } catch {}
  }
  // Low-contrast ASCII field behind the reference-style loading phrases.
  const loadingScreen=query('#loader');
  if(loadingScreen&&!reduce.matches) {
    const canvas=document.createElement('canvas');
    canvas.className='loader-ascii';canvas.setAttribute('aria-hidden','true');loadingScreen.prepend(canvas);
    const width=innerWidth,height=innerHeight;
    canvas.width=width;canvas.height=height;
    const pen=canvas.getContext('2d');
    const glyphs='01PATCH/<>:..*+=—';
    let frame=0,last=0;
    const paint=time=>{
      if(!loadingScreen.isConnected)return;
      if(time-last>45){
        last=time;frame++;
        pen.clearRect(0,0,width,height);pen.font='11px monospace';
        for(let row=0;row<Math.ceil(height/24);row++)for(let col=0;col<Math.ceil(width/24);col++){
          const wave=Math.sin(col*.24+frame*.055)+Math.cos(row*.31-frame*.045);
          if(wave<.75)continue;
          pen.fillStyle=`rgba(180,180,180,${.025+Math.max(0,wave-1)*.18})`;
          pen.fillText(glyphs[(col*7+row*11+Math.floor(frame/4))%glyphs.length],col*24,row*24);
        }
      }
      requestAnimationFrame(paint);
    };
    requestAnimationFrame(paint);
  }
  let cursorX=0,cursorY=0,targetX=0,targetY=0,cursorFrame=0,cursorShown=false;
  function cursorTick() {
    const damping=reduce.matches?1:.12;
    cursorX+=(targetX-cursorX)*damping;
    cursorY+=(targetY-cursorY)*damping;
    cursor.style.transform=`translate3d(${cursorX}px,${cursorY}px,0)`;
    if(cursorShown) cursorFrame=requestAnimationFrame(cursorTick);
    else cursorFrame=0;
  }
  function hideCursor() {
    cursorShown=false;
    cursor.classList.remove('visible','over-link','over-photo','pressed');
    document.documentElement.classList.remove('has-square-cursor');
    if(cursorTopLayer&&cursor.matches(':popover-open'))cursor.hidePopover();
  }
  document.addEventListener('pointermove',event=>{
    if(event.pointerType==='touch'||!finePointer.matches) return hideCursor();
    targetX=event.clientX;targetY=event.clientY;
    if(!cursorShown){cursorX=targetX;cursorY=targetY;}
    cursorShown=true;
    if(cursorTopLayer&&!cursor.matches(':popover-open'))promoteCursor();
    cursor.classList.add('visible');
    document.documentElement.classList.add('has-square-cursor');
    const photo=!!event.target.closest('.catalog-image,.next-product');
    cursor.classList.toggle('over-photo',photo);
    cursor.classList.toggle('over-link',!photo&&!!event.target.closest('a,button,summary,[role="tab"]'));
    if(!cursorFrame) cursorFrame=requestAnimationFrame(cursorTick);
  },{passive:true});
  document.addEventListener('pointerdown',()=>cursor.classList.add('pressed'),{passive:true});
  document.addEventListener('pointerup',()=>cursor.classList.remove('pressed'),{passive:true});
  document.addEventListener('pointerout',e=>{if(!e.relatedTarget)hideCursor();},{passive:true});
  addEventListener('blur',hideCursor);
  document.addEventListener('keydown',e=>{if(e.key==='Tab')hideCursor();});

  if(!window.gsap||!window.ScrollTrigger) return;
  const gsap=window.gsap,ScrollTrigger=window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ignoreMobileResize:true});

  function split(element,mode='words') {
    if(!originalText.has(element)) originalText.set(element,element.innerHTML);
    element.innerHTML=originalText.get(element);
    element.setAttribute('aria-label',element.textContent.trim());
    const walk=node=>{
      for(const child of [...node.childNodes]) {
        if(child.nodeType===Node.TEXT_NODE) {
          const fragment=document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(text=>{
            if(!text.trim()){fragment.append(document.createTextNode(text));return;}
            const word=document.createElement('span');
            word.className=mode==='ink'?'motion-ink-word':'motion-word';
            word.setAttribute('aria-hidden','true');
            if(mode==='ink') {
              word.textContent=text;
              const fill=document.createElement('span');
              fill.className='motion-ink-fill';fill.textContent=text;word.append(fill);
            } else {
              const inner=document.createElement('span');inner.className='motion-word-inner';
              if(mode==='chars') [...text].forEach(letter=>{
                const char=document.createElement('span');char.className='motion-char';char.textContent=letter;inner.append(char);
              }); else inner.textContent=text;
              word.append(inner);
            }
            fragment.append(word);
          });
          child.replaceWith(fragment);
        } else if(child.nodeType===Node.ELEMENT_NODE&&child.tagName!=='BR') walk(child);
      }
    };
    walk(element);
    return all(mode==='ink'?'.motion-ink-fill':mode==='chars'?'.motion-char':'.motion-word-inner',element);
  }

  // Shuffle actual letters without changing word width or accessible content.
  function scramble(element) {
    if(reduce.matches||element._scrambling) return;
    const words=all('.motion-shuffle-word',element);
    if(!words.length) return;
    element._scrambling=true;
    const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const state={progress:0};
    gsap.to(state,{progress:1,duration:.85,ease:'none',onUpdate:()=>{
      words.forEach((word,index)=>{
        const text=word.dataset.original;
        const resolved=limit((state.progress-index*.035)*1.5);
        word.textContent=[...text].map((letter,i)=>/[^\p{L}\p{N}]/u.test(letter)||i/text.length<resolved?letter:alphabet[Math.floor(Math.random()*alphabet.length)]).join('');
      });
    },onComplete:()=>{words.forEach(word=>word.textContent=word.dataset.original);element._scrambling=false;}});
  }
  function prepareShuffle(element) {
    element._scrambling=false;
    if(!originalText.has(element)) originalText.set(element,element.innerHTML);
    element.innerHTML=originalText.get(element);
    element.setAttribute('aria-label',element.textContent.trim());
    const walk=node=>{for(const child of [...node.childNodes]){
      if(child.nodeType===Node.TEXT_NODE){const fragment=document.createDocumentFragment();child.textContent.split(/(\s+)/).forEach(text=>{
        if(!text.trim()){fragment.append(document.createTextNode(text));return;}
        const word=document.createElement('span');word.className='motion-shuffle-word';word.dataset.original=text;word.textContent=text;word.setAttribute('aria-hidden','true');fragment.append(word);
      });child.replaceWith(fragment);}else if(child.nodeType===Node.ELEMENT_NODE&&child.tagName!=='BR')walk(child);
    }};walk(element);
    all('.motion-shuffle-word',element).forEach(word=>word.style.width=`${word.getBoundingClientRect().width}px`);
  }

  function initSmoothScroll() {
    if(lenis){lenis.destroy();lenis=null;}
    if(reduce.matches||!window.Lenis) return;
    lenis=new Lenis({duration:1.2,smoothWheel:true,syncTouch:false,wheelMultiplier:1,autoResize:true,
      prevent:node=>!!node.closest?.('dialog,.mobile-menu,[data-lenis-prevent]')});
    lenis.on('scroll',ScrollTrigger.update);
  }
  gsap.ticker.add(time=>lenis?.raf(time*1000));
  gsap.ticker.lagSmoothing(0);
  document.addEventListener('keydown',event=>{
    if(!lenis||event.defaultPrevented||lenis.isStopped||event.altKey||event.metaKey) return;
    if(event.target.closest?.('input,textarea,select,[contenteditable="true"]')) return;
    const key=event.key;
    if(event.ctrlKey&&!['Home','End'].includes(key))return;
    if(!['Home','End','PageUp','PageDown','ArrowUp','ArrowDown',' '].includes(key))return;
    if(['ArrowUp','ArrowDown',' '].includes(key)&&event.target.closest?.('button,a,[role="tab"]'))return;
    const step=innerHeight*.85;
    const target=key==='Home'?0:key==='End'?lenis.limit:
      scrollY+(key==='PageUp'?-step:key==='PageDown'?step:key==='ArrowUp'?-60:key==='ArrowDown'?60:event.shiftKey?-step:step);
    event.preventDefault();
    lenis.scrollTo(target,{duration:.65});
  });
  function syncScrollLock() {
    if(!lenis) return;
    const locked=document.documentElement.classList.contains('preloading')||document.body.classList.contains('dialog-open')||document.body.classList.contains('menu-open');
    if(locked) lenis.stop();
    else if(lenis.isStopped){lenis.start();lenis.scrollTo(scrollY,{immediate:true,force:true});}
  }
  let previousMenu=false;
  new MutationObserver(()=>{
    syncScrollLock();
    promoteCursor();
    const open=document.body.classList.contains('menu-open');
    if(open&&!previousMenu&&!reduce.matches) {
      gsap.fromTo(all('.mobile-menu nav a'),{y:65,rotationX:-65,opacity:0},{y:0,rotationX:0,opacity:1,duration:.9,stagger:.065,ease:'expo.out',overwrite:true});
    }
    previousMenu=open;
  }).observe(document.body,{attributes:true,attributeFilter:['class']});
  new MutationObserver(syncScrollLock).observe(document.documentElement,{attributes:true,attributeFilter:['class']});

  function build() {
    context?.revert();
    const onProduct=!query('#product-page').hidden;
    context=gsap.context(()=>{
      if(reduce.matches) return;
      if(!onProduct) {
        // The catalog scrolls over the held portrait, then resumes normal flow.
        // No extra scroll distance or wheel/touch interception is introduced.
        const campaign=query('.campaign');
        gsap.set(campaign,{zIndex:1});
        ScrollTrigger.create({
          trigger:campaign,
          start:'top top',
          end:()=>`+=${campaign.offsetHeight}`,
          pin:true,
          pinSpacing:false,
          invalidateOnRefresh:true,
          id:'patch-catalog-overlay'
        });
        const hero=query('#hero-title');
        const heroChars=split(hero,'chars');
        gsap.fromTo(heroChars,{yPercent:115,rotationX:-80,opacity:0},{yPercent:0,rotationX:0,opacity:1,duration:1.25,stagger:.018,ease:'expo.out',delay:.12});
        gsap.to([hero,query('.hero-copy')],{opacity:0,ease:'none',scrollTrigger:{trigger:query('.hero'),start:'top top',end:'bottom top',scrub:true}});

        const manifesto=query('.reading-reveal');
        const fills=split(manifesto,'ink');
        gsap.to(fills,{clipPath:'inset(0 0% 0 0)',duration:1,stagger:.23,ease:'none',scrollTrigger:{trigger:manifesto,start:'top 88%',end:'bottom 52%',scrub:.7}});

          // Ease into and out of each movement, then softly catch up to scrolling.
        all('.kinetic-line').forEach((line,index)=>{
          const words=[...line.children];
          gsap.set(words,{x:0});
          const setters=words.map(word=>gsap.quickSetter(word,'x','px'));
          function position(progress) {
            const gap=parseFloat(getComputedStyle(line).columnGap)||0;
            const free=Math.max(0,line.clientWidth-words.reduce((sum,word)=>sum+word.getBoundingClientRect().width,0)-gap*(words.length-1));
              const pulse=Math.pow(Math.sin(progress*Math.PI),2);
              const eased=progress*progress*(3-2*progress);
              if(words.length===1) {
                const value=index%2===0?.34*pulse:1-.34*eased;
              setters[0](free*value);
            } else {
                const spread=1-.65*pulse;
              setters[0](free*.5*(1-spread));
              setters.at(-1)(free*.5*(1+spread));
            }
          }
            const movement={progress:0};
            gsap.to(movement,{progress:1,duration:1,ease:'none',onUpdate:()=>position(movement.progress),scrollTrigger:{trigger:line,start:'top 92%',end:'top 18%',scrub:.85,onRefresh:()=>position(movement.progress),id:`patch-words-${index}`}});
        });

        all('.campaign-content h3,.section-heading h2,.questions-heading h2').forEach(heading=>{
          const words=split(heading,'words');
          gsap.fromTo(words,{yPercent:115,rotationX:-75,opacity:0},{yPercent:0,rotationX:0,opacity:1,duration:1.1,stagger:.12,ease:'expo.out',scrollTrigger:{trigger:heading,start:'top 88%',toggleActions:'play reverse play reverse'}});
        });
        all('.catalog-card-title h3').forEach(heading=>{
          const chars=split(heading,'chars');
          gsap.fromTo(chars,{opacity:0,yPercent:110,rotationX:-80},{opacity:1,yPercent:0,rotationX:0,duration:.8,stagger:.045,ease:'expo.out',scrollTrigger:{trigger:heading,start:'top 93%',toggleActions:'play reverse play reverse'}});
        });
      } else {
        const heading=query('#product-page-title');
        const chars=split(heading,'chars');
        gsap.from(chars,{yPercent:110,rotationX:-80,opacity:0,duration:1.1,stagger:.05,ease:'expo.out'});

      }

      const shuffleSelectors=onProduct?'.product-breadcrumb span,.product-effect>span:last-child,.product-facts dt':'.hero-copy p,.hero-bottom>p,.manifesto>p,.section-heading>p,.formula-intro>p:not(.normal-case),.collection-note>span,.questions-heading>p,.reviews-top h2';
      all(shuffleSelectors).forEach(element=>{
        prepareShuffle(element);
        if(element.closest('.hero')) scramble(element);
        else ScrollTrigger.create({trigger:element,start:'top 88%',onEnter:()=>scramble(element),onEnterBack:()=>scramble(element)});
      });
      all('.desktop-nav a').forEach(element=>{
        prepareShuffle(element);
        if(!element.dataset.motionHover){
          element.addEventListener('pointerenter',()=>scramble(element));
          element.dataset.motionHover='true';
        }
      });

      const footer=query('.footer-statement');
      const footerChars=split(footer,'chars');
      // Scroll-scrubbed folding letters, not a loading-screen-only entrance.
      gsap.fromTo(footerChars,{rotationX:-75,yPercent:85,opacity:0},{rotationX:0,yPercent:0,opacity:1,stagger:.055,duration:1.5,ease:'power1.inOut',scrollTrigger:{trigger:footer,start:'top 98%',end:'clamp(top 30%)',scrub:1.6,id:'patch-footer-fold'}});
    });
    ScrollTrigger.refresh();
    lenis?.resize();
  }
  function refresh() {
    clearTimeout(refreshTimer);
    refreshTimer=setTimeout(()=>{ScrollTrigger.refresh();lenis?.resize();},100);
  }
  function onRoute() {
    if(!initialized) return;
    cursor.classList.remove('over-photo','over-link');
    lenis?.scrollTo(scrollY,{immediate:true,force:true});
    build();
    requestAnimationFrame(refresh);
  }
  document.addEventListener('patch:route',onRoute);
  document.addEventListener('patch:filter',refresh);
  document.addEventListener('toggle',event=>{if(event.target.matches('details'))refresh();},true);
  document.addEventListener('load',event=>{if(event.target.tagName==='IMG')refresh();},true);
  reduce.addEventListener('change',()=>{
    all('.motion-shuffle-word').forEach(word=>word.textContent=word.dataset.original);
    initSmoothScroll();build();syncScrollLock();
  });
  ScrollTrigger.addEventListener('refreshInit',()=>{
    const words=all('.motion-shuffle-word').filter(word=>word.getClientRects().length);
    words.forEach(word=>word.style.width='');
    words.forEach(word=>word.style.width=`${word.getBoundingClientRect().width}px`);
  });
  window.patchMotion={
    scrollTo(target){
      if(lenis) lenis.scrollTo(target,{offset:innerWidth<=760?-78:-90,duration:1.2});
      else target.scrollIntoView({behavior:reduce.matches?'instant':'smooth',block:'start'});
    },
    get state(){return {initialized,mode:window.patchMotionMode||'system',systemReduced:systemMotion.matches,reduced:reduce.matches,smooth:!!lenis,triggers:ScrollTrigger.getAll().length};}
  };
  async function start() {
    await document.fonts.ready;
    if(document.documentElement.classList.contains('preloading')) {
      await new Promise(resolve=>{
        const observer=new MutationObserver(()=>{if(!document.documentElement.classList.contains('preloading')){observer.disconnect();resolve();}});
        observer.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
      });
    }
    initSmoothScroll();
    initialized=true;
    build();
    syncScrollLock();
  }
  start();
})();
