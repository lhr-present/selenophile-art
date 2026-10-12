(() => {
  const DATA = window.FIKIRLER || [];
  const REPO = "https://github.com/lhr-present/selenophile-art";
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const lower = s => s.toLocaleLowerCase("tr");

  // Bu gecenin ay evresi
  const SYN = 29.530588853, ref = Date.UTC(2000,0,6,18,14);
  const p = ((((Date.now() - ref) / 864e5) % SYN) + SYN) % SYN / SYN;
  const names = ["yeni ay","hilal","ilk dördün","şişkin ay","dolunay","şişkin ay","son dördün","hilal"];
  $("#phase-name").textContent = names[Math.round(p * 8) % 8];

  const counts = DATA.reduce((m, d) => (m[d.cat] = (m[d.cat] || 0) + 1, m), {});
  const cats = Object.keys(counts).sort((a, b) => a.localeCompare(b, "tr"));
  $("#stat-total").textContent = DATA.length;
  $("#stat-cats").textContent = cats.length;
  $("#yr").textContent = new Date().getFullYear();

  let active = "Hepsi", query = "";
  const filters = $("#filters");
  filters.innerHTML = [["Hepsi", DATA.length], ...cats.map(c => [c, counts[c]])]
    .map(([c, n]) => `<button class="chip" role="tab" data-cat="${esc(c)}" aria-selected="${c === active}">${esc(c)}<sup>${n}</sup></button>`).join("");
  filters.addEventListener("click", e => {
    const b = e.target.closest(".chip"); if (!b) return;
    active = b.dataset.cat;
    filters.querySelectorAll(".chip").forEach(x => x.setAttribute("aria-selected", x === b));
    render();
  });
  $("#q").addEventListener("input", e => { query = lower(e.target.value.trim()); render(); });

  const typeLabel = { makale: "yazı", thread: "thread", tweet: "tweet", "konuşma": "konuşma" };

  function render() {
    const list = DATA.filter(d => (active === "Hepsi" || d.cat === active) &&
      (!query || lower([d.title, d.summary, d.author, d.handle, d.cat].join(" ")).includes(query)));
    $("#list").innerHTML = list.map(d => {
      const n = String(DATA.indexOf(d) + 1).padStart(3, "0");
      return `<li class="row" id="${esc(d.id)}">
        <span class="num">${n}</span>
        <div><h3><a href="${esc(d.url)}" target="_blank" rel="noopener">${esc(d.title)}</a></h3><p>${esc(d.summary)}</p></div>
        <div class="side">
          <span class="who">${esc(d.author)}</span>
          <span class="what">${esc(d.cat)}, ${esc(typeLabel[d.type] || d.type)}</span>
          <span class="links"><a href="${esc(d.url)}" target="_blank" rel="noopener">Kaynak</a><button data-copy="${esc(d.id)}">Bağlantı</button></span>
        </div></li>`;
    }).join("");
    $("#empty").hidden = list.length > 0;
  }
  render();

  const toast = msg => { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 1600); };

  $("#list").addEventListener("click", async e => {
    const b = e.target.closest("[data-copy]"); if (!b) return;
    const link = `${location.origin}${location.pathname}#${b.dataset.copy}`;
    try { await navigator.clipboard.writeText(link); toast("Bağlantı kopyalandı"); }
    catch { prompt("Bağlantıyı kopyalayın:", link); }
  });

  function focusHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    const el = id && DATA.some(d => d.id === id) && document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ block: "start" });
    el.classList.add("flash"); setTimeout(() => el.classList.remove("flash"), 2500);
  }
  addEventListener("hashchange", focusHash); focusHash();

  $("#submit-form").addEventListener("submit", e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const body = `Bağlantı: ${f.get("url")}\n\nNeden: ${f.get("why") || "-"}`;
    window.open(`${REPO}/issues/new?labels=oneri&title=${encodeURIComponent("Öneri: " + f.get("url"))}&body=${encodeURIComponent(body)}`, "_blank", "noopener");
    e.target.reset(); toast("Teşekkürler, öneri sayfası açıldı");
  });
})();
