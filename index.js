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
    maspace: {
      boolean: true,
      describe: "use [maSpace](https://github.com/ho-oto/maSpace)",
    },
  }).argv;

require("mathjax-full")
  .init({
    loader: {
      source: require("mathjax-full/components/src/source.js").source,
      load: ["input/tex", "output/svg", "[tex]/mathtools"],
    },
    tex: {
      packages: ["base", "ams", "mathtools"],
    },
  })
  .then((MathJax) => {
    MathJax.tex2svgPromise(
      argv.maspace ? require("maspace").maspace_to_tex_wasm(input) : input,
      {
        display: !argv.inline,
      }
    ).then((node) => {
      const adaptor = MathJax.startup.adaptor;
      let html = adaptor
        .innerHTML(node)
        .replace(/<defs>/, `<defs><style>${CSS}</style>`);
      console.log(html);
    });
  })
  .catch((err) => console.log(err));
