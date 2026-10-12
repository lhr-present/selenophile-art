(() => {
  const PAGE = document.body.dataset.page || "fikirler";
  const REPO = "https://github.com/lhr-present/selenophile-art";
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const lower = s => String(s ?? "").toLocaleLowerCase("tr");
  const dark = () => matchMedia("(prefers-color-scheme: dark)").matches;

  // Bu gecenin ay evresi
  const SYN = 29.530588853, ref = Date.UTC(2000,0,6,18,14);
  const p = ((((Date.now() - ref) / 864e5) % SYN) + SYN) % SYN / SYN;
  const phase = ["yeni ay","hilal","ilk dördün","şişkin ay","dolunay","şişkin ay","son dördün","hilal"][Math.round(p * 8) % 8];
  document.querySelectorAll(".phase-name").forEach(e => e.textContent = phase);
  document.querySelectorAll(".yr").forEach(e => e.textContent = new Date().getFullYear());

  const typeLabel = { makale: "yazı", thread: "thread", tweet: "tweet", "konuşma": "konuşma" };
  const links = (url, id, extra = "") =>
    `<span class="links"><a href="${esc(url)}" target="_blank" rel="noopener">${PAGE === "tweetler" ? "X'te aç" : "Kaynak"}</a>${extra}<button data-copy="${esc(id)}">Bağlantı</button></span>`;

  const PAGES = {
    fikirler: {
      data: window.FIKIRLER || [],
      fields: d => [d.title, d.summary, d.author, d.handle, d.cat],
      row: (d, n) => `<li class="row" id="${esc(d.id)}">
        <span class="num">${n}</span>
        <div><h3><a href="${esc(d.url)}" target="_blank" rel="noopener">${esc(d.title)}</a></h3><p>${esc(d.summary)}</p></div>
        <div class="side"><span class="who">${esc(d.author)}</span><span class="what">${esc(d.cat)}, ${esc(typeLabel[d.type] || d.type)}</span>${links(d.url, d.id)}</div></li>`
    },
    tweetler: {
      data: window.TWEETLER || [],
      fields: d => [d.title, d.summary, d.text.replace(/<[^>]+>/g, " "), d.author, d.handle, d.cat],
      row: (d, n) => `<li class="row trow" id="${esc(d.id)}">
        <span class="num">${n}</span>
        <div class="tmeta">
          <span class="who">${esc(d.author)} <span class="what">${esc(d.handle)}</span></span>
          <span class="what">${d.star ? '<b class="star">★ milyon dolarlık</b> · ' : ""}${esc(d.cat)}, ${esc(d.type)}${d.date ? " · " + esc(d.date) : ""}</span>
          ${d.title ? `<h3 class="ttitle"><a href="${esc(d.url)}" target="_blank" rel="noopener">${esc(d.title)}</a></h3>` : ""}
          ${d.summary ? `<p class="tsum">${esc(d.summary)}</p>` : `<p class="tsum muted">İçerik gönderi kartında.</p>`}
          ${links(d.url, d.id)}
        </div>
        <div class="embed" data-tid="${esc(d.tid)}">
          <blockquote class="twitter-tweet" data-dnt="true" data-conversation="none" data-theme="${dark() ? "dark" : "light"}">
            <p${d.lang && d.lang !== "zxx" ? ` lang="${esc(d.lang)}"` : ""}>${d.text}</p>&mdash; ${esc(d.author)} (${esc(d.handle)}) <a href="${esc(d.url)}">${esc(d.date || "X")}</a>
          </blockquote>
        </div></li>`
    },
    pdfler: {
      data: window.BELGELER || [],
      fields: d => [d.title, d.summary, d.author, d.cat, d.type, d.date],
      row: (d, n) => `<li class="row" id="${esc(d.id)}">
        <span class="num">${n}</span>
        <div><h3><a href="${esc(d.url)}" target="_blank" rel="noopener">${esc(d.title)}</a></h3>
          <p>${esc(d.summary)}</p><div class="viewer" hidden></div></div>
        <div class="side"><span class="who">${esc(d.author)}</span><span class="what">${esc(d.date)} · ${esc(d.type)}${d.pdf ? ' · <b class="badge">PDF</b>' : ""}</span>
          <span class="what">${esc(d.cat)}</span>
          ${links(d.url, d.id, d.preview ? `<button data-preview="${esc(d.url)}">Önizle</button>` : "")}</div></li>`
    }
  };
  const cfg = PAGES[PAGE], DATA = cfg.data;

  const counts = DATA.reduce((m, d) => (m[d.cat] = (m[d.cat] || 0) + 1, m), {});
  const cats = Object.keys(counts).sort((a, b) => a.localeCompare(b, "tr"));
  $("#stat-total").textContent = DATA.length;
  $("#stat-cats").textContent = cats.length;

  let active = "Hepsi", query = "";
  const filters = $("#filters");
  const STAR = "★ Milyon dolarlık", stars = DATA.filter(d => d.star).length;
  filters.innerHTML = [["Hepsi", DATA.length], ...(stars ? [[STAR, stars]] : []), ...cats.map(c => [c, counts[c]])]
    .map(([c, n]) => `<button class="chip" role="tab" data-cat="${esc(c)}" aria-selected="${c === active}">${esc(c)}<sup>${n}</sup></button>`).join("");
  filters.addEventListener("click", e => {
    const b = e.target.closest(".chip"); if (!b) return;
    active = b.dataset.cat;
    filters.querySelectorAll(".chip").forEach(x => x.setAttribute("aria-selected", x === b));
    render();
  });
  $("#q").addEventListener("input", e => { query = lower(e.target.value.trim()); render(); });

  // X gömmeleri: widgets.js yalnızca ilk gönderi görünür olduğunda yüklenir
  let wjs;
  const loadWidgets = () => wjs || (wjs = new Promise(res => {
    const s = document.createElement("script");
    s.src = "https://platform.twitter.com/widgets.js"; s.async = true; s.charset = "utf-8";
    s.onload = () => (window.twttr && twttr.ready ? twttr.ready(res) : res()); s.onerror = () => res();
    document.head.appendChild(s);
  }));
  const io = "IntersectionObserver" in window && new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return; io.unobserve(en.target);
    loadWidgets().then(() => window.twttr && twttr.widgets && twttr.widgets.load(en.target));
  }), { rootMargin: "600px 0px" });

  function render() {
    const list = DATA.filter(d => (active === "Hepsi" || d.cat === active || (active === STAR && d.star)) &&
      (!query || lower(cfg.fields(d).join(" ")).includes(query)));
    $("#list").innerHTML = list.map(d => cfg.row(d, String(DATA.indexOf(d) + 1).padStart(3, "0"))).join("");
    $("#empty").hidden = list.length > 0;
    if (PAGE === "tweetler" && io) document.querySelectorAll(".embed").forEach(e => io.observe(e));
  }
  render();

  const toast = msg => { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 1600); };

  $("#list").addEventListener("click", async e => {
    const pv = e.target.closest("[data-preview]");
    if (pv) {
      const v = pv.closest(".row").querySelector(".viewer");
      if (v.hidden) {
        v.innerHTML = `<iframe src="${esc(pv.dataset.preview)}#view=FitH" title="PDF önizleme" loading="lazy"></iframe><p class="vnote">Görünmüyorsa <a href="${esc(pv.dataset.preview)}" target="_blank" rel="noopener">PDF'i yeni sekmede açın</a>.</p>`;
        v.hidden = false; pv.textContent = "Kapat";
      } else { v.innerHTML = ""; v.hidden = true; pv.textContent = "Önizle"; }
      return;
    }
    const b = e.target.closest("[data-copy]"); if (!b) return;
    const link = `${location.origin}${location.pathname}#${b.dataset.copy}`;
    try { await navigator.clipboard.writeText(link); toast("Bağlantı kopyalandı"); }
    catch { prompt("Bağlantıyı kopyalayın:", link); }
  });

  function focusHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    // Eskiden ana sayfadaki fikir bağlantıları artık fikirler.html'de
    if (PAGE === "tweetler" && id && !/^t\d+$/.test(id) && !["liste","hakkinda","gonder"].includes(id)) {
      location.replace("fikirler.html#" + encodeURIComponent(id)); return;
    }
    const el = id && DATA.some(d => d.id === id) && document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ block: "start" });
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
