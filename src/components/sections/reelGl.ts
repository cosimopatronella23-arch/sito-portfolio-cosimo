/*
 * Motore WebGL per le transizioni del montaggio dell'hero. Niente librerie:
 * un solo shader a schermo intero che mescola due immagini (la corrente e la
 * prossima) con una di otto transizioni. Le immagini sono quelle già caricate
 * da next/image (stessa origine, quindi utilizzabili come texture).
 * Mentre un lavoro è in scena fa un lento zoom (Ken Burns).
 */

export const T = {
  PUSH: 0, // scivolamento con parallasse e sfocatura di movimento
  ZOOM: 1, // zoom radiale attraverso l'immagine
  WIPE: 2, // dissolvenza diagonale con bordo lavanda
  TILES: 3, // tessere che si ribaltano
  RIPPLE: 4, // onda con rifrazione
  GLITCH: 5, // bande con scarto RGB
  IRIS: 6, // iride con anello lavanda
  SLATS: 7, // lamelle verticali sfalsate
} as const;

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uA;
uniform sampler2D uB;
uniform vec2 uRes;
uniform vec2 uSizeA;
uniform vec2 uSizeB;
uniform float uScaleA;
uniform float uScaleB;
uniform float uP;
uniform float uType;

const float PI = 3.14159265;
const vec3 ACCENT = vec3(0.804, 0.776, 0.941);

vec2 cover(vec2 uv, vec2 sz, float sc){
  float rs = uRes.x / uRes.y;
  float is = sz.x / sz.y;
  vec2 s = rs > is ? vec2(1.0, is / rs) : vec2(rs / is, 1.0);
  return ((uv - 0.5) / sc) * s + 0.5;
}
vec3 sA(vec2 uv){ return texture2D(uA, cover(uv, uSizeA, uScaleA)).rgb; }
vec3 sB(vec2 uv){ return texture2D(uB, cover(uv, uSizeB, uScaleB)).rgb; }

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

void main(){
  float p = uP;
  vec2 c = vec2(0.5);
  vec3 col;

  if (uType < -0.5) {
    col = sA(vUv);

  } else if (uType < 0.5) {
    // PUSH: la prossima immagine spinge via la corrente, con parallasse
    float edge = 1.0 - p;
    float vel = p * (1.0 - p) * 0.12;
    vec3 acc = vec3(0.0);
    for (int i = 0; i < 8; i++) {
      float o = (float(i) / 7.0 - 0.5) * vel;
      vec2 uv = vUv + vec2(o, 0.0);
      vec3 s;
      if (uv.x < edge) {
        s = sA(uv + vec2(p * 0.35, 0.0));
        s *= mix(1.0, 0.55, smoothstep(0.25, 0.0, edge - uv.x));
      } else {
        s = sB(vec2(uv.x - edge, uv.y));
        s *= mix(0.7, 1.0, smoothstep(0.0, 0.12, uv.x - edge));
      }
      acc += s;
    }
    col = acc / 8.0;

  } else if (uType < 1.5) {
    // ZOOM: attraversa l'immagine con sfocatura radiale e aberrazione
    float s = sin(p * PI);
    vec2 dir = vUv - c;
    float zA = 1.0 + p * 0.9;
    float zB = 1.6 - 0.6 * p;
    vec3 a = vec3(0.0);
    vec3 b = vec3(0.0);
    for (int i = 0; i < 10; i++) {
      float k = float(i) / 9.0;
      float blur = 1.0 - k * 0.16 * s;
      a.r += sA(c + dir * blur / (zA * 1.012)).r;
      a.g += sA(c + dir * blur / zA).g;
      a.b += sA(c + dir * blur / (zA * 0.988)).b;
      b.r += sB(c + dir * blur / (zB * 1.012)).r;
      b.g += sB(c + dir * blur / zB).g;
      b.b += sB(c + dir * blur / (zB * 0.988)).b;
    }
    a /= 10.0; b /= 10.0;
    col = mix(a, b, smoothstep(0.3, 0.7, p));
    col *= 1.0 + s * 0.1;

  } else if (uType < 2.5) {
    // WIPE: bordo diagonale irregolare con filo lavanda
    float d = dot(vUv, normalize(vec2(1.0, 0.55))) / 1.14;
    float n = (noise(vUv * 6.0) - 0.5) * 0.16;
    float th = p * 1.45 - 0.22;
    float m = 1.0 - smoothstep(th - 0.025, th + 0.025, d + n);
    float line = 1.0 - smoothstep(0.0, 0.014, abs(d + n - th));
    vec2 uvA = c + (vUv - c) * (1.0 - p * 0.05);
    vec2 uvB = c + (vUv - c) * (1.0 - (1.0 - p) * 0.12);
    col = mix(sA(uvA), sB(uvB), m);
    col += ACCENT * line * step(0.001, p) * step(p, 0.999);

  } else if (uType < 3.5) {
    // TILES: tessere che si ribaltano a scacchiera casuale
    float cols = 14.0;
    vec2 cell = vec2(1.0 / cols, (1.0 / cols) * uRes.x / uRes.y);
    vec2 id = floor(vUv / cell);
    vec2 f = fract(vUv / cell);
    float r = hash(id);
    float cp = clamp((p - r * 0.45) / 0.55, 0.0, 1.0);
    float sx = abs(cos(cp * PI));
    vec3 img = cp < 0.5 ? sA(vUv) : sB(vUv);
    float inside = step(abs(f.x - 0.5), 0.5 * sx);
    col = mix(vec3(0.02), img, inside);

  } else if (uType < 4.5) {
    // RIPPLE: un'onda parte dal centro e rifrange le due immagini
    vec2 asp = vec2(uRes.x / uRes.y, 1.0);
    float d = distance(vUv * asp, c * asp) / length(0.5 * asp);
    float front = p * 1.5;
    float w = sin((d - front) * 42.0) * exp(-abs(d - front) * 7.0) * 0.035 * (1.0 - p * 0.4);
    vec2 uv = vUv + normalize(vUv - c + 1e-5) * w;
    float m = 1.0 - smoothstep(front - 0.14, front + 0.02, d);
    col = mix(sA(uv), sB(uv), m);

  } else if (uType < 5.5) {
    // GLITCH: bande orizzontali scartate, canali RGB separati
    float bands = 26.0;
    float b = floor(vUv.y * bands);
    float r = hash(vec2(b, floor(p * 14.0)));
    float s = sin(p * PI);
    float off = (r - 0.5) * 0.2 * s * step(0.55, r);
    float sh = 0.008 * s;
    float m = step(0.5 + (hash(vec2(b, 3.1)) - 0.5) * 0.55, p);
    vec2 uv = vec2(vUv.x + off, vUv.y);
    vec3 a = vec3(sA(uv + vec2(sh, 0.0)).r, sA(uv).g, sA(uv - vec2(sh, 0.0)).b);
    vec3 bb = vec3(sB(uv + vec2(sh, 0.0)).r, sB(uv).g, sB(uv - vec2(sh, 0.0)).b);
    col = mix(a, bb, m);

  } else if (uType < 6.5) {
    // IRIS: cerchio che si apre con anello lavanda
    vec2 asp = vec2(uRes.x / uRes.y, 1.0);
    float d = distance(vUv * asp, c * asp) / length(0.5 * asp);
    float rad = p * 1.15;
    float m = 1.0 - smoothstep(rad - 0.004, rad + 0.004, d);
    float ring = 1.0 - smoothstep(0.0, 0.012, abs(d - rad));
    vec2 uvA = c + (vUv - c) * (1.0 - p * 0.12);
    vec2 uvB = c + (vUv - c) * (1.0 - (1.0 - p) * 0.25);
    col = mix(sA(uvA), sB(uvB), m);
    col += ACCENT * ring * step(0.01, p) * step(p, 0.99);

  } else {
    // SLATS: lamelle verticali che salgono e scendono a turno
    float n = 10.0;
    float i = floor(vUv.x * n);
    float delay = (i / n) * 0.5;
    float lp = clamp((p - delay) / 0.5, 0.0, 1.0);
    lp = lp * lp * (3.0 - 2.0 * lp);
    float odd = mod(i, 2.0);
    float y = odd < 0.5 ? vUv.y : 1.0 - vUv.y;
    float m = step(y, lp);
    vec2 uvB = vUv + vec2(0.0, (1.0 - lp) * (odd < 0.5 ? -0.12 : 0.12));
    col = mix(sA(vUv), sB(uvB), m);
    col *= 1.0 - 0.55 * step(0.988, fract(vUv.x * n)) * step(0.001, p) * step(p, 0.999);
  }

  gl_FragColor = vec4(col, 1.0);
}
`;

const easeInOutQuart = (t: number) =>
  t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

export type ReelGl = {
  /** Vero se la texture dell'immagine `i` è pronta. */
  has(i: number): boolean;
  /** Avvia una transizione verso l'immagine `to`. */
  transition(to: number, type: number, durationMs: number): void;
  resize(): void;
  start(): void;
  stop(): void;
  destroy(): void;
};

export function createReelGl(
  canvas: HTMLCanvasElement,
  images: HTMLImageElement[],
  onLost: () => void,
  onReady: () => void,
): ReelGl | null {
  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    powerPreference: "high-performance",
  });
  if (!gl) return null;

  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn("reelGl shader:", gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = (n: string) => gl.getUniformLocation(prog, n);
  const uA = U("uA"), uB = U("uB"), uRes = U("uRes"), uSizeA = U("uSizeA"), uSizeB = U("uSizeB");
  const uScaleA = U("uScaleA"), uScaleB = U("uScaleB"), uP = U("uP"), uType = U("uType");
  gl.uniform1i(uA, 0);
  gl.uniform1i(uB, 1);

  const textures: (WebGLTexture | null)[] = images.map(() => null);
  const sizes: [number, number][] = images.map(() => [1, 1]);
  const loaded: boolean[] = images.map(() => false);
  let readyFired = false;
  const cleanups: (() => void)[] = [];

  const upload = (i: number) => {
    const img = images[i];
    if (loaded[i] || !img.complete || img.naturalWidth === 0) return;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    try {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    } catch {
      return;
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    textures[i] = tex;
    sizes[i] = [img.naturalWidth, img.naturalHeight];
    loaded[i] = true;
    if (i === 0 && !readyFired) {
      readyFired = true;
      onReady();
    }
  };
  images.forEach((img, i) => {
    upload(i);
    if (!loaded[i]) {
      const h = () => upload(i);
      img.addEventListener("load", h);
      cleanups.push(() => img.removeEventListener("load", h));
    }
  });

  // Stato
  let cur = 0;
  let next = -1;
  let type = -1;
  let tStart = 0;
  let dur = 1;
  let fast = false;
  const shownAt: number[] = images.map(() => 0);
  shownAt[0] = performance.now();
  let raf = 0;
  let running = false;
  let destroyed = false;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.min(Math.round(canvas.clientWidth * dpr), 2560);
    const h = Math.round((w / Math.max(canvas.clientWidth, 1)) * canvas.clientHeight);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
  };

  const kenBurns = (i: number, now: number) =>
    1 + 0.06 * Math.min((now - shownAt[i]) / 3500, 1);

  const draw = (now: number) => {
    let p = 0;
    if (next >= 0) {
      const t = Math.min((now - tStart) / dur, 1);
      p = fast ? easeOutExpo(t) : easeInOutQuart(t);
      if (t >= 1) {
        cur = next;
        next = -1;
        type = -1;
        p = 0;
      }
    }
    const b = next >= 0 ? next : cur;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[cur]);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textures[b]);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform2f(uSizeA, sizes[cur][0], sizes[cur][1]);
    gl.uniform2f(uSizeB, sizes[b][0], sizes[b][1]);
    gl.uniform1f(uScaleA, kenBurns(cur, now));
    gl.uniform1f(uScaleB, kenBurns(b, now));
    gl.uniform1f(uP, p);
    gl.uniform1f(uType, next >= 0 ? type : -1);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  const frame = (now: number) => {
    if (!running) return;
    if (textures[cur]) draw(now);
    raf = requestAnimationFrame(frame);
  };

  const onContextLost = (e: Event) => {
    e.preventDefault();
    running = false;
    cancelAnimationFrame(raf);
    onLost();
  };
  canvas.addEventListener("webglcontextlost", onContextLost);

  return {
    has: (i) => loaded[i],
    transition(to, t, ms) {
      if (!loaded[to]) return;
      if (next >= 0) {
        cur = next; // chiude di scatto la transizione in corso
      }
      next = to;
      type = t;
      dur = ms;
      fast = t === T.GLITCH || t === T.SLATS;
      tStart = performance.now();
      shownAt[to] = tStart;
    },
    resize,
    start() {
      if (running || destroyed) return;
      running = true;
      resize();
      raf = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    destroy() {
      destroyed = true;
      running = false;
      cancelAnimationFrame(raf);
      cleanups.forEach((f) => f());
      canvas.removeEventListener("webglcontextlost", onContextLost);
      textures.forEach((t) => t && gl.deleteTexture(t));
    },
  };
}
