// Metro config for `expo start` and `expo export`. The dev server also answers
// the MangaDex proxy paths that Netlify provides in production, so a localhost
// build loads volume covers like the deployed site does.
//
// Both handler and routes are TypeScript modules, which `require` can load
// since Node strips types (22.6 behind a flag, 24 by default): see
// `engines.node`. Neither has imports, so no tsconfig alias is involved.
const { getDefaultConfig } = require("expo/metro-config");
const { proxyMangaDex } = require("./scripts/mangadexProxy.ts");
const {
  MANGADEX_USER_AGENT,
  upstreamUrl,
} = require("./src/data/mangadexRoutes.ts");

const config = getDefaultConfig(__dirname);

config.server = {
  ...config.server,
  enhanceMiddleware: (metroMiddleware) => async (req, res, next) => {
    try {
      const handled = await proxyMangaDex({
        req,
        res,
        upstreamUrl,
        userAgent: MANGADEX_USER_AGENT,
      });
      if (!handled) metroMiddleware(req, res, next);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = config;
