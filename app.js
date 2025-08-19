/* Telegram Mini App SPA */
(function(){
  const tg = window.Telegram?.WebApp;
  const state = {
    currentTab: 'home',
    projects: [
      {
        id:'food',
        title:'Доставка продуктов на дом',
        cardTitle:'Доставка продуктов',
        tag:'iOS/Android',
        desc:'Современное мобильное приложение для заказа продуктов на дом, с интеграцией платежей, корзиной покупок и системой уведомлений. Разработано на iOS и Android',
        cover:'assets/food-cover.png',
        gallery:['assets/food-1.png','assets/food-2.png','assets/food-3.png']
      },
      {
        id:'pet',
        title:'Приложение приют для животных',
        cardTitle:'Приют для животных',
        tag:'iOS/Android',
        desc:'Здесь желающий спасти животное уже может выбрать будущего питомца. Надо отметить, что поиск реализован в точности, как в приложении для знакомств Tinder. Только вместо человеческих аватарок - фотографии милых зверушек. Разработано на iOS и Android',
        cover:'assets/pets-cover.png',
        gallery:['assets/pets-1.png','assets/pets-2.png']
      },
      {
        id:'asia',
        title:'Приложение доставки азиатской кухни',
        cardTitle:'Азиатский ресторан',
        tag:'iOS/Android',
        desc:'С помощью приложения, вы сможете заказать блюда азиатской кухни: суши, роллы, вок, суп, азиатские пельмени. Только оригинальная рецептура и 100% качество ингредиентов. Квалифицированные повара японской, китайской и вьетнамской кухни. Разработано на iOS и Android',
        cover:'assets/1s-cover.png',
        gallery:['assets/1s.png','assets/2s.png','assets/3s.png','assets/4s.png']
      },
      {
        id:'job',
        title:'Приложение для поиска работы',
        cardTitle:'Поиск работы',
        tag:'iOS/Android',
        desc:'База работодателей и соискателей, с личным кабинетом и системой уведомлений. Разработано на iOS и Android',
        cover:'assets/job-cover.png',
        gallery:['assets/job-1.png','assets/job-2.png','assets/job-3.png']
      }
    ],
    services:[
      {emoji:'📱', title:'Разработка мобильных приложений на iOS и Android'},
      {emoji:'🪪', title:'Разработка Telegram Mini App'},
      {emoji:'🎨', title:'UI/UX дизайн'},
      {emoji:'🔧', title:'Техническая поддержка'},
      {emoji:'📊', title:'Аналитика и оптимизация'},
    ],
    technologies:[
      {emoji:'🦋', name:'Flutter', level:'90%'},
      {emoji:'🍎', name:'Swift', level:'75%'},
      {emoji:'🤖', name:'Kotlin', level:'70%'},
      {emoji:'🔥', name:'Firebase', level:'85%'}
    ]
  };

  // Система аналитики
  const analytics = {
    startTime: Date.now(),
    screenStartTime: Date.now(),
    currentScreen: 'home',
    
    track(eventName, properties = {}) {
      if (tg) {
        const eventData = {
          action: 'analytics',
          event: eventName,
          properties: {
            ...properties,
            timestamp: Date.now(),
            user_id: tg.initDataUnsafe?.user?.id,
            language: tg.initDataUnsafe?.user?.language_code,
            platform: tg.platform,
            version: tg.version,
            session_duration: Date.now() - this.startTime
          }
        };
        
        try {
          tg.sendData(JSON.stringify(eventData));
        } catch (e) {
          console.log('Analytics error:', e);
        }
      }
    },
    
    trackScreenView(screenName) {
      // Отслеживаем время на предыдущем экране
      if (this.currentScreen !== screenName) {
        const timeOnScreen = Date.now() - this.screenStartTime;
        this.track('screen_time', { 
          screen: this.currentScreen, 
          duration: timeOnScreen 
        });
        
        // Обновляем текущий экран и время
        this.currentScreen = screenName;
        this.screenStartTime = Date.now();
      }
      
      this.track('screen_view', { screen: screenName });
    },
    
    trackProjectView(projectId) {
      this.track('project_view', { project_id: projectId });
    },
    
    trackInteraction(action, details = {}) {
      this.track('interaction', { action, ...details });
    },
    
    trackPerformance(metric, value) {
      this.track('performance', { metric, value });
    }
  };

  function initTelegram(){
    if(!tg) return;
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#0d0d0d');
    tg.setBackgroundColor('#0d0d0d');

    // Скрываем MainButton навсегда
    tg.MainButton.hide();
    
    // Добавляем класс для Telegram Web App специфичных стилей
    document.body.classList.add('telegram-webapp');
    
    // Принудительно применяем стили для таббара в Telegram
    if (tg.platform === 'ios' || tg.platform === 'android') {
      setTimeout(() => {
        const tabbar = document.querySelector('.tabbar');
        const tabs = document.querySelectorAll('.tab');
        
        if (tabbar) {
          tabbar.style.overflow = 'hidden';
          tabbar.style.contain = 'layout style paint';
          tabbar.style.isolation = 'isolate';
        }
        
        tabs.forEach(tab => {
          tab.style.overflow = 'hidden';
          tab.style.maxHeight = '40px';
          tab.style.minHeight = '40px';
        });
      }, 100);
    }
  }

  function qs(sel){ return document.querySelector(sel); }
  function qsa(sel){ return Array.from(document.querySelectorAll(sel)); }

  function findProjectById(projectId){
    return state.projects.find(p => p.id === projectId);
  }

  function setActiveTab(tab){
    state.currentTab = tab;
    qsa('.tab').forEach(btn=>{
      btn.classList.toggle('active', btn.dataset.tab===tab);
      btn.setAttribute('aria-selected', String(btn.dataset.tab===tab));
    });
    qsa('.screen').forEach(s=>{
      const visible = s.dataset.screen===tab;
      s.setAttribute('aria-hidden', String(!visible));
    });
    if(tg){
      // На обычных экранах скрываем BackButton
      try{ tg.BackButton.hide(); }catch(e){}
    }
    moveTabIndicator();
    
    // Аналитика: отслеживание просмотра экрана
    analytics.trackScreenView(tab);
  }

  function mountHome(){
    const btn = qs('#screen-home .button.primary');
    btn.addEventListener('click', ()=> { location.hash = '#projects'; });
  }

  function mountAbout(){
    const root = qs('#tech-list');
    root.innerHTML = '';
    state.technologies.forEach(t=>{
      const el = document.createElement('div');
      el.className = 'tech';
      el.innerHTML = `<span>${t.emoji}</span><span class="name">${t.name}</span><span class="level">${t.level}</span>`;
      root.appendChild(el);
    });
  }

  function renderProjectCard(p){
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <div class="project-cover"></div>
      <div class="project-meta">
        <div class="project-title">${p.cardTitle || p.title}</div>
        <div class="project-tag">${p.tag}</div>
      </div>
    `;
    const cover = card.querySelector('.project-cover');
    if(p.cover){ cover.style.backgroundImage = `url('${p.cover}')`; cover.style.backgroundSize='cover'; cover.style.backgroundPosition='center'; }
    card.addEventListener('click', ()=> { 
      // Аналитика: отслеживание клика по проекту
      analytics.trackInteraction('project_click', { project_id: p.id, project_title: p.title });
      location.hash = `#detail/${p.id}`; 
    });
    return card;
  }

  function mountProjects(){
    const root = qs('#projects-list');
    root.innerHTML = '';
    state.projects.forEach(p=> root.appendChild(renderProjectCard(p)));
    observeInView(root.querySelectorAll('.project-card'));
  }

  function mountServices(){
    const root = qs('#services-list');
    root.innerHTML = '';
    state.services.forEach(s=>{
      const el = document.createElement('div');
      el.className = 'service-card';
      el.innerHTML = `<span class="service-emoji">${s.emoji}</span><div class="service-title">${s.title}</div>`;
      root.appendChild(el);
    });
  }

  function mountContacts(){
    qs('#btn-tg').addEventListener('click', ()=>{
      // Аналитика: отслеживание клика по Telegram
      analytics.trackInteraction('contact_click', { type: 'telegram', value: '@ilgar_x' });
      if(tg){ tg.openTelegramLink('https://t.me/ilgar_x'); }
      else { window.open('https://t.me/ilgar_x','_blank'); }
    });
    qs('#btn-email').addEventListener('click', ()=>{
      // Аналитика: отслеживание клика по email
      analytics.trackInteraction('contact_click', { type: 'email', value: 'pmdpro@yandex.ru' });
      window.location.href = 'mailto:pmdpro@yandex.ru';
    });
    qs('#back-to-projects').addEventListener('click',()=>{location.hash='#projects'})
  }

  function openProjectDetail(p){
    // Аналитика: отслеживание просмотра деталей проекта
    analytics.trackProjectView(p.id);
    
    qs('#project-title').textContent = p.title;
    qs('#project-desc').textContent = p.desc;
    const cover = qs('#project-cover');
    if(p.cover){ cover.style.backgroundImage = `url('${p.cover}')`; cover.style.backgroundSize='cover'; cover.style.backgroundPosition='center'; }
    const g = qs('#project-gallery');
    g.innerHTML = '';
    p.gallery.forEach(src=>{
      const shot = document.createElement('div');
      shot.className = 'shot';
      shot.style.backgroundImage = `url('${src}')`;
      shot.style.backgroundSize = 'cover';
      shot.style.backgroundPosition = 'center';
      shot.dataset.src = src;
      shot.addEventListener('click', ()=> openLightbox(p.gallery, p.gallery.indexOf(src)));
      g.appendChild(shot);
    });
    observeInView(g.querySelectorAll('.shot'));
    qsa('.screen').forEach(s=> s.setAttribute('aria-hidden','true'));
    qs('#screen-project-detail').setAttribute('aria-hidden','false');
    if(tg){
      try{ tg.BackButton.show(); }catch(e){}
      try{ tg.BackButton.offClick?.(); }catch(e){}
      tg.BackButton.onClick(()=>{ history.back(); });
    }
  }

  // Lightbox slider
  function openLightbox(images, startIndex){
    // Аналитика: отслеживание открытия галереи
    analytics.trackInteraction('gallery_open', { 
      project_id: state.currentTab === 'project-detail' ? 'current' : 'unknown',
      images_count: images.length,
      start_index: startIndex
    });
    
    const lb = qs('#lightbox');
    const img = qs('#lightbox-image');
    const dots = qs('#lightbox-dots');
    let idx = Math.max(0, Math.min(images.length-1, startIndex||0));
    function render(){
      img.src = images[idx];
      dots.innerHTML = '';
      images.forEach((_,i)=>{
        const d = document.createElement('div');
        d.className = 'dot' + (i===idx?' active':'');
        d.addEventListener('click', ()=>{ idx=i; render(); });
        dots.appendChild(d);
      });
    }
    function next(){ idx = (idx+1)%images.length; render(); }
    function prev(){ idx = (idx-1+images.length)%images.length; render(); }
    qs('.lightbox-next').onclick = next;
    qs('.lightbox-prev').onclick = prev;
    qs('.lightbox-close').onclick = close;
    function onKey(e){ if(e.key==='Escape') close(); if(e.key==='ArrowRight') next(); if(e.key==='ArrowLeft') prev(); }
    function onBackdrop(e){ if(e.target===lb) close(); }
    let sx=0, sy=0, touching=false;
    function touchStart(e){ touching=true; sx=e.touches[0].clientX; sy=e.touches[0].clientY; }
    function touchEnd(e){ if(!touching) return; touching=false; const dx=e.changedTouches[0].clientX-sx; const dy=e.changedTouches[0].clientY-sy; if(Math.abs(dx)>50 && Math.abs(dy)<40){ if(dx<0) next(); else prev(); } }
    function close(){
      lb.setAttribute('aria-hidden','true');
      document.removeEventListener('keydown', onKey);
      lb.removeEventListener('click', onBackdrop);
      lb.removeEventListener('touchstart', touchStart);
      lb.removeEventListener('touchend', touchEnd);
    }
    render();
    lb.setAttribute('aria-hidden','false');
    document.addEventListener('keydown', onKey);
    lb.addEventListener('click', onBackdrop);
    lb.addEventListener('touchstart', touchStart, {passive:true});
    lb.addEventListener('touchend', touchEnd);
  }

  function bindTabs(){
    qsa('.tab').forEach(btn=> btn.addEventListener('click', ()=> { location.hash = `#${btn.dataset.tab}`; }));
  }

  function moveTabIndicator(){
    const indicator = qs('.tab-indicator');
    const tabs = qsa('.tab');
    const idx = tabs.findIndex(t => t.dataset.tab === state.currentTab);
    if(!indicator || idx < 0) return;
    
    const tabEl = tabs[idx];
    const tb = tabEl.getBoundingClientRect();
    const pb = tabEl.parentElement.getBoundingClientRect();
    
    // Центрируем индикатор относительно активного таба
    const center = tb.left + tb.width/2 - pb.left;
    const indicatorWidth = window.innerWidth <= 380 ? 32 : window.innerWidth <= 320 ? 28 : 36;
    
    indicator.style.left = `${Math.max(16, center - indicatorWidth/2)}px`;
    indicator.style.width = `${indicatorWidth}px`;
  }

  function bindSwipes(){
    const area = qs('#screens');
    let startX = 0, startY = 0, isTouch=false;
    const order = ['home','about','projects','services','contacts'];
    function currentIndex(){ return Math.max(0, order.indexOf(state.currentTab)); }
    function goToIndex(i){ const clamped = Math.max(0, Math.min(order.length-1, i)); location.hash = `#${order[clamped]}`; }
    area.addEventListener('touchstart', (e)=>{ isTouch=true; const t=e.touches[0]; startX=t.clientX; startY=t.clientY; }, {passive:true});
    area.addEventListener('touchend', (e)=>{
      if(!isTouch) return; isTouch=false;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX; const dy = t.clientY - startY;
      if(Math.abs(dx) > 50 && Math.abs(dy) < 40){
        const idx = currentIndex();
        if(dx < 0) goToIndex(idx+1); else goToIndex(idx-1);
      }
    });
  }

  function observeInView(nodes){
    if(!('IntersectionObserver' in window)){
      nodes.forEach?.(n=> n.classList.add('in-view'));
      return;
    }
    const observer = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },{ root:null, rootMargin:'0px 0px -10% 0px', threshold:0.1 });
    nodes.forEach?.(n=> observer.observe(n));
  }

  function navigateFromHash(){
    const hash = (location.hash || '').replace(/^#/, '');
    if(!hash){
      setActiveTab('home');
      return;
    }
    const [route, param] = hash.split('/');
    switch(route){
      case 'home':
      case 'about':
      case 'projects':
      case 'services':
      case 'contacts':
        setActiveTab(route);
        break;
      case 'detail': {
        const project = findProjectById(param);
        if(project){
          openProjectDetail(project);
        } else {
          location.hash = '#projects';
        }
        break;
      }
      default:
        location.hash = '#home';
    }
  }

  function start(){
    const startTime = performance.now();
    
    initTelegram();
    bindTabs();
    bindSwipes();
    mountHome();
    mountAbout();
    mountProjects();
    mountServices();
    mountContacts();
    window.addEventListener('hashchange', navigateFromHash);
    if(!location.hash){
      location.hash = '#home';
    } else {
      navigateFromHash();
    }
    window.setTimeout(moveTabIndicator, 0);
    
    // Аналитика: отслеживание времени инициализации
    const initTime = performance.now() - startTime;
    analytics.trackPerformance('app_init_time', initTime);
    
    // Аналитика: отслеживание первого экрана
    analytics.trackScreenView('home');
  }
  
  // Обработка ошибок для аналитики
  window.addEventListener('error', (e) => {
    analytics.track('error', { 
      message: e.message, 
      filename: e.filename, 
      lineno: e.lineno,
      colno: e.colno
    });
  });
  
  window.addEventListener('unhandledrejection', (e) => {
    analytics.track('error', { 
      type: 'unhandled_promise_rejection',
      reason: e.reason?.toString() || 'Unknown error'
    });
  });

  document.addEventListener('DOMContentLoaded', start);
})();


