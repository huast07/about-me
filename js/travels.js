(() => {
 const countries = [
 ['Canada',124,-79.38,43.65],['United States',840,-98,39],['Mexico',484,-102,23],['Dominican Republic',214,-70.2,18.8],['Jamaica',388,-77.3,18.1],['France',250,2.4,46.6],['Belgium',56,4.5,50.6],['Netherlands',528,5.3,52.1],['Italy',380,12.5,42.5],['Denmark',208,10,56],['Switzerland',756,8.2,46.8],['Germany',276,10.4,51],['Thailand',764,100.8,15.3],['Malaysia',458,102,4.2],['Singapore',702,103.8,1.35],['Cambodia',116,105,12.6],['Myanmar',104,96,21],['Vietnam',704,107.5,16],['China',156,104,35],['Japan',392,138,37],['Iceland',352,-19,65],['United Kingdom',826,-2.5,54]
 ];
 const home=[-79.38,43.65];
 const root=document.getElementById('travel-app'); if(!root || root.dataset.ready) return; root.dataset.ready='true';
 const svg=d3.select(root.querySelector('svg')), list=root.querySelector('.country-list'), dialog=root.querySelector('dialog'), title=dialog.querySelector('h2'), gallery=dialog.querySelector('.gallery-content');
 const projection=d3.geoOrthographic().scale(235).translate([300,300]).rotate([45,-25]).clipAngle(90);
 const path=d3.geoPath(projection); let geo, selected, rotation=[45,-25];
 const ocean=svg.append('circle').attr('cx',300).attr('cy',300).attr('r',235).attr('class','globe-ocean');
 const grid=svg.append('path').datum(d3.geoGraticule10()).attr('class','globe-grid');
 const land=svg.append('g'); const routes=svg.append('g'); const dots=svg.append('g');
 function draw(){projection.rotate(rotation);grid.attr('d',path);land.selectAll('path').attr('d',path);routes.selectAll('path').attr('d',path);dots.selectAll('circle').attr('cx',d=>projection([d[2],d[3]])[0]).attr('cy',d=>projection([d[2],d[3]])[1]).style('display',d=>d3.geoDistance([d[2],d[3]],[-rotation[0],-rotation[1]]) < Math.PI/2 ? null : 'none');}
 function open(d){selected=d; title.textContent=d[0];gallery.replaceChildren();const photos=(window.TRAVEL_PHOTOS||{})[d[0]]||[];if(!photos.length){const p=document.createElement('p');p.textContent='Photos coming soon.';gallery.append(p)}else photos.forEach(photo=>{const figure=document.createElement('figure'),img=document.createElement('img');img.src=photo.src;img.alt=photo.alt||'';img.loading='lazy';figure.append(img);if(photo.caption){const caption=document.createElement('figcaption');caption.textContent=photo.caption;figure.append(caption)}gallery.append(figure)});dialog.showModal();}
 countries.forEach(d=>{const b=document.createElement('button');b.type='button';b.textContent=d[0];b.addEventListener('click',()=>{rotation=[-d[2],-d[3]];draw();open(d)});list.append(b)});
 dialog.querySelector('.close-gallery').addEventListener('click',()=>dialog.close());
 svg.call(d3.drag().on('start',()=>svg.classed('dragging',true)).on('drag',event=>{rotation=[rotation[0]+event.dx*.35,Math.max(-85,Math.min(85,rotation[1]-event.dy*.35))];draw()}).on('end',()=>svg.classed('dragging',false)));
 fetch(new URL('assets/data/countries-110m.json',document.baseURI)).then(r=>{if(!r.ok) throw Error('Map unavailable');return r.json()}).then(data=>{
 geo=topojson.feature(data,data.objects.countries).features;
 const byId=new Map(countries.map(d=>[d[1],d]));
 land.selectAll('path').data(geo).join('path').attr('class',d=>byId.has(+d.id)?'country visited':'country').on('click',(event,d)=>{const target=byId.get(+d.id);if(target && !event.defaultPrevented)open(target)}).append('title').text(d=>byId.get(+d.id)?.[0]||'');
 routes.selectAll('path').data(countries.filter(d=>d[1]!==124)).join('path').attr('class','flight-route').datum(d=>({type:'LineString',coordinates:[home,[d[2],d[3]]]}));
 dots.selectAll('circle').data(countries).join('circle').attr('r',d=>d[1]===124?4:3).attr('class','destination-dot').on('click',(event,d)=>{if(!event.defaultPrevented)open(d)}).append('title').text(d=>d[0]);draw();
 }).catch(()=>{root.querySelector('.map-status').textContent='The globe could not load. Select a country below to explore.'});
})();
