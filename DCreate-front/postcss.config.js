module.exports = {
  plugins: {
    'postcss-px-to-viewport': {
      // options
      unitToConvert: 'px', // 需要转换的单位
      viewportWidth: 1400, // 设计稿的视口宽度
      unitPrecision: 5, // 单位转换后保留的精度
      propList: ['*'], // 能转换的vw属性列表
      viewportUnit: 'vw', // 希望使用的视口单位
      fontViewportUnit: 'vw', // 字体使用的视口单位
      selectorBlackList: [], // 需要忽略的css选择器
      minPixelValue: 1, // 设置最小的转换数值，如果为1，只有大于1的值才会被转换
      mediaQuery: false, // 媒体查询中是否需要转换单位
      replace: true, // 是否直接更换属性值
      exclude: [],
      landscape: false,
      landscapeUnit: 'vw', // 横屏时使用的单位
      landscapeWidth: 568 // 横屏时使用的视口宽度
    }
  }
}
