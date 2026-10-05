  // ---------- Hero image carousel ----------
  (function () {
    const slides = Array.from(document.querySelectorAll('.hero-slide'));
    const dots   = Array.from(document.querySelectorAll('.hero-dot'));
    if (slides.length < 2) return;

    const INTERVAL = 4500;   // ms each slide stays on
    let idx = 0;
    let timer = null;

    function show(next) {
      if (next === idx) return;
      slides[idx].classList.remove('active');
      dots[idx]?.classList.remove('active');
      idx = next;
      slides[idx].classList.add('active');
      dots[idx]?.classList.add('active');
    }

    function start() { stop(); timer = setInterval(() => show((idx + 1) % slides.length), INTERVAL); }
    function stop()  { if (timer) { clearInterval(timer); timer = null; } }
    start();

    dots.forEach((d, i) => d.addEventListener('click', () => { show(i); start(); }));

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop(); else start();
    });
  })();

  // ---------- Live approvals feed (Why us panel) ----------
  (function () {
    const feed = document.getElementById('live-feed');
    const indicator = document.getElementById('live-indicator');
    if (!feed || !indicator) return;

    const liveText = indicator.querySelector('.live-text');

    const POOL = [
      { status: 'approved',     asset: 'Vehicle finance' },
      { status: 'settled',      asset: 'Caravan finance' },
      { status: 'pre-approved', asset: 'Business equipment' },
      { status: 'approved',     asset: 'Marine finance' },
      { status: 'settled',      asset: 'Truck & trailer finance' },
      { status: 'pre-approved', asset: 'Personal finance' },
      { status: 'approved',     asset: 'Equipment & machinery' },
      { status: 'settled',      asset: 'Vehicle finance' },
      { status: 'pre-approved', asset: 'Marine finance' },
      { status: 'approved',     asset: 'Caravan finance' },
    ];
    const LABELS = { approved: 'Approved', settled: 'Settled', 'pre-approved': 'Pre-approved' };

    // Randomised relative timestamps per row position.
    // Position 0 is always "Just now"; older positions draw from progressively
    // wider ranges so the order stays monotonic and feels organic.
    const TIME_RANGES = [null, [2, 9], [10, 21], [22, 49]];
    function timeFor(position) {
      if (position === 0) return 'Just now';
      const r = TIME_RANGES[position] || [50, 90];
      const mins = r[0] + Math.floor(Math.random() * (r[1] - r[0] + 1));
      return mins + ' min ago';
    }

    let poolIdx = 4;     // skip the first 4 already shown in the static HTML
    let rotateTimer = null;
    let checkTimer = null;

    // Office hours on the visitor's local clock:
    //   Mon–Fri  8:30am – 6:00pm
    //   Sat      9:00am – 5:00pm
    //   Sun      closed
    function isOfficeOpen() {
      const now = new Date();
      const day = now.getDay();                            // 0=Sun, 6=Sat
      if (day === 0) return false;
      const mins = now.getHours() * 60 + now.getMinutes();
      if (day === 6) return mins >= 540 && mins < 1020;    // Sat: 9:00 – 17:00
      return mins >= 510 && mins < 1080;                   // Mon–Fri: 8:30 – 18:00
    }

    function buildRow(item, timeLabel) {
      const row = document.createElement('div');
      row.className = 'live-row';
      row.innerHTML =
        '<span class="status-pill ' + item.status + '">' + LABELS[item.status] + '</span>' +
        '<span class="asset">' + item.asset + '</span>' +
        '<span class="time">' + timeLabel + '</span>';
      return row;
    }

    function rotate() {
      while (feed.children.length >= 4) feed.lastElementChild.remove();
      const item = POOL[poolIdx % POOL.length]; poolIdx++;
      feed.prepend(buildRow(item, 'Just now'));
      Array.from(feed.children).forEach(function (r, i) {
        const t = r.querySelector('.time');
        if (t) t.textContent = timeFor(i);
      });
    }

    // Stamp the initial 4 static-HTML rows with randomised times on first load
    function randomiseInitialTimes() {
      Array.from(feed.children).forEach(function (r, i) {
        const t = r.querySelector('.time');
        if (t) t.textContent = timeFor(i);
      });
    }

    function renderClosed() {
      indicator.classList.add('closed');
      liveText.textContent = 'After hours';
      feed.innerHTML =
        '<div class="feed-closed">' +
          '<div class="feed-closed-icon">' +
            '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
              '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' +
            '</svg>' +
          '</div>' +
          '<div class="feed-closed-title">After hours</div>' +
          '<div class="feed-closed-msg">Log on during office hours for live updates</div>' +
          '<div class="feed-closed-hours">Mon &ndash; Fri &middot; 8:30am &ndash; 6:00pm<br>Sat &middot; 9:00am &ndash; 5:00pm</div>' +
        '</div>';
    }

    function renderOpen() {
      indicator.classList.remove('closed');
      liveText.textContent = 'Live activity';
      // rebuild initial 4 rows from the pool with fresh randomised times
      feed.innerHTML = '';
      for (let i = 0; i < 4; i++) feed.appendChild(buildRow(POOL[i], timeFor(i)));
      poolIdx = 4;
    }

    function startRotation() { stopRotation(); rotateTimer = setInterval(rotate, 12000); }
    function stopRotation()  { if (rotateTimer) { clearInterval(rotateTimer); rotateTimer = null; } }

    function applyState() {
      if (isOfficeOpen()) {
        if (indicator.classList.contains('closed')) renderOpen();
        if (!rotateTimer && !document.hidden) startRotation();
      } else {
        stopRotation();
        if (!indicator.classList.contains('closed')) renderClosed();
      }
    }

    // initial render
    if (!isOfficeOpen()) {
      renderClosed();
    } else {
      randomiseInitialTimes();
      startRotation();
    }

    // re-check every minute so the panel flips at 8:30 and 18:00 boundaries
    checkTimer = setInterval(applyState, 60000);

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopRotation();
      else if (isOfficeOpen() && !rotateTimer) startRotation();
    });
  })();

  // Loan-type pill toggle
  document.querySelectorAll('.loan-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.loan-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    });
  });

  // ---------- Amortisation schedule modal ----------
  (function () {
    const modal   = document.getElementById('sched-modal');
    const trigger = document.getElementById('open-schedule');
    const rowsEl  = document.getElementById('sched-rows');
    const summaryEl = document.getElementById('sched-summary');
    const printBtn = document.getElementById('sched-print');
    const csvBtn   = document.getElementById('sched-csv');
    if (!modal || !trigger) return;

    const fmt0 = function (n) {
      return n.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };
    const fmt2 = function (n) {
      return n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };
    const monthName = function (d) {
      return d.toLocaleString('en-AU', { month: 'short', year: 'numeric' });
    };

    let lastSchedule = null;   // cache the most recent build for CSV export

    function buildSchedule() {
      // Read live values from the calculator's sliders
      const P  = +document.getElementById('calc-amount').value;
      const years = +document.getElementById('calc-term').value;
      const annualRate = +document.getElementById('calc-rate').value;
      const residualPct = +document.getElementById('calc-residual').value;
      const FV = P * residualPct / 100;
      const n  = years * 12;
      const r  = (annualRate / 100) / 12;

      let M;
      if (r === 0) {
        M = (P - FV) / n;
      } else {
        const pow = Math.pow(1 + r, n);
        M = (P - FV / pow) * r / (1 - 1 / pow);
      }

      const rows = [];
      let balance = P;
      const startDate = new Date();
      startDate.setDate(1);
      let totalInterest = 0;
      let totalPaid = 0;

      for (let i = 1; i <= n; i++) {
        const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
        const interest = balance * r;
        let principal = M - interest;
        if (i === n) principal = balance - FV;     // snap final row to land exactly at residual
        const payment = principal + interest;
        balance -= principal;
        if (balance < 0.005) balance = 0;          // float guard
        totalInterest += interest;
        totalPaid += payment;
        // `balance` already includes the residual still owing (fix 2026-09-29: was `balance + FV`, which overstated every row by the balloon)
        rows.push({ no: i, date: d, payment: payment, principal: principal, interest: interest, balance: balance });
      }
      // Final balloon row (if residual > 0)
      if (FV > 0.005) {
        const balloonDate = new Date(startDate.getFullYear(), startDate.getMonth() + n, 1);
        rows.push({ no: n + 1, date: balloonDate, payment: FV, principal: FV, interest: 0, balance: 0, balloon: true });
        totalPaid += FV;
      } else {
        // ensure last regular row shows 0 balance not FV
        rows[rows.length - 1].balance = 0;
      }

      return {
        principal: P,
        rate: annualRate,
        years: years,
        residualPct: residualPct,
        residual: FV,
        monthly: M,
        n: n,
        rows: rows,
        totalInterest: totalInterest,
        totalPaid: totalPaid
      };
    }

    function render(s) {
      // Summary header
      summaryEl.innerHTML =
        '<div><span class="lbl">Loan amount</span><span class="val">$' + fmt0(s.principal) + '</span></div>' +
        '<div><span class="lbl">Rate p.a.</span><span class="val">' + fmt2(s.rate) + '%</span></div>' +
        '<div><span class="lbl">Term</span><span class="val">' + s.years + ' yrs</span></div>' +
        '<div><span class="lbl">Residual</span><span class="val">$' + fmt0(s.residual) + ' (' + s.residualPct + '%)</span></div>' +
        '<div><span class="lbl">Monthly</span><span class="val green">$' + fmt0(s.monthly) + '</span></div>';

      // Table rows
      rowsEl.innerHTML = s.rows.map(function (row) {
        const cls = row.balloon ? ' class="balloon"' : '';
        const label = row.balloon ? 'Balloon' : row.no;
        return '<tr' + cls + '>' +
          '<td>' + label + '</td>' +
          '<td>' + monthName(row.date) + '</td>' +
          '<td>$' + fmt2(row.payment) + '</td>' +
          '<td>$' + fmt2(row.principal) + '</td>' +
          '<td>$' + fmt2(row.interest) + '</td>' +
          '<td>$' + fmt2(Math.max(0, row.balance)) + '</td>' +
        '</tr>';
      }).join('');
    }

    function open() {
      lastSchedule = buildSchedule();
      render(lastSchedule);
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    trigger.addEventListener('click', open);
    modal.querySelectorAll('[data-sched-close]').forEach(function (el) {
      el.addEventListener('click', close);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) close();
    });

    // Print
    printBtn.addEventListener('click', function () { window.print(); });

    // CSV download
    csvBtn.addEventListener('click', function () {
      if (!lastSchedule) return;
      const head = ['Payment #', 'Date', 'Payment', 'Principal', 'Interest', 'Balance'];
      const body = lastSchedule.rows.map(function (r) {
        return [
          r.balloon ? 'Balloon' : r.no,
          monthName(r.date),
          r.payment.toFixed(2),
          r.principal.toFixed(2),
          r.interest.toFixed(2),
          Math.max(0, r.balance).toFixed(2)
        ].join(',');
      });
      // Prepend a header block describing the loan scenario
      const meta = [
        'Acquired Finance — Amortisation Schedule',
        'Loan amount,$' + lastSchedule.principal.toFixed(2),
        'Interest rate p.a.,' + lastSchedule.rate.toFixed(2) + '%',
        'Term,' + lastSchedule.years + ' years',
        'Residual,$' + lastSchedule.residual.toFixed(2) + ' (' + lastSchedule.residualPct + '%)',
        'Monthly payment,$' + lastSchedule.monthly.toFixed(2),
        'Total interest,$' + lastSchedule.totalInterest.toFixed(2),
        'Total repaid,$' + lastSchedule.totalPaid.toFixed(2),
        '',
        head.join(',')
      ].join('\n');
      const csv = meta + '\n' + body.join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'acquired-finance-schedule.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  })();

  // ---------- Legal / document modals (Privacy Policy etc.) ----------
  (function () {
    const modals = {
      privacy: document.getElementById('privacy-modal')
    };

    function open(key) {
      const m = modals[key];
      if (!m) return;
      m.classList.add('open');
      m.setAttribute('aria-hidden', 'false');
      // ensure body scroll is locked (works even if another modal already locked it)
      document.body.style.overflow = 'hidden';
      // scroll modal body to top each time
      const body = m.querySelector('.doc-modal-body');
      if (body) body.scrollTop = 0;
    }
    function close(m) {
      m.classList.remove('open');
      m.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    // Triggers: any link/button with data-doc="<key>"
    document.querySelectorAll('[data-doc]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        open(el.dataset.doc);
      });
    });

    // Closes: backdrop, close button, anything with data-close inside a doc-modal
    Object.values(modals).forEach(function (m) {
      if (!m) return;
      m.querySelectorAll('[data-close]').forEach(function (el) {
        el.addEventListener('click', function () { close(m); });
      });
    });

    // Escape closes whichever doc modal is open
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      Object.values(modals).forEach(function (m) {
        if (m && m.classList.contains('open')) close(m);
      });
    });
  })();

  // Quote enquiry modal — opens the finance enquiry iframe as a centered overlay
  (function () {
    const modal    = document.getElementById('quote-modal');
    const backdrop = document.getElementById('quote-modal-backdrop');
    const closeBtn = document.getElementById('quote-modal-close');
    const iframe   = document.getElementById('quote-modal-iframe');
    const trigger  = document.getElementById('quote-start');
    if (!modal || !iframe) return;

    let loaded = false;

    function open() {
      // load the iframe lazily on first open
      if (!loaded) {
        iframe.src = iframe.dataset.src;
        loaded = true;
      }
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';   // lock background scroll
    }
    function close() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    // Open from the compact card's "Start my quote" button
    if (trigger) trigger.addEventListener('click', open);

    // Open from any other in-page link/button pointing at #quote
    // (hero "Get my quote", header "Get a quote", finance modals' "Get my quote", calc CTA)
    document.querySelectorAll('a[href="#quote"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        open();
      });
    });

    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) close();
    });
  })();

  // Lender marquee — inject two copies of the logo set for a seamless infinite scroll
  const LENDERS = [
    ['westpac', 'Westpac'],
    ['anz', 'ANZ'],
    ['nab', 'NAB'],
    ['commonwealth-bank', 'Commonwealth Bank'],
    ['macquarie', 'Macquarie'],
    ['bank-of-melbourne', 'Bank of Melbourne'],
    ['boq', 'Bank of Queensland'],
    ['alex-bank', 'alex.bank'],
    ['peppermoney', 'Pepper Money'],
    ['liberty', 'Liberty'],
    ['latitude', 'Latitude'],
    ['plenti', 'Plenti'],
    ['firstmac', 'Firstmac'],
    ['resimac', 'Resimac'],
    ['now-finance', 'Now Finance'],
    ['wisr', 'Wisr'],
    ['moneyme-autopay', 'MoneyMe Autopay'],
    ['moneyplace', 'MoneyPlace'],
    ['societyone', 'SocietyOne'],
    ['financeone', 'Finance One'],
    ['money3', 'Money3'],
    ['salt-and-lime', 'Salt & Lime'],
    ['racv', 'RACV'],
    ['angle-auto-finance', 'Angle Auto Finance'],
    ['affordable-car-loans', 'Affordable Car Loans'],
    ['greenlight', 'GreenLight'],
    ['carstart', 'Carstart'],
    ['branded-financial', 'Branded Financial'],
    ['ammf', 'AMMF'],
    ['afs-automotive', 'AFS Automotive'],
    ['une-loans', 'Une Loans'],
    ['capital-finance', 'Capital Finance'],
    ['flexicommercial', 'Flexicommercial'],
    ['selfco-leasing', 'Selfco Leasing'],
    ['azora', 'Azora'],
    ['morris', 'Morris'],
    ['australian-premier-finance', 'Australian Premier Finance'],
    ['asset-financier', 'The Asset Financier'],
    ['maple', 'Maple'],
    ['grenke', 'Grenke'],
    ['moula', 'Moula'],
    ['bizcap', 'Bizcap'],
    ['banjo', 'Banjo'],
    ['prospa', 'Prospa'],
    ['scotpac', 'ScotPac'],
    ['dynamoney', 'Dynamoney'],
    ['shift', 'Shift'],
    ['metro', 'Metro'],
    ['multipli', 'Multipli'],
    ['earlypay', 'Earlypay'],
    ['rapid', 'Rapid']
  ];

  const track = document.getElementById('lenders-track');
  if (track) {
    // build one set of <img>s as an HTML string, then drop it in twice so the loop is seamless
    const imgsHtml = LENDERS.map(([slug, name]) =>
      `<img class="lender-logo" src="{{ASSETS}}/lenders/${slug}.png" alt="${name}" loading="lazy" />`
    ).join('');
    track.innerHTML = imgsHtml + imgsHtml;
  }

  // Repayment calculator
  (function () {
    const amountEl   = document.getElementById('calc-amount');
    const termEl     = document.getElementById('calc-term');
    const rateEl     = document.getElementById('calc-rate');
    const residualEl = document.getElementById('calc-residual');
    if (!amountEl) return;

    // matching editable text inputs
    const amountIn   = document.getElementById('val-amount');
    const termIn     = document.getElementById('val-term');
    const rateIn     = document.getElementById('val-rate');
    const residualIn = document.getElementById('val-residual-pct');

    const fmt  = n => Math.round(n).toLocaleString('en-AU');
    const fmt2 = n => n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // write a value into an input ONLY if the user isn't currently typing in it
    function setIfNotFocused(el, value) {
      if (document.activeElement !== el) el.value = value;
    }

    function paintTrack(el) {
      const min = +el.min, max = +el.max, val = +el.value;
      const pct = ((val - min) / (max - min)) * 100;
      el.style.background =
        `linear-gradient(to right, var(--green) 0%, var(--green) ${pct}%, var(--grey-100) ${pct}%, var(--grey-100) 100%)`;
    }

    function recalc() {
      const P           = +amountEl.value;
      const years       = +termEl.value;
      const annualRate  = +rateEl.value / 100;
      const residualPct = +residualEl.value;
      const FV          = P * residualPct / 100;
      const n           = years * 12;
      const r           = annualRate / 12;

      // Amortisation with future-value (balloon): M = (P - FV/(1+r)^n) * r / (1 - (1+r)^-n)
      let monthly;
      if (r === 0) {
        monthly = (P - FV) / n;
      } else {
        const pow = Math.pow(1 + r, n);
        monthly = (P - FV / pow) * r / (1 - 1 / pow);
      }

      // mirror slider values into the editable inputs (only when user isn't typing in them)
      setIfNotFocused(amountIn,   fmt(P));
      setIfNotFocused(termIn,     String(years));
      setIfNotFocused(rateIn,     fmt2(+rateEl.value));
      setIfNotFocused(residualIn, String(residualPct));
      document.getElementById('val-residual-amt').textContent = fmt(FV);

      document.getElementById('res-monthly').textContent     = fmt(monthly);
      document.getElementById('res-weekly').textContent      = fmt(monthly * 12 / 52);
      document.getElementById('res-fortnightly').textContent = fmt(monthly * 12 / 26);
      document.getElementById('res-residual').textContent    = fmt(FV);

      [amountEl, termEl, rateEl, residualEl].forEach(paintTrack);
    }

    // ----- slider drag -> recalc -----
    [amountEl, termEl, rateEl, residualEl].forEach(el => el.addEventListener('input', recalc));

    // Loan amount: dragging the slider snaps to $50; typing a figure keeps it exact to the dollar
    // (the slider itself has step="1" so typed values aren't rounded).
    const AMOUNT_DRAG_STEP = 50;
    amountEl.addEventListener('input', () => {
      amountEl.value = Math.round(+amountEl.value / AMOUNT_DRAG_STEP) * AMOUNT_DRAG_STEP;
      recalc();
    });

    // ----- typing into a value field -> sync to slider -----
    function bindInput(input, slider, opts) {
      const { integer = false, parse } = opts || {};
      const parseFn = parse || (s => parseFloat(String(s).replace(/[^\d.\-]/g, '')));

      // while typing: if parsed value is within range, drive the slider live
      input.addEventListener('input', () => {
        const num = parseFn(input.value);
        if (isNaN(num)) return;
        const v = integer ? Math.round(num) : num;
        if (v >= +slider.min && v <= +slider.max) {
          slider.value = v;
          recalc();
        }
      });

      // on blur / Enter: clamp to range, reformat, finalise
      const finalise = () => {
        let num = parseFn(input.value);
        if (isNaN(num)) num = +slider.value;
        if (integer) num = Math.round(num);
        num = Math.max(+slider.min, Math.min(+slider.max, num));
        // snap to slider step
        const step = +slider.step || 1;
        num = Math.round(num / step) * step;
        slider.value = num;
        input.blur();   // ensure recalc reformats the input
        recalc();
      };
      input.addEventListener('blur', finalise);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); finalise(); }
      });
      // select-all on focus for easy overwrite
      input.addEventListener('focus', () => input.select());
    }

    bindInput(amountIn,   amountEl,   { integer: true });
    bindInput(termIn,     termEl,     { integer: true });
    bindInput(rateIn,     rateEl,     {});
    bindInput(residualIn, residualEl, { integer: true });

    recalc();
  })();

  // ---------- Finance category modal ----------
  (function () {
    const modal    = document.getElementById('finance-modal');
    const backdrop = document.getElementById('finance-modal-backdrop');
    const closeBtn = document.getElementById('finance-modal-close');
    const content  = document.getElementById('finance-modal-content');
    if (!modal) return;

    const FINANCE = {
      vehicle: {
        bg: 'cards/vehicle.jpg',
        eyebrow: 'Vehicle Finance',
        title: 'Get the keys without the <span class="accent">dealership runaround.</span>',
        body: "Whether you're chasing a new SUV, a clean second-hand ute or a private-sale weekend toy &mdash; we'll shop 63+ bank and non-bank lenders to find the right loan, then handle the paperwork so you don't have to.",
        list: ['New &amp; used cars', 'Vans, SUVs, utes', 'Dealer &amp; private sales', 'EVs and hybrids', 'Imports &amp; modifieds', 'Refinances'],
        footnote: 'Pre-approval in under an hour, valid for up to 90 days. Use it to negotiate harder.'
      },
      marine: {
        bg: 'cards/marine.jpg',
        eyebrow: 'Marine Finance',
        title: 'Get on the <span class="accent">water faster.</span>',
        body: "From your first tinnie to a wakeboard boat, jet ski or full bluewater setup &mdash; we know which lenders fund what, and which ones won't waste your time. Flexible terms designed around the weekend, not the dealership.",
        list: ['Jet skis &amp; PWCs', 'Tinnies &amp; runabouts', 'Wakeboard &amp; ski boats', 'Yachts &amp; cruisers', 'Fishing boats &amp; tenders', 'Trailers &amp; outboards'],
        footnote: 'Boat shows, online listings, dealer or private sale &mdash; we settle anywhere.'
      },
      caravan: {
        bg: 'cards/caravan.jpg',
        eyebrow: 'Caravan Finance',
        title: 'Built for the <span class="accent">long road.</span>',
        body: "Whether you're upgrading to a new family van, eyeing an off-road camper, or finally pulling the trigger on that motorhome &mdash; we'll match you with lenders that get caravan finance. No square-peg-round-hole nonsense.",
        list: ['Caravans (new &amp; used)', 'Camper trailers', 'Off-road campers', 'Motorhomes', 'Pop-tops &amp; slide-ons', 'Tow-vehicle packages'],
        footnote: 'Accessories &mdash; annexes, solar, lithium &mdash; can bundle into one loan.'
      },
      business: {
        bg: 'cards/business.jpg',
        eyebrow: 'Business Finance',
        title: 'Working capital <span class="accent">that actually works.</span>',
        body: "From the day-to-day cashflow squeeze to that piece of kit that'll pay for itself in six months &mdash; we've got specialist lenders for every ABN, every industry, every age of business.",
        list: ['Equipment &amp; machinery', 'Commercial vehicles', 'Working capital, overdrafts &amp; cashflow', 'Chattel mortgages &amp; commercial leases', 'Invoice &amp; debtor finance', 'Insurance premium funding'],
        footnote: 'Low-doc from 6 months ABN. Established business? Even faster.'
      },
      equipment: {
        bg: 'cards/equipment.jpg',
        eyebrow: 'Equipment & Machinery',
        title: 'The gear that <span class="accent">gets the job done.</span>',
        body: "Skid steers, excavators, tippers, forklifts, manufacturing kit, IT infrastructure &mdash; if your business runs on it, we can finance it. Structured to suit the asset's life and your cashflow.",
        list: ['Earthmoving &amp; yellow goods', 'Forklifts &amp; warehouse gear', 'Manufacturing machinery', 'Trade tools &amp; equipment', 'Hospitality &amp; refrigeration', 'IT &amp; office equipment'],
        footnote: 'New, used or refinance. Tight deadline? We move fast.'
      },
      truck: {
        bg: 'cards/truck.jpg',
        eyebrow: 'Truck & Trailer Finance',
        title: 'Owner-operators <span class="accent">welcome.</span>',
        body: "Light rigid to B-double &mdash; we know the lenders that actually do truck deals, not just the ones who claim they do. Whether you're solo or growing a fleet, we'll structure it around your contract income and your hours.",
        list: ['Light, medium &amp; heavy rigids', 'Prime movers', 'B-doubles &amp; B-trailers', 'Tippers, tankers, specialty', 'Refrigerated transport', 'Owner-driver &amp; small fleet'],
        footnote: 'New ABN? Recent move to owner-driver? Bring the contracts &mdash; we work with what you have.'
      },
      personal: {
        bg: 'cards/personal.jpg',
        eyebrow: 'Personal Finance',
        title: 'Honest advice on the <span class="accent">right product.</span>',
        body: "Holiday, wedding, debt consolidation, home renovation, medical expenses &mdash; whatever the reason, we'll tell you straight whether borrowing makes sense and which lender's the best fit. No pressure to proceed.",
        list: ['Holidays &amp; travel', 'Weddings', 'Home renovations', 'Debt consolidation', 'Medical &amp; dental', 'Major purchases'],
        footnote: 'Secured or unsecured. Terms from 1 to 7 years. Talk to us before you accept the bank&rsquo;s offer.'
      },
      insurance: {
        bg: 'cards/insurance.jpg',
        eyebrow: 'Insurance & Warranty',
        title: "Two trusted providers, <span class=\"accent\">complete cover.</span>",
        body: "When it comes to protecting your asset &mdash; or anything else you own &mdash; we point our clients to two independent specialist providers. <strong>Warranty Hub</strong> (warrantyhub.com.au) is a dedicated extended-warranty specialist covering vehicles, marine, caravans, motorhomes and machinery. <strong>Acquired Insurance Brokers</strong> (acquiredinsurance.com.au) is a general insurance brokerage handling every personal and business insurance need. Each operates independently with its own team, cover options, policies and claims process.",
        lists: [
          { head: 'What Warranty Hub covers', items: [
              'Vehicle extended warranty',
              'Marine &amp; jet ski warranty',
              'Caravan, motorhome &amp; RV warranty',
              'Equipment &amp; machinery warranty',
              'Mechanical breakdown cover',
              'Transferable on resale'
            ]
          },
          { head: 'What Acquired Insurance covers', items: [
              'Home, contents &amp; landlord',
              'Motor, caravan, marine &amp; travel',
              'Commercial property &amp; business interruption',
              'Public, product &amp; professional liability',
              'Fleet, cyber &amp; cargo',
              'Trade-specific &amp; specialty cover'
            ]
          }
        ],
        footnote: 'Both providers manage their own quotes, policies and claims independently. Visit either site directly to enquire.',
        ctas: [
          { label: 'Visit Warranty Hub',        href: 'https://www.warrantyhub.com.au',      style: 'primary' },
          { label: 'Visit Acquired Insurance',  href: 'https://www.acquiredinsurance.com.au', style: 'dark' }
        ]
      }
    };

    // Preload every category's hero image as soon as the page is interactive.
    // Without this, the first time a card is clicked the modal animates in BEFORE the
    // background-image has finished downloading — so the image flashes in late, or on
    // a slow connection appears not to show at all. After preload, the browser already
    // has each image cached, so the modal renders it instantly every time.
    (function preloadFinanceImages() {
      Object.keys(FINANCE).forEach(function (key) {
        const img = new Image();
        img.src = FINANCE[key].bg;
      });
    })();

    function buildContent(key) {
      const d = FINANCE[key];
      if (!d) return '';
      // pull the matching SVG icon from the card that owns this button
      const card = document.querySelector('[data-finance="' + key + '"]').closest('.finance-card');
      const iconHTML = card && card.querySelector('.finance-icon') ? card.querySelector('.finance-icon').innerHTML : '';
      // Normalise to an array of { head, items } blocks so a single tile can have
      // either one list ("What we finance") or multiple grouped lists.
      const blocks = d.lists ? d.lists
                              : [{ head: d.listhead || 'What we finance', items: d.list }];
      const listsHTML = blocks.map(function (b) {
        return '<div class="finance-modal-listhead">' + b.head + '</div>' +
               '<ul class="finance-modal-list">' +
                 b.items.map(function (i) { return '<li>' + i + '</li>'; }).join('') +
               '</ul>';
      }).join('');

      // CTAs: each FINANCE entry can override the default "Get my quote + Call" pair
      // by providing its own `ctas` array. Used by Insurance & Warranty to link out
      // to the independent partner sites Warranty Hub and Acquired Insurance Brokers.
      const arrowSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
      const extSvg   = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left:6px;"><path d="M15 3h6v6"/><path d="M10 14L21 3"/><path d="M21 13v8H3V3h8"/></svg>';
      let ctasHTML;
      if (Array.isArray(d.ctas) && d.ctas.length) {
        ctasHTML = d.ctas.map(function (c) {
          const isExternal = /^https?:/i.test(c.href);
          const cls = 'btn btn-' + (c.style || 'primary') + ' btn-lg';
          const target = isExternal ? ' target="_blank" rel="noopener"' : '';
          const icon = isExternal ? extSvg : arrowSvg;
          return '<a href="' + c.href + '"' + target + ' class="' + cls + '">' + c.label + icon + '</a>';
        }).join('');
      } else {
        ctasHTML =
          '<a href="#quote" class="btn btn-primary btn-lg" data-quote-cta>Get my quote' + arrowSvg + '</a>' +
          '<a href="tel:1300235255" class="btn btn-dark btn-lg">Call 1300 235 255</a>';
      }

      return (
        '<div class="finance-modal-hero" style="background-image: url(\'' + d.bg + '\')">' +
          '<div class="finance-icon">' + iconHTML + '</div>' +
        '</div>' +
        '<div class="finance-modal-body">' +
          '<span class="finance-modal-eyebrow">' + d.eyebrow + '</span>' +
          '<h3 class="finance-modal-title" id="finance-modal-title">' + d.title + '</h3>' +
          '<p>' + d.body + '</p>' +
          listsHTML +
          '<p class="finance-modal-footnote">' + d.footnote + '</p>' +
          '<div class="finance-modal-ctas">' + ctasHTML + '</div>' +
        '</div>'
      );
    }

    function open(key) {
      content.innerHTML = buildContent(key);
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      // Wire the inner "Get my quote" CTA: close this modal, then open the quote modal
      const inner = content.querySelector('[data-quote-cta]');
      if (inner) {
        inner.addEventListener('click', function (e) {
          e.preventDefault();
          close();
          setTimeout(function () {
            const trigger = document.getElementById('quote-start');
            if (trigger) trigger.click();
          }, 200);
        });
      }
    }

    function close() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    document.querySelectorAll('[data-finance]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        open(btn.dataset.finance);
      });
    });
    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) close();
    });
  })();
