(() => {
  const DATA = window.FIKIRLER || [];
  const REPO = "https://github.com/lhr-present/selenophile-art";
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const lower = s => s.toLocaleLowerCase("tr");

  /* Yıldızlar */
  const cv = $("#stars"), ctx = cv.getContext("2d");
  let stars = [];
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function resize(){
    const d = devicePixelRatio || 1;
    cv.width = innerWidth * d; cv.height = innerHeight * d; ctx.setTransform(d,0,0,d,0,0);
    stars = Array.from({length: Math.round(innerWidth*innerHeight/5000)}, () => ({
      x: Math.random()*innerWidth, y: Math.random()*innerHeight, r: Math.random()*1.1+.2,
      p: Math.random()*Math.PI*2, s: Math.random()*.02+.004 }));
  }
  function draw(){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    for (const st of stars){
      st.p += st.s;
      ctx.globalAlpha = .25 + .55*(.5+.5*Math.sin(st.p));
      ctx.fillStyle = "#efe6d2"; ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, 7); ctx.fill();
    }
    if (!still) requestAnimationFrame(draw);
  }
  addEventListener("resize", resize); resize(); draw();

  /* Gerçek ay evresi */
  const SYN = 29.530588853, ref = Date.UTC(2000,0,6,18,14);
  const phaseOf = t => (((t - ref)/864e5 % SYN) + SYN) % SYN / SYN;
  const p = phaseOf(Date.now());
  const names = ["Yeni Ay","Hilal","İlk Dördün","Şişkin Ay","Dolunay","Şişkin Ay","Son Dördün","Hilal"];
  $("#phase-name").textContent = names[Math.round(p*8)%8];
  const shadow = $(".moon .shadow");
  const lit = (1 - Math.cos(2*Math.PI*p))/2;
  shadow.setAttribute("cx", p < .5 ? 200 - lit*344 : 200 + lit*344);

  function phaseIcon(i, n){
    const q = (i+.5)/n, f = (1-Math.cos(2*Math.PI*q))/2, off = q < .5 ? -f*20 : f*20;
    return `<svg class="phase" viewBox="0 0 20 20" aria-hidden="true"><defs><clipPath id="pc${i}"><circle cx="10" cy="10" r="8"/></clipPath></defs>
      <circle cx="10" cy="10" r="8" fill="#efe6d2"/><circle clip-path="url(#pc${i})" cx="${10+off}" cy="10" r="8.4" fill="#0c0b10" opacity=".88"/>
      <circle cx="10" cy="10" r="8" fill="none" stroke="#efe6d2" stroke-opacity=".35"/></svg>`;
  }

  /* Kategoriler */
  const counts = DATA.reduce((m,d) => (m[d.cat]=(m[d.cat]||0)+1, m), {});
  const cats = Object.keys(counts).sort((a,b) => counts[b]-counts[a] || a.localeCompare(b,"tr"));
  $("#stat-total").textContent = DATA.length;
  $("#stat-cats").textContent = cats.length;
  $("#yr").textContent = new Date().getFullYear();

  let active = "Tümü", query = "";
  const filters = $("#filters");
  filters.innerHTML = [["Tümü", DATA.length], ...cats.map(c => [c, counts[c]])]
    .map(([c,n]) => `<button class="chip" role="tab" data-cat="${esc(c)}" aria-selected="${c===active}">${esc(c)}<b>${n}</b></button>`).join("");
  filters.addEventListener("click", e => {
    const b = e.target.closest(".chip"); if (!b) return;
    active = b.dataset.cat;
    filters.querySelectorAll(".chip").forEach(x => x.setAttribute("aria-selected", x === b));
    render();
  });
  $("#q").addEventListener("input", e => { query = lower(e.target.value.trim()); render(); });

  const typeLabel = {makale:"Makale", thread:"Thread", tweet:"Tweet", "konuşma":"Konuşma"};
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target);} }), {rootMargin:"0px 0px -40px"});

  function render(){
    const list = DATA.filter(d => (active === "Tümü" || d.cat === active) &&
      (!query || lower([d.title,d.summary,d.author,d.handle,d.cat].join(" ")).includes(query)));
    $("#grid").innerHTML = list.map(d => {
      const i = DATA.indexOf(d);
      return `<article class="card" id="${esc(d.id)}">
        <div class="card-top"><span class="no">No. ${String(i+1).padStart(2,"0")}</span><span>${esc(typeLabel[d.type]||d.type)}</span>${phaseIcon(i, DATA.length)}</div>
        <h3>${esc(d.title)}</h3>
        <p>${esc(d.summary)}</p>
        <div class="card-meta"><div class="author"><b>${esc(d.author)}</b>${d.handle?`<small>${esc(d.handle)}</small>`:""}</div><span class="tag">${esc(d.cat)}</span></div>
        <div class="actions">
          <a class="btn primary" href="${esc(d.url)}" target="_blank" rel="noopener">Kaynağa git ↗</a>
          <button class="btn ghost" data-copy="${esc(d.id)}">Kopyala</button>
        </div></article>`;
    }).join("");
    $("#empty").hidden = list.length > 0;
    document.querySelectorAll(".card").forEach(c => io.observe(c));
  }
  render();

  const toast = msg => { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 1800); };
  $("#grid").addEventListener("click", async e => {
    const b = e.target.closest("[data-copy]"); if (!b) return;
    const link = `${location.origin}${location.pathname}#${b.dataset.copy}`;
    try { await navigator.clipboard.writeText(link); toast("Bağlantı kopyalandı!"); }
    catch { prompt("Bağlantıyı kopyalayın:", link); }
  });

  /* Paylaşılan bağlantıyı vurgula */
  function focusHash(){
    const id = decodeURIComponent(location.hash.slice(1));
    const el = id && DATA.some(d => d.id === id) && document.getElementById(id);
    if (!el) return;
    el.classList.add("in","flash"); el.scrollIntoView({behavior:"smooth", block:"center"});
    setTimeout(() => el.classList.remove("flash"), 2600);
  }
  addEventListener("hashchange", focusHash); setTimeout(focusHash, 200);

  /* Fikir gönder: GitHub issue taslağı açar */
  $("#submit-form").addEventListener("submit", e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const body = `Bağlantı: ${f.get("url")}\n\nNeden değerli: ${f.get("why") || "-"}`;
    window.open(`${REPO}/issues/new?labels=oneri&title=${encodeURIComponent("Fikir önerisi: " + f.get("url"))}&body=${encodeURIComponent(body)}`, "_blank", "noopener");
    e.target.reset(); toast("Teşekkürler! Öneri sayfası açıldı.");
  });
})();
