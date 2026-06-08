(function () {
  // 覆盖原生的 console.log
  const originalLog = console.log;
  console.log = function (...args) {
    const err = new Error();
    const stack = err.stack.split('\n')[2]; // 获取调用者的堆栈
    const match = stack.match(/\((.*):(\d+):\d+\)/) || stack.match(/at (.*):(\d+):\d+/);

    if (match) {
      originalLog(`[${match[1]}:${match[2]}]`, ...args);
    } else {
      originalLog(...args);
    }
  };

  // 打印调用堆栈的函数
  printstack = function (title) {
    const err = new Error();
    const stack = err.stack.split('\n').slice(2); // 获取调用者的堆栈
    console.log(title || "Stack trace", { stack: stack });
  };

  //
  const canvasContent = localStorage.getItem("md-canvasContent");
  const isDark = localStorage.getItem("md-darkmode");
  if (!isDark && isDark !== null) document.body.classList.add("inverted");
  if (!canvasContent) return;

  console.log("Loading canvas content from localStorage");
  console.log("canvasContent", {canvasContent});
  console.log("isDark", {isDark});

  const parser = new DOMParser();
  const doc = parser.parseFromString(canvasContent, "image/svg+xml");
  console.log("doc", {doc});
  console.log("doc.documentElement", doc.documentElement);

  const workarea = document.getElementById("workarea");
  workarea.appendChild(doc.documentElement);
  const svgCanvas = document.getElementById("svgcanvas");
  const canvasTitle = localStorage.getItem("md-canvasTitle");
  svgCanvas.setAttribute("title", canvasTitle ? "Loading " + canvasTitle : "Loading Drawing");
  const svg = workarea.querySelector("svg");
})();

