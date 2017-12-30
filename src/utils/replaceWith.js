export default function replaceWith(node, nodes) {
  nodes = this.isArray(nodes) ? nodes : [nodes];

  for (var index = 0; index < nodes.length; index++) {
    if (index == 0) {
      node.parentNode.replaceChild(nodes[index], node);
    } else {
      this.insertAfter(nodes[index - 1], nodes[index]);
    }
  }
}
