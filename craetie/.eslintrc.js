// .eslintrc.js

module.exports = {
  root: true,
  env: {
    browser: true,
    jest: true,
    es6: true,
    es2020: true, // <- activate “es2020” globals
    node: true,
    mocha: true,
  },
  extends: ['prettier'],
  plugins: ['prettier', 'import', 'react'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    parser: 'babel-eslint',
  },
  rules: {
    // 自定义 prettier 规则 (实际上，可配置项非常有限)
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        trailingComma: 'all',
      },
    ],
    camelcase: 'off', // 强制驼峰法命名
    'no-new': 'off', // 禁止在使用new构造一个实例后不赋值
    'space-before-function-paren': 'off', // 函数定义时括号前面不要有空格
    'no-plusplus': 'off', // 禁止使用 ++， ——
    'max-len': 'off', // 字符串最大长度
    'func-names': 'off', // 函数表达式必须有名字
    'no-param-reassign': 'off', // 不准给函数入参赋值
  },
};
