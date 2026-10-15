(() => {
  const PAGE = document.body.dataset.page || "fikirler";
  const REPO = "https://github.com/lhr-present/selenophile-art";
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  // Aramada I/ı ve şapka/aksan farkı gözetilmez: "Intelligence", "yapay zeka", "sirket" de bulunur
  const lower = s => String(s ?? "").toLocaleLowerCase("tr").replace(/ı/g, "i").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const dark = () => matchMedia("(prefers-color-scheme: dark)").matches;
  const hashId = () => { try { return decodeURIComponent(location.hash.slice(1)); } catch { return ""; } };  // bozuk %-kodlu adres hata vermesin

  // Bu gecenin ay evresi
  const SYN = 29.530588853, ref = Date.UTC(2000,0,6,18,14);
  const p = ((((Date.now() - ref) / 864e5) % SYN) + SYN) % SYN / SYN;
  const phase = ["yeni ay","hilal","ilk dördün","şişkin ay","dolunay","şişkin ay","son dördün","hilal"][Math.round(p * 8) % 8];
  document.querySelectorAll(".phase-name").forEach(e => e.textContent = phase);
  document.querySelectorAll(".yr").forEach(e => e.textContent = new Date().getFullYear());

  // Başlıktaki ara çizgi satır başına düşmesin: "Consistent –" birlikte kalır
  const ttl = t => esc(t).replace(/ ([–—-]) /g, "\u00a0$1 ");
  const langAttr = t => /^[\x00-\x7F’‘“”–—…]*$/.test(t) && /[a-z]/i.test(t) ? ' lang="en"' : "";  // İngilizce başlıklar doğru okunsun
  const typeLabel = { makale: "yazı", thread: "thread", tweet: "tweet", "konuşma": "konuşma" };
  const links = (url, id, name, extra = "") =>
    `<span class="links"><a href="${esc(url)}" target="_blank" rel="noopener" aria-label="${esc((PAGE === "tweetler" ? "X'te aç: " : "Kaynak: ") + name)} (yeni sekme)">${PAGE === "tweetler" ? "X'te aç" : "Kaynak"}</a>${extra}<button type="button" data-copy="${esc(id)}" aria-label="${esc("Bağlantı kopyala: " + name)}">Bağlantı</button></span>`;

  // Gömme için önceden yer ayrılır (X kartı gelince sayfa kaymasın). Tahmin, 390 ve 1440px'te
  // ölçülen kart yüksekliklerinden: yazı uzunluğuna göre; görselli kartlar CSS'te genişliğe göre.
  // Ölçülmüş yükseklik varsa (hm: 390px telefon, hd: masaüstü) onu kullan; yoksa tahmine düş.
  const narrow = matchMedia("(max-width: 980px)").matches;
  const embedStyle = d => {
    const h = narrow ? d.hm : d.hd;
    if (h) return ` class="embed" style="min-height:${h}px"`;
    return /pic\.(twitter|x)\.com/.test(d.text) ? ' class="embed media"'
      : ` class="embed" style="min-height:${Math.min(700, Math.round(190 + 0.6 * d.text.replace(/<[^>]+>/g, "").length + 11 * (d.text.split("<br>").length - 1)))}px"`;
  };

  const PAGES = {
    fikirler: {
      data: window.FIKIRLER || [],
      fields: d => [d.title, d.summary, d.author, d.handle, d.cat],
      row: (d, n) => `<li class="row" id="${esc(d.id)}">
        <span class="num">${n}</span>
        <div><h3${langAttr(d.title)}><a href="${esc(d.url)}" target="_blank" rel="noopener">${ttl(d.title)}</a></h3><p>${esc(d.summary)}</p></div>
        <div class="side"><span class="who">${esc(d.author)}</span><span class="what">${esc(d.cat)}, ${esc(typeLabel[d.type] || d.type)}</span>${links(d.url, d.id, d.title)}</div></li>`
    },
    tweetler: {
      data: window.TWEETLER || [],
      fields: d => [d.title, d.summary, d.text.replace(/<[^>]+>/g, " "), d.author, d.handle, d.cat],
      row: (d, n) => `<li class="row trow${d.star ? " is-star" : ""}" id="${esc(d.id)}">
        <span class="num">${n}</span>
        <div class="tmeta">
          <span class="who">${esc(d.author)} <span class="what">${esc(d.handle)}</span></span>
          <span class="what">${d.star ? '<b class="star">★ milyon dolarlık</b> · ' : ""}${esc(d.cat)}, ${esc(d.type)}${d.date ? ' · <span class="nw">' + esc(d.date) + "</span>" : ""}</span>
          ${d.title ? `<h3 class="ttitle"><a href="${esc(d.url)}" target="_blank" rel="noopener">${ttl(d.title)}</a></h3>` : ""}
          ${d.summary ? `<p class="tsum">${esc(d.summary)}</p>` : `<p class="tsum muted">İçerik gönderi kartında.</p>`}
          ${links(d.url, d.id, d.title || d.author)}
        </div>
        <div${embedStyle(d)} data-tid="${esc(d.tid)}">
          <blockquote class="x-tweet" data-dnt="true" data-conversation="none">
            <p${d.lang && d.lang !== "zxx" ? ` lang="${esc(d.lang)}"` : ""}>${d.text}</p>&mdash; ${esc(d.author)} (${esc(d.handle)}) <a href="${esc(d.url)}">${esc(d.date || "X")}</a>
          </blockquote>
        </div></li>`
    },
    pdfler: {
      data: window.BELGELER || [],
      fields: d => [d.title, d.summary, d.author, d.cat, d.type, d.date],
      row: (d, n) => `<li class="row${d.star ? " is-star" : ""}" id="${esc(d.id)}">
        <span class="num">${n}</span>
        <div><h3${langAttr(d.title)}><a href="${esc(d.url)}" target="_blank" rel="noopener">${ttl(d.title)}</a></h3>
          <p>${esc(d.summary)}</p><div class="viewer" hidden></div></div>
        <div class="side"><span class="who">${esc(d.author)}</span><span class="what">${esc(d.date)} · ${esc(d.type)}${d.pdf ? ' · <b class="badge">PDF</b>' : ""}</span>
          <span class="what">${d.star ? '<b class="star">★ milyon dolarlık</b> · ' : ""}${esc(d.cat)}</span>
          ${links(d.url, d.id, d.title, d.preview ? `<button type="button" data-preview="${esc(d.url)}" aria-expanded="false" aria-label="${esc("Önizle: " + d.title)}">Önizle</button>` : "")}</div></li>`
    }
  };
  const cfg = PAGES[PAGE], DATA = cfg.data;

  const counts = DATA.reduce((m, d) => (m[d.cat] = (m[d.cat] || 0) + 1, m), {});
  const cats = Object.keys(counts).sort((a, b) => a.localeCompare(b, "tr"));
  $("#stat-total").textContent = DATA.length;
  $("#stat-cats").textContent = cats.length;
  const NUM = new Map(DATA.map((d, i) => [d, String(i + 1).padStart(3, "0")]));
  // En yeni: tweet kimliği zamana göre artar (eski kısa kimlikler de dahil)
  const NEWEST = DATA.slice().sort((a, b) => String(b.tid).length - String(a.tid).length || (b.tid > a.tid ? 1 : b.tid < a.tid ? -1 : 0));

  // Uzun liste parça parça çizilir; DOM ve X iframe sayısı küçük kalır
  const STEP = PAGE === "tweetler" ? 30 : Infinity;
  let active = "Hepsi", query = "", order = "secki", list = [], shown = 0;
  const filters = $("#filters"), q = $("#q"), listEl = $("#list"), moreBtn = $("#more"), tools = $("#tool-links");
  const STAR = "★ Milyon dolarlık", stars = DATA.filter(d => d.star).length;
  filters.innerHTML = [["Hepsi", DATA.length], ...(stars ? [[STAR, stars]] : []), ...cats.map(c => [c, counts[c]])]
    .map(([c, n]) => `<button type="button" class="chip" data-cat="${esc(c)}" aria-pressed="${c === active}">${esc(c)}<sup>${n}</sup></button>`).join("");
  const setActive = c => { active = c; filters.querySelectorAll(".chip").forEach(x => x.setAttribute("aria-pressed", x.dataset.cat === c)); };
  filters.addEventListener("click", e => {
    const b = e.target.closest(".chip"); if (!b) return;
    setActive(b.dataset.cat); render();
  });
  let qt;
  q.addEventListener("input", () => { clearTimeout(qt); qt = setTimeout(() => { query = lower(q.value.trim()); render(); }, 120); });

  if (tools) {
    tools.innerHTML = (PAGE === "tweetler" ? `<span class="sort" role="group" aria-label="Sıralama"><button type="button" data-sort="secki" aria-pressed="true">Seçki sırası</button><button type="button" data-sort="yeni" aria-pressed="false">En yeni</button></span>` : "") +
      `<a id="random" href="#liste">Rastgele</a>`;
    tools.addEventListener("click", e => {
      const s = e.target.closest("[data-sort]");
      if (s) { order = s.dataset.sort; tools.querySelectorAll("[data-sort]").forEach(x => x.setAttribute("aria-pressed", x === s)); render(); return; }
      const r = e.target.closest("#random"); if (!r) return;
      const cur = hashId(), pool = list.filter(d => d.id !== cur);
      if (!pool.length) { e.preventDefault(); return; }
      r.href = "#" + pool[Math.floor(Math.random() * pool.length)].id;  // varsayılan gezinme hashchange'i tetikler
    });
  }

  // X gömmeleri: widgets.js ilk gönderi yaklaşınca yüklenir. Bekleyen alıntılar "x-tweet" sınıfıyla durur,
  // böylece widgets.js sayfadaki tüm gönderileri bir anda işlemez; sınıf yalnızca görünüme yaklaşınca değişir.
  let wjs;
  const loadWidgets = () => wjs || (wjs = new Promise(res => {
    const s = document.createElement("script");
    s.src = "https://platform.twitter.com/widgets.js"; s.async = true; s.charset = "utf-8";
    s.onload = () => (window.twttr && twttr.ready ? twttr.ready(res) : res());
    s.onerror = () => { document.body.classList.add("no-x"); res(); };  // X engelliyse yedek alıntı kalır, ayrılan yer kalkar
    document.head.appendChild(s);
  }));
  // Ekrandan uzaklaşan kartlar geri dönüştürülür: iframe kaldırılır, yerine bekleyen alıntı konur (boy kilitli).
  // Her X kartı ~3 MB; böylece aynı anda en fazla birkaç düzine canlı kart kalır, telefonda sekme çökmez.
  const KEEP = 24, liveSet = new Set();
  const embed = em => {
    const bq = em.querySelector("blockquote.x-tweet"); if (!bq || em._st) return;
    const g = em._gen = (em._gen || 0) + 1, ok = () => em._gen === g && em.isConnected;
    em._st = "loading"; liveSet.add(em);
    if (em.style.height) { em.style.height = em.style.overflow = ""; }  // kilit min-height olarak kalır; kart büyürse sığar
    bq.className = "twitter-tweet"; bq.dataset.theme = dark() ? "dark" : "light";
    loadWidgets().then(() => {
      if (!ok() || !(window.twttr && twttr.widgets && twttr.widgets.load)) return;  // kart bu arada geri dönüştüyse/silindiyse dokunma
      try { return Promise.race([twttr.widgets.load(em), new Promise(r => setTimeout(r, 10000))]); } catch {}
    }).catch(() => {}).then(() => {
      if (!ok()) return;
      em._st = "live";
      setTimeout(() => ok() && !em.querySelector("iframe") && em.classList.add("failed"), 8000);  // kart gelmediyse yedek alıntıyı göster
      em._far ? recycle(em) : trim();
    });
  };
  const recycle = em => {
    if (em._st !== "live" || !em.isConnected) return;  // yüklenirken dokunulmaz (widgets.js yarışı); yüklenince yeniden bakılır
    const h = em.offsetHeight;
    em.style.minHeight = em.style.height = h + "px"; em.style.overflow = "hidden";  // önce boy kilitlenir: üstteki kart değişse de içerik kaymaz
    em._gen++; em._st = ""; liveSet.delete(em);
    em.classList.remove("failed"); em.innerHTML = em._html;  // io gözlemi sürer: kart yeniden yaklaşınca tekrar gömülür
  };
  // Güvenlik sınırı: canlı kart sayısı KEEP'i aşarsa görünüme en uzak olanlar (yaklaşma bandının dışındakiler) bırakılır
  const trim = () => {
    if (liveSet.size <= KEEP) return;
    const vh = innerHeight, dist = em => { const r = em.getBoundingClientRect(); return r.bottom < 0 ? -r.bottom : r.top > vh ? r.top - vh : 0; };
    [...liveSet].filter(em => em._st === "live").map(em => [dist(em), em]).filter(([d]) => d > 1200)
      .sort((a, b) => b[0] - a[0]).slice(0, liveSet.size - KEEP).forEach(([, em]) => recycle(em));
  };
  // Kart görünüme ~1000 px yaklaşıp ~150 ms orada kalırsa gömülür: hızlı kaydırmada yanından geçilen kartlar için
  // iframe açılmaz, normal hızda ise kart ekrana girmeden hazır olur
  const io = "IntersectionObserver" in window && new IntersectionObserver(es => es.forEach(en => {
    const em = en.target; em._near = en.isIntersecting;
    em._near && !em._st && setTimeout(() => em._near && embed(em), 150);
  }), { rootMargin: "1000px 0px" });
  // ~3 ekran boyu uzaktaki canlı kart geri dönüştürülür
  const far = io && new IntersectionObserver(es => es.forEach(en => {
    const em = en.target; em._far = !en.isIntersecting; em._far && recycle(em);
  }), { rootMargin: "300% 0px" });

  // Ekranın üstünde kalmış bir X kartı geç yüklenip boy değiştirirse, görünen içerik kaymasın diye sayfayı o kadar kaydır.
  // Tarayıcı bunu kendisi yapıyorsa (overflow-anchor) yapılmaz; yoksa kayma iki kez düzeltilir ve sayfa zıplar.
  const nativeAnchor = window.CSS && CSS.supports && CSS.supports("overflow-anchor", "auto");
  const ro = !nativeAnchor && "ResizeObserver" in window && new ResizeObserver(es => es.forEach(e => {
    const el = e.target, h = el.offsetHeight, p = el._h; el._h = h;
    if (p != null && h !== p && el.getBoundingClientRect().bottom <= 0) scrollBy({ top: h - p, behavior: "instant" });  // html{scroll-behavior:smooth} bu düzeltmeyi canlandırmasın
  }));
  function more(n) {
    const next = list.slice(shown, shown + n);
    listEl.insertAdjacentHTML("beforeend", next.map(d => cfg.row(d, NUM.get(d))).join(""));
    if (PAGE === "tweetler" && io) next.forEach(d => {
      const em = document.getElementById(d.id).querySelector(".embed");
      em._html = em.innerHTML; io.observe(em); far.observe(em); ro && ro.observe(em);
    });
    shown += next.length;
    if (moreBtn) {
      moreBtn.hidden = shown >= list.length;
      moreBtn.innerHTML = `Daha fazla göster <span>${shown} / ${list.length}</span>`;
    }
    return next[0];
  }
  function render() {
    list = (order === "yeni" ? NEWEST : DATA).filter(d => (active === "Hepsi" || d.cat === active || (active === STAR && d.star)) &&
      (!query || lower(cfg.fields(d).join(" ")).includes(query)));
    if (io) { io.disconnect(); far.disconnect(); ro && ro.disconnect(); liveSet.clear(); }  // eski satırlar bırakılır
    listEl.innerHTML = ""; listEl.classList.add("ready"); shown = 0;
    more(STEP);
    $("#empty").hidden = list.length > 0;
  }
  render();
  addEventListener("beforeprint", () => shown < list.length && more(list.length - shown));  // baskıda tüm liste çıksın
  // Yapışkan araç çubuğunun yüksekliği kadar kaydırma payı (tablet genişliğinde çubuk daha uzun)
  const tb = $(".toolbar"), setTb = () => tb && document.documentElement.style.setProperty("--tb", (getComputedStyle(tb).position === "sticky" ? tb.offsetHeight : 8) + "px");
  setTb(); addEventListener("resize", setTb);
  moreBtn && moreBtn.addEventListener("click", () => {
    const first = more(STEP);
    const a = first && document.getElementById(first.id).querySelector("a");
    a && a.focus({ preventScroll: true });  // klavyede yeni gelen ilk girdiye geç
  });

  const toast = msg => { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 1600); };

  listEl.addEventListener("click", async e => {
    const pv = e.target.closest("[data-preview]");
    if (pv) {
      const v = pv.closest(".row").querySelector(".viewer");
      if (v.hidden) {
        v.innerHTML = `<iframe src="${esc(pv.dataset.preview)}#view=FitH" title="PDF önizleme" loading="lazy"></iframe><p class="vnote">Görünmüyorsa <a href="${esc(pv.dataset.preview)}" target="_blank" rel="noopener">PDF'yi yeni sekmede aç</a>.</p>`;
        v.hidden = false; pv.textContent = "Kapat";
      } else { v.innerHTML = ""; v.hidden = true; pv.textContent = "Önizle"; }
      pv.setAttribute("aria-expanded", !v.hidden);
      return;
    }
    const b = e.target.closest("[data-copy]"); if (!b) return;
    const link = `${location.origin}${location.pathname}#${b.dataset.copy}`;
    try { await navigator.clipboard.writeText(link); toast("Bağlantı kopyalandı"); }
    catch { prompt("Bağlantıyı kopyala:", link); }
  });

  function focusHash() {
    const id = hashId();
    // Eskiden ana sayfadaki fikir bağlantıları artık fikirler.html'de
    if (PAGE === "tweetler" && id && !/^t\d+$/.test(id) && !["liste","hakkinda","gonder"].includes(id)) {
      location.replace("fikirler.html#" + encodeURIComponent(id)); return;
    }
    const d = id && DATA.find(x => x.id === id);
    if (!d) { id && !document.getElementById(id) && toast("Bu girdi artık listede yok"); return; }  // kaldırılmış girdinin eski bağlantısı
    // Girdi filtrede/aramada gizliyse filtreyi sıfırla; henüz çizilmediyse o noktaya kadar çiz
    if (!list.includes(d)) { setActive("Hepsi"); query = ""; q.value = ""; render(); }
    const i = list.indexOf(d);
    if (i >= shown) more(Math.ceil((i + 1 - shown) / STEP) * STEP);
    const el = document.getElementById(id);
    el.scrollIntoView({ block: "start", behavior: "instant" });
    el.tabIndex = -1; el.focus({ preventScroll: true });
    el.classList.add("flash"); setTimeout(() => el.classList.remove("flash"), 2500);
  }
  addEventListener("hashchange", focusHash); focusHash();

  const form = $("#submit-form");
  form && form.addEventListener("submit", e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const body = `Bağlantı: ${f.get("url")}\n\nNeden: ${f.get("why") || "-"}`;
    window.open(`${REPO}/issues/new?labels=oneri&title=${encodeURIComponent("Öneri: " + f.get("url"))}&body=${encodeURIComponent(body)}`, "_blank", "noopener");
    e.target.reset(); toast("Teşekkürler, öneri sayfası açıldı");
  });
})();
