// UI-only swatch catalog (IDs here should map to real renderer/material keys)
export const SWATCHES = {
  cloud: {
    any: [
      { id: "plastic_wh",  name: "Pearl",  color: "#e2dccb" }
    ],
  },

  noise: {
    any: [
      { id: "plastic_wh",  name: "Pearl",  color: "#e8e5dc" },
      { id: "petg_clear",  name: "Haze",  color: "#cdcdcd" },
    ],
    private: [
      { id: "golden",   name: "Deluxe",   color: "#a89051"}
    ],
    office: [
      { id: "plastic_char",  name: "Haze",  color: "#444" },
    ]
  },

  brush: {
    any: [
      { id: "plastic_wh",  name: "Pearl",  color: "#e8e5dc" }
    ],
    private: [
      { id: "golden",   name: "Deluxe",   color: "#a89051"} // brush won't even show while on private residence so this is irrelevant
    ]
  },

  touch: {
    any: [
      { id: "petg_clear",  name: "Haze",  color: "#cdcdcd" }
    ],
    office: [
      { id: "golden",   name: "Deluxe",   color: "#a89051"}
    ]
  },

  wall: {
    any: [
      {id: "plastic_wh",  name: "Pearl",  color: "#e8e5dc"},
      {id: "plastic_char",  name: "Charcoal",  color: "#444"},
    ],
  },
  desk: {
    any: [
      {id: "plastic_wh",  name: "Pearl",  color: "#e8e5dc"},
      {id: "plastic_char",  name: "Charcoal",  color: "#444"},
    ],
  },
  ceiling: {
    any: [
      {id: "plastic_wh",  name: "Pearl",  color: "#e8e5dc"}
    ],
  },
  surround: {
    any: [
      {id: "plastic_wh",  name: "Pearl",  color: "#e8e5dc"}
    ],
  }
}


export function initUI(ctx, models, assets) {
  const $ = (id) => document.getElementById(id);//define shortcut DOM getter

  // Elements
  const project = $("project");
  const design  = $("design");
  const lightsBtn = $("lightsBtn");
  let lightsOn = false;
  function refreshLightsButton() {
    lightsBtn.textContent = lightsOn ? "lights: on" : "lights: off";
    lightsBtn.setAttribute("aria-pressed", String(lightsOn));
  }
  if (lightsBtn) {
    refreshLightsButton(); // ensure label shows "off" on load
    lightsBtn.addEventListener("click", () => {
      lightsOn = !lightsOn;
      refreshLightsButton();
      // tell models to enable/disable and (re)place/remove ring lights
      if (typeof models.setRingLightEnabled === "function") {
        models.setRingLightEnabled(lightsOn);
      }
    });
  }
  
  const controlSets = document.querySelectorAll(".control-set");
  function showSet(rawName){
    let name = String(rawName || "").toLowerCase();
    if (name==="wall"||"desk"||"ceiling"||"surround") {
      name = "lobbyset";
    };
    controlSets.forEach(set => {
      const match = (set.dataset.design || "").split(/\s+/).includes(name);
      set.hidden = !match;
      set.toggleAttribute("inert", !match);
    });
  }

  // CLOUD sliders
  const depthCloud   = $("depthCloud"),   angleCloud   = $("angleCloud"),   stretchCloud = $("stretchCloud");
  const depthCVal    = $("depthCVal"),    angleCVal    = $("angleCVal"),    stretchCVal  = $("stretchCVal");
  // NOISE sliders
  const depthNoise   = $("depthNoise"),   scaleNoise   = $("scaleNoise");
  const depthNVal    = $("depthNVal"),    scaleNVal    = $("scaleNVal");
  // BRUSH sliders
  const densityBrush = $("densityBrush"), softenBrush  = $("softenBrush");
  const densityBVal  = $("densityBVal"),  softenBVal   = $("softenBVal");
  // TOUCH sliders
  const sizeTouch    = $("sizeTouch"),    repTouch    = $("repTouch");
  const sizeTVal     = $("sizeTVal"),     repTVal     = $("repTVal");
  // LOBBY sliders
  const depthLobby   = $("depthLobby"),   scaleLobby   = $("scaleLobby");
  const depthLVal    = $("depthLVal"),    scaleLVal    = $("scaleLVal");

  // Readout formatters
  const fmt_in  = (v) => `${v}″`;
  const fmt_x   = (v) => `${v}x`;
  const fmt_deg = (v) => `${v}°`;
  const fmt     = (v) => `${v}`;

  // --- Material swatch elements (always visible control) ---
  const materialSwatches = $("matSwatches");
  const materialReadout  = $("matReadout");
  const materialHidden   = $("material"); // holds the selected swatch id (material key)

  function getSwatchList(designKey, projectKey) {
    const bucket = (SWATCHES[designKey] || {});
    const base = bucket.any || [];
    const byProject = bucket[projectKey] || [];
    return [...base, ...byProject];
  }
  function setSelectedSwatch(id) {
    const items = [...materialSwatches.querySelectorAll(".swatch")];
    let label = "—";
    items.forEach(el => {
      const on = el.dataset.materialId === id;
      el.setAttribute("aria-checked", on ? "true" : "false");
      el.tabIndex = on ? 0 : -1;
      if (on) label = el.title;
    });
    materialHidden.value = id || "";
    if (materialReadout) materialReadout.value = label;
  }
  function renderSwatches() {
    if (!materialSwatches) return;
    materialSwatches.setAttribute("role", "radiogroup");
    materialSwatches.setAttribute("aria-label", "Material");
    const p = String(project?.value || "").toLowerCase();
    const d = String(design?.value  || "").toLowerCase();

    const list = getSwatchList(d, p);
    const keep = materialHidden.value;
    const defaultFromSpec = desiredPartSpec()?.material || ""; // falls back if user has no selection
    materialSwatches.innerHTML = "";

    list.forEach(m => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "swatch";
      btn.setAttribute("role", "radio");
      btn.setAttribute("aria-checked", "false");
      btn.tabIndex = -1; 
      btn.dataset.materialId = m.id;
      btn.title = m.name;

      if (m.image) {
        btn.style.backgroundImage = `url("${m.image}")`;
        btn.style.backgroundSize = "cover";
        btn.style.backgroundPosition = "center";
        btn.style.backgroundColor = "#eee";
      } else if (m.color) {
        btn.style.background = m.color;
      }
      materialSwatches.appendChild(btn);
    });

    // Choose: keep prior if still available → default from spec → first
    const firstId = list[0]?.id || "";
    const nextId  = list.some(m => m.id === keep) ? keep
                 : list.some(m => m.id === defaultFromSpec) ? defaultFromSpec
                 : firstId;
    setSelectedSwatch(nextId);

    // Apply immediately to the loaded part
    if (nextId) models.setMaterial("part", nextId);
  }
  // Click + minimal keyboard nav
  if (materialSwatches) {
    materialSwatches.addEventListener("click", (e) => {
      const b = e.target.closest(".swatch");
      if (!b) return;
      setSelectedSwatch(b.dataset.materialId);
      // Update renderer material right away
      models.setMaterial("part", materialHidden.value);
    });

    materialSwatches.addEventListener("keydown", (e) => {
      const keys = ["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End"];
      if (!keys.includes(e.key)) return;
      e.preventDefault();
      const btns = [...materialSwatches.querySelectorAll(".swatch")];
      const cur  = btns.findIndex(b => b.getAttribute("aria-checked") === "true");
      let idx = cur;

      if (e.key === "Home") idx = 0;
      else if (e.key === "End") idx = btns.length - 1;
      else {
        const step = (e.key === "ArrowLeft" || e.key === "ArrowUp") ? -1 : +1;
        idx = Math.max(0, Math.min(btns.length - 1, cur + step));
      }
      const next = btns[idx];
      if (next) {
        setSelectedSwatch(next.dataset.materialId);
        next.focus();
        models.setMaterial("part", materialHidden.value);
      }
    });
  }
  function getChosenMaterial() {
    return materialHidden?.value || "";
  }
  // end material swatches section ----


  // Track how many backdrop sub-slots we’re using, so we can unload extras
  let prevBackdropCount = 0;
  // for camera focus
  let framedBackdropOnce = false;

  // ---------- Backdrop by Project ----------
  // Normalize a backdrop entry (string or {url,material}) → {url, material}
  function normalizeBackdropEntry(e) {
    if (!e) return null;
    if (typeof e === "string") return { url: e, material: "stucco" };
    const { url, material } = e;
    if (!url) return null;
    return { url, material: material || "stucco" };
  }

  // Return array of normalized entries for current project
  function desiredBackdropEntries() {
    const p = String(project?.value || "").toLowerCase();
    const raw = (assets.backdropByProject || {})[p];
    const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
    return list.map(normalizeBackdropEntry).filter(Boolean);
  }

  function updateBackdrops({ forceFrame = false } = {}) {
    const entries = desiredBackdropEntries();
    for (let i = 0; i < entries.length; i++) {
      const spec = entries[i];
      const slotName = `backdrop-${i}`;
      const shouldFrame = forceFrame && i === 0 && !framedBackdropOnce;
      updateSlot(slotName, spec.url, spec.material, { frame: shouldFrame });
    }
    for (let j = entries.length; j < prevBackdropCount; j++) {
      const slotName = `backdrop-${j}`;
      models.unloadModel(slotName);
    }
    prevBackdropCount = entries.length;
  }
  // Wait until the NEW backdrop URLs are loaded in their slots, then fit shadows.
  // Also refit for a few frames afterward to catch late bbox updates.
  function fitShadowsAfterBackdrops() {
    const entries = desiredBackdropEntries();        // new project's desired backdrops
    const want = entries.length;

    // If there are no backdrops for this project, still fit once (no-op if none found)
    if (want === 0) {
      ctx.fitShadowToBackdrops?.({ mode: "fit", margin: 1.4 });
      return;
    }

    let tries = 0;         // up to ~5s @ 60fps
    let postFits = 0;      // extra fits after ready

    function allReady() {
      for (let i = 0; i < want; i++) {
        const slot = `backdrop-${i}`;
        const url  = models.getUrl(slot);
        if (!url) return false;                         // slot empty
        if (url !== entries[i].url) return false;       // old model still present
        if (!models.isLoaded(slot)) return false;       // new model not fully loaded
      }
      return true;
    }

    function tick() {
      if (allReady()) {
        ctx.fitShadowToBackdrops?.({ mode: "fit", margin: 1.4 });
        if (++postFits < 4) requestAnimationFrame(tick); // a few more frames to be safe
        return;
      }
      if (++tries < 300) {
        requestAnimationFrame(tick);
      } else {
        // Fallback so we never get stuck without any fit
        ctx.fitShadowToBackdrops?.({ mode: "fit", margin: 1.4 });
      }
    }

    requestAnimationFrame(tick);
  }




  // ---------- Design options by Project ----------
  function populateDesignChoices(pVal) {
    const allowed = (assets.designsByProject || {})[pVal] || [];
    const current = String(design?.value || "").toLowerCase();

    // Rebuild <select>
    design.innerHTML = "";
    for (const name of allowed) {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name.charAt(0).toUpperCase() + name.slice(1);
      design.appendChild(opt);
    }
    // Preserve if still valid, else pick first
    if (allowed.includes(current)) design.value = current;
    const chosen = design.value || allowed[0] || "";
    showSet(chosen);
  }

  // ---------- Part by (Project + Design + Sliders) ----------
  function getValsForDesign(designKey) {
    switch (designKey) {
      case "cloud": return {
        depth:   Number(depthCloud?.value),
        angle:   Number(angleCloud?.value),
        stretch: Number(stretchCloud?.value)
      };
      case "noise": return {
        depth: Number(depthNoise?.value),
        scale: Number(scaleNoise?.value)
      };
      case "brush": return {
        density: Number(densityBrush?.value),
        soften:  Number(softenBrush?.value)
      };
      case "touch": return {
        size: Number(sizeTouch?.value),
        rep: Number(repTouch?.value)
      };
      case "wall": return {
        depth: Number(depthLobby?.value),
        scale: Number(scaleLobby?.value)
      };
      case "desk": return {
        depth: Number(depthLobby?.value),
        scale: Number(scaleLobby?.value)
      };
      case "ceiling": return {
        depth: Number(depthLobby?.value),
        scale: Number(scaleLobby?.value)
      };
      case "surround": return {
        depth: Number(depthLobby?.value),
        scale: Number(scaleLobby?.value)
      };
      default: return {};
    }
  }
  function comboKey(designKey, vals) {
    switch (designKey) {
      case "cloud": return (vals.depth|0) + "|" + (vals.angle|0) + "|" + (vals.stretch|0);
      case "noise": return (vals.depth|0) + "|" + (vals.scale|0);
      case "brush": return (vals.density|0) + "|" + (vals.soften|0);
      case "touch": return (vals.size|0) + "|" + (vals.rep|0);
      case "wall":
      case "desk":
      case "ceiling":
      case "surround":
        return (vals.depth|0) + "|" + (vals.scale|0);
      default: return "";
    }
  }
  function findPartSpec(projectKey, designKey, key) {
    const root = assets.partsByProjectDesign || {};
    return (root[projectKey]?.[designKey]?.[key])
        || (root[projectKey]?.["*"]?.[key])
        || (root["*"]?.[designKey]?.[key])
        || (root["*"]?.["*"]?.[key])
        || null;
  }
  function desiredPartSpec() {
    const p = String(project?.value || "").toLowerCase();
    const d = String(design?.value  || "").toLowerCase();
    const vals = getValsForDesign(d);
    const k = comboKey(d, vals);
    return findPartSpec(p, d, k);
  }

  // ---------- Slot updater ----------
  function updateSlot(slot, wantUrl, matKey, opts = {}) {
    const hasKey  = models.getUrl(slot);

    // build a stable key for arrays/objects/strings
    const wantKey = Array.isArray(wantUrl)
      ? JSON.stringify(wantUrl.map(it => {
          if (typeof it === "string") return { url: it };
          return {
            url: it.url,
            material: it.material ?? null,
            id: it.id ?? null,
            target: (it.target === true ? true : (it.target === false ? false : null)),
          };
        }))
      : (typeof wantUrl === "object" && wantUrl && "url" in wantUrl
          ? (Array.isArray(wantUrl.url) ? JSON.stringify(wantUrl.url) : wantUrl.url)
          : wantUrl);

    if (wantKey) {
      if (hasKey !== wantKey) {
        models.loadModel(slot, wantUrl, matKey, opts);
        if ((slot === "backdrop-0" || slot === "backdrop") && opts.frame) {
          framedBackdropOnce = true;
        }
      } else {
        models.setMaterial(slot, matKey); // swatch only paints the target piece
      }
    } else if (hasKey) {
      models.unloadModel(slot);
    }
  }

  function checkAndUpdateModels() {
    const spec = desiredPartSpec();
    const want = (spec && "url" in (spec || {})) ? spec.url : spec; // allow array-or-string directly
    const matKey = getChosenMaterial() || "stucco";
    updateSlot("part", want || null, matKey, { frame: false });
  }


  // ---------- Sync  ----------
  function sync(updateModel = true){
    if (depthCloud && depthCVal)   depthCVal.textContent   = fmt(depthCloud.value);
    if (angleCloud && angleCVal)   angleCVal.textContent   = fmt_deg(angleCloud.value);
    if (stretchCloud && stretchCVal) stretchCVal.textContent = fmt(stretchCloud.value);

    if (depthNoise && depthNVal)   depthNVal.textContent   = fmt(depthNoise.value);
    if (scaleNoise && scaleNVal)   scaleNVal.textContent   = fmt_x(scaleNoise.value);

    if (densityBrush && densityBVal) densityBVal.textContent = fmt(densityBrush.value);
    if (softenBrush  && softenBVal)  softenBVal.textContent  = fmt(softenBrush.value);

    if (sizeTouch && sizeTVal)     sizeTVal.textContent    = fmt(sizeTouch.value);
    if (repTouch && repTVal)     repTVal.textContent    = fmt(repTouch.value);

    if (depthLobby && depthLVal)   depthLVal.textContent   = fmt(depthLobby.value);
    if (scaleLobby && scaleLVal)   scaleLVal.textContent   = fmt_x(scaleLobby.value);

    if (updateModel) checkAndUpdateModels();
  }


  // Events
  function onSliderChange(e) {
    const isCommit = e.type === "change";     // "input" while dragging, "change" on release
    sync(isCommit);
  }
  const sliders = [
    depthCloud, angleCloud, stretchCloud,
    depthNoise, scaleNoise,
    densityBrush, softenBrush,
    sizeTouch, repTouch,
    depthLobby, scaleLobby
  ].filter(Boolean);
  sliders.forEach(s => {
    s.addEventListener("input", onSliderChange);   // live readouts / preview
    s.addEventListener("change", onSliderChange);  // commit on release
  });

  design?.addEventListener("change", (e) => {
    showSet((e.target.value || "").toLowerCase());
    renderSwatches();
    sync();
  });

  project?.addEventListener("change", () => {
    const p = String(project?.value || "").toLowerCase();
    populateDesignChoices(p);        // reset Design choices + fieldset
    framedBackdropOnce = false;      // allow a new frame for this project
    updateBackdrops({ forceFrame: true });
    fitShadowsAfterBackdrops();
    renderSwatches();
    sync();                          // updates the Part only (no backdrop reload)
  });

  // Initial
  if (project) populateDesignChoices(String(project.value || "").toLowerCase());
  updateBackdrops({ forceFrame: true }); // frame on first load
  fitShadowsAfterBackdrops();
  renderSwatches();
  sync();
}
