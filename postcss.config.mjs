import postcssImport from 'postcss-import';
import postcssNesting from 'postcss-nesting';

// 简单的 @layer 展开插件：把 @layer 内的规则提取到外层
// 用于兼容不支持 @layer 的旧浏览器（Chrome < 99）
const unwrapCascadeLayers = () => ({
  postcssPlugin: 'unwrap-cascade-layers',
  Once(root) {
    root.walkAtRules('layer', (atRule) => {
      const parent = atRule.parent;
      const nodes = [...atRule.nodes].reverse();
      for (const node of nodes) {
        parent.insertAfter(atRule, node);
      }
      atRule.remove();
    });
  }
});

export default {
  plugins: [
    postcssImport(),
    postcssNesting(),
    unwrapCascadeLayers(),
  ]
};
