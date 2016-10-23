require.config({
    baseUrl: 'js',
    paths: {
        // remove:start
        jquery: '../vendor/jquery/dist/jquery',
        knockout: '../vendor/knockout/dist/knockout',
        'knockout.mapping': '../vendor/knockout-mapping/knockout.mapping',
        lodash: '../vendor/lodash/lodash',
        requirejs: '../vendor/requirejs/require',
        sammy: '../vendor/sammy/lib/sammy'
        // remove:end
        /* remove:line
        jquery: '../vendor/jquery/dist/jquery.min',
        knockout: '../vendor/knockout/dist/knockout',
        'knockout.mapping': '../vendor/knockout-mapping/build/output/knockout.mapping-latest',
        lodash: '../vendor/lodash/dist/lodash.min',
        requirejs: '../vendor/requirejs/require',
        sammy: '../vendor/sammy/lib/min/sammy-latest.min'
        // remove:line */
    },
    packages: [],
    shim: {}
});
