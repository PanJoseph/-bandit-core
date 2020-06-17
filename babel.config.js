module.exports = function(api) {
  api.cache(true);

  const plugins = ['@babel/plugin-transform-runtime'];
  const presets = ['@babel/preset-env'];

  return { plugins, presets };
};
