interface DesktopNavVisibilityOptions {
  currentScrollTop: number;
  lastScrollTop: number;
  isVisible: boolean;
  topRevealOffset?: number;
  deltaThreshold?: number;
}

export function getNextDesktopNavVisibility({
  currentScrollTop,
  lastScrollTop,
  isVisible,
  topRevealOffset = 12,
  deltaThreshold = 8,
}: DesktopNavVisibilityOptions) {
  if (currentScrollTop <= topRevealOffset) {
    return true;
  }

  const delta = currentScrollTop - lastScrollTop;

  if (delta >= deltaThreshold) {
    return false;
  }

  if (delta <= -deltaThreshold) {
    return true;
  }

  return isVisible;
}
