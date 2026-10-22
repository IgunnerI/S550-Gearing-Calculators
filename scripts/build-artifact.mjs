// Inlines the Vite build into one HTML fragment for publishing as a claude.ai Artifact.
// The artifact host supplies <html>/<head>/<body>, so the output is head tags + body content.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dist = "dist";
const html = readFileSync(join(dist, "index.html"), "utf8");
const assets = readdirSync(join(dist, "assets"));
const css = assets.filter((f) => f.endsWith(".css")).map((f) => readFileSync(join(dist, "assets", f), "utf8")).join("\n");
const js = assets.filter((f) => f.endsWith(".js")).map((f) => readFileSync(join(dist, "assets", f), "utf8")).join("\n");

const pick = (re) => (html.match(re) ?? []).join("\n");
const head = [
  pick(/<title>[\s\S]*?<\/title>/),
  pick(/<meta name="(description|claude:viewport-fit-sides)"[^>]*>/g),
  pick(/<link rel="(preconnect|stylesheet)" href="https:\/\/fonts[^>]*>/g),
].join("\n");

const out = `${head}
<style>
${css}
</style>
<div id="root"></div>
<script type="module">
${js.replace(/<\/script/gi, "<\\/script")}
</script>
`;

mkdirSync("artifact", { recursive: true });
writeFileSync("artifact/index.html", out);
console.log(`artifact/index.html ${(out.length / 1024).toFixed(1)} KB`);
