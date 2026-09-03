const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reduceMotion) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
  revealEls.forEach((el, i) => {
    el.style.setProperty('--delay', `${Math.min((i % 8) * 55, 330)}ms`);
    io.observe(el);
  });
} else {
  revealEls.forEach(el => el.classList.add('is-visible'));
}

// V7 fast diamond cursor
if (window.matchMedia('(pointer:fine)').matches) {
  const oldGlow=document.querySelector('.cursor-glow'); if(oldGlow) oldGlow.remove();
  let dot=document.querySelector('.cursor-dot'); if(!dot){dot=document.createElement('div');dot.className='cursor-dot';document.body.appendChild(dot);}
  let cursorX=0,cursorY=0,cursorFrame=0; document.addEventListener('pointermove',e=>{cursorX=e.clientX;cursorY=e.clientY;if(!cursorFrame)cursorFrame=requestAnimationFrame(()=>{dot.style.left=cursorX+'px';dot.style.top=cursorY+'px';cursorFrame=0;});},{passive:true});
  document.querySelectorAll('a,button,.pin,.card,.resource-story,.insight-card,.datasheet-card').forEach(el=>{el.addEventListener('pointerenter',()=>document.body.classList.add('cursor-hover'));el.addEventListener('pointerleave',()=>document.body.classList.remove('cursor-hover'));});
}

// Hero product parallax — subtle, never distorts product imagery
const stage = document.querySelector('.stage');
if(stage && !reduceMotion){
  const pieces = stage.querySelectorAll('[data-depth]');
  stage.addEventListener('mousemove', e => {
    const r=stage.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
    pieces.forEach(p => {
      const d=Number(p.dataset.depth || 1);
      p.style.setProperty('--mx', `${x*d*18}px`);
      p.style.setProperty('--my', `${y*d*14}px`);
    });
  });
  stage.addEventListener('mouseleave',()=>pieces.forEach(p=>{p.style.setProperty('--mx','0px');p.style.setProperty('--my','0px')}));
}

// Navbar state
const nav = document.querySelector('.nav');
const setNav=()=>nav && nav.classList.toggle('scrolled', scrollY>28);
setNav(); addEventListener('scroll',setNav,{passive:true});

// Tiny count-up for hero proof numbers
if(!reduceMotion){
  document.querySelectorAll('[data-count]').forEach(el=>{
    const end=Number(el.dataset.count), suffix=el.dataset.suffix||'';
    const io=new IntersectionObserver(([entry])=>{
      if(!entry.isIntersecting) return;
      const start=performance.now(), dur=1100;
      const tick=t=>{ const p=Math.min(1,(t-start)/dur); const eased=1-Math.pow(1-p,3); el.textContent=Math.round(end*eased)+suffix; if(p<1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick); io.disconnect();
    },{threshold:.6}); io.observe(el);
  });
}

// Scroll progress — nearly invisible, adds a premium sense of motion
const progress = document.createElement('div');
progress.className='scroll-progress'; document.body.appendChild(progress);
const setProgress=()=>{ const h=document.documentElement.scrollHeight-innerHeight; progress.style.transform=`scaleX(${h>0?scrollY/h:0})`; };
setProgress(); addEventListener('scroll',setProgress,{passive:true});

// V10 — accurate, clickable office map. Pins are positioned from real latitude/longitude.
const offices={
  usa:{country:'USA',city:'New York',address:'1185 6th Ave, 3rd Floor<br>New York, NY 10036',phone:'+1 844 636 4588',tel:'+18446364588',lat:40.7128,lon:-74.0060},
  uae:{country:'UAE',city:'Dubai',address:'Office 2506, Burlington Tower<br>Marasi Drive, Business Bay, Dubai',phone:'+971 4 259 5022',tel:'+97142595022',lat:25.2048,lon:55.2708},
  india:{country:'INDIA',city:'Pune',address:'968/11, Senapati Bapat Rd<br>Shivajinagar, Pune 411016',phone:'+91 20 2998 0506',tel:'+912029980506',lat:18.5204,lon:73.8567},
  hk:{country:'HONG KONG SAR',city:'Hong Kong',address:'Unit 19B, 9/F., Block B<br>Focal Industrial Centre, Hunghom, Kowloon',phone:'+852 9088 4833',tel:'+85290884833',lat:22.3193,lon:114.1694},
  sg:{country:'SINGAPORE',city:'Singapore',address:'Suite 13, Level 24<br>31 Rochester Drive, Singapore 138637',phone:'+65 8946 5990',tel:'+6589465990',lat:1.3521,lon:103.8198}
};
const panel=document.getElementById('officePanel');
const officeMap=document.getElementById('irysOfficeMap');
function projectOffice(lat,lon){
  // The supplied world-map asset uses a simple equirectangular-style canvas cropped to ~85°N / 60°S.
  const left=((lon+180)/360)*100;
  const top=((85-lat)/(85-(-60)))*100;
  return {left,top};
}
function positionOfficePins(){
  if(!officeMap)return;
  officeMap.querySelectorAll('.pin[data-office]').forEach(pin=>{
    const o=offices[pin.dataset.office]; if(!o)return;
    const pos=projectOffice(o.lat,o.lon);
    pin.style.left=pos.left.toFixed(3)+'%'; pin.style.top=pos.top.toFixed(3)+'%';
  });
}
function showOffice(key,pin){
  const o=offices[key]; if(!o||!panel)return;
  document.querySelectorAll('.interactive-map .pin').forEach(p=>{p.classList.remove('active');p.setAttribute('aria-pressed','false')});
  if(pin){pin.classList.add('active');pin.setAttribute('aria-pressed','true')}
  try{panel.animate([{opacity:.45,transform:'translateX(10px)'},{opacity:1,transform:'none'}],{duration:260,easing:'cubic-bezier(.2,.8,.2,1)'})}catch(e){}
  panel.innerHTML=`<small>${irysT(o.country)}</small><h3>${irysT(o.city)}</h3><p>${o.address}</p><div class="office-actions"><a href="tel:${o.tel}">${o.phone}</a><a href="contact.html">${irysT('Contact this office')}</a></div><span>${irysT('Select another office on the map')}</span>`;
}
positionOfficePins();
window.addEventListener('resize',positionOfficePins,{passive:true});
document.querySelectorAll('.interactive-map .pin[data-office]').forEach(pin=>{
  pin.setAttribute('aria-pressed',pin.classList.contains('active')?'true':'false');
  pin.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();showOffice(pin.dataset.office,pin)});
  pin.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showOffice(pin.dataset.office,pin)}});
});

// Micro-tilt on selected premium surfaces
if(window.matchMedia('(pointer:fine)').matches && !reduceMotion){
  document.querySelectorAll('.feature-product,.mini-product,.card,.mv-card').forEach(el=>{
    el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transform=`perspective(900px) rotateX(${(-y*2.4).toFixed(2)}deg) rotateY(${(x*2.4).toFixed(2)}deg) translateY(-3px)`});
    el.addEventListener('mouseleave',()=>el.style.transform='');
  });
}

// ===== V4 enhancements =====
// Persistent language switch in the top navigation
(() => {
  const links = document.querySelector('.nav .links');
  if (!links || links.querySelector('.lang-switch')) return;
  const btn = document.createElement('button');
  btn.className = 'lang-switch';
  btn.type = 'button';
  btn.setAttribute('aria-label','Switch language');
  btn.textContent = localStorage.getItem('irys-lang') === 'ar' ? 'EN' : 'عربي';
  const pill = links.querySelector('.pill');
  links.insertBefore(btn, pill || null);
  btn.addEventListener('click', () => setIrysLanguage(document.documentElement.lang === 'ar' ? 'en' : 'ar'));
})();

// Floating WhatsApp on every page
(() => {
  if (document.querySelector('.whatsapp-float')) return;
  const a = document.createElement('a');
  a.className = 'whatsapp-float';
  a.href = "https://wa.me/971565260202?text=" + encodeURIComponent("Hello Irys, I'd like to discuss an RFID solution for my jewellery business.");
  a.target = '_blank'; a.rel = 'noopener'; a.setAttribute('aria-label','Chat with Irys on WhatsApp');
  a.innerHTML = `<span class="wa-tip">Message Irys</span><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3C8.82 3 3 8.54 3 15.38c0 2.39.72 4.63 1.96 6.53L3.5 29l7.38-1.41A13.48 13.48 0 0 0 16 28.62c7.18 0 13-5.54 13-12.38S23.18 3 16 3Zm0 22.98c-1.77 0-3.49-.46-4.98-1.32l-.36-.21-4.38.84.87-4.06-.24-.37a9.26 9.26 0 0 1-1.53-5.09c0-5.31 4.73-9.63 10.62-9.63s10.62 4.32 10.62 9.63S21.89 25.98 16 25.98Zm5.83-7.17c-.32-.15-1.9-.89-2.19-.99-.29-.1-.5-.15-.71.15-.21.3-.82.99-1.01 1.19-.18.2-.37.22-.69.07-.32-.15-1.35-.47-2.56-1.5-.95-.8-1.59-1.79-1.78-2.09-.19-.3-.02-.46.14-.61.14-.13.32-.34.48-.51.16-.17.21-.3.32-.5.11-.2.05-.37-.03-.52-.08-.15-.71-1.64-.98-2.25-.26-.62-.53-.53-.71-.54h-.61c-.21 0-.56.08-.85.37-.29.3-1.11 1.04-1.11 2.53 0 1.49 1.14 2.93 1.3 3.13.16.2 2.24 3.26 5.43 4.57.76.31 1.35.5 1.81.64.76.23 1.45.2 2 .12.61-.09 1.9-.74 2.17-1.45.27-.72.27-1.33.19-1.45-.08-.13-.29-.2-.61-.35Z"/></svg>`;
  document.body.appendChild(a);
})();

// Lightweight bilingual layer. Keeps English as source-of-truth and swaps visible copy in-browser.
const irysAr = {
  'Solutions':'الحلول','Products':'المنتجات','Solution Finder':'مساعد الحلول','Resources':'المصادر','Company':'الشركة','Team':'الفريق','Request a demo':'اطلب عرضاً توضيحياً',
  'Jewellery intelligence, engineered by Irys':'ذكاء المجوهرات، بتقنيات Irys','Every piece.':'كل قطعة.','Visible.':'مرئية.','Verified.':'موثّقة.',
  'Request a private demo':'اطلب عرضاً خاصاً','Discover the Irys ecosystem →':'اكتشف منظومة Irys ←','Selected relationships':'عملاؤنا','Trusted across jewellery & diamonds.':'ثقة عالمية في المجوهرات والألماس.',
  'The Irys ecosystem':'منظومة Irys','Technology designed around high-value inventory.':'تقنية مصممة للمخزون عالي القيمة.','Operational intelligence':'ذكاء العمليات','From count to dispatch, with certainty.':'من الجرد إلى الشحن بثقة.',
  'Global presence':'حضور عالمي','Local expertise.':'خبرة محلية.','Global reach.':'انتشار عالمي.','See Irys in your workflow':'شاهد Irys ضمن عملياتك','Make every piece accountable.':'اجعل كل قطعة قابلة للتتبع.',
  'Built around the way jewellery actually moves.':'مصممة حول الطريقة التي تتحرك بها المجوهرات فعلياً.','Find my solution':'اعثر على الحل المناسب','Talk to a specialist →':'تحدث مع مختص ←','Retailers':'تجار التجزئة','Wholesalers':'تجار الجملة','Diamantaires':'شركات الألماس',
  'Daily stock counts':'الجرد اليومي','Fast item search':'البحث السريع عن القطع','Issue & return verification':'التحقق من التسليم والإرجاع','High-volume counting':'جرد الكميات الكبيرة','Dispatch verification':'التحقق من الشحن','ERP-connected workflows':'عمليات مرتبطة بأنظمة ERP','Packet identification':'تعريف عبوات الألماس','Inventory movement':'حركة المخزون','Verification & search':'التحقق والبحث',
  'Not sure what fits?':'غير متأكد من الحل؟','Describe the problem. We’ll map the workflow.':'صف المشكلة وسنحدد لك مسار العمل المناسب.','Open Solution Finder':'افتح مساعد الحلول',
  'Purpose-built RFID technology.':'تقنيات RFID مصممة خصيصاً.','Software':'البرمجيات','Hardware & Readers':'الأجهزة والقارئات','RFID Consumables':'مستهلكات RFID',
  'RFID intelligence with a jewellery-first perspective.':'ذكاء RFID بمنظور متخصص في المجوهرات.','Technology that looks beyond stock audit.':'تقنية تتجاوز مفهوم الجرد التقليدي.','Global by design.':'عالمية منذ التصميم.','Purpose':'غايتنا','Our mission & vision':'رؤيتنا ورسالتنا','Our mission':'رسالتنا','Our vision':'رؤيتنا',
  'Contact Irys':'تواصل مع Irys','One group. Five offices. One conversation.':'مجموعة واحدة. خمسة فروع. تواصل واحد.','Global offices':'فروعنا العالمية','Talk to the team closest to you.':'تواصل مع أقرب فريق لك.','Smart lead capture':'تواصل ذكي','Tell us what you need — not just your contact details.':'أخبرنا بما تحتاجه، وليس فقط بيانات التواصل.','Prefer guidance first? Open Solution Finder →':'تفضل تحديد الحل أولاً؟ افتح مساعد الحلول ←','Prepare enquiry':'جهّز الطلب','Send on WhatsApp':'أرسل عبر واتساب',
  'Irys Solution Finder':'مساعد حلول Irys','Describe the problem.':'صف المشكلة.','Find the right RFID path.':'اعثر على مسار RFID المناسب.','Guided recommendation':'توصية موجهة','What is the biggest inventory challenge you want to solve?':'ما أكبر مشكلة في المخزون تريد حلها؟','Stock counting takes too long':'الجرد يستغرق وقتاً طويلاً','We waste time finding items':'نضيّع وقتاً في البحث عن القطع','Issue / return needs better control':'نحتاج تحكماً أفضل بالتسليم والإرجاع','Dispatch verification is manual':'التحقق من الشحن يدوي','We need better inventory accuracy':'نحتاج دقة أفضل للمخزون','We need RFID connected to ERP / SAP':'نحتاج ربط RFID مع ERP / SAP','Your recommendation will appear here.':'ستظهر توصيتك هنا.','Choose the challenge that best matches your operation.':'اختر المشكلة الأقرب لعملياتك.','Turn the recommendation into a plan':'حوّل التوصية إلى خطة','Send this requirement to Irys.':'أرسل هذا الاحتياج إلى Irys.','Continue on WhatsApp':'تابع عبر واتساب',
  'RFID & IoT intelligence for jewellery and diamond inventory.':'ذكاء RFID وإنترنت الأشياء لمخزون المجوهرات والألماس.','All rights reserved.':'جميع الحقوق محفوظة.','Message Irys':'راسل Irys'
};
Object.assign(irysAr,{"Request a demo":"اطلب عرضاً توضيحياً","RFID and IoT technology created for the precision of jewellery and diamond inventory — connecting stocktaking, search, verification and enterprise workflows in one intelligent ecosystem.":"تقنيات RFID وإنترنت الأشياء صُممت لدقة مخزون المجوهرات والألماس، لتربط الجرد والبحث والتحقق وعمليات الأنظمة المؤسسية ضمن منظومة ذكية واحدة.","companies deployed":"شركة تعتمد حلولنا","global offices":"مكاتب عالمية","stocktaking time reduction*":"خفض في وقت الجرد*","IRYS ECOSYSTEM":"منظومة IRYS","Software · Readers · RFID Tags":"برمجيات · قارئات · بطاقات RFID","Technology deployed across an international network of jewellery and diamond businesses.":"تقنيات مطبّقة لدى شبكة عالمية من شركات المجوهرات والألماس.","Purpose-built hardware, software and RFID consumables work together to make inventory operations faster, more controlled and easier to connect with existing systems.":"تعمل الأجهزة والبرمجيات ومستهلكات RFID المصممة خصيصاً معاً لجعل عمليات المخزون أسرع وأكثر تحكماً وأسهل ربطاً بالأنظمة الحالية.","01 · FIXED RFID READER":"01 · قارئ RFID ثابت","RFID reading engineered for controlled jewellery workflows.":"قراءة RFID مصممة لعمليات المجوهرات التي تتطلب تحكماً عالياً.","02 · HANDHELD RFID":"02 · قارئ RFID محمول","03 · PRINT & ENCODE":"03 · طباعة وترميز","Irys technology supports the workflows where visibility matters most — without forcing jewellery businesses into a generic inventory model.":"تدعم تقنيات Irys العمليات التي تكون فيها الرؤية الدقيقة للمخزون أساسية، من دون فرض نموذج مخزون عام لا يناسب قطاع المجوهرات.","Stock Counting":"جرد المخزون","Accelerate daily and periodic inventory checks.":"سرّع عمليات الجرد اليومية والدورية.","Item Search":"البحث عن القطع","Locate tagged pieces with less manual searching.":"اعثر على القطع المعلّمة بسرعة وبحث يدوي أقل.","Verification":"التحقق","Confirm inventory during issue, return and dispatch.":"تحقق من المخزون أثناء التسليم والإرجاع والشحن.","Loss Prevention":"الحد من الفاقد","Improve visibility across high-value stock.":"حسّن الرؤية والتحكم بالمخزون عالي القيمة.","ERP Integration":"تكامل ERP","Connect RFID operations with enterprise systems.":"اربط عمليات RFID بالأنظمة المؤسسية.","Measured impact":"نتائج قابلة للقياس","reduction in time required for daily stocktaking reported by Navkkar Jewellers.":"خفض في الوقت المطلوب للجرد اليومي وفقاً لشركة Navkkar Jewellers.","“We’ve witnessed a remarkable 90% reduction in the time required for daily stocktaking.”":"«شهدنا انخفاضاً ملحوظاً بنسبة 90% في الوقت المطلوب لإجراء الجرد اليومي.»","Vivek Jain — Managing Director, Navkkar Jewellers":"Vivek Jain — المدير العام، Navkkar Jewellers","Rated by businesses we support.":"آراء من شركات استخدمت حلولنا.","Recent public feedback on Google.":"آراء عامة حديثة على Google.","Google review · 5 stars":"تقييم Google · 5 نجوم","Google Local Guide · 5 stars":"مرشد محلي على Google · 5 نجوم","“I highly recommend this company. We had such a great experience with them from start to finish. All my stuff was trained…”":"«أوصي بهذه الشركة بشدة. كانت تجربتنا معهم رائعة من البداية حتى النهاية، وتم تدريب جميع الموظفين…»","“Excellent RFID solutions provider in the UAE. Professional team, fast support, and reliable systems. Highly recommended!”":"«مزود ممتاز لحلول RFID في الإمارات. فريق محترف، دعم سريع، وأنظمة موثوقة. أوصي بهم بشدة!»","Reviews reproduced from the Google review screenshots supplied for this website.":"تقييمات Google كما ظهرت في الصور المقدمة للموقع.","Irys operates across Singapore, India, the UAE, Hong Kong SAR and the United States.":"تعمل Irys عبر سنغافورة والهند والإمارات وهونغ كونغ والولايات المتحدة.","Click any location to explore":"اضغط على أي موقع لعرض التفاصيل","See Irys in your workflow":"شاهد Irys ضمن عملياتك","Talk to Irys":"تحدث مع Irys","Headquartered in Singapore, Irys is a pioneer in inventory management for diamond and jewellery businesses using next-generation auto-identification technologies.":"تتخذ Irys من سنغافورة مقراً رئيسياً، وهي من الشركات الرائدة في إدارة مخزون المجوهرات والألماس باستخدام تقنيات التعرف الآلي من الجيل الجديد.","Backed by domain expertise, the Irys suite combines IoT technologies to support inventory visibility across jewellery and diamond operations. With offices in Singapore, UAE, Hong Kong, India and the USA, Irys has deployed RFID technology for hundreds of jewellery and diamond companies worldwide.":"بفضل خبرتها المتخصصة في القطاع، تجمع منظومة Irys بين تقنيات إنترنت الأشياء لتعزيز رؤية المخزون في عمليات المجوهرات والألماس. ومن خلال مكاتبها في سنغافورة والإمارات وهونغ كونغ والهند والولايات المتحدة، طبقت Irys تقنيات RFID لدى مئات شركات المجوهرات والألماس حول العالم.","Our footprint brings technology, implementation and support closer to jewellery businesses across major international markets.":"يقرّب حضورنا العالمي التكنولوجيا والتنفيذ والدعم من شركات المجوهرات في أهم الأسواق الدولية.","The principles guiding how Irys builds technology for the jewellery and diamond industry.":"المبادئ التي توجه Irys في تطوير تقنيات مخصصة لصناعة المجوهرات والألماس.","Empower jewellery businesses through visibility.":"تمكين شركات المجوهرات من خلال رؤية أوضح للمخزون.","Our mission is to empower jewelry and diamond businesses with cutting-edge RFID solutions that enable them to gain real-time visibility, streamline processes, and increase their productivity. We strive to be the trusted partner that helps our clients achieve unprecedented levels of efficiency, accuracy, and profitability.":"رسالتنا هي تمكين شركات المجوهرات والألماس بحلول RFID متطورة تمنحها رؤية لحظية، وتبسّط العمليات، وترفع الإنتاجية. ونسعى لأن نكون الشريك الموثوق الذي يساعد عملاءنا على تحقيق مستويات استثنائية من الكفاءة والدقة والربحية.","Lead the future of jewellery RFID.":"قيادة مستقبل RFID في قطاع المجوهرات.","Our vision is to be the global leader in RFID technology for the jewelry and diamond industry. We aim to continually innovate and develop advanced solutions that address the evolving needs of our clients. By leveraging the power of RFID, we envision a future where jewelry businesses can operate with optimal productivity, exceptional security, and seamless integration, ultimately unlocking new levels of success.":"رؤيتنا أن نكون الشركة العالمية الرائدة في تقنيات RFID لصناعة المجوهرات والألماس. نواصل الابتكار وتطوير حلول متقدمة تلبي احتياجات عملائنا المتغيرة، ونرى مستقبلاً تعمل فيه شركات المجوهرات بإنتاجية مثالية وأمان استثنائي وتكامل سلس يفتح مستويات جديدة من النجاح.","From product to outcome":"من المنتج إلى النتيجة","Not sure which Irys setup fits your workflow?":"غير متأكد من إعداد Irys الأنسب لعملياتك؟","Three industry-specific RFID workflows for retailers, wholesalers and diamantaires — supported by Irys hardware, software and tags.":"ثلاثة مسارات RFID متخصصة لتجار التجزئة والجملة وشركات الألماس، مدعومة بأجهزة وبرمجيات وبطاقات Irys.","Bring speed and confidence to store-level inventory counting, item search and verification without turning the jewellery floor into a warehouse.":"أضف السرعة والثقة إلى الجرد والبحث والتحقق داخل المتجر من دون تحويل صالة المجوهرات إلى مستودع.","Solve a retail challenge":"حل تحدي التجزئة","Explore products →":"استكشف المنتجات ←","Support high-volume jewellery inventory movement with RFID-assisted counting, verification and dispatch workflows designed for operational control.":"ادعم حركة كميات كبيرة من مخزون المجوهرات بجرد وتحقق وشحن مدعوم بـRFID ومصمم للتحكم التشغيلي.","Solve a wholesale challenge":"حل تحدي الجملة","Request a demo →":"اطلب عرضاً توضيحياً ←","Purpose-built workflows for diamond packet inventory, movement and verification — where accuracy and traceability matter at every hand-off.":"مسارات مخصصة لمخزون عبوات الألماس وحركتها والتحقق منها، حيث تكون الدقة وإمكانية التتبع أساسية في كل مرحلة تسليم.","Solve a diamond challenge":"حل تحدي الألماس","Explore RFID tags →":"استكشف بطاقات RFID ←","The Irys Solution Finder turns your operational challenge into a recommended RFID setup and a clear next step.":"يحوّل مساعد حلول Irys تحديك التشغيلي إلى إعداد RFID مقترح وخطوة تالية واضحة.","People of Irys":"فريق Irys","Built by specialists across technology, operations and jewellery.":"يبنيها متخصصون في التكنولوجيا والعمليات وقطاع المجوهرات.","A global team working across product, engineering, support, design, sales and leadership.":"فريق عالمي يعمل في تطوير المنتجات والهندسة والدعم والتصميم والمبيعات والقيادة.","Leadership":"القيادة","Global Irys":"Irys عالمياً","Our team":"فريقنا","Technology · Operations · Sales":"تكنولوجيا · عمليات · مبيعات","Group CEO":"الرئيس التنفيذي للمجموعة","Group CTO":"الرئيس التنفيذي للتكنولوجيا","Business Head – USA":"مدير الأعمال – الولايات المتحدة","Business Head – India":"مدير الأعمال – الهند","VP Sales – Middle East":"نائب رئيس المبيعات – الشرق الأوسط","Business Head – Hong Kong":"مدير الأعمال – هونغ كونغ","Jr. Developer":"مطوّر مبتدئ","Technical Support Specialist":"أخصائي دعم فني","Strategic Sales":"مبيعات استراتيجية","Executive – Accounts":"تنفيذي – الحسابات","Sr. Developer":"مطوّر أول","Sr. Executive – Admin":"تنفيذي أول – الإدارة","Sr. Quality Control":"مراقبة جودة أولى","Sales Manager":"مدير مبيعات","Jr. Graphic Designer":"مصمم جرافيك مبتدئ","Executive – Admin":"تنفيذي – الإدارة","UI/UX Designer":"مصمم UI/UX","Irys ecosystem":"منظومة Irys","Hardware, software and consumables developed around the precision and operational demands of jewellery and diamond inventory.":"أجهزة وبرمجيات ومستهلكات طُورت لتناسب دقة ومتطلبات تشغيل مخزون المجوهرات والألماس.","01 product":"منتج واحد","09 products":"9 منتجات","06 products":"6 منتجات","Standard RFID Tags":"بطاقات RFID القياسية","Soft Tag Without Tail":"بطاقة مرنة دون ذيل","Reusable Hard Tag":"بطاقة صلبة قابلة لإعادة الاستخدام","Diamond Tag":"بطاقة الألماس","Tamper Evident Tag":"بطاقة مقاومة للعبث","Printer Ribbon":"شريط الطابعة","Choose your closest office, request a private demo or tell us what you are trying to improve.":"اختر أقرب مكتب إليك، أو اطلب عرضاً خاصاً، أو أخبرنا بما تريد تحسينه.","Direct office details for the UAE, India, Singapore, Hong Kong SAR and the United States.":"بيانات التواصل المباشرة لمكاتب الإمارات والهند وسنغافورة وهونغ كونغ والولايات المتحدة.","Share the operational challenge, your market and the type of jewellery business. That gives the Irys team useful context before the first call.":"شاركنا التحدي التشغيلي والسوق ونوع نشاط المجوهرات، لنبدأ أول مكالمة بفهم واضح لاحتياجك.","Name":"الاسم","Business email":"البريد الإلكتروني للعمل","Phone / WhatsApp":"الهاتف / واتساب","Country":"الدولة","Business type":"نوع النشاط","Retailer":"تجزئة","Wholesaler":"جملة","Diamantaire":"ألماس","Manufacturer":"مصنّع","Other":"أخرى","What are you trying to improve?":"ما الذي تريد تحسينه؟","Stock counting speed":"سرعة الجرد","Missing item search":"البحث عن القطع المفقودة","Issue / return verification":"التحقق من التسليم / الإرجاع","Inventory accuracy":"دقة المخزون","RFID implementation planning":"تخطيط تطبيق RFID","Message":"الرسالة","Prefer WhatsApp? Your message can be handed directly to the Dubai team.":"تفضل واتساب؟ يمكن إرسال طلبك مباشرة عبر واتساب.","Your enquiry is ready. Send it by email or WhatsApp.":"طلبك جاهز. أرسله عبر البريد الإلكتروني أو واتساب.","Describe the problem.":"صف المشكلة.","Build the right RFID path.":"ابنِ مسار RFID المناسب.","A consultative assistant that asks about your operation before recommending an Irys solution direction.":"مساعد استشاري يسألك عن تفاصيل عملياتك قبل اقتراح مسار حل مناسب من Irys.","Adaptive recommendation engine":"محرك توصيات متكيّف","Consultative solution assistant":"مساعد استشاري للحلول","← Previous question":"السؤال السابق →","I’ll ask a few questions first so the direction fits your operation.":"سأطرح عليك عدة أسئلة أولاً حتى يكون الاقتراح مناسباً لطبيعة عملياتك.","Your answers are carried into the enquiry so the sales team can start with context.":"تُرفق إجاباتك بالطلب ليبدأ فريق المبيعات بفهم واضح لاحتياجك.","Inventory management is difficult":"إدارة المخزون تحتاج إلى تحسين","Which part of inventory management creates the most friction?":"أي جزء من إدارة المخزون يسبب أكبر تحدٍ؟","Real-time visibility across stock":"رؤية لحظية للمخزون","Tracking movement between locations":"تتبع الحركة بين المواقع","Missing items / inventory exceptions":"القطع المفقودة واستثناءات المخزون","Managing inventory across multiple locations":"إدارة المخزون عبر عدة مواقع","What best describes your business?":"ما نوع نشاطك؟","Jewellery retailer":"متجر مجوهرات","Jewellery wholesaler":"تاجر جملة مجوهرات","Diamantaire / diamond business":"شركة ألماس","Other jewellery operation":"نشاط مجوهرات آخر","Approximately how large is the inventory you need to manage?":"ما الحجم التقريبي للمخزون الذي تريد إدارته؟","Under 5,000 items":"أقل من 5,000 قطعة","5,000–50,000 items":"من 5,000 إلى 50,000 قطعة","More than 50,000 items":"أكثر من 50,000 قطعة","How many locations need to share inventory visibility?":"كم موقعاً يحتاج إلى مشاركة رؤية المخزون؟","One location":"موقع واحد","2–5 locations":"من موقعين إلى 5 مواقع","More than 5 locations":"أكثر من 5 مواقع","What system do you currently use?":"ما النظام الذي تستخدمه حالياً؟","POS / inventory software":"نظام نقاط بيع / برنامج مخزون","Excel / manual records":"Excel / سجلات يدوية","No central inventory system":"لا يوجد نظام مركزي للمخزون","Stock counting takes too long":"الجرد يستغرق وقتاً طويلاً","We waste time finding items":"نهدر وقتاً في البحث عن القطع","Issue / return needs better control":"نحتاج تحكماً أفضل بالتسليم والإرجاع","Dispatch verification is manual":"التحقق من الشحن يتم يدوياً","We need better inventory accuracy":"نحتاج دقة أعلى للمخزون","We need RFID connected to ERP / SAP":"نحتاج ربط RFID مع ERP / SAP","Turn the recommendation into a plan":"حوّل التوصية إلى خطة","Send this requirement to Irys.":"أرسل هذا الاحتياج إلى Irys.","Continue on WhatsApp":"تابع عبر واتساب","CONSULTATIVE RECOMMENDATION":"توصية استشارية","Business":"النشاط","Inventory scale":"حجم المخزون","Locations":"المواقع","Current system":"النظام الحالي","Send requirement":"أرسل الاحتياج","I have enough context to suggest a solution direction. The Irys team can validate the final architecture in a discovery call.":"أصبحت لدي معلومات كافية لاقتراح اتجاه للحل. يمكن لفريق Irys تأكيد البنية النهائية خلال مكالمة استكشافية.","Accelerate stock counting":"تسريع جرد المخزون","Find tagged items faster":"العثور على القطع المعلّمة بسرعة","Control issue & return workflows":"تحسين التحكم بالتسليم والإرجاع","Verify before dispatch":"التحقق قبل الشحن","Connect RFID with enterprise workflows":"ربط RFID بالأنظمة المؤسسية","Build an intelligent inventory management layer":"بناء طبقة ذكية لإدارة المخزون","Improve inventory accuracy":"رفع دقة المخزون","Resource Library":"مكتبة المصادر","Ideas, evidence and technical detail.":"أفكار، نتائج، وتفاصيل تقنية.","Case studies, product data sheets and practical thinking from Irys for jewellery and diamond businesses evaluating RFID.":"دراسات حالة ونشرات بيانات ومحتوى عملي من Irys لشركات المجوهرات والألماس التي تقيّم حلول RFID.","Featured case study":"دراسة حالة مختارة","Diarough — RFID across five global locations.":"Diarough — تطبيق RFID عبر خمسة مواقع عالمية.","A DTC Sightholder deployed Irys RFID across Mumbai, Antwerp, Hong Kong, New York and Bangkok, integrating printers, scanners and RFID tunnels with SAP.":"طبقت شركة DTC Sightholder حلول Irys RFID في مومباي وأنتويرب وهونغ كونغ ونيويورك وبانكوك، مع دمج الطابعات والقارئات وأنفاق RFID مع SAP.","50,000+":"50,000+","SKUs at rollout":"وحدة SKU عند الإطلاق","5 locations":"5 مواقع","8 months":"8 أشهر","implementation":"للتنفيذ","5+ years":"أكثر من 5 سنوات","in operation":"في التشغيل","Read the case study →":"اقرأ دراسة الحالة ←","Case studies":"دراسات الحالة","RFID in real jewellery operations.":"RFID في عمليات مجوهرات حقيقية.","Selected stories from the Irys resource library, spanning retail, wholesale, manufacturing and diamond workflows.":"قصص مختارة من مكتبة Irys تشمل التجزئة والجملة والتصنيع وعمليات الألماس.","KD Gold Group — craftsmanship meets RFID efficiency.":"KD Gold Group — الحرفية تلتقي بكفاءة RFID.","Elevating RFID to the “Rolls Royce” of inventory management.":"رفع RFID إلى مستوى «Rolls Royce» في إدارة المخزون.","Chandigarh jeweller puts trust in Irys RFID.":"صائغ في Chandigarh يضع ثقته في Irys RFID.","DTC Sightholder boosts productivity with Irys RFID.":"DTC Sightholder يرفع الإنتاجية باستخدام Irys RFID.","Singapore retailer transforms stock counting with RFID.":"متجر في سنغافورة يطوّر الجرد باستخدام RFID.","Aurous improves multi-location jewellery tracking.":"Aurous يحسن تتبع المجوهرات عبر مواقع متعددة.","Explore story →":"استكشف القصة ←","Product data sheets":"نشرات بيانات المنتجات","Technical detail, beautifully organised.":"تفاصيل تقنية منظمة بأناقة.","Open the current Irys data sheets for core hardware used in jewellery RFID workflows.":"افتح نشرات بيانات Irys الحالية للأجهزة الأساسية المستخدمة في عمليات RFID للمجوهرات.","DATA SHEET":"نشرة بيانات","Open PDF ↗":"افتح PDF ↖","Insights":"مقالات ورؤى","Thinking beyond stock audit.":"تفكير يتجاوز الجرد التقليدي.","Selected articles from Irys on RFID adoption, sales and technology decisions for jewellery businesses.":"مقالات مختارة من Irys حول تبني RFID والمبيعات والقرارات التقنية لشركات المجوهرات.","ARTICLE":"مقال","Why adopt RFID?":"لماذا تعتمد RFID؟","A practical starting point for understanding where RFID can change jewellery operations.":"مدخل عملي لفهم أين يمكن لـRFID أن يغيّر عمليات المجوهرات.","Use technology to drive sales.":"استخدم التكنولوجيا لدعم المبيعات.","How technology can support a stronger customer-facing jewellery experience.":"كيف يمكن للتكنولوجيا أن تعزز تجربة العميل في قطاع المجوهرات.","Choose the right solution before you scale.":"اختر الحل الصحيح قبل التوسع.","Consider the operating system behind the business before growth makes change harder.":"فكر في النظام التشغيلي للأعمال قبل أن يجعل النمو التغيير أكثر صعوبة.","Read insight →":"اقرأ المقال ←","From insight to action":"من المعرفة إلى التطبيق","Turn a resource into the right RFID decision.":"حوّل المعرفة إلى قرار RFID صحيح.","RFID & IoT intelligence for jewellery and diamond inventory.":"ذكاء RFID وإنترنت الأشياء لمخزون المجوهرات والألماس.","Office 2506, Burlington Tower,":"مكتب 2506، برج Burlington،","Marasi Drive, Business Bay, Dubai":"Marasi Drive، Business Bay، دبي","968/11, Senapati Bapat Rd,":"968/11، Senapati Bapat Rd،","Shivajinagar, Pune 411016":"Shivajinagar، بونه 411016","Suite 13, Level 24,":"جناح 13، الطابق 24،","31 Rochester Drive, Singapore 138637":"31 Rochester Drive، سنغافورة 138637","Unit 19B, 9/F., Block B,":"الوحدة 19B، الطابق 9، المبنى B،","Focal Industrial Centre, Hunghom, Kowloon":"Focal Industrial Centre، Hunghom، Kowloon","1185 6th Ave, 3rd Floor,":"1185 6th Ave، الطابق الثالث،","New York, NY 10036":"نيويورك، NY 10036","© 2026 Irys Group. All rights reserved.":"© 2026 Irys Group. جميع الحقوق محفوظة."});
function irysT(s){return document.documentElement.lang==='ar' && irysAr[s] ? irysAr[s] : s;}
const irysOriginalText = new WeakMap();
function translatableNodes(){
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode(n){
    if(!n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
    if(['SCRIPT','STYLE'].includes(n.parentElement?.tagName)) return NodeFilter.FILTER_REJECT;
    return NodeFilter.FILTER_ACCEPT;
  }}); const out=[]; let n; while(n=walker.nextNode()) out.push(n); return out;
}
function setIrysLanguage(lang){
  const ar=lang==='ar'; document.documentElement.lang=ar?'ar':'en'; document.documentElement.dir=ar?'rtl':'ltr'; document.body.classList.toggle('rtl',ar); localStorage.setItem('irys-lang',lang);
  translatableNodes().forEach(n=>{
    if(!irysOriginalText.has(n)) irysOriginalText.set(n,n.nodeValue);
    const original=irysOriginalText.get(n); const trimmed=original.trim();
    if(ar && irysAr[trimmed]) n.nodeValue=original.replace(trimmed,irysAr[trimmed]); else if(!ar) n.nodeValue=original;
  });
  document.querySelectorAll('input,textarea').forEach(el=>{ if(!el.dataset.enPlaceholder) el.dataset.enPlaceholder=el.placeholder||''; if(ar){ const ph={'Your name':'الاسم','Company name':'اسم الشركة','name@company.com':'البريد الإلكتروني','Country':'الدولة','Name':'الاسم','Company':'الشركة','WhatsApp / phone':'واتساب / الهاتف','Business email':'البريد الإلكتروني للعمل'}[el.dataset.enPlaceholder]; if(ph) el.placeholder=ph; } else el.placeholder=el.dataset.enPlaceholder; });
  const b=document.querySelector('.lang-switch'); if(b)b.textContent=ar?'EN':'عربي';
}
setIrysLanguage(localStorage.getItem('irys-lang')||'en');

// Contact form — prepares a qualified enquiry and hands it to the user's preferred channel.
const contactForm=document.getElementById('contactForm');
if(contactForm){
  contactForm.addEventListener('input',()=>{
    const d=Object.fromEntries(new FormData(contactForm).entries());
    const msg=`Hello Irys,\n\nName: ${d.name||''}\nCompany: ${d.company||''}\nEmail: ${d.email||''}\nPhone: ${d.phone||''}\nCountry: ${d.country||''}\nBusiness type: ${d.type||''}\nChallenge: ${d.challenge||''}\n\n${d.message||''}`;
    const wa=document.getElementById('contactWhatsApp'); if(wa)wa.href='https://wa.me/971565260202?text='+encodeURIComponent(msg);
  });
  contactForm.addEventListener('submit',e=>{
    e.preventDefault(); const d=Object.fromEntries(new FormData(contactForm).entries());
    const subject=`Irys website enquiry — ${d.company||d.name||'New lead'}`;
    const body=`Name: ${d.name}\nCompany: ${d.company}\nEmail: ${d.email}\nPhone: ${d.phone}\nCountry: ${d.country}\nBusiness type: ${d.type}\nChallenge: ${d.challenge}\n\nMessage:\n${d.message||''}`;
    const status=document.getElementById('formStatus'); if(status)status.textContent='Your enquiry is ready. Send it by email or WhatsApp.';
    window.location.href='mailto:info@irysgroup.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  });
}

// Solution Finder — multi-step consultative recommendation engine.
const finderFlow={
 start:{q:'What is the biggest inventory challenge you want to solve?',options:[['inventory','Inventory management is difficult'],['count','Stock counting takes too long'],['search','We waste time finding items'],['verify','Issue / return needs better control'],['dispatch','Dispatch verification is manual'],['accuracy','We need better inventory accuracy'],['erp','We need RFID connected to ERP / SAP']]},
 inventory:{q:'Which part of inventory management creates the most friction?',options:[['visibility','Real-time visibility across stock'],['movement','Tracking movement between locations'],['exceptions','Missing items / inventory exceptions'],['multi','Managing inventory across multiple locations']]},
 type:{q:'What best describes your business?',options:[['retail','Jewellery retailer'],['wholesale','Jewellery wholesaler'],['diamond','Diamantaire / diamond business'],['other','Other jewellery operation']]},
 scale:{q:'Approximately how large is the inventory you need to manage?',options:[['small','Under 5,000 items'],['medium','5,000–50,000 items'],['large','More than 50,000 items']]},
 locations:{q:'How many locations need to share inventory visibility?',options:[['one','One location'],['few','2–5 locations'],['many','More than 5 locations']]},
 system:{q:'What system do you currently use?',options:[['erp','ERP / SAP'],['pos','POS / inventory software'],['excel','Excel / manual records'],['none','No central inventory system']]}
};
const recs={
 count:{title:'Accelerate stock counting',desc:'A jewellery-focused RFID counting workflow can reduce repetitive manual work and give teams faster stock visibility.',products:[['surface.png','Surface'],['sledge.png','Sledge'],['tiara.png','Tiara Nxt']]},
 search:{title:'Find tagged items faster',desc:'A mobile RFID search workflow helps teams locate tagged jewellery or diamond inventory with less manual searching.',products:[['wand.png','Wand'],['rfd40-premium-transparent.png','RFD40 Premium'],['tiara.png','Tiara Nxt']]},
 verify:{title:'Control issue & return workflows',desc:'RFID verification at hand-off points can confirm what leaves, what returns and where exceptions occur.',products:[['surface.png','Surface'],['rwlink.png','RW Link'],['tiara.png','Tiara Nxt']]},
 dispatch:{title:'Verify before dispatch',desc:'A controlled RFID verification point can compare the prepared shipment before goods leave the operation.',products:[['sledge.png','Sledge'],['tunnel-transparent.png','Tunnel'],['tiara.png','Tiara Nxt']]},
 erp:{title:'Connect RFID with enterprise workflows',desc:'Irys can form the RFID layer around an existing ERP / SAP process, with read and verification points mapped to operations.',products:[['rwlink.png','RW Link'],['surface.png','Surface'],['tiara.png','Tiara Nxt']]},
 inventory:{title:'Build an intelligent inventory management layer',desc:'Combine item-level RFID identification, appropriate readers and Tiara Nxt to improve visibility, counting, movement control and exception handling.',products:[['tag-roll.png','RFID Tags'],['surface.png','Surface'],['tiara.png','Tiara Nxt']]},
 accuracy:{title:'Improve inventory accuracy',desc:'Standardise RFID identification and capture stock events consistently so exceptions are easier to identify and investigate.',products:[['tag-roll.png','RFID Tags'],['surface.png','Surface'],['tiara.png','Tiara Nxt']]}
};
const chatLog=document.getElementById('chatLog'), finderResult=document.getElementById('finderResult'), finderOptions=document.getElementById('finderOptions'), finderBack=document.getElementById('finderBack'), finderProgress=document.getElementById('finderProgress');
let finderAnswers={}, finderHistory=[], finderStep='start', selectedIntent='';

// V10 — live AI reasoning for static websites via Puter.js, with an intelligent local fallback.
// No API key is embedded in the website. Puter may request user sign-in/consent for live model usage.
const aiPrompt=document.getElementById('aiPrompt'), aiAnalyze=document.getElementById('aiAnalyze'), aiThinking=document.getElementById('aiThinking'), aiStatus=document.getElementById('aiStatus');
let aiHasAnalysed=false;
function setAiStatus(mode,label){
  if(!aiStatus)return; aiStatus.classList.remove('fallback','live','local'); aiStatus.classList.add(mode);
  const span=aiStatus.querySelector('span'); if(span)span.textContent=irysT(label);
}
function inferIrysIntent(text=''){
  const t=text.toLowerCase();
  const score={count:0,search:0,verify:0,dispatch:0,erp:0,inventory:1,accuracy:0};
  const hit=(k,words,w=2)=>words.forEach(x=>{if(t.includes(x))score[k]+=w});
  hit('count',['stock count','stocktake','stock take','counting','cycle count','جرد','عد المخزون','إحصاء المخزون'],3);
  hit('search',['find item','locate','search','missing item','lost item','العثور','البحث','مفقود'],3);
  hit('verify',['issue','return','handover','verification','تحقق','تسليم','إرجاع'],2);
  hit('dispatch',['dispatch','shipment','packing','shipping','شحن','إرسال','تجهيز الطلب'],3);
  hit('erp',['erp','sap','oracle','dynamics','integration','تكامل','نظام تخطيط'],3);
  hit('accuracy',['accuracy','errors','mismatch','variance','discrepancy','دقة','أخطاء','فروقات'],3);
  hit('inventory',['inventory','stock','visibility','movement','branches','locations','مخزون','رؤية','حركة','فروع'],2);
  return Object.entries(score).sort((a,b)=>b[1]-a[1])[0][0];
}
function inferContext(text=''){
  const t=text.toLowerCase();
  if(/erp|sap|oracle|dynamics|تكامل|نظام تخطيط/.test(t)) finderAnswers.system='erp';
  else if(/excel|spreadsheet|manual|يدوي|اكسل/.test(t)) finderAnswers.system='excel';
  else if(/pos|inventory software|نقاط بيع|برنامج مخزون/.test(t)) finderAnswers.system='pos';
  const itemMatch=t.match(/([\d,]+)\s*(items?|pieces?|skus?|قطعة|قطع)/); if(itemMatch){const n=Number(itemMatch[1].replace(/,/g,''));finderAnswers.scale=n>50000?'large':n>=5000?'medium':'small';}
  const branch=t.match(/(\d+)\s*(stores?|branches?|locations?|فروع|فرع|مواقع?)/); if(branch){const n=Number(branch[1]);finderAnswers.locations=n>5?'many':n>1?'few':'one';}
  if(/retail|store|boutique|متجر|تجزئة/.test(t)) finderAnswers.type='retailer';
  else if(/wholesale|wholesaler|جملة/.test(t)) finderAnswers.type='wholesaler';
  else if(/diamond|diamantaire|ألماس|الماس/.test(t)) finderAnswers.type='diamond';
}
function localExplanation(intent,text){
  const ar=(document.documentElement.lang||'en')==='ar'; const base=recs[intent]||recs.inventory;
  const scale=finderAnswers.scale, loc=finderAnswers.locations, sys=finderAnswers.system;
  if(ar){
    let why=`من وصفك، المشكلة الأساسية الأقرب هي «${irysT(base.title)}». السبب أن كلماتك تشير إلى ${intent==='count'?'وقت الجرد وكثرة العمل اليدوي':intent==='search'?'الحاجة للوصول إلى القطع بسرعة':intent==='erp'?'الحاجة إلى ربط RFID بالنظام الحالي':intent==='dispatch'?'الحاجة إلى التحقق قبل خروج الشحنات':intent==='verify'?'ضبط التسليم والإرجاع':intent==='accuracy'?'تقليل الفروقات ورفع دقة المخزون':'الحاجة إلى رؤية وتحكم أفضل بالمخزون'}.`;
    if(loc==='few'||loc==='many') why+=' وبما أن لديك عدة مواقع، فالرؤية المشتركة وحركة القطع بين الفروع تصبح جزءاً أساسياً من التصميم.';
    if(sys==='erp') why+=' وجود ERP/SAP يعني أن التكامل يجب أن يُخطط له من البداية حتى تنتقل أحداث RFID إلى النظام المؤسسي بشكل منظم.';
    if(scale==='large') why+=' حجم المخزون الكبير يرجّح الحاجة إلى نقاط قراءة ومسارات تشغيل مدروسة بدلاً من حل قارئ واحد.';
    return why+' التوصية هنا مبدئية، ويجب اعتماد توزيع الأجهزة والتكامل النهائي بعد مراجعة سير العمل الفعلي.';
  }
  let why=`From your description, the strongest fit is “${base.title}”. Your wording points to ${intent==='count'?'stocktake time and repetitive manual counting':intent==='search'?'faster item location':intent==='erp'?'RFID integration with the current enterprise system':intent==='dispatch'?'verification before shipments leave':intent==='verify'?'stronger issue-and-return control':intent==='accuracy'?'reducing variances and improving inventory accuracy':'better inventory visibility and movement control'}.`;
  if(loc==='few'||loc==='many') why+=' Because multiple locations are involved, shared visibility and inter-branch movement should be part of the architecture.';
  if(sys==='erp') why+=' ERP/SAP is already in the workflow, so integration should be designed before reader placement is finalised.';
  if(scale==='large') why+=' The larger inventory scale also suggests a mapped workflow with multiple controlled read points rather than a single-reader approach.';
  return why+' This is a solution direction, not a final technical specification; the final hardware and integration design should be validated against the live workflow.';
}
function extractAIText(res){
  if(typeof res==='string')return res;
  if(!res)return '';
  if(typeof res.text==='string')return res.text;
  if(typeof res.content==='string')return res.content;
  if(res.message){
    if(typeof res.message.content==='string')return res.message.content;
    if(Array.isArray(res.message.content))return res.message.content.map(x=>x.text||x.content||'').join('');
  }
  if(Array.isArray(res.content))return res.content.map(x=>x.text||x.content||'').join('');
  return '';
}
function parseAIJson(raw){
  const txt=String(raw||'').replace(/```json|```/gi,'').trim();
  try{return JSON.parse(txt)}catch(e){const m=txt.match(/\{[\s\S]*\}/);if(m)try{return JSON.parse(m[0])}catch(_){} return null}
}
async function liveIrysAnalysis(text){
  if(!(window.puter&&puter.ai&&puter.ai.chat))throw new Error('live AI unavailable');
  const lang=(document.documentElement.lang||'en')==='ar'?'Arabic':'English';
  const prompt=`You are the Irys Group AI Solution Architect for jewellery and diamond RFID inventory. Analyse the user's real operational problem. Do not invent Irys products beyond these names: Surface, Sledge, Wand, RFD40 Premium, RW Link, Tunnel, Tiara Nxt, RFID Tags. Classify into exactly one intent: count, search, verify, dispatch, erp, inventory, accuracy. Explain WHY in ${lang}, in a practical consultative tone. Return JSON only with keys: intent, rationale, explanation, next_question, considerations (array of max 3 short strings). User message: ${JSON.stringify(text)}. Known context: ${JSON.stringify(finderAnswers)}.`;
  const res=await puter.ai.chat(prompt,{model:'gpt-5-nano'});
  const data=parseAIJson(extractAIText(res));
  if(!data||!recs[data.intent])throw new Error('invalid AI response');
  return data;
}
async function liveIrysExplain(question){
  if(!(window.puter&&puter.ai&&puter.ai.chat))throw new Error('live AI unavailable');
  const lang=(document.documentElement.lang||'en')==='ar'?'Arabic':'English';
  const base=recs[selectedIntent]||recs.inventory;
  const prompt=`You are Irys Group's jewellery RFID solution architect. Answer the visitor's follow-up in ${lang}. Be clear, practical and explanatory. Stay within this known Irys solution context and do not invent specifications or performance claims. Current recommendation: ${base.title}. Known answers: ${JSON.stringify(finderAnswers)}. Original problem: ${JSON.stringify(finderAnswers.aiText||'')}. Visitor question: ${JSON.stringify(question)}. Explain how RFID, readers, tags and Tiara Nxt could fit the workflow, and state when Irys engineers should validate details.`;
  const res=await puter.ai.chat(prompt,{model:'gpt-5-nano'});
  const answer=extractAIText(res).trim(); if(!answer)throw new Error('empty AI response'); return answer;
}
async function askIrysAI(text){
  inferContext(text);
  try{
    const data=await liveIrysAnalysis(text); selectedIntent=data.intent; setAiStatus('live','Live AI'); return {...data,live:true};
  }catch(e){
    const intent=inferIrysIntent(text); selectedIntent=intent; setAiStatus('local','Local analysis');
    return {intent,rationale:localExplanation(intent,text),explanation:localExplanation(intent,text),considerations:[],live:false};
  }
}
async function runAiIntake(){
  const text=aiPrompt?.value.trim(); if(!text)return;
  aiThinking?.classList.add('active'); if(aiAnalyze)aiAnalyze.disabled=true;
  const u=document.createElement('div');u.className='user-msg';u.textContent=text;chatLog?.appendChild(u);
  if(aiHasAnalysed && selectedIntent){
    let answer='';
    try{answer=await liveIrysExplain(text);setAiStatus('live','Live AI')}catch(e){answer=localExplanation(selectedIntent,finderAnswers.aiText||text);setAiStatus('local','Local analysis')}
    aiThinking?.classList.remove('active'); if(aiAnalyze)aiAnalyze.disabled=false;
    const b=document.createElement('div');b.className='bot-msg follow';b.textContent=answer;chatLog?.appendChild(b);chatLog?.scrollTo({top:chatLog.scrollHeight,behavior:'smooth'});aiPrompt.value='';return;
  }
  const data=await askIrysAI(text);
  aiThinking?.classList.remove('active'); if(aiAnalyze)aiAnalyze.disabled=false;
  const base=recs[data.intent]||recs.inventory;
  const explanation=data.explanation||data.rationale||localExplanation(data.intent,text);
  const b=document.createElement('div');b.className='bot-msg follow';b.textContent=irysT('I analysed your workflow and built a first solution hypothesis. Ask me why, or refine it with the guided questions below.');chatLog?.appendChild(b);
  finderAnswers.aiText=text; selectedIntent=data.intent; aiHasAnalysed=true; aiPrompt.value=''; aiPrompt.placeholder=irysT('Ask a follow-up, for example: Why do you recommend this? How would it work across branches?'); if(aiAnalyze)aiAnalyze.textContent=irysT('Ask AI');
  if(finderProgress)finderProgress.style.width='38%';
  const considerations=(data.considerations||[]).slice(0,3);
  finderResult.innerHTML=`<div class="result-content"><div class="result-kicker">${irysT(data.live?'LIVE AI ANALYSIS':'IRYS ANALYSIS')}</div><h2>${irysT(base.title)}</h2><div class="result-confidence" style="--confidence:${data.live?'86%':'76%'}"><i></i><span>${irysT(data.live?'AI reasoned match':'Initial match')}</span></div><p>${irysT(base.desc)}</p><div class="ai-rationale">${explanation}</div>${considerations.length?`<div class="finder-summary">${considerations.map(x=>`<span>${x}</span>`).join('')}</div>`:''}<div class="result-products">${base.products.map(([img,n])=>`<div class="result-product"><img src="./assets/products/${img}" alt="${n}"><b>${n}</b></div>`).join('')}</div><div class="ai-followup-hint">${irysT('You can now ask the AI to explain the recommendation in more detail.')}</div></div>`;
  finderQuestion('type'); setIrysLanguage(document.documentElement.lang||'en');
}
aiAnalyze?.addEventListener('click',runAiIntake); aiPrompt?.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter')runAiIntake()});

function finderQuestion(key){
 if(!finderOptions)return; finderStep=key; const f=finderFlow[key]; finderOptions.innerHTML='';
 f.options.forEach(([v,label])=>{const b=document.createElement('button');b.type='button';b.dataset.value=v;b.textContent=irysT(label);b.onclick=()=>finderChoose(v,label);finderOptions.appendChild(b)});
 finderBack.hidden=finderHistory.length===0; if(finderProgress)finderProgress.style.width=Math.min(92,15+finderHistory.length*18)+'%';
}
function finderChoose(value,label){
 finderAnswers[finderStep]=value; finderHistory.push(finderStep); const u=document.createElement('div');u.className='user-msg';u.textContent=irysT(label);chatLog?.appendChild(u);
 if(finderStep==='start') selectedIntent=value;
 let next;
 if(finderStep==='start' && value==='inventory') next='inventory'; else if(finderStep==='start') next='type'; else if(finderStep==='inventory') next='type'; else if(finderStep==='type') next='scale'; else if(finderStep==='scale') next='locations'; else if(finderStep==='locations') next='system'; else return finderRecommend();
 const b=document.createElement('div');b.className='bot-msg follow';b.textContent=irysT(finderFlow[next].q);chatLog?.appendChild(b); finderQuestion(next); chatLog?.scrollTo({top:chatLog.scrollHeight,behavior:'smooth'});
}
function finderRecommend(){
 if(finderProgress)finderProgress.style.width='100%'; finderOptions.innerHTML=''; finderBack.hidden=false;
 const base=recs[selectedIntent]||recs.inventory; const complexity=finderAnswers.scale==='large'||finderAnswers.locations==='many';
 let desc=base.desc; if(complexity) desc+=' Your answers indicate a larger or multi-location deployment, so workflow mapping and integration design should be part of the discovery phase.'; if(finderAnswers.system==='erp') desc+=' Existing ERP / SAP integration should be assessed before hardware placement is finalised.';
 const summary=[['Business',finderAnswers.type],['Inventory scale',finderAnswers.scale],['Locations',finderAnswers.locations],['Current system',finderAnswers.system]].filter(x=>x[1]);
 finderResult.innerHTML=`<div class="result-content"><div class="result-kicker">${irysT('CONSULTATIVE RECOMMENDATION')}</div><h2>${irysT(base.title)}</h2><div class="result-confidence" style="--confidence:88%"><i></i><span>${irysT('Refined match')}</span></div><p>${irysT(desc)}</p><div class="ai-rationale">${irysT('This direction is based on your challenge, business type, inventory scale, number of locations and current system. It is a solution hypothesis, not a final technical specification.')}</div><div class="finder-summary">${summary.map(x=>`<span><b>${irysT(x[0])}:</b> ${x[1]}</span>`).join('')}</div><div class="result-products">${base.products.map(([img,n])=>`<div class="result-product"><img src="./assets/products/${img}" alt="${n}"><b>${n}</b></div>`).join('')}</div><div class="result-cta"><a class="primary" href="#finderLead">${irysT('Send requirement')}</a><a class="secondary" href="contact.html">${irysT('Talk to Irys')}</a></div></div>`;
 const b=document.createElement('div');b.className='bot-msg follow';b.textContent=irysT('I have enough context to suggest a solution direction. The Irys team can validate the final architecture in a discovery call.');chatLog?.appendChild(b);
 setIrysLanguage(document.documentElement.lang||'en');
}
if(finderOptions){finderQuestion('start');}
finderBack?.addEventListener('click',()=>{location.reload()});
const finderLeadForm=document.getElementById('finderLeadForm');
if(finderLeadForm){finderLeadForm.addEventListener('submit',e=>{e.preventDefault();const d=Object.fromEntries(new FormData(finderLeadForm).entries());const rec=recs[selectedIntent]||recs.inventory;const msg=`Hello Irys, I used the Solution Finder.\n\nName: ${d.name}\nCompany: ${d.company}\nPhone: ${d.phone}\nEmail: ${d.email||''}\nPrimary challenge: ${selectedIntent||'Not selected'}\nBusiness: ${finderAnswers.type||''}\nInventory scale: ${finderAnswers.scale||''}\nLocations: ${finderAnswers.locations||''}\nCurrent system: ${finderAnswers.system||''}\nRecommended direction: ${rec.title}\n\nI'd like to discuss the next step.`;window.open('https://wa.me/971565260202?text='+encodeURIComponent(msg),'_blank','noopener');});}
// V5 extended Arabic dictionary: covers recurring UI, footer, reviews and finder copy.
Object.assign(irysAr,{
'Google reviews':'تقييمات Google','Rated by businesses we support.':'تقييمات من شركات نخدمها.','Recent public feedback for Irys Middle East LLC-FZ.':'آراء عامة حديثة حول Irys Middle East LLC-FZ.','Google review · 5 stars':'تقييم Google · 5 نجوم','Google Local Guide · 5 stars':'مرشد محلي على Google · 5 نجوم','Reviews reproduced from the Google review screenshots supplied for this website.':'تقييمات من صور Google المقدمة لهذا الموقع.',
'Build the right RFID path.':'ابنِ مسار RFID المناسب.','A consultative assistant that asks about your operation before recommending an Irys solution direction.':'مساعد استشاري يسألك عن عملياتك قبل اقتراح مسار حل مناسب من Irys.','Adaptive recommendation engine':'محرك توصيات متكيّف','Consultative solution assistant':'مساعد استشاري للحلول','Inventory management is difficult':'إدارة المخزون صعبة','Which part of inventory management creates the most friction?':'أي جزء من إدارة المخزون يسبب أكبر تحدٍ؟','Real-time visibility across stock':'رؤية فورية للمخزون','Tracking movement between locations':'تتبع الحركة بين الفروع','Missing items / inventory exceptions':'القطع المفقودة واستثناءات المخزون','Managing inventory across multiple locations':'إدارة المخزون عبر عدة فروع','What best describes your business?':'ما نوع نشاطك؟','Jewellery retailer':'متجر مجوهرات','Jewellery wholesaler':'تاجر جملة مجوهرات','Diamantaire / diamond business':'شركة ألماس','Other jewellery operation':'نشاط مجوهرات آخر','Approximately how large is the inventory you need to manage?':'ما الحجم التقريبي للمخزون الذي تريد إدارته؟','Under 5,000 items':'أقل من 5,000 قطعة','5,000–50,000 items':'من 5,000 إلى 50,000 قطعة','More than 50,000 items':'أكثر من 50,000 قطعة','How many locations need to share inventory visibility?':'كم فرعاً يحتاج إلى مشاركة رؤية المخزون؟','One location':'فرع واحد','2–5 locations':'من 2 إلى 5 فروع','More than 5 locations':'أكثر من 5 فروع','What system do you currently use?':'ما النظام الذي تستخدمه حالياً؟','ERP / SAP':'ERP / SAP','POS / inventory software':'نظام نقاط بيع / برنامج مخزون','Excel / manual records':'Excel / سجلات يدوية','No central inventory system':'لا يوجد نظام مركزي للمخزون','Previous question':'السؤال السابق','Your recommendation will appear here.':'ستظهر توصيتك هنا.','I’ll ask a few questions first so the direction fits your operation.':'سأطرح عدة أسئلة أولاً حتى يناسب الحل طبيعة عملياتك.','Your answers are carried into the enquiry so the sales team can start with context.':'سيتم إرفاق إجاباتك بالطلب ليبدأ فريق المبيعات بفهم واضح لاحتياجك.','UAE':'الإمارات','INDIA':'الهند','SINGAPORE':'سنغافورة','HONG KONG SAR':'هونغ كونغ','USA':'الولايات المتحدة','Dubai':'دبي','Pune':'بونه','Singapore':'سنغافورة','Hong Kong':'هونغ كونغ','New York':'نيويورك'
});


// V6 creative micro-interactions: premium spotlight, magnetic CTA and section depth.
if(window.matchMedia('(pointer:fine)').matches && !reduceMotion){
  document.querySelectorAll('.resource-story,.datasheet-card,.insight-card,.google-card,.card').forEach(el=>{
    el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect();el.style.setProperty('--sx',`${e.clientX-r.left}px`);el.style.setProperty('--sy',`${e.clientY-r.top}px`)});
  });
  document.querySelectorAll('.btn,.cta-outline,.resource-link,.pill').forEach(el=>{
    el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;el.style.transform=`translate(${x*.07}px,${y*.10}px)`});
    el.addEventListener('mouseleave',()=>el.style.transform='');
  });
}

Object.assign(irysAr,{
'Irys AI Solution Architect':'مساعد Irys الذكي لتصميم الحلول',
'Jewellery RFID intelligence':'ذكاء RFID لقطاع المجوهرات',
'Tell me what is happening in your inventory.':'صف لي ما يحدث في مخزونك.',
'Describe the workflow, bottleneck or result you want. The assistant will interpret it, then ask only the questions that matter.':'اشرح سير العمل أو التحدّي أو النتيجة التي تريد الوصول إليها. سيحلّل المساعد وصفك ثم يطرح فقط الأسئلة الضرورية لبناء توصية أدق.',
'Example: We have 3 jewellery stores and stock counting takes 5 hours. We use an ERP and need live movement visibility between branches.':'مثال: لدينا 3 متاجر مجوهرات ويستغرق الجرد 5 ساعات. نستخدم نظام ERP ونحتاج إلى رؤية لحظية لحركة المخزون بين الفروع.',
'Analyse':'حلّل',
'Analysing your workflow':'جارٍ تحليل سير عملك',
'You can describe your situation above, or start with the guided questions below.':'يمكنك وصف وضعك في الأعلى، أو البدء بالأسئلة الإرشادية أدناه.',
'AI connected':'الذكاء الاصطناعي متصل',
'Smart mode':'الوضع الذكي',
'AI WORKFLOW HYPOTHESIS':'تصوّر أولي ذكي لسير العمل',
'Initial match':'تطابق أولي',
'Refined match':'تطابق مُحسّن',
'I found a likely solution direction. I’ll use your description as context and refine it with a few targeted questions.':'حددت مساراً مرجحاً للحل. سأستخدم وصفك كسياق ثم أدقّق التوصية عبر عدد قليل من الأسئلة المستهدفة.',
'I interpreted the strongest signals in your description and matched them to the most relevant Irys workflow. The final architecture should be validated by the Irys team.':'حلّلت أبرز المؤشرات في وصفك وربطتها بسير العمل الأكثر صلة ضمن حلول Irys. ويجب اعتماد البنية التقنية النهائية بعد مراجعتها مع فريق Irys.',
'Your description points to this workflow as the strongest starting point. The guided questions will refine the recommendation.':'يشير وصفك إلى أن هذا المسار هو نقطة البداية الأقوى، وستساعد الأسئلة الإرشادية التالية على تحسين دقة التوصية.',
'This direction is based on your challenge, business type, inventory scale, number of locations and current system. It is a solution hypothesis, not a final technical specification.':'بُني هذا المسار على التحدّي الذي ذكرتَه، ونوع النشاط، وحجم المخزون، وعدد المواقع، والنظام الحالي. وهو تصوّر مبدئي للحل وليس مواصفة تقنية نهائية.',
'Accelerate stock counting':'تسريع عمليات الجرد',
'Find tagged items faster':'العثور على القطع المعلّمة بسرعة أكبر',
'Control issue & return workflows':'ضبط عمليات التسليم والإرجاع',
'Verify before dispatch':'التحقق قبل الشحن',
'Connect RFID with enterprise workflows':'ربط RFID بسير العمل المؤسسي',
'Build an intelligent inventory management layer':'بناء طبقة ذكية لإدارة المخزون',
'Improve inventory accuracy':'رفع دقة المخزون',
'A jewellery-focused RFID counting workflow can reduce repetitive manual work and give teams faster stock visibility.':'يمكن لسير عمل جرد يعتمد RFID ومصمم لقطاع المجوهرات أن يقلّل العمل اليدوي المتكرر ويمنح الفريق رؤية أسرع للمخزون.',
'A mobile RFID search workflow helps teams locate tagged jewellery or diamond inventory with less manual searching.':'يساعد سير البحث المتنقل عبر RFID الفرق على تحديد مواقع قطع المجوهرات أو الألماس المعلّمة مع تقليل البحث اليدوي.',
'Combine item-level RFID identification, appropriate readers and Tiara Nxt to improve visibility, counting, movement control and exception handling.':'يجمع هذا المسار بين تعريف كل قطعة عبر RFID والقارئات المناسبة ومنصة Tiara Nxt لتحسين الرؤية والجرد وضبط الحركة وإدارة الاستثناءات.'
});


// V10 map + AI bilingual additions
Object.assign(irysAr,{
  'Contact this office':'تواصل مع هذا المكتب','Select another office on the map':'اختر مكتباً آخر من الخريطة',
  'Live AI':'ذكاء اصطناعي مباشر','Local analysis':'تحليل محلي','AI ready':'الذكاء الاصطناعي جاهز','Ask AI':'اسأل الذكاء الاصطناعي',
  'LIVE AI ANALYSIS':'تحليل مباشر بالذكاء الاصطناعي','IRYS ANALYSIS':'تحليل IRYS','AI reasoned match':'تطابق محلّل بالذكاء الاصطناعي',
  'I analysed your workflow and built a first solution hypothesis. Ask me why, or refine it with the guided questions below.':'حللت سير عملك وبنيت تصوراً أولياً للحل. يمكنك أن تسألني لماذا اخترت هذا المسار، أو تحسين التوصية عبر الأسئلة الإرشادية أدناه.',
  'Ask a follow-up, for example: Why do you recommend this? How would it work across branches?':'اسأل سؤالاً إضافياً، مثلاً: لماذا توصي بهذا الحل؟ وكيف يعمل بين عدة فروع؟',
  'You can now ask the AI to explain the recommendation in more detail.':'يمكنك الآن أن تطلب من الذكاء الاصطناعي شرح التوصية بتفصيل أكبر.'
});
