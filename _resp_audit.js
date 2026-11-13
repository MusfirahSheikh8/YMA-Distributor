const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9223;
const pages = [
  'index.html',
  'cart.html',
  'checkout.html',
  'pages/contact.html',
  'collections/all.html',
  'products/blue-buffalo-life-protection-formula-adult-dog-food-natural-chicken-recipe.html'
];
const widths = [320, 375, 768, 1024, 1280];

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const userDir = path.join(process.env.TEMP, 'chrome-resp-audit');
  const chrome = spawn(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--disable-extensions',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${userDir}`,
    'about:blank'
  ], { stdio: 'ignore' });

  let targets;
  for (let i = 0; i < 30; i++) {
    try {
      targets = JSON.parse(await get(`http://127.0.0.1:${PORT}/json`));
      if (targets.length) break;
    } catch {}
    await sleep(300);
  }
  if (!targets || !targets.length) {
    console.error('no targets');
    chrome.kill();
    process.exit(1);
  }
  const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.addEventListener('open', res);
    ws.addEventListener('error', rej);
  });
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  });
  function send(method, params = {}) {
    const my = ++id;
    return new Promise((resolve) => {
      pending.set(my, resolve);
      ws.send(JSON.stringify({ id: my, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  const expr = `(() => {
    const vw = document.documentElement.clientWidth;
    const sw = document.documentElement.scrollWidth;
    const offenders = [];
    const all = document.querySelectorAll('body *');
    for (const el of all) {
      const r = el.getBoundingClientRect();
      if (r.width < 8 || r.height < 8) continue;
      if (r.right > vw + 8 || r.left < -8) {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        if (cs.position === 'fixed' && (r.left < -100 || r.right > vw + 200)) continue;
        offenders.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className && typeof el.className === 'string' ? el.className : '').slice(0, 90),
          w: Math.round(r.width),
          l: Math.round(r.left),
          r: Math.round(r.right)
        });
        if (offenders.length > 15) break;
      }
    }
    const desk = document.querySelector('.tt-desktop-header');
    const mob = document.querySelector('.tt-mobile-header');
    const hero = document.querySelector('.hero-slider-standalone');
    const cat = document.querySelector('.categories-sidebar-box');
    return {
      inner: window.innerWidth,
      vw, sw, overflow: sw - vw,
      desktop: desk ? getComputedStyle(desk).display : null,
      mobile: mob ? getComputedStyle(mob).display : null,
      heroH: hero ? Math.round(hero.getBoundingClientRect().height) : null,
      cat: cat ? getComputedStyle(cat.parentElement).display : null,
      offenders
    };
  })()`;

  const report = {};
  for (const page of pages) {
    report[page] = {};
    for (const w of widths) {
      await send('Emulation.setDeviceMetricsOverride', {
        width: w,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false
      });
      const nav = await send('Page.navigate', { url: `http://127.0.0.1:8765/${page}` });
      await sleep(1800);
      const ev = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
      report[page][w] = ev.result && ev.result.result ? ev.result.result.value : ev;
    }
  }

  fs.writeFileSync(path.join(__dirname, '_resp_report.json'), JSON.stringify(report, null, 2));
  console.log('wrote report');
  chrome.kill();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
