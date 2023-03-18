export function isAncestorOf(parent: HTMLElement, child: HTMLElement): boolean {
    if (parent === child) {
        return true;
      }
      if (child.parentNode === null) {
        return false;
      }
      return isAncestorOf(parent, child.parentNode as HTMLElement);
}