/*
 app.js - Vercel-friendly frontend
 - Cria UI automática se não houver elementos existentes
 - Chama /api/gemini?text=... ou /api/grok?text=...
 - Exibe resposta (JSON) em campo de resultado
*/

(function () {
  // util
  const $ = (sel) => document.querySelector(sel);

  // try find existing container; if not, create one
  let container = $('.opusclip-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'container opusclip-container';
    container.innerHTML = `
      <h1>OpusClip — Vercel (Gemini / Grok)</h1>
      <p class="small">Cole a transcrição ou um texto (ex.: fala do vídeo) e escolha a API. A API deve estar implementada em /api/gemini e /api/grok.</p>

      <div class="controls">
        <div class="row" style="flex:1 1 200px;">
          <label for="apiSelect" class="small" style="margin-right:8px;">API:</label>
          <select id="apiSelect">
            <option value="gemini">Gemini</option>
            <option value="grok">Grok</option>
          </select>
        </div>
        <div style="flex:1 1 200px;">
          <button id="btnGenerate">Gerar cortes / análise</button>
          <button id="btnGeneratePOST" class="secondary">(POST)</button>
        </div>
      </div>

      <div style="margin-top:12px;">
        <textarea id="inputText" placeholder="Cole a transcrição/texto do vídeo aqui (ou cole um trecho)."></textarea>
      </div>

      <div class="row" style="margin-top:10px;">
        <button id="btnShort" class="secondary">Sugestão Rápida (ex.: 0-15s)</button>
        <div class="small" style="margin-left:8px;">ou envie texto e clique em <b>Gerar cortes</b>.</div>
      </div>

      <div id="result" class="result" aria-live="polite">Resultado aparecerá aqui...</div>
      <div id="log" class="log" style="display:none"></div>
    `;
    document.body.prepend(container);
  }

  // elements
  const apiSelect = $('#apiSelect');
  const inputText = $('#inputText');
  const btnGenerate = $('#btnGenerate');
  const btnGeneratePOST = $('#btnGeneratePOST');
  const btnShort = $('#btnShort');
  const result = $('#result');
  const log = $('#log');

  function showResult(obj) {
    if (!obj) {
      result.textContent = 'Resposta vazia';
      return;
    }
    if (typeof obj === 'string') {
      // try parse as JSON
      try { const j = JSON.parse(obj); result.textContent = JSON.stringify(j, null, 2); return; } catch {}
      result.textContent = obj;
      return;
    }
    result.textContent = JSON.stringify(obj, null, 2);
  }
  function showLog(txt) { log.style.display = 'block'; log.textContent = txt; }

  async function callProviderGET(provider, text) {
    if (!text) { showLog('Coloque um texto / transcrição no campo.'); return; }
    showLog(`Chamando /api/${provider} (GET)...`);
    try {
      const resp = await fetch(`/api/${provider}?text=${encodeURIComponent(text)}`);
      const data = await resp.json();
      showResult(data);
      showLog(`/api/${provider} retornou (status ${resp.status})`);
    } catch (err) {
      showLog('Erro fetch: ' + (err.message || err));
    }
  }

  async function callProviderPOST(provider, text) {
    if (!text) { showLog('Coloque um texto / transcrição no campo.'); return; }
    showLog(`Chamando /api/${provider} (POST)...`);
    try {
      const resp = await fetch(`/api/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await resp.json();
      showResult(data);
      showLog(`/api/${provider} retornou (status ${resp.status})`);
    } catch (err) {
      showLog('Erro fetch: ' + (err.message || err));
    }
  }

  // quick suggestion example
  btnShort.addEventListener('click', () => {
    inputText.value = `Sugira até 5 trechos curtos (em segundos: inicio,fim) ideais para reels ou shorts. Seja objetivo.`;
    showLog('Texto preenchido com sugestão rápida. Clique em Gerar.');
  });

  btnGenerate.addEventListener('click', async () => {
    const provider = apiSelect.value || 'gemini';
    const text = inputText.value.trim();
    await callProviderGET(provider, text);
  });

  btnGeneratePOST.addEventListener('click', async () => {
    const provider = apiSelect.value || 'gemini';
    const text = inputText.value.trim();
    await callProviderPOST(provider, text);
  });

  // If index.html already provided elements like file upload, keep compatibility:
  // If developer added #uploadBtn and #fileInput, attach basic handlers (no firebase here).
  const uploadBtn = $('#uploadBtn');
  const fileInput = $('#fileInput');
  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener('click', () => {
      const f = fileInput.files && fileInput.files[0];
      if (!f) { showLog('Selecione um arquivo para enviar.'); return; }
      showLog('Upload local detectado. Use seu storage (S3/Cloud) ou configure backend para receber o arquivo.');
      // We don't implement direct upload here; keep as hint for user.
    });
  }

  // finished
  showLog('Frontend pronto — escolha a API e cole o texto.');
})();
