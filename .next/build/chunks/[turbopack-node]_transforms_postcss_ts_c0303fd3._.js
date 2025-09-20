module.exports = [
"[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/saas-notes-app/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "build/chunks/2cb5f_82cf9bf9._.js",
  "build/chunks/[root-of-the-server]__30b5df88._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/saas-notes-app/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript)");
    });
});
}),
];