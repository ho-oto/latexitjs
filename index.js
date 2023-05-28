#! /usr/bin/env -S node -r esm

const CSS = [
  "svg a{fill:blue;stroke:blue}",
  '[data-mml-node="merror"]>g{fill:red;stroke:red}',
  '[data-mml-node="merror"]>rect[data-background]{fill:yellow;stroke:none}',
  "[data-frame],[data-line]{stroke-width:70px;fill:none}",
  ".mjx-dashed{stroke-dasharray:140}",
  ".mjx-dotted{stroke-linecap:round;stroke-dasharray:0,140}",
  "use[data-c]{stroke-width:3px}",
].join("");

var input = require("fs").readFileSync("/dev/stdin", "utf8");

var argv = require("yargs")
  .demand(0)
  .strict()
  .usage('echo "math" | $0 [options] > file.svg')
  .options({
    inline: {
      boolean: true,
      describe: "process as inline math",
    },
    em: {
      default: 16,
      describe: "em-size in pixels",
    },
    ex: {
      default: 8,
      describe: "ex-size in pixels",
    },
    width: {
      default: 80 * 16,
      describe: "width of container in pixels",
    },
    dist: {
      boolean: true,
      default: false,
      describe:
        "true to use webpacked version, false to use MathJax source files",
    },
  }).argv;

require("mathjax-full")
  .init({
    options: {
      enableAssistiveMml: false,
    },
    loader: {
      load: ["tex-svg", "[tex]/ams", "[tex]/mathtools"],
    },
    tex: {
      packages: ["base", "ams", "mathtools"],
    },
    svg: {
      fontCache: "local",
    },
    startup: {
      typeset: false,
    },
  })
  .then((MathJax) => {
    MathJax.tex2svgPromise(input, {
      display: !argv.inline,
      em: argv.em,
      ex: argv.ex,
      containerWidth: argv.width,
    }).then((node) => {
      const adaptor = MathJax.startup.adaptor;
      let html = adaptor.innerHTML(node);
      console.log(html.replace(/<defs>/, `<defs><style>${CSS}</style>`));
    });
  })
  .catch((err) => console.log(err));
