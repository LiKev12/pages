/* Lightweight client-side password gate for the pages site.
   NOTE: obscurity only — these are static, public files, so the content and this
   hash are fetchable from the repo and a 6-digit PIN is brute-forceable. It just
   stops casual visitors from browsing. Enter once -> unlocked for all pages (localStorage). */
(function () {
  var HASH = '8fd5b48f3822dd9b7626f16b411dbc3aec05fd594db0fd9d603d4fdb8a65c173'; // sha256("898989")
  var KEY = 'kp_unlock';
  function unlocked() { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } }
  if (unlocked()) return;

  var de = document.documentElement;
  de.classList.add('kp-gated');
  var st = document.createElement('style');
  st.textContent =
    'html.kp-gated{overflow:hidden}' +
    'html.kp-gated body>*:not(#kp-gate){visibility:hidden!important}' +
    '#kp-gate{position:fixed;inset:0;z-index:2147483647;background:#0e1511;display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,Segoe UI,sans-serif}' +
    '#kp-gate form{background:#161f19;border:1px solid #293a31;border-radius:14px;padding:28px;width:88%;max-width:300px;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.5)}' +
    '#kp-gate h3{color:#e6eee9;font-size:15px;font-weight:700;margin:0 0 14px}' +
    '#kp-gate input{width:100%;box-sizing:border-box;padding:11px;border-radius:8px;border:1px solid #293a31;background:#0e1511;color:#e6eee9;font-size:16px;text-align:center;letter-spacing:4px;outline:none}' +
    '#kp-gate input:focus{border-color:#168653}' +
    '#kp-gate .err{color:#f0756c;font-size:12px;height:15px;margin-top:7px}' +
    '#kp-gate button{margin-top:4px;width:100%;padding:11px;border:0;border-radius:8px;background:#168653;color:#fff;font-weight:700;font-size:14px;cursor:pointer}';
  de.appendChild(st);

  function hex(buf) {
    return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }
  function build() {
    var g = document.createElement('div');
    g.id = 'kp-gate';
    g.innerHTML =
      '<form autocomplete="off"><h3>🔒 Enter password</h3>' +
      '<input id="kp-in" type="password" inputmode="numeric" autocomplete="off" aria-label="password">' +
      '<div class="err" id="kp-err"></div>' +
      '<button type="submit">Enter</button></form>';
    document.body.appendChild(g);
    var inp = g.querySelector('#kp-in');
    try { inp.focus(); } catch (e) {}
    g.querySelector('form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var v = (inp.value || '').trim();
      var err = document.getElementById('kp-err');
      if (!window.crypto || !crypto.subtle) { err.textContent = 'Unsupported browser'; return; }
      crypto.subtle.digest('SHA-256', new TextEncoder().encode(v)).then(function (buf) {
        if (hex(buf) === HASH) {
          try { localStorage.setItem(KEY, '1'); } catch (e) {}
          var gg = document.getElementById('kp-gate'); if (gg) gg.remove();
          de.classList.remove('kp-gated');
        } else { err.textContent = 'Wrong password'; inp.value = ''; inp.focus(); }
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
