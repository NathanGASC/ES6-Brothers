export function traverseChildren(element: HTMLElement, callback: (child: HTMLElement) => void) {
    const children = element.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;
      callback(child);
      if (child.children.length > 0) {
        traverseChildren(child, callback);
      }
    }
  }