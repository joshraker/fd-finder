require.config({
    baseUrl: 'js',
    paths: {
        // remove:start
        jquery: '../..//node_modules/jquery/dist/jquery',
        knockout: '../../node_modules/knockout/build/output//knockout-latest.debug',
        'knockout.mapping': '../../node_modules/knockout-mapping/dist/knockout.mapping',
        lodash: '../../node_modules/lodash/lodash',
        requirejs: '../../node_modules/requirejs/require',
        sammy: '../../node_modules/sammy/lib/sammy'
        // remove:end
        /* remove:line
        jquery: '../../node_modules/jquery/dist/jquery.min',
        knockout: '../../node_modules/knockout/dist/knockout',
        'knockout.mapping': '../../node_modules/knockout-mapping/build/output/knockout.mapping-latest',
        lodash: '../../node_modules/lodash/dist/lodash.min',
        requirejs: '../../node_modules/requirejs/require',
        sammy: '../../node_modules/sammy/lib/min/sammy-latest.min'
        // remove:line */
    },
    packages: [],
    shim: {}
});
