/* 识药录 · 交互逻辑 */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var CATS = ['全部', '补虚', '解表', '清热', '泻下', '温里', '化痰', '理气', '消食', '活血', '利水', '安神', '收涩', '平肝', '止血', '止咳', '祛风湿', '补阳'];
  var NATURES = ['全部', '寒', '凉', '平', '温', '热'];
  var TOXS = ['全部', '无毒', '小毒', '有毒'];
  var MAX_CMP = 3;

  var state = {
    view: 'explore',
    q: '',
    cat: '全部',
    nature: '全部',
    tox: '全部',
    favOnly: false,
    detail: null,
    tab: 'effect',
    symptom: null,
    compare: [],
    favs: load('tcm-favs', []),
    quiz: { i: 0, score: 0, answered: false, done: false }
  };

  /* ---------- 存储 ---------- */
  function load(key, dflt) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : dflt;
    } catch (e) { return dflt; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* 忽略隐私模式限制 */ }
  }

  var byId = {};
  // 合并扩展字段（产地 / 部位 / 用法 / 忌口）；图片按约定路径 assets/herbs/<id>.jpg 加载
  HERBS.forEach(function (h) {
    var ex = (typeof HERB_EXTRA !== 'undefined' && HERB_EXTRA[h.id]) || {};
    h.origin = ex.origin || '';
    h.part = ex.part || '';
    h.usage = ex.usage || '';
    h.dietary = ex.dietary || '';
    h.image = 'assets/herbs/' + h.id + '.jpg';
    byId[h.id] = h;
  });

  /* ---------- 工具 ---------- */
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.hidden = true; }, 1600);
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function isFav(id) { return state.favs.indexOf(id) > -1; }
  function inCompare(id) { return state.compare.indexOf(id) > -1; }

  /* ---------- 筛选 ---------- */
  function matches(h, q) {
    if (!q) return true;
    var hay = [
      h.name, h.py, h.pyDisp, h.alias.join(' '), h.cat, h.nature, h.part, h.origin,
      h.effects.join(' '), h.indications.join(' '), h.meridians.join(' ')
    ].join(' ').toLowerCase();
    return q.toLowerCase().split(/\s+/).every(function (w) { return hay.indexOf(w) > -1; });
  }

  function filtered() {
    return HERBS.filter(function (h) {
      if (state.cat !== '全部' && h.cat !== state.cat) return false;
      if (state.nature !== '全部' && h.natureTag !== state.nature) return false;
      if (state.tox !== '全部' && h.tox !== state.tox) return false;
      if (state.favOnly && !isFav(h.id)) return false;
      return matches(h, state.q.trim());
    });
  }

  /* ---------- 渲染：筛选条 ---------- */
  function chipRow(container, values, field) {
    container.innerHTML = values.map(function (v) {
      var on = state[field] === v;
      return '<button class="chip" data-field="' + field + '" data-val="' + esc(v) + '" aria-pressed="' + on + '">' + esc(v) + '</button>';
    }).join('');
  }

  function renderFilters() {
    chipRow($('#chipsCat'), CATS, 'cat');
    chipRow($('#chipsNature'), NATURES, 'nature');
    chipRow($('#chipsTox'), TOXS, 'tox');
    $('#favOnly').setAttribute('aria-pressed', String(state.favOnly));
    var dirty = state.cat !== '全部' || state.nature !== '全部' || state.tox !== '全部' || state.favOnly || state.q;
    $('#resetFilters').hidden = !dirty;
  }

  /* ---------- 渲染：统计 ---------- */
  function renderStats() {
    var tox = HERBS.filter(function (h) { return h.tox !== '无毒'; }).length;
    var cats = {};
    HERBS.forEach(function (h) { cats[h.cat] = 1; });
    var box = $('#heroStats');
    box.innerHTML = [
      ['<b>' + HERBS.length + '</b><span>味常用药材</span>'],
      ['<b>' + Object.keys(cats).length + '</b><span>个功效分类</span>'],
      ['<b>' + tox + '</b><span>味需警惕毒性</span>'],
      ['<b>' + SYMPTOMS.length + '</b><span>类常见不适</span>']
    ].map(function (a) { return '<div class="stat">' + a[0] + '</div>'; }).join('');
    $('#footCount').textContent = HERBS.length;
    if ($('#heroCount')) $('#heroCount').textContent = HERBS.length;
  }

  /* ---------- 渲染：卡片 ---------- */
  function card(h) {
    var tags = h.effects.slice(0, 3).map(function (e) { return '<span class="tag">' + esc(e) + '</span>'; }).join('');
    var fav = isFav(h.id);
    var cmp = inCompare(h.id);
    return '' +
      '<article class="card" data-tox="' + esc(h.tox) + '" data-id="' + esc(h.id) + '">' +
        '<div class="card-top">' +
          '<div><div class="card-name">' + esc(h.name) + '</div><div class="card-py">' + esc(h.pyDisp) + '</div></div>' +
          '<span class="card-cat">' + esc(h.cat) + '</span>' +
        '</div>' +
        '<div class="card-meta"><b>' + esc(h.nature) + '</b> · 归 ' + h.meridians.map(esc).join('、') + '经</div>' +
        '<div class="tags">' + tags + '</div>' +
        '<div class="card-foot">' +
          '<span class="tox tox-' + esc(h.tox) + '">' + esc(h.tox) + '</span>' +
          '<div class="card-actions">' +
            '<button class="mini' + (fav ? ' on' : '') + '" data-act="fav" data-id="' + esc(h.id) + '">' + (fav ? '已收藏' : '收藏') + '</button>' +
            '<button class="mini' + (cmp ? ' on' : '') + '" data-act="cmp" data-id="' + esc(h.id) + '">' + (cmp ? '对比中' : '对比') + '</button>' +
            '<button class="mini" data-act="open" data-id="' + esc(h.id) + '">详情 →</button>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function renderGrid() {
    var list = filtered();
    var grid = $('#grid');
    grid.innerHTML = list.map(card).join('');
    $('#empty').hidden = list.length > 0;
    var bits = [];
    if (state.q) bits.push('“' + state.q.trim() + '”');
    if (state.cat !== '全部') bits.push(state.cat + '类');
    if (state.nature !== '全部') bits.push(state.nature + '性');
    if (state.tox !== '全部') bits.push(state.tox);
    if (state.favOnly) bits.push('收藏');
    $('#resultText').textContent = (bits.length ? bits.join(' · ') + '：' : '全部药材：') + list.length + ' 味';
    renderFilters();
  }

  /* ---------- 详情抽屉 ---------- */
  function openDetail(id) {
    var h = byId[id];
    if (!h) return;
    state.detail = id;
    state.tab = 'effect';
    $('#dName').textContent = h.name;
    $('#dMeta').textContent = [h.pyDisp, h.alias.length ? '别名：' + h.alias.join('、') : '', h.cat + '类'].filter(Boolean).join(' · ');
    $('#drawer').hidden = false;
    $('#drawerMask').hidden = false;
    document.body.style.overflow = 'hidden';
    renderFigure(h);
    renderTabs();
    renderBody();
    renderDrawerFoot();
    try { history.replaceState(null, '', '#' + id); } catch (e) { /* file:// 下忽略 */ }
    $('#drawerClose').focus();
  }

  // 图片：按约定路径尝试加载，缺图时明确说明"为什么没有图"
  function renderFigure(h) {
    var img = $('#dImg'), ph = $('#dImgPh'), cap = $('#dImgCap');
    img.hidden = true;
    img.alt = h.name + ' 药材图';
    ph.hidden = false;
    cap.textContent = '';
    img.onload = function () {
      img.hidden = false;
      ph.hidden = true;
      cap.textContent = h.name + ' · 图片来自 assets/herbs/' + h.id + '.jpg';
    };
    img.onerror = function () {
      img.hidden = true;
      ph.hidden = false;
      cap.textContent = '';
    };
    img.src = h.image;
  }

  function closeDetail() {
    state.detail = null;
    $('#drawer').hidden = true;
    $('#drawerMask').hidden = true;
    document.body.style.overflow = '';
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* 忽略 */ }
  }

  function renderTabs() {
    $$('#dTabs .tab').forEach(function (b) {
      var on = b.getAttribute('data-tab') === state.tab;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-selected', String(on));
    });
  }

  function sec(title, inner, warn) {
    return '<section class="d-sec"><h4>' + esc(title) + '</h4>' + inner + '</section>';
  }

  function renderBody() {
    var h = byId[state.detail];
    if (!h) return;
    var box = $('#drawerBody');
    var html = '';

    if (state.tab === 'effect') {
      html += sec('性味归经',
        '<p class="d-line"><b>' + esc(h.nature) + '</b>　归 ' + h.meridians.map(esc).join('、') + ' 经</p>');
      html += sec('功效',
        '<div class="chipset">' + h.effects.map(function (e) { return '<span>' + esc(e) + '</span>'; }).join('') + '</div>');
      html += sec('主治',
        '<ul>' + h.indications.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>');
      html += sec('用法用量',
        '<p class="d-line">' + esc(h.dosage) + '</p>');
      if (h.research) html += sec('现代研究提示',
        '<p class="d-line">' + esc(h.research) + '</p>');
    }

    if (state.tab === 'identify') {
      html += sec('道地产区',
        '<p class="d-line">' + esc(h.origin || '（暂无考订）') + '</p>' +
        '<p class="d-line small">道地指传统公认的优质产区，不等于「只有这里才有效」；换产区可能影响成分含量与外观。</p>');
      html += sec('药用部位', '<p class="d-line">' + esc(h.part || '—') + '</p>');
      html += sec('识别方法（按顺序看）',
        '<ol class="steps">' + h.identify.map(function (x, i) {
          return '<li><span class="step-n">' + (i + 1) + '</span><span>' + esc(x) + '</span></li>';
        }).join('') + '</ol>');
      html += sec('易混与伪品',
        '<ul>' + h.confusion.map(function (x) { return '<li class="warn">' + esc(x) + '</li>'; }).join('') + '</ul>');
      if (h.tox !== '无毒') {
        html += '<div class="warn-box strong"><b>本品有毒，识别要求更高</b><p>有毒药材的混淆品往往毒性更强或更难分辨，<b>不要凭图片或气味判断</b>；请由药师做实物鉴别。</p></div>';
      }
      html += '<div class="warn-box"><b>辨识提醒</b><p>药材真伪与优劣需专业经验，部分伪品（如土三七冒三七）有肝毒性。请勿凭网上图片自行购买服用。</p></div>';
    }

    if (state.tab === 'usage') {
      html += sec('使用方法',
        '<p class="d-line">' + esc(h.usage || '—') + '</p>');
      html += sec('忌口与饮食配合',
        '<p class="d-line">' + esc(h.dietary || '—') + '</p>' +
        '<p class="d-line small">忌口属传统经验，个体差异大，且不能替代药物的相互作用核查。</p>');
      html += sec('煎服法要点',
        '<ul><li><b>先煎</b>：矿石、贝壳类，以及附子等需久煎减毒者</li>' +
        '<li><b>后下</b>：薄荷等含挥发油者，出锅前 5–10 分钟下</li>' +
        '<li><b>冲服</b>：芒硝等易溶物，三七粉等贵重药</li>' +
        '<li><b>另煎</b>：人参等贵重药，煎后兑入</li></ul>');
      html += '<div class="warn-box"><b>这些只是通用做法</b><p>剂量、配伍、疗程必须由医师确定；带「食疗」字样的用法同样需要辨证，不能因为"是食物"就随意加量。</p></div>';
    }

    if (state.tab === 'caution') {
      html += sec('用药注意',
        '<ul>' + h.cautions.map(function (x) { return '<li class="warn">' + esc(x) + '</li>'; }).join('') + '</ul>');
      if (h.tox !== '无毒') {
        html += '<div class="warn-box strong"><b>本品标注：' + esc(h.tox) + '</b><p>' +
          (h.tox === '有毒'
            ? '毒性明确，炮制、剂量、煎法均有严格规范，禁止自行购买使用；误服出现口舌麻木、心悸须立即就医。'
            : '含已知毒性成分，不可超量、不可长期服用，儿童与孕产妇尤须回避。') +
          '</p></div>';
      }
      html += sec('谁要特别小心',
        '<p class="d-line">孕妇、哺乳期、儿童、老年人、肝肾功能异常者，以及正在服用西药（尤其抗凝、降压、降糖、镇静类）的人，使用前必须咨询医师或药师。</p>');
    }

    if (state.tab === 'pairs') {
      html += sec('常见配伍',
        '<ul>' + h.pairs.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>');
      html += sec('配伍禁忌速记',
        '<ul><li>人参 反 藜芦；甘草 反 大戟、芫花、甘遂、海藻</li>' +
        '<li>乌头类（川乌、草乌、附子）反 半夏、瓜蒌、贝母、白蔹、白及</li>' +
        '<li>丹参、玄参、苦参、细辛、芍药 亦反 藜芦</li></ul>');
      html += '<div class="warn-box"><b>别自己组方</b><p>配伍不是「把功效加起来」。同一味药在不同方中的剂量、炮制、煎法都不同，差一点方向就反了。</p></div>';
    }

    box.innerHTML = html;
    box.scrollTop = 0;
  }

  function renderDrawerFoot() {
    var id = state.detail;
    var fav = isFav(id);
    $('#dFav').textContent = fav ? '★ 已收藏' : '☆ 收藏';
    var cmp = inCompare(id);
    $('#dCompare').textContent = cmp ? '移出对比' : '加入对比';
    $('#dCompare').classList.toggle('primary', !cmp);
  }

  /* ---------- 收藏 / 对比 ---------- */
  // 原地更新按钮，避免整表重绘（重绘会丢失焦点与滚动位置）
  function updateCardButtons(id) {
    var nodes = document.querySelectorAll('.card[data-id="' + id + '"]');
    Array.prototype.forEach.call(nodes, function (el) {
      var f = el.querySelector('[data-act="fav"]');
      if (f) { f.textContent = isFav(id) ? '已收藏' : '收藏'; f.classList.toggle('on', isFav(id)); }
      var c = el.querySelector('[data-act="cmp"]');
      if (c) { c.textContent = inCompare(id) ? '对比中' : '对比'; c.classList.toggle('on', inCompare(id)); }
    });
  }

  function toggleFav(id) {
    var i = state.favs.indexOf(id);
    if (i > -1) { state.favs.splice(i, 1); toast('已取消收藏'); }
    else { state.favs.push(id); toast('已收藏 ' + byId[id].name); }
    save('tcm-favs', state.favs);
    updateCardButtons(id);
    if (state.favOnly) renderGrid();          // 「只看收藏」时列表内容会变
    if (state.detail === id) renderDrawerFoot();
    if (state.view === 'compare') renderCompare();
  }

  function toggleCompare(id) {
    var i = state.compare.indexOf(id);
    if (i > -1) { state.compare.splice(i, 1); toast('已移出对比'); }
    else {
      if (state.compare.length >= MAX_CMP) { toast('最多同时对比 ' + MAX_CMP + ' 味'); return; }
      state.compare.push(id);
      toast('已加入对比（' + state.compare.length + '/' + MAX_CMP + '）');
    }
    save('tcm-compare', state.compare);
    var n = state.compare.length;
    $('#cmpCount').textContent = n;
    $('#cmpCount').hidden = n === 0;
    updateCardButtons(id);
    if (state.detail === id) renderDrawerFoot();
    if (state.view === 'compare') renderCompare();
  }

  /* ---------- 视图切换 ---------- */
  var VIEWS = ['explore', 'symptom', 'wizard', 'quiz', 'compare', 'safety'];

  function go(view) {
    if (VIEWS.indexOf(view) < 0) view = 'explore';
    if (!$('#drawer').hidden) closeDetail();
    state.view = view;
    VIEWS.forEach(function (v) {
      $('#view-' + v).hidden = v !== view;
    });
    $$('.nav-btn').forEach(function (b) {
      var on = b.getAttribute('data-go') === view;
      b.classList.toggle('is-on', on);
      if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    if (view === 'symptom') renderSymptoms();
    if (view === 'wizard') renderWizard();
    if (view === 'quiz') renderQuiz();
    if (view === 'compare') renderCompare();
    if (view === 'safety') renderToxList();
    try { history.replaceState(null, '', view === 'explore' ? location.pathname + location.search : '#/' + view); } catch (e) { /* 忽略 */ }
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { /* 无头环境忽略 */ }
  }

  /* ---------- 辨识向导 ---------- */
  function renderWizard() {
    var box = $('#wizParts');
    if (box.dataset.done) return;
    box.innerHTML = PARTS.map(function (p) {
      return '<button class="chip" data-part="' + esc(p.key) + '">' + esc(p.key) + '</button>';
    }).join('');
    box.dataset.done = '1';
  }

  function pickPart(part) {
    state.part = part;
    var meta = PARTS.filter(function (p) { return p.key === part; })[0];
    $('#wizPartNote').textContent = meta ? meta.note : '';
    $$('#wizParts .chip').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-part') === part));
    });

    var list = HERBS.filter(function (h) { return h.part === part; });
    // 有毒的排前面：先看到风险，再谈功效
    var weight = function (h) { return h.tox === '有毒' ? -2 : h.tox === '小毒' ? -1 : 0; };
    list.sort(function (a, b) { return weight(a) - weight(b); });

    $('#wizStep2').hidden = false;
    $('#wizCandidates').innerHTML = list.map(function (h) {
      return '<article class="wiz-item" data-tox="' + esc(h.tox) + '">' +
        '<div class="wiz-head"><b>' + esc(h.name) + '</b>' +
          '<span class="tox tox-' + esc(h.tox) + '">' + esc(h.tox) + '</span></div>' +
        '<ol class="steps">' + h.identify.map(function (x, i) {
          return '<li><span class="step-n">' + (i + 1) + '</span><span>' + esc(x) + '</span></li>';
        }).join('') + '</ol>' +
        '<div class="wiz-foot"><span>' + esc(h.origin) + '</span>' +
          '<button class="mini" data-act="open" data-id="' + esc(h.id) + '">详情 →</button></div>' +
        '</article>';
    }).join('');
  }

  /* ---------- 症状速查 ---------- */
  function renderSymptoms() {
    var box = $('#symptomGrid');
    if (box.dataset.done) return;
    box.innerHTML = SYMPTOMS.map(function (s) {
      return '<button class="sym" data-sym="' + esc(s.key) + '">' +
        '<span class="sym-icon">' + s.icon + '</span>' +
        '<span class="sym-name">' + esc(s.key) + '</span>' +
        '<span class="sym-note">' + esc(s.note) + '</span></button>';
    }).join('');
    box.dataset.done = '1';
  }

  function pickSymptom(key) {
    state.symptom = key;
    var s = SYMPTOMS.filter(function (x) { return x.key === key; })[0];
    $$('#symptomGrid .sym').forEach(function (b) {
      b.classList.toggle('is-on', b.getAttribute('data-sym') === key);
    });
    $('#symptomTitle').textContent = s.icon + ' ' + s.key;
    $('#symptomNote').textContent = '常见表现：' + s.note;
    $('#symptomResult').hidden = false;
    renderSymptomCards();
    var res = $('#symptomResult');
    if (res.scrollIntoView) {
      try { res.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) { /* 忽略 */ }
    }
  }

  function renderSymptomCards() {
    var s = SYMPTOMS.filter(function (x) { return x.key === state.symptom; })[0];
    if (!s) return;
    $('#symptomHerbs').innerHTML = s.herbs.map(function (id) { return byId[id]; }).filter(Boolean).map(card).join('');
  }

  /* ---------- 测验 ---------- */
  function renderQuiz() {
    var st = state.quiz;
    var total = QUIZ.length;
    if (st.i >= total) {
      $('#quizProgress').textContent = '已完成 ' + total + ' 题';
      $('#quizScore').textContent = '答对 ' + st.score + ' / ' + total;
      $('#quizBar').style.width = '100%';
      $('#quizQ').textContent = st.score === total ? '全对。你已经建立起一套辨药的基本框架。' : '答对 ' + st.score + ' 题。错题的解释值得再看一遍。';
      $('#quizOptions').innerHTML = '';
      $('#quizFeedback').hidden = true;
      $('#quizNext').hidden = true;
      return;
    }
    var item = QUIZ[st.i];
    $('#quizProgress').textContent = '第 ' + (st.i + 1) + ' / ' + total + ' 题';
    $('#quizScore').textContent = '答对 ' + st.score;
    $('#quizBar').style.width = (st.i / total * 100) + '%';
    $('#quizQ').textContent = item.q;
    $('#quizFeedback').hidden = true;
    $('#quizNext').hidden = true;
    $('#quizOptions').innerHTML = item.options.map(function (id, idx) {
      return '<button class="opt" data-opt="' + idx + '"' + (st.answered ? ' disabled' : '') + '>' +
        String.fromCharCode(65 + idx) + '. ' + esc(byId[id] ? byId[id].name : id) + '</button>';
    }).join('');
    if (st.answered) {
      $$('#quizOptions .opt').forEach(function (b, idx) {
        if (idx === item.answer) b.classList.add('right');
      });
      $('#quizFeedback').innerHTML = '<b>为什么：</b>' + esc(item.why);
      $('#quizFeedback').hidden = false;
      $('#quizNext').hidden = false;
    }
  }

  function answerQuiz(idx) {
    var st = state.quiz;
    if (st.answered) return;
    var item = QUIZ[st.i];
    st.answered = true;
    var correct = idx === item.answer;
    if (correct) st.score++;
    $$('#quizOptions .opt').forEach(function (b, i) {
      b.disabled = true;
      if (i === item.answer) b.classList.add('right');
      else if (i === idx) b.classList.add('wrong');
    });
    var fb = $('#quizFeedback');
    fb.innerHTML = '<b>' + (correct ? '答对了。' : '不对。') + '</b>' + esc(item.why);
    fb.hidden = false;
    $('#quizNext').hidden = false;
    $('#quizScore').textContent = '答对 ' + st.score;
  }

  function nextQuiz() {
    state.quiz.i++;
    state.quiz.answered = false;
    renderQuiz();
  }

  function restartQuiz() {
    state.quiz = { i: 0, score: 0, answered: false, done: false };
    renderQuiz();
  }

  /* ---------- 对比 ---------- */
  function renderCompare() {
    var wrap = $('#compareWrap');
    var n = state.compare.length;
    $('#cmpCount').textContent = n;
    $('#cmpCount').hidden = n === 0;

    if (!n) {
      wrap.innerHTML = '<p class="compare-empty">还没有加入药材。回到「探索」，在卡片上点「对比」，最多 3 味。</p>';
      return;
    }
    var hs = state.compare.map(function (id) { return byId[id]; }).filter(Boolean);
    var rows = [
      ['性味', function (h) { return esc(h.nature); }],
      ['归经', function (h) { return h.meridians.map(esc).join('、'); }],
      ['功效', function (h) { return h.effects.map(esc).join('、'); }],
      ['主治', function (h) { return h.indications.map(esc).join('<br>'); }],
      ['用量', function (h) { return esc(h.dosage); }],
      ['关键禁忌', function (h) { return h.cautions.slice(0, 2).map(esc).join('<br>'); }],
      ['毒性', function (h) { return '<span class="tox tox-' + esc(h.tox) + '">' + esc(h.tox) + '</span>'; }]
    ];

    var html = '<table class="compare-table"><thead><tr><th></th>' +
      hs.map(function (h) {
        return '<th>' + esc(h.name) + '<div class="card-py">' + esc(h.pyDisp) + '</div>' +
          '<button class="mini" data-act="uncmp" data-id="' + esc(h.id) + '">移出</button></th>';
      }).join('') + '</tr></thead><tbody>' +
      rows.map(function (r) {
        return '<tr><th>' + r[0] + '</th>' + hs.map(function (h) { return '<td>' + r[1](h) + '</td>'; }).join('') + '</tr>';
      }).join('') + '</tbody></table>';
    wrap.innerHTML = html;
  }

  /* ---------- 安全须知：毒性药材清单 ---------- */
  function renderToxList() {
    var box = $('#toxList');
    if (box.dataset.done) return;
    var list = HERBS.filter(function (h) { return h.tox !== '无毒'; });
    box.innerHTML = list.map(function (h) {
      return '<li><b>' + esc(h.name) + '</b>（' + esc(h.tox) + '）— ' + esc(h.cautions[0]) + '</li>';
    }).join('');
    box.dataset.done = '1';
  }

  /* ---------- 事件 ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target;

    var goBtn = t.closest('[data-go]');
    if (goBtn) { e.preventDefault(); go(goBtn.getAttribute('data-go')); return; }

    var partBtn = t.closest('[data-part]');
    if (partBtn) { pickPart(partBtn.getAttribute('data-part')); return; }

    var chip = t.closest('.chip');
    if (chip) {
      var f = chip.getAttribute('data-field');
      if (!f) return;
      state[f] = chip.getAttribute('data-val');
      renderGrid();
      return;
    }

    var act = t.closest('[data-act]');
    if (act) {
      var action = act.getAttribute('data-act');
      var id = act.getAttribute('data-id');
      if (action === 'open') openDetail(id);
      if (action === 'fav') toggleFav(id);
      if (action === 'cmp') toggleCompare(id);
      if (action === 'uncmp') toggleCompare(id);
      return;
    }

    var sym = t.closest('[data-sym]');
    if (sym) { pickSymptom(sym.getAttribute('data-sym')); return; }

    var opt = t.closest('[data-opt]');
    if (opt && !opt.disabled) { answerQuiz(Number(opt.getAttribute('data-opt'))); return; }

    var tab = t.closest('#dTabs .tab');
    if (tab) { state.tab = tab.getAttribute('data-tab'); renderTabs(); renderBody(); return; }
  });

  $('#q').addEventListener('input', function (e) {
    state.q = e.target.value;
    $('#qClear').hidden = !state.q;
    renderGrid();
  });
  $('#qClear').addEventListener('click', function () {
    state.q = '';
    $('#q').value = '';
    $('#qClear').hidden = true;
    renderGrid();
    $('#q').focus();
  });

  $('#favOnly').addEventListener('click', function () {
    state.favOnly = !state.favOnly;
    renderGrid();
  });

  $('#resetFilters').addEventListener('click', function () {
    state.cat = '全部'; state.nature = '全部'; state.tox = '全部';
    state.favOnly = false; state.q = '';
    $('#q').value = ''; $('#qClear').hidden = true;
    renderGrid();
  });

  $('#drawerClose').addEventListener('click', closeDetail);
  $('#drawerMask').addEventListener('click', closeDetail);
  $('#dFav').addEventListener('click', function () { if (state.detail) toggleFav(state.detail); });
  $('#dCompare').addEventListener('click', function () { if (state.detail) toggleCompare(state.detail); });

  $('#quizNext').addEventListener('click', nextQuiz);
  $('#quizRestart').addEventListener('click', restartQuiz);

  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement !== $('#q')) {
      e.preventDefault();
      $('#q').focus();
      $('#q').select();
    }
    if (e.key === 'Escape' && !$('#drawer').hidden) closeDetail();
  });

  /* ---------- 引导 ---------- */
  function maybeIntro() {
    var never = load('tcm-intro-never', false);
    if (never) return;
    $('#intro').hidden = false;
    $('#introStart').focus();
  }
  $('#introStart').addEventListener('click', function () {
    if ($('#introNever').checked) save('tcm-intro-never', true);
    $('#intro').hidden = true;
    $('#q').focus();
  });
  $('#introNever').addEventListener('change', function (e) {
    if (e.target.checked) save('tcm-intro-never', true);
    else save('tcm-intro-never', false);
  });

  /* ---------- 启动 ---------- */
  state.compare = load('tcm-compare', []).filter(function (id) { return byId[id]; });
  state.favs = load('tcm-favs', []).filter(function (id) { return byId[id]; });

  renderStats();
  renderGrid();
  renderSymptoms();
  renderCompare();

  // 深链：#/quiz 打开视图；#renshen 打开详情；#renshen/usage 直达某个标签页；
  // #/wizard?part=根 直达向导某部位；?nointro 用于截图/演示跳过引导
  var hash = location.hash;
  var raw = hash.replace(/^#\/?/, '');
  var deep = raw.split('?')[0];
  var seg = deep.split('/');
  var noIntro = /(^|[?&])nointro(=|&|$|&)/.test(location.search);
  var partParam = (raw.match(/[?&]part=([^&]+)/) || [])[1] ||
                  (location.search.match(/[?&]part=([^&]+)/) || [])[1];

  if (VIEWS.indexOf(seg[0]) > -1) {
    go(seg[0]);
    if (seg[0] === 'wizard' && partParam) { pickPart(decodeURIComponent(partParam)); }
  } else if (byId[seg[0]]) {
    openDetail(seg[0]);
    if (seg[1]) { state.tab = seg[1]; renderTabs(); renderBody(); }
  } else if (!noIntro) {
    maybeIntro();
  }

  if (window.matchMedia && window.matchMedia('(max-width: 720px)').matches) {
    $('#q').placeholder = '搜药材、拼音、功效…';
  }
})();
