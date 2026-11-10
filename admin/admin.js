(function () {
  'use strict';

  // ---- 入力項目の定義 ----
  var T = function (key, label, hint) { return { type: 'text', key: key, label: label, hint: hint }; };
  var A = function (key, label, hint, tall) { return { type: 'area', key: key, label: label, hint: hint, tall: tall }; };
  var I = function (key, label, hint) { return { type: 'image', key: key, label: label, hint: hint }; };
  var S = function (key, label, options) { return { type: 'select', key: key, label: label, options: options }; };
  var L = function (key, label, itemLabel, titleKey, fields, blank) { return { type: 'list', key: key, label: label, itemLabel: itemLabel, titleKey: titleKey, fields: fields, blank: blank }; };
  var G = function (key, label, fields) { return { type: 'group', key: key, label: label, fields: fields }; };
  var URL_HINT = 'https:// から始まるURL。空欄ならボタン・リンクは表示されません';

  var teamFields = [
    T('name', 'チーム名（日本語）'), T('nameEn', 'チーム名（英語・大きい文字）'), T('sub', 'チーム名（英語・小さい文字）'),
    T('short', 'エンブレムの文字', '1〜2文字。エンブレム画像を入れた場合は使いません'),
    { type: 'color', key: 'color', label: 'チームカラー' }, I('logo', 'エンブレム画像', '背景が透明のPNGがおすすめ'),
  ];

  var SECTIONS = [
    { key: 'site', label: '基本情報', help: 'サイト名、ロゴ、チケット購入ボタンの行き先を設定します。', fields: [
      T('title', 'ページタイトル', 'ブラウザのタブや検索結果に出る名前'), A('description', 'サイトの説明文', '検索結果に出る説明'),
      S('indexable', 'Google などの検索結果に載せる', [['no', '載せない（準備中・仮の内容のあいだ）'], ['yes', '載せる（本番公開後）']]),
      T('logoMain', 'ロゴ 1行目（大きい文字）'), T('logoSub', 'ロゴ 2行目（小さい文字）'),
      I('logoImage', 'ヘッダーのロゴ画像', '入れると左上のロゴが画像に置き換わります'),
      T('ticketUrl', 'チケット購入ページのURL', 'チケット販売サイトのURL。#tickets のままならページ内の料金表へ移動します'),
      T('ticketButton', 'チケット購入ボタンの文字'),
      T('subButtonLabel', '2つ目のボタンの文字', '例：配信視聴チケット。空欄なら表示されません'), T('subButtonUrl', '2つ目のボタンのURL'),
    ] },
    { key: 'sns', label: 'SNS', help: 'URLを入れたSNSだけリンクが有効になります。', fields: [
      T('instagram', 'Instagram のURL'), T('x', 'X（旧Twitter）のURL'), T('facebook', 'Facebook のURL'),
    ] },
    { key: 'teams', label: '対戦チーム', help: '2チームの名前・色・エンブレムです。色は選手カードやエンブレムに使われます。', fields: [
      G('a', 'チームA（左側）', teamFields), G('b', 'チームB（右側）', teamFields),
    ] },
    { key: 'hero', label: 'メインビジュアル', help: 'ページ最上部の大きなエリアです。上部の選手名は「出場レジェンド」に登録した名前が自動で並びます。', fields: [
      I('image', 'キービジュアル画像', '選手の集合写真など。横長（1920×1080以上）がおすすめ。入れると背景に大きく表示されます'),
      A('catch', '左側のキャッチコピー', '改行するとそのまま改行されます（3行まで推奨）'),
      T('date', '開催日'), T('kickoff', 'キックオフ時間'), T('venue', '会場'),
      T('rosterNote', '選手未発表のときの一言', '選手が1人も登録されていない間だけ表示されます'),
    ] },
    { key: 'backgrounds', label: '背景写真', help: '各エリアの背景に敷くスタジアムの写真です。横長（1920×1080程度）の暗めの写真が合います。外すとそのエリアは写真なしの黒背景になります。', fields: [
      I('hero', 'メインビジュアルの背景', 'キービジュアル画像が未設定のとき（とスマホ表示）に使われます'),
      I('match', '「試合について」の背景'), I('legends', '「出場レジェンド」の背景'),
      I('banner', 'チケット案内の帯の背景'), I('closing', 'ページ最後の帯の背景'),
    ] },
    { key: 'partners', label: '協賛・パートナー', help: '区分（例：PRESENTED BY:）ごとに企業を登録します。ロゴ画像がなければ社名が文字で表示されます。', root: true, fields: [
      L('partners', '区分', '区分', 'label', [
        T('label', '区分の名前', '例：SPONSORED BY:'),
        L('items', '企業', '企業', 'name', [T('name', '企業名'), I('logo', 'ロゴ画像', '黒背景に載るので、白抜きロゴがおすすめ'), T('url', 'リンク先URL')], { name: '', logo: '', url: '' }),
      ], { label: '', items: [] }),
    ] },
    { key: 'festival', label: 'ファンフェスティバル', help: 'クリーム色の帯のエリアです。', fields: [
      T('title', '見出し'), A('body', '説明文', null, true),
      L('items', '催し', '催し', 'title', [T('title', 'タイトル'), A('text', '説明'), I('image', '写真', '正方形がおすすめ')], { title: '', text: '', image: '' }),
      T('buttonLabel', 'ボタンの文字'), T('buttonUrl', 'ボタンのURL', URL_HINT),
    ] },
    { key: 'goods', label: '公式グッズ', help: 'グッズを0件にすると、このエリアごと非表示になります。', fields: [
      T('title', '見出し'),
      L('items', 'グッズ', 'グッズ', 'name', [T('name', '商品名'), T('price', '価格', '例：¥4,000 (tax in)'), I('image', '商品画像', '正方形・背景透明のPNGがおすすめ')], { name: '', price: '', image: '' }),
      T('buttonLabel', 'ボタンの文字', '例：購入はこちらから'), T('buttonUrl', 'ボタンのURL', URL_HINT),
    ] },
    { key: 'match', label: '試合について', help: '日時・会場の大きな表示と、紹介文、当日のスケジュールです。', fields: [
      T('date', '開催日'), T('time', '時間'), T('venue', '会場'),
      L('sections', '紹介文', '段落', 'heading', [T('heading', '小見出し'), A('body', '本文', '1行空けると段落が分かれます', true)], { heading: '', body: '' }),
      T('timetableTitle', 'スケジュールの見出し'),
      L('timetable', 'スケジュール', '予定', 'title', [T('time', '時間', '例：14:00'), T('title', '内容'), T('note', '補足')], { time: '', title: '', note: '' }),
    ] },
    { key: 'tickets', label: 'チケット情報', help: '販売状況に「残りわずか」と入れると赤く、「完売」と入れるとグレーで表示されます。', fields: [
      T('title', '見出し'), A('lead', 'リード文'),
      L('items', '席種', '席種', 'name', [T('rank', '記号', '例：SS、S、A'), T('name', '席種名'), T('desc', '説明'), T('price', '価格', '例：¥8,000'), T('status', '販売状況', '例：販売中／残りわずか／完売')], { rank: '', name: '', desc: '', price: '', status: '販売中' }),
      A('note', '注意書き'),
      A('bannerTitle', '写真の帯：大きな見出し', '選手紹介の下に出る写真つきの帯。見出しと文を両方空欄にすると帯ごと非表示'), A('bannerText', '写真の帯：説明文'),
    ] },
    { key: 'legends', label: '出場レジェンド', help: '名前が空欄の選手は「COMING SOON」カードになります。名前を入れると、ページ最上部の選手名一覧にも自動で載ります。', fields: [
      T('title', '見出し'), A('lead', 'リード文'),
      L('players', '選手', '選手', 'name', [
        T('name', '名前（日本語）'), T('nameEn', '名前（英語）', 'カードに大きく表示されます。例：TARO YAMADA'),
        T('number', '背番号'), T('position', 'ポジション', '例：GK / DF / MF / FW'),
        S('team', '所属チーム', [['a', 'チームA'], ['b', 'チームB']]),
        T('years', '在籍期間など', '例：1998-2010'),
        I('photo', '選手写真', '縦長（3:4）がおすすめ'),
        S('featured', '最上部の選手名一覧での扱い', [['no', '2段目（小さめ）'], ['yes', '1段目（目玉選手・大きめ）']]),
      ], { name: '', nameEn: '', number: '', position: '', team: 'a', years: '', photo: '', featured: 'no' }),
    ] },
    { key: 'access', label: '会場・アクセス', help: '地図は「地図の検索ワード」でGoogleマップを検索した場所が表示されます。', fields: [
      T('title', '見出し'), T('venue', '会場名'), T('address', '住所'), T('mapQuery', '地図の検索ワード', '会場名か住所。空欄なら地図は非表示'),
      L('routes', 'アクセス方法', '項目', 'label', [T('label', '項目名', '例：電車・バス'), A('text', '内容')], { label: '', text: '' }),
    ] },
    { key: 'faq', label: 'よくある質問', help: '質問と回答を登録します。', root: true, fields: [
      L('faq', '質問', '質問', 'q', [T('q', '質問'), A('a', '回答')], { q: '', a: '' }),
    ] },
    { key: 'footer', label: 'フッター', help: 'ページ最下部のリンク・著作権表示です。', fields: [
      L('links', 'リンク', 'リンク', 'label', [T('label', '文字'), T('url', 'URL', 'メールなら mailto:info@example.com のように入力')], { label: '', url: '' }),
      T('closingText', 'ページ最後の帯の英字', '例：SEE YOU AT THE STADIUM。空欄にすると帯ごと非表示。日時と会場は「試合について」の内容が出ます'),
      T('copyright', 'コピーライト'), A('disclaimer', '注意書き', '本番公開時は空欄にしてください（「記載内容は仮のものです」の一文）'),
    ] },
  ];

  // ---- 状態 ----
  var data = null, current = SECTIONS[0].key, dirty = false;
  var $ = function (id) { return document.getElementById(id); };
  var el = function (tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  function touch() { dirty = true; $('state').textContent = '未保存の変更があります'; }
  function toast(msg, err) {
    var t = $('toast'); t.textContent = msg; t.className = 'toast show' + (err ? ' err' : '');
    clearTimeout(toast.t); toast.t = setTimeout(function () { t.className = 'toast'; }, err ? 6000 : 2600);
  }

  // ---- 入力部品 ----
  function fieldWrap(f) {
    var w = el('div', 'field'), lb = el('label', null, f.label);
    if (f.hint) lb.appendChild(el('span', 'hint', f.hint));
    w.appendChild(lb); return w;
  }
  function renderField(f, obj) {
    if (f.type === 'group') {
      if (!obj[f.key] || typeof obj[f.key] !== 'object') obj[f.key] = {};
      var g = el('div', 'group'); g.appendChild(el('h3', null, f.label));
      var cols = el('div', 'cols'); renderFields(f.fields, obj[f.key], cols); g.appendChild(cols); return g;
    }
    if (f.type === 'list') return renderList(f, obj);
    var w = fieldWrap(f), input;
    if (f.type === 'image') return renderImage(f, obj, w);
    if (f.type === 'color') {
      var box = el('div', 'color'), pick = el('input'), txt = el('input');
      pick.type = 'color'; txt.type = 'text';
      pick.value = /^#[0-9a-f]{6}$/i.test(obj[f.key] || '') ? obj[f.key] : '#000000'; txt.value = obj[f.key] || '';
      pick.oninput = function () { txt.value = pick.value; obj[f.key] = pick.value; touch(); };
      txt.oninput = function () { obj[f.key] = txt.value.trim(); if (/^#[0-9a-f]{6}$/i.test(obj[f.key])) pick.value = obj[f.key]; touch(); };
      box.appendChild(pick); box.appendChild(txt); w.appendChild(box); return w;
    }
    if (f.type === 'area') { input = el('textarea', f.tall ? 'tall' : ''); }
    else if (f.type === 'select') {
      input = el('select');
      f.options.forEach(function (o) { var op = el('option', null, o[1]); op.value = o[0]; input.appendChild(op); });
    } else { input = el('input'); input.type = 'text'; }
    input.value = obj[f.key] == null ? '' : obj[f.key];
    input.addEventListener('input', function () { obj[f.key] = input.value; touch(); });
    input.addEventListener('change', function () { obj[f.key] = input.value; touch(); });
    w.appendChild(input); return w;
  }
  function renderFields(fields, obj, parent) { fields.forEach(function (f) { parent.appendChild(renderField(f, obj)); }); }

  function renderImage(f, obj, w) {
    var box = el('div', 'image'), thumb = el('div', 'thumb'), file = el('input'), choose = el('button', null, '画像を選ぶ'), rm = el('button', 'rm', '画像を外す');
    file.type = 'file'; file.accept = 'image/png,image/jpeg,image/webp,image/gif'; choose.type = 'button'; rm.type = 'button';
    function show() {
      var v = obj[f.key];
      thumb.style.backgroundImage = v ? 'url("/' + encodeURI(v) + '")' : 'none';
      thumb.textContent = v ? '' : '未設定'; rm.style.display = v ? '' : 'none';
    }
    choose.onclick = function () { file.click(); };
    rm.onclick = function () { obj[f.key] = ''; show(); touch(); };
    file.onchange = function () {
      var fl = file.files[0]; if (!fl) return;
      choose.disabled = true; choose.textContent = 'アップロード中…';
      fetch('/api/upload', { method: 'POST', headers: { 'X-Admin': '1', 'X-Filename': encodeURIComponent(fl.name), 'Content-Type': 'application/octet-stream' }, body: fl })
        .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || 'アップロードに失敗しました'); return j; }); })
        .then(function (j) { obj[f.key] = j.path; show(); touch(); })
        .catch(function (e) { toast(e.message, true); })
        .then(function () { choose.disabled = false; choose.textContent = '画像を選ぶ'; file.value = ''; });
    };
    show(); box.appendChild(thumb); box.appendChild(choose); box.appendChild(rm); box.appendChild(file); w.appendChild(box); return w;
  }

  function renderList(f, obj) {
    if (!Array.isArray(obj[f.key])) obj[f.key] = [];
    var list = obj[f.key], wrap = el('div', 'list');
    function draw(openIndex) {
      wrap.innerHTML = '';
      wrap.appendChild(el('div', 'label', f.label + '（' + list.length + '件）'));
      list.forEach(function (it, i) {
        var item = el('div', 'item'), head = el('div', 'item-head'), title = el('b');
        var name = function () { title.textContent = f.itemLabel + ' ' + (i + 1) + (it[f.titleKey] ? '：' + it[f.titleKey] : ''); };
        name();
        var up = el('button', null, '↑'), down = el('button', null, '↓'), del = el('button', 'del', '削除');
        up.type = down.type = del.type = 'button'; up.title = '上へ'; down.title = '下へ';
        up.disabled = i === 0; down.disabled = i === list.length - 1;
        up.onclick = function () { list.splice(i - 1, 0, list.splice(i, 1)[0]); touch(); draw(); };
        down.onclick = function () { list.splice(i + 1, 0, list.splice(i, 1)[0]); touch(); draw(); };
        del.onclick = function () {
          if (!confirm(f.itemLabel + ' ' + (i + 1) + ' を削除しますか？')) return;
          list.splice(i, 1); touch(); draw();
        };
        head.appendChild(title); head.appendChild(up); head.appendChild(down); head.appendChild(del);
        var body = el('div', 'item-body');
        renderFields(f.fields, it, body);
        body.addEventListener('input', name);
        item.appendChild(head); item.appendChild(body); wrap.appendChild(item);
        if (i === openIndex) setTimeout(function () { item.scrollIntoView({ block: 'center', behavior: 'smooth' }); var first = body.querySelector('input,textarea'); if (first) first.focus(); }, 0);
      });
      var add = el('button', 'add', '＋ ' + f.itemLabel + 'を追加'); add.type = 'button';
      add.onclick = function () { list.push(JSON.parse(JSON.stringify(f.blank))); touch(); draw(list.length - 1); };
      wrap.appendChild(add);
    }
    draw(); return wrap;
  }

  // ---- 画面 ----
  function showSection(key) {
    current = key;
    var sec = SECTIONS.filter(function (s) { return s.key === key; })[0];
    $('title').textContent = sec.label; $('help').textContent = sec.help || '';
    var form = $('form'); form.innerHTML = '';
    var target = data;
    if (!sec.root) { if (!data[sec.key] || typeof data[sec.key] !== 'object') data[sec.key] = {}; target = data[sec.key]; }
    renderFields(sec.fields, target, form);
    Array.prototype.forEach.call($('menu').children, function (b) { b.className = b.dataset.key === key ? 'on' : ''; });
    window.scrollTo(0, 0);
  }
  function save() {
    var btn = $('save'); btn.disabled = true; btn.textContent = '保存中…';
    fetch('/api/content', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Admin': '1' }, body: JSON.stringify(data) })
      .then(function (r) { if (!r.ok) throw new Error('保存に失敗しました'); return r.json(); })
      .then(function () { dirty = false; $('state').textContent = ''; toast('保存しました。サイトに反映されています'); })
      .catch(function (e) { toast(e.message + '（「管理画面を開く」から起動しているか確認してください）', true); })
      .then(function () { btn.disabled = false; btn.textContent = '保存して反映'; });
  }

  SECTIONS.forEach(function (s) {
    var b = el('button', null, s.label); b.type = 'button'; b.dataset.key = s.key;
    b.onclick = function () { showSection(s.key); }; $('menu').appendChild(b);
  });
  $('save').onclick = save;
  document.addEventListener('keydown', function (e) { if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); save(); } });
  window.addEventListener('beforeunload', function (e) { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

  fetch('/api/content').then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
    .then(function (j) { data = j; showSection(current); })
    .catch(function () {
      $('title').textContent = '管理画面を開けませんでした';
      $('help').textContent = 'フォルダ内の「管理画面を開く.command」をダブルクリックして起動してください。';
      $('save').disabled = true;
    });
})();
