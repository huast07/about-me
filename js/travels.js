(() => {
 const countries = [
 ['Canada',124,-79.38,43.65],['United States',840,-98,39],['Mexico',484,-102,23],['Dominican Republic',214,-70.2,18.8],['Bahamas',44,-77.4,25.0],['France',250,2.4,46.6],['Belgium',56,4.5,50.6],['Netherlands',528,5.3,52.1],['Italy',380,12.5,42.5],['Denmark',208,10,56],['Switzerland',756,8.2,46.8],['Germany',276,10.4,51],['Thailand',764,100.8,15.3],['Malaysia',458,102,4.2],['Singapore',702,103.8,1.35],['Cambodia',116,105,12.6],['Laos',418,102.6,19.5],['Myanmar',104,96,21],['Vietnam',704,107.5,16],['China',156,104,35],['Japan',392,138,37],['Iceland',352,-19,65],['United Kingdom',826,-2.5,54]
 ];
 const home=[-79.38,43.65];
 const root=document.getElementById('travel-app'); if(!root || root.dataset.ready) return; root.dataset.ready='true';
 const journal=root.querySelector('.journal-entry');
 if(journal){
   const walker=document.createTreeWalker(journal,NodeFilter.SHOW_TEXT),nodes=[];
   while(walker.nextNode()) nodes.push(walker.currentNode);
   nodes.forEach(node=>{
     const fragment=document.createDocumentFragment();
     node.textContent.split(/(\s+)/).forEach(word=>{
       if(!word.trim()) fragment.append(document.createTextNode(word));
       else { const span=document.createElement('span');span.className='journal-word';span.textContent=word;fragment.append(span); }
     });node.replaceWith(fragment);
   });
   const paragraphs=[...journal.querySelectorAll('p')].map(p=>({p,words:[...p.querySelectorAll('.journal-word')]}));
   let queued=false;
   const motion=matchMedia('(prefers-reduced-motion: reduce)');
   function writeJournal(){
     queued=false;if(!journal.isConnected)return;
     paragraphs.forEach(({p,words})=>{
       const box=p.getBoundingClientRect();
       const progress=motion.matches?1:Math.max(0,Math.min(1,(innerHeight*.92-box.top)/(box.height+innerHeight*.02)));
       // Reveal whole glyphs without clipping ascenders or italic overhangs.
       words.forEach((word,i)=>{const ink=Math.max(0,Math.min(1,progress*words.length-i));word.style.opacity=ink;});
     });
   }
   function scheduleJournal(){if(!queued){queued=true;requestAnimationFrame(writeJournal);}}
   addEventListener('scroll',scheduleJournal,{passive:true});addEventListener('resize',scheduleJournal);
   addEventListener('portfolio:pagechange',scheduleJournal);motion.addEventListener('change',scheduleJournal);
   document.fonts?.ready.then(scheduleJournal);scheduleJournal();
 }
 const svg=d3.select(root.querySelector('svg')), list=root.querySelector('.country-list'), dialog=root.querySelector('dialog'), title=dialog.querySelector('h2'), gallery=dialog.querySelector('.gallery-content');
 const projection=d3.geoOrthographic().scale(235).translate([300,300]).rotate([45,-25]).clipAngle(90);
 const path=d3.geoPath(projection); let geo, selected, rotation=[45,-25];
 const ocean=svg.append('circle').attr('cx',300).attr('cy',300).attr('r',235).attr('class','globe-ocean');
 const grid=svg.append('path').datum(d3.geoGraticule10()).attr('class','globe-grid');
 const land=svg.append('g'); const routes=svg.append('g'); const dots=svg.append('g');
 function draw(){projection.rotate(rotation);grid.attr('d',path);land.selectAll('path').attr('d',path);routes.selectAll('path').attr('d',path);dots.selectAll('circle').attr('cx',d=>projection([d[2],d[3]])[0]).attr('cy',d=>projection([d[2],d[3]])[1]).style('display',d=>d3.geoDistance([d[2],d[3]],[-rotation[0],-rotation[1]]) < Math.PI/2 ? null : 'none');}
 function startCarousel(photos,gallery){
   if(!photos.length)return;
   gallery.classList.add('travel-carousel');
   gallery.setAttribute('role','region');
   gallery.setAttribute('aria-roledescription','carousel');
   gallery.setAttribute('aria-label','Travel moments');
   const viewport=document.createElement('div');viewport.className='travel-carousel-window';
   viewport.tabIndex=0;
   viewport.setAttribute('role','group');
   viewport.setAttribute('aria-label','Photo strip. Use left and right arrow keys to browse.');
   const track=document.createElement('div');track.className='travel-carousel-track';viewport.append(track);
   const controls=document.createElement('div');controls.className='travel-carousel-controls';
   controls.innerHTML='<button type="button" aria-label="Previous photo">←</button><span></span><button type="button" aria-label="Next photo">→</button><button type="button" class="carousel-playback"></button><button type="button" class="carousel-expand" aria-haspopup="dialog" aria-controls="travel-gallery">Expand gallery</button>';
   gallery.append(viewport,controls);
   const [previous,next,toggle,expand]=controls.querySelectorAll('button'),counter=controls.querySelector('span');
   const motion=matchMedia('(prefers-reduced-motion: reduce)');
   let index=0,playing=!motion.matches,hovered=false,timer,startX=null,animation=null;
   const wrap=value=>(value+photos.length)%photos.length;
   function makeSlide(position){
     const photoIndex=wrap(position),photo=photos[photoIndex];
     const slide=document.createElement('figure'),img=document.createElement('img');
     slide.className='travel-carousel-slide';
     slide.setAttribute('role','group');slide.setAttribute('aria-roledescription','slide');
     slide.setAttribute('aria-label',`Photo ${photoIndex+1} of ${photos.length}`);
     img.src=photo.src;img.alt=photo.alt;img.width=photo.width;img.height=photo.height;
     img.decoding='async';img.draggable=false;slide.append(img);return slide;
   }
   // Keep a photo on either side of the visible row so the loop never jumps back.
   for(let offset=-1;offset<=4;offset++)track.append(makeSlide(index+offset));
   function update(){
     counter.textContent=`${index+1} / ${photos.length}`;
     const visible=innerWidth<=600?2:3;
     [...track.children].forEach((slide,i)=>slide.setAttribute('aria-hidden',i<1||i>visible?'true':'false'));
   }
   function show(direction){
     if(animation)return;
     function finish(){
       index=wrap(index+direction);
       if(direction>0){track.firstElementChild.remove();track.append(makeSlide(index+4));}
       else {track.lastElementChild.remove();track.prepend(makeSlide(index-1));}
       animation?.cancel();animation=null;update();
     }
     if(motion.matches){finish();return;}
     const step=track.children[1].getBoundingClientRect().left-track.children[0].getBoundingClientRect().left;
     animation=track.animate([
       {transform:`translateX(${-step}px)`},
       {transform:`translateX(${-(1+direction)*step}px)`}
     ],{duration:650,easing:'cubic-bezier(.25,.1,.25,1)',fill:'forwards'});
     animation.onfinish=finish;
   }
   new ResizeObserver(()=>{if(animation)animation.finish();update();}).observe(viewport);
   function restart(){
     clearInterval(timer);toggle.textContent=playing?'Pause slideshow':'Play slideshow';
     viewport.setAttribute('aria-live',playing?'off':'polite');
     if(playing)timer=setInterval(()=>{
       const bounds=gallery.getBoundingClientRect();
       if(gallery.isConnected&&bounds.bottom>0&&bounds.top<innerHeight&&!dialog.open&&!document.hidden&&!hovered&&!gallery.contains(document.activeElement))show(1);
     },2000);
   }
   previous.addEventListener('click',()=>{show(-1);restart();});
   next.addEventListener('click',()=>{show(1);restart();});
   toggle.addEventListener('click',()=>{playing=!playing;restart();});
   expand.addEventListener('click',()=>{
     if(animation)animation.finish();
     openGallery('Travel moments',photos,false);
   });
   gallery.addEventListener('keydown',event=>{
     if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
       event.preventDefault();show(event.key==='ArrowLeft'?-1:1);restart();
     }
   });
   viewport.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')hovered=true;});
   viewport.addEventListener('pointerleave',()=>{hovered=false;});
   viewport.addEventListener('pointerdown',event=>{
     if(!event.isPrimary||event.button!==0)return;
     startX=event.clientX;viewport.setPointerCapture(event.pointerId);
   });
   viewport.addEventListener('pointerup',event=>{
     if(startX!==null&&Math.abs(event.clientX-startX)>40){show(event.clientX<startX?1:-1);restart();}
     startX=null;
   });
   viewport.addEventListener('pointercancel',()=>{startX=null;});
   viewport.addEventListener('dragstart',event=>event.preventDefault());
   function reduceMotion(){if(motion.matches){playing=false;restart();}}
   motion.addEventListener('change',reduceMotion);update();restart();
 }
 function open(d){
   selected=d;
   openGallery(d[0],(window.TRAVEL_PHOTOS||{})[d[0]]||[]);
 }
 function openGallery(name,photos,linkPhotos=true){
   title.textContent=name;gallery.replaceChildren();
   gallery.classList.toggle('has-photos',photos.length>0);
   if(!photos.length){const p=document.createElement('p');p.textContent='Photos coming soon.';gallery.append(p);}
   else photos.forEach(photo=>{
     const figure=document.createElement('figure'),img=document.createElement('img');
     img.src=photo.src;img.alt=photo.alt||'';img.loading='lazy';img.decoding='async';
     img.width=photo.width||1400;img.height=photo.height||1050;
     if(linkPhotos){
       const link=document.createElement('a');
       link.href=photo.src;link.target='_blank';link.rel='noopener';link.setAttribute('aria-label',`View full photo: ${photo.alt}`);
       link.append(img);figure.append(link);
     }else figure.append(img);
     gallery.append(figure);
   });
   dialog.showModal();dialog.scrollTop=0;
 }
 countries.forEach(d=>{const b=document.createElement('button');b.type='button';b.textContent=d[0];b.addEventListener('click',()=>{rotation=[-d[2],-d[3]];draw();open(d)});list.append(b)});
 startCarousel(Object.values(window.TRAVEL_PHOTOS||{}).flat(),root.querySelector('.travel-slideshow'));
 dialog.querySelector('.close-gallery').addEventListener('click',()=>dialog.close());
 addEventListener('portfolio:pagechange',()=>{if(!dialog.isConnected&&dialog.open)dialog.close();});
 svg.call(d3.drag().on('start',()=>svg.classed('dragging',true)).on('drag',event=>{rotation=[rotation[0]+event.dx*.35,Math.max(-85,Math.min(85,rotation[1]-event.dy*.35))];draw()}).on('end',()=>svg.classed('dragging',false)));
 fetch(new URL('assets/data/countries-110m.json',document.baseURI)).then(r=>{if(!r.ok) throw Error('Map unavailable');return r.json()}).then(data=>{
 geo=topojson.feature(data,data.objects.countries).features;
 const byId=new Map(countries.map(d=>[d[1],d]));
 land.selectAll('path').data(geo).join('path').attr('class',d=>byId.has(+d.id)?'country visited':'country').on('click',(event,d)=>{const target=byId.get(+d.id);if(target && !event.defaultPrevented)open(target)}).append('title').text(d=>byId.get(+d.id)?.[0]||'');
 routes.selectAll('path').data(countries.filter(d=>d[1]!==124)).join('path').attr('class','flight-route').datum(d=>({type:'LineString',coordinates:[home,[d[2],d[3]]]}));
 dots.selectAll('circle').data(countries).join('circle').attr('r',d=>d[1]===124?4:3).attr('class','destination-dot').on('click',(event,d)=>{if(!event.defaultPrevented)open(d)}).append('title').text(d=>d[0]);draw();
 }).catch(()=>{root.querySelector('.map-status').textContent='The globe could not load. Select a country below to explore.'});
})();
