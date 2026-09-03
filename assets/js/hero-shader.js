/**
 * EasyCoin WebGL Liquid Fluid Shader
 * Replicates the organic Perlin noise mouse-reactive dynamic background from dlr-test.training
 */
(function () {
  'use strict';

  function initHeroFlow(box, cssClass) {
    if (!box) return;

    var canvas = document.createElement('canvas');
    canvas.className = cssClass || 'dlrtt-pf-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '0';
    canvas.style.borderRadius = 'inherit';
    canvas.style.opacity = '1';

    box.insertBefore(canvas, box.firstChild);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    
    var gl = canvas.getContext('webgl', { antialias: false, alpha: true, powerPreference: 'low-power' })
          || canvas.getContext('experimental-webgl');
    if (!gl) return;

    var VS = 'attribute vec2 aPos; void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }';

    var FS = [
      'precision highp float;',
      'uniform vec2 uRes;',
      'uniform float uT;',
      'uniform vec2 uMaus;',
      '',
      'vec3 hash33(vec3 p3){',
      '  p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));',
      '  p3 += dot(p3, p3.yxz + 19.19);',
      '  return -1.0 + 2.0 * fract(vec3((p3.x + p3.y) * p3.z, (p3.x + p3.z) * p3.y, (p3.y + p3.z) * p3.x));',
      '}',
      'float perlin(vec3 p){',
      '  vec3 pi = floor(p); vec3 pf = p - pi;',
      '  vec3 w = pf * pf * (3.0 - 2.0 * pf);',
      '  float n000 = dot(pf - vec3(0,0,0), hash33(pi + vec3(0,0,0)));',
      '  float n100 = dot(pf - vec3(1,0,0), hash33(pi + vec3(1,0,0)));',
      '  float n010 = dot(pf - vec3(0,1,0), hash33(pi + vec3(0,1,0)));',
      '  float n110 = dot(pf - vec3(1,1,0), hash33(pi + vec3(1,1,0)));',
      '  float n001 = dot(pf - vec3(0,0,1), hash33(pi + vec3(0,0,1)));',
      '  float n101 = dot(pf - vec3(1,0,1), hash33(pi + vec3(1,0,1)));',
      '  float n011 = dot(pf - vec3(0,1,1), hash33(pi + vec3(0,1,1)));',
      '  float n111 = dot(pf - vec3(1,1,1), hash33(pi + vec3(1,1,1)));',
      '  float nx00 = mix(n000, n100, w.x); float nx01 = mix(n001, n101, w.x);',
      '  float nx10 = mix(n010, n110, w.x); float nx11 = mix(n011, n111, w.x);',
      '  return mix(mix(nx00, nx10, w.y), mix(nx01, nx11, w.y), w.z);',
      '}',
      '',
      'void main(){',
      '  vec2 uv = gl_FragCoord.xy / uRes;',
      '  vec2 m = uMaus;',
      '  float dist = distance(uv, m);',
      '  float p1 = perlin(vec3(uv * 2.8, uT * 0.18 + dist * 0.4));',
      '  float p2 = perlin(vec3(uv * 5.2 + vec2(p1 * 0.4), uT * 0.25));',
      '  ',
      '  // Deep Navy (#00081B) to Rich Royal Blue (#003DD1) to Glowing Cyan-Blue (#7B9BE8)',
      '  vec3 colDark  = vec3(0.0, 0.031, 0.106); // #00081B',
      '  vec3 colNavy  = vec3(0.0, 0.090, 0.306); // #00174E',
      '  vec3 colRoyal = vec3(0.0, 0.239, 0.820); // #003DD1',
      '  vec3 colGlow  = vec3(0.482, 0.608, 0.910); // #7B9BE8',
      '  ',
      '  float t1 = clamp(p1 * 0.5 + 0.5, 0.0, 1.0);',
      '  float t2 = clamp(p2 * 0.5 + 0.5, 0.0, 1.0);',
      '  ',
      '  vec3 c = mix(colDark, colNavy, uv.y);',
      '  c = mix(c, colRoyal, t1 * 0.65);',
      '  c += colGlow * pow(t2, 3.2) * 0.4;',
      '  ',
      '  // Mouse glow',
      '  float mouseGlow = max(0.0, 1.0 - dist * 2.5);',
      '  c += colGlow * mouseGlow * 0.25;',
      '  ',
      '  gl_FragColor = vec4(c, 0.96);',
      '}'
    ].join('\n');

    function createShader(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    }

    var vs = createShader(gl.VERTEX_SHADER, VS);
    var fs = createShader(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return;

    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    var aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    var uRes = gl.getUniformLocation(prog, 'uRes');
    var uT = gl.getUniformLocation(prog, 'uT');
    var uMaus = gl.getUniformLocation(prog, 'uMaus');

    var mausX = 0.5, mausY = 0.5;
    var targetMausX = 0.5, targetMausY = 0.5;

    window.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      targetMausX = (e.clientX - rect.left) / rect.width;
      targetMausY = 1.0 - ((e.clientY - rect.top) / rect.height);
    }, { passive: true });

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = box.clientWidth || window.innerWidth;
      var h = box.clientHeight || window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    var startTime = performance.now();
    var animFrame = null;

    function render(now) {
      var t = (now - startTime) * 0.001;
      mausX += (targetMausX - mausX) * 0.05;
      mausY += (targetMausY - mausY) * 0.05;

      gl.uniform1f(uT, t);
      gl.uniform2f(uMaus, mausX, mausY);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      animFrame = requestAnimationFrame(render);
    }

    // Observer to stop rendering when not visible
    var observer = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        if (!animFrame) animFrame = requestAnimationFrame(render);
      } else {
        if (animFrame) {
          cancelAnimationFrame(animFrame);
          animFrame = null;
        }
      }
    });
    observer.observe(box);

    animFrame = requestAnimationFrame(render);
  }

  window.initHeroFlow = initHeroFlow;
})();
