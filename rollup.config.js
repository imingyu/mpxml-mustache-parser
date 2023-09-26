/* eslint-disable @typescript-eslint/no-require-imports */

const { babel } = require('@rollup/plugin-babel');
const RollupReplace = require('@rollup/plugin-replace');
const swc = require('unplugin-swc');
const { readFileSync } = require('fs');
const path = require('path');

console.log(swc);

module.exports = {
    input: 'src/index.ts',
    output: [
        {
            file: 'dist/cjs/index.js',
            format: 'cjs'
        },
        {
            file: 'dist/esm/index.js',
            format: 'esm'
        },
        {
            file: 'dist/umd/index.js',
            format: 'umd',
            name: 'MpXMLMustacheParser'
        }
    ],
    plugins: [
        swc.default.rollup({
            tsconfigFile: './tsconfig.json'
        }),
        RollupReplace({
            delimiters: ['', ''],
            values: {
                VERSION: JSON.parse(readFileSync(path.resolve(__dirname, './package.json'), 'utf8')).version
            },
            preventAssignment: true
        }),
        babel({
            extensions: ['.js'],
            presets: [
                [
                    '@babel/env',
                    {
                        modules: false,
                        targets: {
                            esmodules: true
                        }
                    }
                ]
            ],
            babelHelpers: 'inline'
        })
    ]
};
