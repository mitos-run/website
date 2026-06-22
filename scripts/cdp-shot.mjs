// Reliable viewport screenshots via Chrome DevTools Protocol.
// Requires a Chrome started with --remote-debugging-port=9222.
// Usage: node scripts/cdp-shot.mjs <width> <out.png> [url]
import fs from 'node:fs';

const width = parseInt(process.argv[2] || '390', 10);
const out = process.argv[3] || '/tmp/cdp.png';
const url = process.argv[4] || 'http://localhost:4321/';

const tabs = await (await fetch('http://localhost:9222/json')).json();
const page = tabs.find((t) => t.type === 'page') || tabs[0];
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const send = (method, params) =>
  new Promise((res) => {
    const i = ++id;
    const h = (e) => {
      const d = JSON.parse(e.data);
      if (d.id === i) { ws.removeEventListener('message', h); res(d.result); }
    };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ id: i, method, params }));
  });

await new Promise((r) => ws.addEventListener('open', r, { once: true }));
await send('Page.enable', {});
await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 2, mobile: width < 900 });
await send('Page.navigate', { url });
await new Promise((r) => setTimeout(r, 2600)); // let fonts + reveals settle
// measure full content height + horizontal overflow
const m = await send('Runtime.evaluate', {
  expression: 'JSON.stringify({h:document.documentElement.scrollHeight,doc:document.documentElement.scrollWidth,iw:innerWidth})',
  returnByValue: true,
});
const info = JSON.parse(m.result.value);
await send('Emulation.setDeviceMetricsOverride', { width, height: Math.min(info.h, 20000), deviceScaleFactor: 2, mobile: width < 900 });
await new Promise((r) => setTimeout(r, 400));
const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
fs.writeFileSync(out, Buffer.from(shot.data, 'base64'));
console.log(`saved ${out}  viewport=${info.iw}px  docWidth=${info.doc}px  ${info.doc > info.iw ? 'HORIZONTAL OVERFLOW!' : 'no overflow'}  height=${info.h}px`);
ws.close();
process.exit(0);
