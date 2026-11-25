// @author piercer
(() => {
  const KEY = "piercer_refinery_v1";
  const $ = (id) => document.getElementById(id);

  let stages = (() => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || "null");
      return Array.isArray(s) ? s : [{ type: "b64dec", arg: "" }];
    } catch { return [{ type: "b64dec", arg: "" }]; }
  })();

  function runOp(val, { type, arg }) {
    try {
      if (type === "b64dec") return atob(val.trim());
      if (type === "b64enc") return btoa(val);
      if (type === "hexdec") {
        const c = val.replace(/[^0-9a-fA-F]/g, "");
        let out = "";
        for (let i = 0; i < c.length; i += 2) out += String.fromCharCode(parseInt(c.substr(i, 2), 16));
        return out;
      }
      if (type === "hexenc") return [...new TextEncoder().encode(val)].map((b) => b.toString(16).padStart(2, "0")).join(" ");
      if (type === "urldec") return decodeURIComponent(val);
      if (type === "urlenc") return encodeURIComponent(val);
      if (type === "rot13") return val.replace(/[a-zA-Z]/g, (c) => String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26));
      if (type === "xor") {
        const k = /^[0-9a-fA-F]{2}$/.test(arg.trim()) ? [parseInt(arg.trim(), 16)] : [...new TextEncoder().encode(arg || "\x00")];
        return [...val].map((ch, i) => String.fromCharCode(ch.charCodeAt(0) ^ k[i % k.length])).join("");
      }
      if (type === "regex") return (val.match(new RegExp(arg || ".", "g")) || []).join("\n");
      if (type === "strings") return (val.match(/[ -~]{4,}/g) || []).join("\n");
    } catch (e) {
      return `[Erro em ${type}]: ${e.message}`;
    }
    return val;
  }

  function render() {
    localStorage.setItem(KEY, JSON.stringify(stages));
    $("stageList").innerHTML = "";
    stages.forEach((st, i) => {
      const row = document.createElement("div");
      row.className = "stage-row";
      row.innerHTML = `<span><strong>${i + 1}.</strong> ${st.type} ${st.arg ? `<code>(${st.arg})</code>` : ""}</span><button type="button" class="btn">×</button>`;
      row.querySelector("button").addEventListener("click", () => { stages.splice(i, 1); render(); });
      $("stageList").appendChild(row);
    });

    let cur = $("pipeIn").value;
    for (const st of stages) cur = runOp(cur, st);
    $("pipeOut").textContent = cur;
  }

  $("btnAddOp").addEventListener("click", () => {
    stages.push({ type: $("opType").value, arg: $("opArg").value });
    $("opArg").value = "";
    render();
  });

  $("btnCopyOut").addEventListener("click", () => {
    navigator.clipboard.writeText($("pipeOut").textContent);
    alert("Saída copiada!");
  });

  $("pipeIn").addEventListener("input", render);
  render();
})();
