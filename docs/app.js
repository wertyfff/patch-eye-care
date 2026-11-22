const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const systemMotion=matchMedia('(prefers-reduced-motion: reduce)'),reducedMotion={get matches(){return window.patchShouldReduceMotion?window.patchShouldReduceMotion():systemMotion.matches;},addEventListener:(...args)=>systemMotion.addEventListener(...args)},clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const products=[
{id:'aqua',name:'AQUA',image:'aqua-restored',color:'#65bfc4',shade:'Green',effect:'Hydration',description:'Aqua pairs a calm green shade with a translucent gel texture. Made for mornings with your favourite coffee and a little time to yourself.'},
{id:'glow',name:'GLOW',image:'glow-restored',color:'#d7b54e',shade:'Gold',effect:'Glow',description:'Glow brings a warm golden shimmer to your routine. Put on your favourite playlist, take your time getting ready and make the morning yours.'},
{id:'graphite',name:'GRAPHITE',image:'graphite-original',color:'#424347',shade:'Graphite',effect:'Fresh look',description:'Graphite combines a deep black shade with a glossy finish. An expressive pair for those who love clean lines and simple details.'},
{id:'rose',name:'ROSE',image:'rose-restored',color:'#db8d9d',shade:'Pink',effect:'Comfort',description:'Rose brings a bright pink touch to getting ready at home. Add a little colour to an ordinary day and take a moment for yourself.'}
];
const siteRoot=new URL('.',document.baseURI).pathname;
const productUrl=id=>`${siteRoot}product/${id}/`;
const productRoute=()=>location.pathname.slice(siteRoot.length).match(/^product\/([a-z-]+)\/?$/)?.[1];
let appliedPromo='';
let cart={};try{const saved=JSON.parse(localStorage.getItem('patch-cart-v1')||'{}');for(const p of products)if(Number.isInteger(saved[p.id])&&saved[p.id]>0)cart[p.id]=Math.min(99,saved[p.id]);}catch{}
const header=$('#header'),loader=$('#loader'),mobileMenu=$('#mobile-menu'),menuToggle=$('.menu-toggle'),page=$('#product-page'),homeSections=$$('main>section:not(#product-page)');
let lastFocus=null,menuOpen=false,productVisible=false,homeScroll=0,scheduled=false;
window.scrollTo({top:0,behavior:'instant'});
function showProduct(id,push=true){const p=products.find(p=>p.id===id);if(!p)return showHome('#collection',push);if(!productVisible)homeScroll=scrollY;if(menuOpen)setMenu(false,false);if(push)history.pushState({product:id},'',productUrl(id));productVisible=true;homeSections.forEach(s=>s.hidden=true);page.hidden=false;const next=products[(products.indexOf(p)+1)%products.length];
page.innerHTML=`<div class="product-breadcrumb page-padding"><button type="button" data-back-catalog>ALL EYE PATCHES</button><span>PATCH / ${p.name}</span></div><div class="product-layout"><div class="product-photo"><img src="assets/catalog/${p.image}.png" alt="${p.shade} eye patches ${p.name} on skin" width="1600" height="2400"></div><div class="product-info"><h1 id="product-page-title">${p.name}</h1><div class="product-effect"><span class="color-swatch" style="--swatch:${p.color}"></span><span>${p.effect.toUpperCase()}</span></div><p class="normal-case">${p.description}</p><p class="product-price">${window.patchShop.price(p.id)===null?'Price on request':window.patchShop.money(window.patchShop.price(p.id))}</p><dl class="product-facts"><div><dt>SHADE</dt><dd>${p.shade}</dd></div><div><dt>BASE</dt><dd>Hydrogel</dd></div><div><dt>HOW TO ORDER</dt><dd><a href="https://t.me/kiwnt1" target="_blank" rel="noopener noreferrer">Message on Telegram ↗</a></dd></div></dl><div class="product-buy"><div class="quantity-control" aria-label="Quantity"><button type="button" data-quantity-step="-1" aria-label="Decrease quantity">−</button><output id="product-quantity">1</output><button type="button" data-quantity-step="1" aria-label="Increase quantity">+</button></div><button class="solid-button" type="button" data-add-cart="${p.id}">ADD TO BAG</button></div><button class="text-link product-view-cart" type="button" data-open-cart>VIEW BAG</button><p class="product-order-note">Add your chosen quantity to the bag and continue to Telegram. Your bag shows the items total. We’ll arrange shipping and payment in the chat.</p><div class="product-information"><div class="product-detail-list"><details open><summary>INGREDIENTS & PACKAGING<span class="plus-icon" aria-hidden="true"></span></summary><div class="detail-content"><p>Ask for the full INCI list and packaging photos on Telegram before ordering. Check the ingredients for any sensitivities and read the product instructions.</p><a class="text-link product-inquiry" href="https://t.me/kiwnt1?text=${encodeURIComponent('Hello! Please send the INCI list, packaging photos and price for '+p.name+'.')}" target="_blank" rel="noopener noreferrer">ASK ABOUT ${p.name} ↗</a></div></details><details><summary>HOW TO USE<span class="plus-icon" aria-hidden="true"></span></summary><div class="detail-content"><p>Apply to clean, dry under-eye skin, avoiding direct contact with the eyes. Follow the packaging instructions for application time and frequency. Do not reuse single-use patches.</p></div></details><details><summary>GOOD TO KNOW<span class="plus-icon" aria-hidden="true"></span></summary><div class="detail-content"><p>Follow the ingredient list and instructions on the packaging. Do not apply to irritated or damaged skin. Stop using if discomfort occurs.</p></div></details></div></div></div></div><a class="next-product page-padding" href="${productUrl(next.id)}" data-product-link="${next.id}"><span>MEET ANOTHER PAIR</span><strong>${next.name}</strong><img src="assets/catalog/${next.image}.png" alt="Eye patches ${next.name}" width="1600" height="2400"></a>`;
document.title=`${p.name} — PATCH eye patches`;scrollTo({top:0,behavior:'instant'});if(push){const h=$('#product-page-title');h.tabIndex=-1;h.focus({preventScroll:true});}scheduleScroll();document.dispatchEvent(new Event('patch:route'));}
function showHome(target=null,push=true){if(push)history.pushState({},'',siteRoot);productVisible=false;page.hidden=true;homeSections.forEach(s=>s.hidden=false);document.title='PATCH — Start with yourself';scrollTo({top:homeScroll,behavior:'instant'});document.dispatchEvent(new Event('patch:route'));if(target)goTo(target);scheduleScroll();}
addEventListener('popstate',()=>{const m=productRoute();if(m)showProduct(m,false);else showHome(null,false);});
function goTo(id){if(menuOpen)setMenu(false,false);const target=$(id);if(!target)return;if(window.patchMotion?.scrollTo){window.patchMotion.scrollTo(target);target.tabIndex=-1;target.focus({preventScroll:true});return;}target.scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth',block:'start'});target.tabIndex=-1;target.focus({preventScroll:true});}
function setMenu(open,focus=true){menuOpen=open;mobileMenu.hidden=!open;menuToggle.setAttribute('aria-expanded',String(open));menuToggle.setAttribute('aria-label',open?'Close menu':'Open menu');header.classList.toggle('menu-active',open);document.body.classList.toggle('menu-open',open);$('main').inert=open;$('footer').inert=open;if(open)$('a',mobileMenu).focus({preventScroll:true});else if(focus)menuToggle.focus({preventScroll:true});}
menuToggle.addEventListener('click',()=>setMenu(!menuOpen));matchMedia('(min-width:761px)').addEventListener('change',e=>{if(e.matches&&menuOpen)setMenu(false,false);});
function openDialog(dialog){lastFocus=document.activeElement;if(dialog.open)return;document.body.classList.add('dialog-open');dialog.showModal();dialog.scrollTop=0;$('[data-close-dialog]',dialog).focus({preventScroll:true});}
$$('dialog').forEach(dialog=>{dialog.addEventListener('close',()=>{document.body.classList.remove('dialog-open');if(lastFocus?.isConnected)lastFocus.focus({preventScroll:true});});dialog.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const controls=$$('button,a[href],input,[tabindex]:not([tabindex="-1"])',dialog).filter(e=>!e.disabled&&e.getClientRects().length),first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===dialog)){e.preventDefault();first.focus();}});let backdropDown=false;const outside=e=>{const b=dialog.getBoundingClientRect();return e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom;};dialog.addEventListener('pointerdown',e=>backdropDown=e.target===dialog&&outside(e));dialog.addEventListener('click',e=>{if(backdropDown&&e.target===dialog&&outside(e))dialog.close();backdropDown=false;});});
let toastTimer;
function saveCart(){try{localStorage.setItem('patch-cart-v1',JSON.stringify(cart));}catch{}$$('[data-cart-count]').forEach(e=>e.textContent=Object.values(cart).reduce((a,b)=>a+b,0));}
function renderCart(){const selected=products.filter(p=>cart[p.id]);$('#cart-items').innerHTML=selected.length?selected.map(p=>`<article class="cart-item"><a href="${productUrl(p.id)}" data-product-link="${p.id}" aria-label="View ${p.name}"><img src="assets/catalog/${p.image}.png" alt="Eye patches ${p.name}" width="1600" height="2400"></a><div><a href="${productUrl(p.id)}" data-product-link="${p.id}"><h3>${p.name}</h3></a><p>${p.effect}</p><p class="cart-item-price">${window.patchShop.money(window.patchShop.price(p.id))} × ${cart[p.id]} <strong>${window.patchShop.money(window.patchShop.price(p.id)*cart[p.id])}</strong></p><div class="cart-item-actions"><button type="button" data-cart-step="-1" data-id="${p.id}" aria-label="Decrease quantity ${p.name}">−</button><span>${cart[p.id]}</span><button type="button" data-cart-step="1" data-id="${p.id}" aria-label="Increase quantity ${p.name}">+</button><button type="button" data-cart-remove="${p.id}">REMOVE</button></div></div></article>`).join(''):'<p class="cart-empty">Your bag is empty.<br>Find your pair in the collection.</p>';updateCheckout();saveCart();}
function updateCheckout(){
  const shop=window.patchShop;
  const selected=products.filter(p=>cart[p.id]);
  let totals=shop.totals(cart,appliedPromo);
  if(totals.error){appliedPromo='';$('#promo-code').value='';$('#promo-status').textContent=totals.error;$('#promo-code').setAttribute('aria-invalid','true');totals=shop.totals(cart);}
  if(!selected.length){appliedPromo='';$('#promo-code').value='';$('#promo-status').textContent='';$('#promo-code').removeAttribute('aria-invalid');}
  $('.cart-calculation').hidden=!selected.length;
  $('#cart-subtotal').textContent=totals.ready?shop.money(totals.subtotal):'Price on request';
  $('#cart-total').textContent=totals.ready?shop.money(totals.total):'Price on request';
  $('#cart-discount-row').hidden=!totals.discount;
  $('#cart-discount').textContent='−'+shop.money(totals.discount);
  $('#cart-promo-name').textContent=totals.code;
  $('[data-remove-promo]').hidden=!appliedPromo;
  if(appliedPromo)$('#promo-status').textContent=`Promo code ${appliedPromo} applied: −${shop.money(totals.discount)}.`;
  const text=['Hello! I would like to order PATCH eye patches:',...selected.map(p=>`${p.name} — ${cart[p.id]} × ${shop.money(shop.price(p.id))} = ${shop.money(shop.price(p.id)*cart[p.id])}`),'',`Subtotal: ${shop.money(totals.subtotal||0)}`,...(totals.code?[`Promo code: ${totals.code}`,`Discount: ${shop.money(totals.discount)}`]:[]),`Items total: ${shop.money(totals.total||0)}`,'Shipping is calculated separately.','Please confirm availability, shipping and payment details.'].join('\n');
  const link=$('[data-cart-checkout]');
  link.href=`https://t.me/kiwnt1?text=${encodeURIComponent(text)}`;
  link.hidden=!selected.length;
  $('.cart-note').hidden=!selected.length;
}
$('#promo-form').addEventListener('submit',event=>{
  event.preventDefault();
  const code=window.patchShop.normalize($('#promo-code').value);
  if(!code){$('#promo-status').textContent='Enter a promo code.';$('#promo-code').setAttribute('aria-invalid','true');$('#promo-code').focus();return;}
  const totals=window.patchShop.totals(cart,code);
  $('#promo-code').value=code;
  if(totals.error){$('#promo-status').textContent=totals.error+(appliedPromo?' Your previous promo code is still applied.':'');$('#promo-code').setAttribute('aria-invalid','true');return;}
  appliedPromo=totals.code;
  $('#promo-code').removeAttribute('aria-invalid');
  updateCheckout();
  $('#promo-status').textContent=`Promo code ${appliedPromo} applied: −${window.patchShop.money(totals.discount)}.`;
});
$('[data-remove-promo]').addEventListener('click',()=>{appliedPromo='';$('#promo-code').value='';$('#promo-code').removeAttribute('aria-invalid');updateCheckout();$('#promo-status').textContent='Promo code removed.';$('#promo-code').focus();});
$$('[data-catalog-price]').forEach(el=>{const value=window.patchShop.price(el.dataset.catalogPrice);el.textContent=value===null?'Price on request':window.patchShop.money(value);});
function addToCart(id){const quantity=Number($('#product-quantity')?.value||$('#product-quantity')?.textContent||1);cart[id]=Math.min(99,(cart[id]||0)+quantity);saveCart();const button=$('[data-add-cart]');button.textContent='ADDED TO BAG';const notice=$('#cart-announcement');notice.textContent=`${products.find(p=>p.id===id).name} — added to your bag`;notice.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>{notice.classList.remove('visible');if(button.isConnected)button.textContent='ADD TO BAG';},2200);}
document.addEventListener('click',e=>{const link=e.target.closest('a');if(link&&(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey))return;const productLink=e.target.closest('[data-product-link]');if(productLink){e.preventDefault();$$('dialog[open]').forEach(d=>{lastFocus=null;d.close();});showProduct(productLink.dataset.productLink);return;}if(link?.getAttribute('href')?.startsWith('#')){e.preventDefault();const id=link.getAttribute('href');if(productVisible)showHome(id);else goTo(id);return;}const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-brand-collection')){lastFocus=null;$('#info-dialog').close();if(productVisible)showHome('#collection');else goTo('#collection');}if(b.hasAttribute('data-back-catalog'))showHome('#collection');if(b.hasAttribute('data-open-info'))openDialog($('#info-dialog'));if(b.hasAttribute('data-close-dialog'))b.closest('dialog').close();if(b.hasAttribute('data-open-cart')){renderCart();openDialog($('#cart-dialog'));}if(b.hasAttribute('data-cart-continue')){lastFocus=null;$('#cart-dialog').close();if(productVisible)showHome('#collection');else goTo('#collection');}if(b.dataset.addCart)addToCart(b.dataset.addCart);if(b.dataset.quantityStep){const out=$('#product-quantity');out.value=clamp(Number(out.value||out.textContent)+Number(b.dataset.quantityStep),1,99);}if(b.dataset.cartStep){const id=b.dataset.id;cart[id]=clamp((cart[id]||0)+Number(b.dataset.cartStep),1,99);renderCart();$(`[data-cart-step="${b.dataset.cartStep}"][data-id="${id}"]`)?.focus({preventScroll:true});}if(b.dataset.cartRemove){delete cart[b.dataset.cartRemove];renderCart();$('[data-close-dialog]',$('#cart-dialog')).focus({preventScroll:true});}if(b.dataset.filter){$$('[data-filter]').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));$$('.catalog-card').forEach(card=>card.hidden=b.dataset.filter!=='all'&&card.dataset.catalogId!==b.dataset.filter);$('.catalog-grid').classList.toggle('filtered',b.dataset.filter!=='all');scheduleScroll();document.dispatchEvent(new Event('patch:filter'));}});
saveCart();
const ingredients={hyaluron:['Helps retain moisture in skincare formulas. Often used in eye patches to leave skin feeling hydrated.','HYDRATION'],caffeine:['Used in under-eye skincare designed to reduce the appearance of puffiness and tired-looking skin.','FRESH LOOK'],panthenol:['A moisturising ingredient used to support the skin barrier and help skin feel comfortable.','SKIN COMFORT']};
function selectIngredient(b,focus=false){$$('[data-ingredient]').forEach(el=>{el.setAttribute('aria-selected',String(el===b));el.tabIndex=el===b?0:-1;});const content=ingredients[b.dataset.ingredient];$('#ingredient-description').textContent=content[0];$('#ingredient-effect').textContent=content[1];$('#ingredient-panel').setAttribute('aria-labelledby',b.id);if(focus)b.focus({preventScroll:true});}
$$('[data-ingredient]').forEach((b,index,all)=>{b.addEventListener('click',()=>selectIngredient(b));b.addEventListener('keydown',e=>{if(['ArrowDown','ArrowRight','ArrowUp','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?all.length-1:(index+(['ArrowUp','ArrowLeft'].includes(e.key)?-1:1)+all.length)%all.length;selectIngredient(all[next],true);}});});
const reviewExamples=[['“BEEN BUYING THESE FOR SIX MONTHS — LOVE THEM!”',''],['“GREAT QUALITY AND QUICK DELIVERY. REALLY HAPPY!”',''],['“REALLY GOOD QUALITY!”',''],['“I USE THEM EVERY MORNING. THE PUFFINESS GOES DOWN SO QUICKLY.”',''],['“LOVE EVERYTHING!”','']];
let reviewIndex=0;
function changeReview(direction){reviewIndex=(reviewIndex+direction+reviewExamples.length)%reviewExamples.length;$('#review-quote').textContent=reviewExamples[reviewIndex][0];$('#review-author').textContent=reviewExamples[reviewIndex][1];$('#review-position').textContent=`${reviewIndex+1} / ${reviewExamples.length}`;}
$('#review-prev').addEventListener('click',()=>changeReview(-1));
$('#review-next').addEventListener('click',()=>changeReview(1));
// Sample a small, cached image bitmap to keep a transparent header readable.
// Sampling changes only text color; photographs and scrolling remain untouched.
const photoBitmaps = new WeakMap();
const headerLabels = [$('.brand'), ...$$('.desktop-nav a'), $('.cart-toggle'), menuToggle];
function bitmapFor(img) {
  if (photoBitmaps.has(img)) return photoBitmaps.get(img);
  if (!img.complete || !img.naturalWidth) return null;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = Math.round(128 * img.naturalHeight / img.naturalWidth);
    const context = canvas.getContext('2d', { willReadFrequently:true });
    context.drawImage(img,0,0,canvas.width,canvas.height);
    const bitmap = { data:context.getImageData(0,0,canvas.width,canvas.height).data, width:canvas.width, height:canvas.height };
    photoBitmaps.set(img,bitmap);
    return bitmap;
  } catch { photoBitmaps.set(img,null); return null; }
}
function pixelLuminance(bitmap,x,y) {
  const index = (clamp(Math.round(y),0,bitmap.height-1)*bitmap.width+clamp(Math.round(x),0,bitmap.width-1))*4;
  const linear = value => { const c=value/255; return c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4); };
  return .2126*linear(bitmap.data[index])+.7152*linear(bitmap.data[index+1])+.0722*linear(bitmap.data[index+2]);
}
function updateHeaderColors() {
  const images = $$('.campaign img,.catalog-image img,.product-photo img,.next-product img')
    .map(img=>({img,rect:img.getBoundingClientRect()})).filter(item=>item.rect.width&&item.rect.top<100&&item.rect.bottom>0);
  const footerBox=$('.site-footer').getBoundingClientRect();
  for (const label of headerLabels) {
    const box=label.getBoundingClientRect();
    if (!box.width) continue;
    const centerX=box.left+box.width/2,centerY=box.top+box.height/2;
    const photo=!menuOpen&&images.find(item=>centerX>=item.rect.left&&centerX<=item.rect.right&&centerY>=item.rect.top&&centerY<=item.rect.bottom);
    let color=centerY>=footerBox.top&&centerY<=footerBox.bottom?'#f5f5f5':'var(--ink)';
    const bitmap=photo&&bitmapFor(photo.img);
    if (bitmap) {
      const {img,rect}=photo;
      const scale=Math.max(rect.width/img.naturalWidth,rect.height/img.naturalHeight);
      const renderWidth=img.naturalWidth*scale,renderHeight=img.naturalHeight*scale;
      const position=getComputedStyle(img).objectPosition.split(' ').map(value=>parseFloat(value)/100);
      const left=rect.left+(rect.width-renderWidth)*(position[0]??.5);
      const top=rect.top+(rect.height-renderHeight)*(position[1]??.5);
      let luminance=0;
      for (const dx of [-.3,0,.3]) for (const dy of [-5,0,5]) {
        luminance+=pixelLuminance(bitmap,(centerX+box.width*dx-left)/renderWidth*bitmap.width,(centerY+dy-top)/renderHeight*bitmap.height);
      }
      luminance/=9;
      color=luminance>.179?'#000000':'#ffffff';
    }
    if(label.style.color!==color) label.style.color=color;
  }
}
document.addEventListener('load',scheduleScroll,true);
function updateScroll(){scheduled=false;header.classList.toggle('scrolled',scrollY>30);updateHeaderColors();}
function scheduleScroll(){if(!scheduled){scheduled=true;requestAnimationFrame(updateScroll);}}addEventListener('scroll',scheduleScroll,{passive:true});addEventListener('resize',scheduleScroll,{passive:true});reducedMotion.addEventListener('change',scheduleScroll);document.fonts.ready.then(scheduleScroll);
document.addEventListener('keydown',e=>{if(!menuOpen)return;if(e.key==='Escape'){setMenu(false);return;}if(e.key==='Tab'){const controls=[menuToggle,...$$('a',mobileMenu)],index=controls.indexOf(document.activeElement);if(e.shiftKey&&index<=0){e.preventDefault();controls.at(-1).focus();}else if(!e.shiftKey&&index===controls.length-1){e.preventDefault();menuToggle.focus();}}});const route=productRoute();if(route)showProduct(route,false);else if(location.hash)history.replaceState({},'',siteRoot);updateScroll();
function startIntro(){const started=performance.now(),minimum=reducedMotion.matches?400:1800;let ready=false,displayed=0,phrase=0;const phrases=['TIME FOR YOURSELF','START WITH YOURSELF.','OPEN YOUR EYES'],image=productVisible?$('.product-photo img'):$('.campaign img');Promise.race([Promise.allSettled([document.fonts.ready,image?.decode?.()]),new Promise(r=>setTimeout(r,3500))]).then(()=>ready=true);function tick(now){if(!loader.isConnected)return;const target=Math.min(ready?100:92,(now-started)/minimum*100);displayed+=(target-displayed)*.17;if(target===100&&displayed>99.4)displayed=100;$('#loader-count').textContent=String(Math.floor(displayed)).padStart(3,'0');$('#loader-line').style.transform=`scaleX(${displayed/100})`;const next=displayed<38?0:displayed<76?1:2;if(next!==phrase){phrase=next;$('#loader-title').textContent=phrases[phrase];}if(displayed>=100){clearTimeout(window.patchLoaderFallback);scrollTo({top:0,behavior:'instant'});loader.classList.add('exiting');document.documentElement.classList.remove('preloading');document.documentElement.classList.add('is-ready');setTimeout(()=>loader.remove(),reducedMotion.matches?100:1000);scheduleScroll();return;}requestAnimationFrame(tick);}requestAnimationFrame(tick);}startIntro();
