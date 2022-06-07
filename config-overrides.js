/* config-overrides.js */

module.exports = function override(config, env) {
    okv = {
        fallback: {
            crypto: require.resolve('crypto-browserify')

        },
    };
    if (!config.resolve) {
        config.resolve = okv;
    } else {
        config.resolve.fallback = {
            ...config.resolve.fallback, ...okv.fallback
        };
    }
    return config;
}