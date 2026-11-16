(function(){
  const { name, subtitle, posters } = window.SITE;
  const book = document.getElementById('book');
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  const counter = document.getElementById('counter');
  const lightbox = document.getElementById('lightbox');
  const lbImg = lightbox.querySelector('img');

  // Build the list of page sides: cover, posters..., (blank), back cover
  const sides = [{type:'cover'}].concat(posters.map((src,i)=>({type:'poster',src,n:i+1})));
  if ((sides.length + 1) % 2 === 1) sides.push({type:'blank'}); // keep total even once the back cover is added
  sides.push({type:'back'});

  function faceEl(side, cls){
    const d = document.createElement('div');
    d.className = 'face ' + cls;
    if (side.type === 'cover'){
      d.classList.add('cover');
      d.innerHTML = `<div class="bar"></div><div><div class="name">${name.split(' ').join('<br>')}</div></div><div class="sub">${subtitle}</div>`;
    } else if (side.type === 'back'){
      d.classList.add('cover','back-cover');
      d.innerHTML = `<div class="sub">${name}</div>`;
    } else if (side.type === 'blank'){
      d.classList.add('blank');
    } else {
      d.classList.add('poster');
      const img = document.createElement('img');
      img.src = side.src; img.alt = `Poster ${side.n}`; img.draggable = false;
      d.appendChild(img);
      d.dataset.src = side.src;
    }
    return d;
  }

  const leafCount = sides.length / 2;
  const leaves = [];
  for (let k = 0; k < leafCount; k++){
    const leaf = document.createElement('div');
    leaf.className = 'leaf';
    leaf.appendChild(faceEl(sides[2*k], 'front'));
    leaf.appendChild(faceEl(sides[2*k+1], 'back'));
    leaf.addEventListener('click', e => onLeafClick(e, k));
    book.appendChild(leaf);
    leaves.push(leaf);
  }

  let state = 0; // number of flipped leaves
  function settleZ(){
    leaves.forEach((l,i)=>{ l.style.zIndex = i < state ? i : leafCount - i; });
  }
  function render(animatedIndex){
    leaves.forEach((l,i)=> l.classList.toggle('flipped', i < state));
    if (animatedIndex != null){
      leaves[animatedIndex].style.zIndex = 999;
      setTimeout(settleZ, 900);
    } else settleZ();
    book.classList.toggle('at-start', state === 0);
    book.classList.toggle('at-end', state === leafCount);
    prev.disabled = state === 0;
    next.disabled = state === leafCount;
    // counter
    if (state === 0) counter.textContent = 'Cover';
    else if (state === leafCount) counter.textContent = 'Back cover';
    else {
      const l = 2*state - 1, r = 2*state;     // side indexes visible
      const pn = i => sides[i] && sides[i].type === 'poster' ? sides[i].n : null;
      const a = pn(l), b = pn(r);
      counter.textContent = (a && b) ? `Posters ${a}–${b}` : `Poster ${a || b}`;
    }
  }
  function flipNext(){ if (state < leafCount){ state++; render(state-1); } }
  function flipPrev(){ if (state > 0){ state--; render(state); } }

  function onLeafClick(e, k){
    const face = e.target.closest('.face');
    // tap on a poster that is already visible in a spread: zoom it
    const isFlipped = k < state;
    const visibleTop = isFlipped ? k === state-1 : k === state;
    if (!visibleTop) return;
    const spreadOpen = state > 0 && state < leafCount;
    const edge = isFlipped ? 'prev' : 'next';
    const rect = leaves[k].getBoundingClientRect();
    const posterHit = e.target.tagName === 'IMG';
    // clicking the middle of a poster zooms; clicking near the outer edge or covers flips
    const x = (e.clientX - rect.left) / rect.width;
    const nearEdge = isFlipped ? (x > .25) : (x < .75);
    if (posterHit && spreadOpen && !nearEdge){ lbImg.src = e.target.src; lightbox.hidden = false; return; }
    edge === 'next' ? flipNext() : flipPrev();
  }
  prev.onclick = flipPrev; next.onclick = flipNext;
  lightbox.onclick = () => { lightbox.hidden = true; };
  document.addEventListener('keydown', e => {
    if (!lightbox.hidden){ if (e.key === 'Escape') lightbox.hidden = true; return; }
    if (e.key === 'ArrowRight') flipNext();
    if (e.key === 'ArrowLeft') flipPrev();
  });
  // swipe
  let sx = null;
  document.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, {passive:true});
  document.addEventListener('touchend', e => {
    if (sx == null) return;
    const dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 50) dx < 0 ? flipNext() : flipPrev();
  });
  render();
})();
