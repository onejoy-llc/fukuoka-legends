// data/content.json から公開用の index.html を作る
'use strict';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const br = (s) => esc(s).replace(/\r?\n/g, '<br>');
const paras = (s) => String(s ?? '').split(/\r?\n\s*\r?\n/).filter((p) => p.trim()).map((p) => `<p>${br(p.trim())}</p>`).join('');
const link = (u) => {
  const s = String(u ?? '').trim();
  if (!s) return '';
  if (/^(https?:\/\/|mailto:|tel:|#|\/|uploads\/|assets\/)/i.test(s)) return esc(s);
  return '';
};
const ext = (u) => (/^https?:/i.test(String(u ?? '')) ? ' target="_blank" rel="noopener"' : '');
const color = (c, d) => (/^#[0-9a-f]{3,8}$/i.test(String(c ?? '')) ? c : d);
const arr = (a) => (Array.isArray(a) ? a : []);

const ICONS = {
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 2H22l-7.2 8.3L23 22h-6.6l-5.2-6.8L5.3 22H2.2l7.7-8.9L1.5 2h6.8l4.7 6.2L18.9 2Zm-1.2 18h1.8L7.2 3.9H5.3L17.7 20Z"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.800-3.900 1.100 0 2.200.2 2.200.2v2.500h-1.200c-1.200 0-1.600.800-1.600 1.600V12h2.800l-.4 2.900h-2.300v7A10 10 0 0 0 22 12Z"/></svg>',
};
const SNS_LABEL = { instagram: 'Instagram', x: 'X', facebook: 'Facebook' };

function emblem(team, cls = '') {
  const t = team || {};
  if (t.logo) return `<img class="emblem ${cls}" src="${link(t.logo)}" alt="${esc(t.name)}">`;
  const c = color(t.color, '#b5121b');
  return `<svg class="emblem ${cls}" viewBox="0 0 60 70" role="img" aria-label="${esc(t.name)}"><path d="M30 2.500 56 10v25c0 15.500-10.500 25.500-26 32C14.500 60.500 4 50.500 4 35V10z" fill="${c}" stroke="#fff" stroke-width="2.500"/><path d="M30 8.500 50.500 14.500V35c0 12-8 20.500-20.500 26C17.500 55.500 9.500 47 9.500 35V14.500z" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="1"/><text x="30" y="45" text-anchor="middle" font-family="Anton,Impact,sans-serif" font-size="27" fill="#fff">${esc(String(t.short || '').slice(0, 2))}</text></svg>`;
}

function snsLinks(sns, cls) {
  const items = ['instagram', 'x', 'facebook'].map((k) => {
    const u = link(sns?.[k]);
    return u ? `<a href="${u}" target="_blank" rel="noopener" aria-label="${SNS_LABEL[k]}">${ICONS[k]}</a>` : `<span class="is-off" title="${SNS_LABEL[k]}（URL未設定）">${ICONS[k]}</span>`;
  });
  return `<div class="${cls}">${items.join('')}</div>`;
}

function partnersBlock(partners) {
  const groups = arr(partners).filter((g) => arr(g.items).length);
  if (!groups.length) return '';
  return `<div class="partners">${groups.map((g) => `
    <div class="partner-group${arr(g.items).length > 2 ? ' is-wide' : ''}">
      <h3>${esc(g.label)}</h3>
      <ul>${arr(g.items).map((p) => {
        const inner = p.logo ? `<img src="${link(p.logo)}" alt="${esc(p.name)}" loading="lazy">` : `<span>${esc(p.name)}</span>`;
        const u = link(p.url);
        return `<li>${u ? `<a href="${u}"${ext(p.url)}>${inner}</a>` : inner}</li>`;
      }).join('')}</ul>
    </div>`).join('')}</div>`;
}

function renderPage(c) {
  c = c || {};
  const site = c.site || {}, sns = c.sns || {}, hero = c.hero || {}, fes = c.festival || {}, goods = c.goods || {};
  const match = c.match || {}, tk = c.tickets || {}, lg = c.legends || {}, ac = c.access || {}, ft = c.footer || {};
  const A = c.teams?.a || {}, B = c.teams?.b || {};
  const colA = color(A.color, '#b5121b'), colB = color(B.color, '#143a8c');
  const bg = c.backgrounds || {};
  const bgUrl = (k) => (link(bg[k]) ? `url('${link(bg[k])}')` : '');
  // 背景画像のURLは index.html から見た相対パスにするため、CSSファイルではなくここで出力する
  const bgCss = [
    hero.image ? `@media (min-width:901px){.hero.has-kv{background:#0d0203}.hero.has-kv::before{background:linear-gradient(90deg,rgba(0,0,0,.55),rgba(0,0,0,0) 26%,rgba(0,0,0,0) 74%,rgba(0,0,0,.55)),linear-gradient(rgba(30,3,6,.5),rgba(20,3,5,0) 26%,rgba(0,0,0,.3) 62%,rgba(0,0,0,.95) 95%),url('${link(hero.image)}') center top/cover no-repeat}}@media (max-width:900px){.has-kv .hero-kv{background-image:url('${link(hero.image)}')}}` : '',
    bgUrl('hero') ? `.hero:not(.has-kv)::before{background:linear-gradient(rgba(60,6,11,.5),rgba(20,3,5,.3) 45%,rgba(0,0,0,.96) 97%),${bgUrl('hero')} center/cover no-repeat}.hero:not(.has-kv)::after{display:none}@media (max-width:900px){.hero.has-kv::before{background:linear-gradient(rgba(40,4,8,.72),rgba(10,2,3,.86) 55%,#000 96%),${bgUrl('hero')} center/cover no-repeat}.hero.has-kv::after{display:none}}` : '',
    bgUrl('match') ? `.about::before{background-image:linear-gradient(rgba(11,11,11,.58),rgba(11,11,11,.7) 55%,#0b0b0b),${bgUrl('match')}}` : '',
    bgUrl('legends') ? `.legends::before{background-image:linear-gradient(rgba(11,11,11,.35),rgba(11,11,11,.6) 55%,#0b0b0b),${bgUrl('legends')}}` : '',
    bgUrl('banner') ? `.banner{background-image:${bgUrl('banner')}}` : '',
    bgUrl('closing') ? `.closing{background-image:${bgUrl('closing')}}` : '',
  ].join('');
  const ticketUrl = link(site.ticketUrl) || '#tickets';
  const players = arr(lg.players);
  const named = players.filter((p) => (p.nameEn || p.name || '').trim());
  const rosterMain = named.filter((p) => p.featured === 'yes');
  const rosterSub = named.filter((p) => p.featured !== 'yes');
  const pname = (p) => esc((p.nameEn || p.name).trim());

  const logo = site.logoImage
    ? `<img src="${link(site.logoImage)}" alt="${esc(site.logoMain)} ${esc(site.logoSub)}">`
    : `<span class="logo-main">${esc(site.logoMain)}</span><span class="logo-sub">${esc(site.logoSub)}</span>`;

  const nav = [
    ['#about', '試合について'], ['#festival', 'FAN FESTIVAL'], ['#legends', '出場レジェンド'],
    ['#tickets', 'チケット情報'], ['#goods', '公式グッズ'], ['#faq', 'FAQS'],
  ].filter(([h]) => !(h === '#goods' && !arr(goods.items).length) && !(h === '#festival' && !arr(fes.items).length && !fes.title));

  const card = (p) => {
    const t = p.team === 'b' ? B : A;
    const has = (p.nameEn || p.name || '').trim();
    const en = (p.nameEn || '').trim();
    return `<li class="card card-${p.team === 'b' ? 'b' : 'a'}${has ? '' : ' is-tba'}">
      <div class="card-frame"><div class="card-in">
        ${p.photo ? `<img src="${link(p.photo)}" alt="${esc(p.name || p.nameEn)}" loading="lazy">` : `<span class="card-ghost" aria-hidden="true">${esc(p.number)}</span>`}
        <p class="card-name">${has ? esc(en || p.name).replace(/\s+/g, '<br>') : 'COMING<br>SOON'}</p>
        <span class="card-num">${esc(p.number)}</span>
        <span class="card-side">${esc([p.position, p.years].filter(Boolean).join(' / '))}</span>
        <span class="card-team">${emblem(t)}</span>
      </div></div>
      <p class="card-jp">${has ? esc(p.name || p.nameEn) : '近日発表'}<small>${esc(t.name)}</small></p>
    </li>`;
  };

  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(site.title)}</title>
<meta name="description" content="${esc(site.description)}">
${site.indexable === 'yes' ? '' : '<meta name="robots" content="noindex,nofollow">'}
<meta property="og:title" content="${esc(site.title)}">
<meta property="og:description" content="${esc(site.description)}">
<meta property="og:type" content="website">
${hero.image || bg.hero ? `<meta property="og:image" content="${link(hero.image || bg.hero)}">` : ''}
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23000'/%3E%3Ccircle cx='32' cy='32' r='22' fill='%23e3000f'/%3E%3Crect x='8' y='27' width='48' height='10' fill='%23fff' transform='skewX(-9)' transform-origin='32 32'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Manrope:wght@300;400;600;800&family=Noto+Sans+JP:wght@400;500;700;900&display=swap">
<link rel="stylesheet" href="assets/site.css">
<style>:root{--team-a:${colA};--team-b:${colB}}${bgCss}</style>
</head>
<body>
<a class="skip" href="#main">コンテンツにスキップ</a>

<header class="header">
  <a class="logo" href="#top" aria-label="${esc(site.logoMain)} ${esc(site.logoSub)}">${logo}</a>
  <nav class="nav" id="nav" aria-label="メインメニュー">
    ${nav.map(([h, l]) => `<a href="${h}">${l}</a>`).join('')}
    <a class="nav-ticket" href="${ticketUrl}"${ext(site.ticketUrl)}>チケット購入</a>
    ${snsLinks(sns, 'nav-sns')}
  </nav>
  <button class="menu-btn" type="button" aria-controls="nav" aria-expanded="false" aria-label="メニューを開く"><span></span><span></span><span></span></button>
</header>

${snsLinks(sns, 'side-sns')}

<a class="ticket-tab" href="${ticketUrl}"${ext(site.ticketUrl)} aria-label="チケット購入">
  <span class="tt-word">TICKET</span>
  <span class="tt-body">
    ${emblem(A)}<b>${esc(A.nameEn)}</b><i>${esc(A.sub)}</i>
    <em>VS</em>
    ${emblem(B)}<b>${esc(B.nameEn)}</b><i>${esc(B.sub)}</i>
  </span>
  <span class="tt-word">TICKET</span>
</a>

<main id="main">
<section class="hero${hero.image ? ' has-kv' : ''}" id="top">
  <div class="hero-roster">
    ${named.length ? `
      ${rosterMain.length ? `<p class="roster-main">${rosterMain.map((p) => `<span>${pname(p)}</span>`).join('')}</p>` : ''}
      ${rosterSub.length ? `<p class="roster-sub">${rosterSub.map((p) => `<span>${pname(p)}</span>`).join('')}</p>` : ''}`
      : `<p class="roster-note"><span>LINEUP TO BE ANNOUNCED</span>${esc(hero.rosterNote)}</p>`}
  </div>
  <div class="hero-mid">
    <p class="hero-catch">${br(hero.catch)}</p>
    <div class="hero-kv" aria-hidden="true"></div>
    <p class="hero-date"><span>${esc(hero.date)}</span><span>${esc(hero.kickoff)}</span><span>${esc(hero.venue)}</span></p>
  </div>
  <div class="hero-lockup">
    <div class="hero-team">${emblem(A)}<b>${esc(A.nameEn)}</b><i>${esc(A.sub)}</i></div>
    <h1 class="hero-logo"><span class="hl-main">${esc(site.logoMain)}</span><span class="hl-sub">${esc(site.logoSub)}</span></h1>
    <div class="hero-team">${emblem(B)}<b>${esc(B.nameEn)}</b><i>${esc(B.sub)}</i></div>
  </div>
  <p class="hero-vs">${esc(A.name)} <span>対</span> ${esc(B.name)}</p>
</section>

<section class="band band-black sponsors">
  ${partnersBlock(c.partners)}
  <div class="cta">
    <a class="btn btn-cream" href="${ticketUrl}"${ext(site.ticketUrl)}>${esc(site.ticketButton || 'チケットの購入はこちらまで')}</a>
    ${site.subButtonLabel && link(site.subButtonUrl) ? `<a class="btn btn-line" href="${link(site.subButtonUrl)}"${ext(site.subButtonUrl)}>${esc(site.subButtonLabel)}</a>` : ''}
  </div>
</section>

${fes.title || arr(fes.items).length ? `
<section class="band band-cream" id="festival">
  <div class="wrap">
    <p class="eyebrow">FAN FESTIVAL</p>
    <h2 class="h-jp">${esc(fes.title)}</h2>
    <div class="lead">${paras(fes.body)}</div>
  </div>
  <ul class="fes-grid">
    ${arr(fes.items).map((it, i) => `<li>
      <div class="fes-img">${it.image ? `<img src="${link(it.image)}" alt="${esc(it.title)}" loading="lazy">` : `<span>${String(i + 1).padStart(2, '0')}</span>`}</div>
      <h3>${esc(it.title)}</h3><p>${br(it.text)}</p>
    </li>`).join('')}
  </ul>
  ${fes.buttonLabel && link(fes.buttonUrl) ? `<div class="cta"><a class="btn btn-black" href="${link(fes.buttonUrl)}"${ext(fes.buttonUrl)}>${esc(fes.buttonLabel)}</a></div>` : ''}
</section>` : ''}

${arr(goods.items).length ? `
<section class="band band-white goods-head" id="goods"><h2 class="h-jp h-coral">${esc(goods.title)}</h2></section>
<section class="band band-dots goods">
  <ul class="goods-grid">
    ${arr(goods.items).map((g) => `<li>
      <div class="goods-img">${g.image ? `<img src="${link(g.image)}" alt="${esc(g.name)}" loading="lazy">` : '<span>IMAGE<br>COMING SOON</span>'}</div>
      <h3>${esc(g.name)}</h3><p>${esc(g.price)}</p>
    </li>`).join('')}
  </ul>
  ${goods.buttonLabel && link(goods.buttonUrl) ? `<div class="cta"><a class="btn btn-cream" href="${link(goods.buttonUrl)}"${ext(goods.buttonUrl)}>${esc(goods.buttonLabel)}</a></div>` : ''}
</section>` : ''}

<section class="band band-dots about" id="about">
  <div class="match-head">
    <p>${esc(match.date)}</p><p>${esc(match.time)}</p><p>${esc(match.venue)}</p>
  </div>
  <div class="about-grid">
    <div class="about-text">
      ${arr(match.sections).map((s) => `<h3>${esc(s.heading)}</h3>${paras(s.body)}`).join('')}
    </div>
    ${arr(match.timetable).length ? `
    <aside class="timetable">
      <div class="tt-match">
        <div>${emblem(A)}<b>${esc(A.name)}</b></div><span>VS</span><div>${emblem(B)}<b>${esc(B.name)}</b></div>
      </div>
      <h3>${esc(match.timetableTitle)}</h3>
      <ol>${arr(match.timetable).map((t) => `<li><time>${esc(t.time)}</time><div><b>${esc(t.title)}</b><span>${esc(t.note)}</span></div></li>`).join('')}</ol>
    </aside>` : ''}
  </div>
</section>

<section class="band band-cream tickets" id="tickets">
  <div class="wrap">
    <p class="eyebrow">TICKETS</p>
    <h2 class="h-jp">${esc(tk.title)}</h2>
    <p class="lead">${br(tk.lead)}</p>
    <ul class="ticket-list">
      ${arr(tk.items).map((t) => `<li>
        <span class="tk-rank">${esc(t.rank)}</span>
        <div class="tk-name"><b>${esc(t.name)}</b><span>${esc(t.desc)}</span></div>
        <span class="tk-price">${esc(t.price)}</span>
        <span class="tk-status${/完売|終了|sold/i.test(t.status || '') ? ' is-end' : /わずか/.test(t.status || '') ? ' is-few' : ''}">${esc(t.status)}</span>
      </li>`).join('')}
    </ul>
    <p class="note">${br(tk.note)}</p>
    <div class="cta"><a class="btn btn-black" href="${ticketUrl}"${ext(site.ticketUrl)}>${esc(site.ticketButton || 'チケットの購入はこちらまで')}</a></div>
  </div>
</section>

<section class="band band-dots legends" id="legends">
  <h2 class="h-wide">${esc(lg.title)}</h2>
  ${lg.lead ? `<p class="legends-lead">${br(lg.lead)}</p>` : ''}
  <ul class="cards">${players.map(card).join('')}</ul>
</section>

${tk.bannerTitle || tk.bannerText ? `
<section class="photo-band banner">
  <div class="photo-band-in">
    <p class="eyebrow">TICKETS</p>
    <h2>${br(tk.bannerTitle)}</h2>
    ${tk.bannerText ? `<p>${br(tk.bannerText)}</p>` : ''}
    <a class="btn btn-cream" href="${ticketUrl}"${ext(site.ticketUrl)}>${esc(site.ticketButton || 'チケットの購入はこちらまで')}</a>
  </div>
</section>` : ''}

<section class="band band-black access" id="access">
  <div class="access-grid">
    <div>
      <p class="eyebrow">ACCESS</p>
      <h2 class="h-jp">${esc(ac.title)}</h2>
      <p class="access-venue">${esc(ac.venue)}<small>${esc(ac.address)}</small></p>
      <dl>${arr(ac.routes).map((r) => `<div><dt>${esc(r.label)}</dt><dd>${br(r.text)}</dd></div>`).join('')}</dl>
    </div>
    ${ac.mapQuery ? `<iframe title="会場の地図" loading="lazy" referrerpolicy="no-referrer" src="https://www.google.com/maps?q=${encodeURIComponent(ac.mapQuery)}&output=embed&hl=ja"></iframe>` : ''}
  </div>
</section>

${arr(c.faq).length ? `
<section class="band band-white faq" id="faq">
  <div class="wrap">
    <h2 class="h-wide h-dark">FAQS</h2>
    ${arr(c.faq).map((f) => `<details><summary>${esc(f.q)}</summary><div>${paras(f.a)}</div></details>`).join('')}
  </div>
</section>` : ''}
${ft.closingText ? `
<section class="photo-band closing">
  <div class="photo-band-in">
    <p class="closing-en">${esc(ft.closingText)}</p>
    <h2>${esc(match.date)}</h2>
    <p>${esc(match.time)}<br>${esc(match.venue)}</p>
  </div>
</section>` : ''}
</main>

<footer class="footer">
  ${partnersBlock(c.partners)}
  <div class="footer-bottom">
    <ul class="footer-links">${arr(ft.links).map((l) => `<li>${link(l.url) ? `<a href="${link(l.url)}"${ext(l.url)}>${esc(l.label)}</a>` : `<span>${esc(l.label)}</span>`}</li>`).join('')}</ul>
    ${snsLinks(sns, 'footer-sns')}
  </div>
  <p class="copy">${esc(ft.copyright)}</p>
  ${ft.disclaimer ? `<p class="disclaimer">${br(ft.disclaimer)}</p>` : ''}
</footer>

<a class="ticket-bar" href="${ticketUrl}"${ext(site.ticketUrl)}>チケットを購入する</a>
<script src="assets/site.js"></script>
</body>
</html>
`;
}

module.exports = { renderPage };
