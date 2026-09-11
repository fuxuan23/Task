// 终极防弹版雪花
//(function() {
  // 防止重复初始化导致多个动画同时运行
  if (window.__SNOW_INITIALIZED__) {
    console.log("雪花已初始化，跳过重复挂载");
    return;
  }
  window.__SNOW_INITIALIZED__ = true;

  const fps = 30;
  const mspf = Math.floor(1000 / fps);

  let width = window.innerWidth || document.documentElement.clientWidth;
  let height = window.innerHeight || document.documentElement.clientHeight;
  let canvas;
  let ctx;

  let particles = [];
  
  function velocity(r) {
    return 70 / r + 30;
  }

  function sine_component(h, a) {
    return [2 * Math.PI / h, Math.random() * a, Math.random() * 2 * Math.PI];
  }

  function calc_sine(components, x) {
    let sum = 0;
    for (let i = 0; i < components.length; i++) {
      const [f, a, p] = components[i];
      sum += Math.sin(x * f + p) * a;
    }
    return sum;
  }

  function gen_particle() {
    let r = Math.random() * 4 + 1;
    return {
      radius: r,
      x: Math.random() * width,
      y: -r,
      opacity: Math.random(),
      sine_components: [sine_component(height, 3), sine_component(height / 2, 2), sine_component(height / 5, 1), sine_component(height / 10, 0.5)],
    };
  }

  function update_pos(dt) {
    const n = particles.length;
    for (let i = 0; i < n; i++) {
      const v = velocity(particles[i].radius);
      particles[i].x += calc_sine(particles[i].sine_components, particles[i].y) * v / 5 * dt;
      particles[i].y += v * dt;

      if (particles[i].y - particles[i].radius > height) {
        particles[i] = gen_particle();
      }
    }
  }

  function init_canvas() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.id = 'snow-canvas';
    canvas.width = width;
    canvas.height = height;
    canvas.style = 'position: fixed; top: 0; left: 0; overflow: hidden; pointer-events: none; z-index: 9999;';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
  }

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    // 检测当前是否为深色模式（MkDocs Material 会在 html 标签添加 data-md-color-scheme 属性）
    const isDark = document.body.getAttribute('data-md-color-scheme') === 'slate' || 
                   document.documentElement.getAttribute('data-md-color-scheme') === 'slate';
    
    // 深色模式用白色雪花，浅色模式用深灰色雪花（否则看不见！）
    const colorBase = isDark ? '255, 255, 255' : '50, 50, 50';

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.fillStyle = `rgba(${colorBase}, ${p.opacity})`;
      ctx.shadowColor = isDark ? '#80EDF7' : '#000000'; // 浅色下阴影黑一点
      ctx.shadowBlur = 7;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  let lastTime = performance.now();

  function loop() {
    const dt = (performance.now() - lastTime) / 1000;
    if (particles.length < 120 && Math.random() < 0.1) {
      particles.push(gen_particle());
    }
    update_pos(dt);
    draw();
    lastTime = performance.now();
    requestAnimationFrame(loop); // 使用原生 requestAnimationFrame，防止 setTimeout 叠加
  }

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    width = window.innerWidth || document.documentElement.clientWidth;
    height = window.innerHeight || document.documentElement.clientHeight;
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
    }
  });

  // 等待 DOM 加载完毕后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init_canvas();
      requestAnimationFrame(loop);
    });
  } else {
    init_canvas();
    requestAnimationFrame(loop);
  }

  console.log("❄️ 雪花特效启动成功！");
//})();