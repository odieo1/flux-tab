// src/frontend.ts
var STYLE_OPTIONS = ["Photo-realistic", "vintage", "3d", "cartoon"];
function setup(ctx) {
  const removeStyle = ctx.dom.addStyle(`
    .perflux-shell{padding:16px;color:var(--lumiverse-text,inherit)}
    .perflux-card{background:var(--lumiverse-fill-subtle);border:1px solid var(--lumiverse-border);border-radius:var(--lumiverse-radius);padding:16px;display:grid;gap:12px}
    .perflux-title{font-size:20px;font-weight:700;margin:0}
    .perflux-sub{font-size:12px;color:var(--lumiverse-text-muted)}
    .perflux-grid{display:grid;gap:12px}
    .perflux-row{display:grid;grid-template-columns:1fr 160px 120px 140px;gap:12px;align-items:end}
    .perflux-field{display:grid;gap:6px}
    .perflux-label{font-size:12px;color:var(--lumiverse-text-muted)}
    .perflux-textarea,.perflux-input,.perflux-select{width:100%;background:var(--lumiverse-fill);color:var(--lumiverse-text,inherit);border:1px solid var(--lumiverse-border);border-radius:var(--lumiverse-radius);padding:10px 12px}
    .perflux-textarea{min-height:150px;resize:vertical}
    .perflux-actions{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
    .perflux-btn{padding:10px 18px;border-radius:var(--lumiverse-radius);background:var(--lumiverse-accent, #4f46e5);color:white;border:none;font-weight:600}
    .perflux-status{font-size:13px;color:var(--lumiverse-text-muted);min-height:20px}
    .perflux-gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
    .perflux-item{background:var(--lumiverse-fill-subtle);border:1px solid var(--lumiverse-border);border-radius:calc(var(--lumiverse-radius) + 2px);overflow:hidden}
    .perflux-frame{aspect-ratio:1/1;background:var(--lumiverse-fill);display:grid;place-items:center;position:relative}
    .perflux-frame img{width:100%;height:100%;object-fit:cover;display:block}
    .perflux-meta{padding:10px;display:grid;gap:8px}
    .perflux-seed{font-size:12px;color:var(--lumiverse-text-muted)}
    .perflux-download{display:inline-flex;justify-content:center;align-items:center;padding:8px 10px;border:1px solid var(--lumiverse-border);border-radius:var(--lumiverse-radius);text-decoration:none;color:inherit}
    .perflux-skeleton{width:100%;height:100%;background:linear-gradient(90deg,var(--lumiverse-fill-subtle) 25%,var(--lumiverse-fill) 50%,var(--lumiverse-fill-subtle) 75%);background-size:200% 100%;animation:perflux-shimmer 1.3s infinite}
    .perflux-lightbox{position:fixed;inset:0;background:rgba(0,0,0,.82);display:none;align-items:center;justify-content:center;padding:24px;z-index:9999}
    .perflux-lightbox.open{display:flex}
    .perflux-lightbox img{max-width:min(92vw,1200px);max-height:90vh;border-radius:12px}
    .perflux-close{position:absolute;top:18px;right:18px;background:rgba(255,255,255,.16);color:white;border:1px solid rgba(255,255,255,.24);border-radius:999px;padding:10px 12px}
    @keyframes perflux-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
    @media (max-width: 900px){.perflux-row{grid-template-columns:1fr 1fr}.perflux-row .perflux-field:first-child{grid-column:1/-1}}
    @media (max-width: 560px){.perflux-row{grid-template-columns:1fr}}
  `);
  ctx.dom.inject("body", `
    <div class="perflux-shell">
      <div class="perflux-card">
        <h2 class="perflux-title">PerFlux</h2>
        <div class="perflux-sub">Flux image generation through Pollinations.</div>
        <div class="perflux-grid">
          <div class="perflux-field">
            <label class="perflux-label" for="perflux-prompt">Prompt</label>
            <textarea id="perflux-prompt" class="perflux-textarea" placeholder="Describe the image you want to generate"></textarea>
          </div>
          <div class="perflux-row">
            <div class="perflux-field">
              <label class="perflux-label" for="perflux-seed">Seed</label>
              <input id="perflux-seed" class="perflux-input" type="number" placeholder="Optional seed" />
            </div>
            <div class="perflux-field">
              <label class="perflux-label" for="perflux-style">Style</label>
              <select id="perflux-style" class="perflux-select">
                ${STYLE_OPTIONS.map((option) => `<option value="${option}">${option}</option>`).join("")}
              </select>
            </div>
            <div class="perflux-field">
              <label class="perflux-label" for="perflux-count">Photos</label>
              <select id="perflux-count" class="perflux-select">
                ${Array.from({ length: 6 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join("")}
              </select>
            </div>
            <div class="perflux-field">
              <label class="perflux-label" for="perflux-key">API key</label>
              <input id="perflux-key" class="perflux-input" type="password" placeholder="Optional session key" />
            </div>
          </div>
          <div class="perflux-actions">
            <button id="perflux-generate" class="perflux-btn">Generate</button>
            <div id="perflux-status" class="perflux-status"></div>
          </div>
          <div id="perflux-gallery" class="perflux-gallery"></div>
        </div>
      </div>
      <div id="perflux-lightbox" class="perflux-lightbox" aria-hidden="true">
        <button id="perflux-close" class="perflux-close" aria-label="Close image preview">Close</button>
        <img id="perflux-lightbox-image" alt="Generated image preview" />
      </div>
    </div>
  `);
  const promptEl = ctx.dom.query("#perflux-prompt");
  const seedEl = ctx.dom.query("#perflux-seed");
  const styleEl = ctx.dom.query("#perflux-style");
  const countEl = ctx.dom.query("#perflux-count");
  const keyEl = ctx.dom.query("#perflux-key");
  const buttonEl = ctx.dom.query("#perflux-generate");
  const statusEl = ctx.dom.query("#perflux-status");
  const galleryEl = ctx.dom.query("#perflux-gallery");
  const lightboxEl = ctx.dom.query("#perflux-lightbox");
  const lightboxImageEl = ctx.dom.query("#perflux-lightbox-image");
  const closeEl = ctx.dom.query("#perflux-close");
  function setStatus(message) {
    if (statusEl)
      statusEl.textContent = message;
  }
  function clearGallery() {
    if (galleryEl)
      galleryEl.innerHTML = "";
  }
  function renderSkeletons(count) {
    clearGallery();
    if (!galleryEl)
      return;
    galleryEl.innerHTML = Array.from({ length: count }, () => `
      <div class="perflux-item">
        <div class="perflux-frame"><div class="perflux-skeleton"></div></div>
        <div class="perflux-meta">
          <div class="perflux-skeleton" style="height:14px;border-radius:8px"></div>
          <div class="perflux-skeleton" style="height:32px;border-radius:8px"></div>
        </div>
      </div>
    `).join("");
  }
  function downloadDataUrl(dataUrl, filename) {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
  function renderImages(images) {
    clearGallery();
    if (!galleryEl)
      return;
    const fragment = document.createDocumentFragment();
    images.forEach((image, i) => {
      const item = document.createElement("div");
      item.className = "perflux-item";
      item.innerHTML = `
        <div class="perflux-frame">
          <img src="${image.dataUrl}" alt="Generated image ${i + 1}" />
        </div>
        <div class="perflux-meta">
          <div class="perflux-seed">Seed: ${image.seed}</div>
          <button class="perflux-download" type="button">Download</button>
        </div>
      `;
      const img = item.querySelector("img");
      const btn = item.querySelector(".perflux-download");
      img.addEventListener("click", () => {
        if (lightboxEl && lightboxImageEl) {
          lightboxImageEl.src = image.dataUrl;
          lightboxEl.classList.add("open");
          lightboxEl.setAttribute("aria-hidden", "false");
        }
      });
      btn.addEventListener("click", () => downloadDataUrl(image.dataUrl, `perflux-${image.seed}.jpg`));
      fragment.appendChild(item);
    });
    galleryEl.appendChild(fragment);
  }
  const offMessage = ctx.onBackendMessage((message) => {
    if (!message || typeof message !== "object")
      return;
    if (message.type === "perflux:status") {
      setStatus(`Generating ${message.count} image${message.count === 1 ? "" : "s"}...`);
      renderSkeletons(message.count);
      return;
    }
    if (message.type === "perflux:results") {
      setStatus(`Generated ${message.images.length} image${message.images.length === 1 ? "" : "s"}.`);
      renderImages(message.images);
      return;
    }
    if (message.type === "perflux:error") {
      setStatus(message.message);
      clearGallery();
    }
  });
  buttonEl?.addEventListener("click", () => {
    const prompt = promptEl?.value?.trim() || "";
    if (!prompt) {
      setStatus("Enter a prompt first.");
      clearGallery();
      return;
    }
    const seedValue = seedEl?.value?.trim() || "";
    ctx.sendToBackend({
      type: "perflux:generate",
      request: {
        prompt,
        style: styleEl?.value || "Photo-realistic",
        count: Number(countEl?.value || "1"),
        seed: seedValue ? Number(seedValue) : null,
        apiKey: keyEl?.value?.trim() || null
      }
    });
  });
  closeEl?.addEventListener("click", () => {
    if (lightboxEl) {
      lightboxEl.classList.remove("open");
      lightboxEl.setAttribute("aria-hidden", "true");
    }
  });
  lightboxEl?.addEventListener("click", (event) => {
    if (event.target === lightboxEl) {
      lightboxEl.classList.remove("open");
      lightboxEl.setAttribute("aria-hidden", "true");
    }
  });
  return () => {
    offMessage();
    removeStyle();
    ctx.dom.cleanup();
  };
}
export {
  setup
};
