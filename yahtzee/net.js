// The socket to the 1v1 table. Thin on purpose: it knows how to reach the
// server and how to hand messages over, and nothing whatsoever about Yahtzee.
//
// The server is authoritative for every number, so this never invents state --
// it forwards intent up and events down.

const SOCKET_PATH = "/yahtzee/api/socket";

// Same origin as the page, ws:// or wss:// to match http/https. Works proxied
// behind nginx in production and against a bare `node server.js` locally.
function socketURL() {
  const proto = location.protocol === "https:" ? "wss:" : "ws:";
  // A local static server (python -m http.server) does not proxy the socket,
  // so in dev we go straight at the node process on its own port.
  const devPort = location.port && location.port !== "8024" ? ":8024" : "";
  const devHost = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  return devHost
    ? `${proto}//${location.hostname}${devPort}/api/socket`
    : `${proto}//${location.host}${SOCKET_PATH}`;
}

// A stable identity per browser, so a name sticks between visits. Same
// localStorage habit as the rest of the hub.
function identity() {
  let id = null;
  try { id = localStorage.getItem("yahtzee-id"); } catch { /* private mode */ }
  if (!id) {
    id = (crypto.randomUUID?.() || String(Math.random()).slice(2)).slice(0, 36);
    try { localStorage.setItem("yahtzee-id", id); } catch { /* fine */ }
  }
  return id;
}

export function loadName() {
  try { return localStorage.getItem("yahtzee-name") || ""; } catch { return ""; }
}
export function saveName(n) {
  try { localStorage.setItem("yahtzee-name", n); } catch { /* fine */ }
}

export class Net {
  constructor({ onMessage, onStatus }) {
    this.onMessage = onMessage;
    this.onStatus = onStatus || (() => {});
    this.ws = null;
    this.ready = false;
    this.queue = [];
  }

  connect(name) {
    this.name = name;
    this.onStatus("connecting");
    let ws;
    try { ws = new WebSocket(socketURL()); } catch (e) {
      this.onStatus("error", e.message);
      return;
    }
    this.ws = ws;

    ws.addEventListener("open", () => {
      this.ready = true;
      this.send({ t: "hello", id: identity(), name: this.name });
      for (const m of this.queue.splice(0)) this.send(m);
      this.onStatus("open");
    });
    ws.addEventListener("message", (e) => {
      let m; try { m = JSON.parse(e.data); } catch { return; }
      this.onMessage(m);
    });
    ws.addEventListener("close", () => {
      this.ready = false;
      this.onStatus("closed");
    });
    ws.addEventListener("error", () => this.onStatus("error"));
  }

  send(obj) {
    if (!this.ready) { this.queue.push(obj); return; }
    try { this.ws.send(JSON.stringify(obj)); } catch { /* closing */ }
  }

  close() {
    this.ready = false;
    try { this.ws && this.ws.close(); } catch { /* already gone */ }
    this.ws = null;
  }
}
