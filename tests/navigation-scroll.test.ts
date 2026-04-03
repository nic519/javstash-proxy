import { describe, expect, it } from 'vitest';
import { getNextDesktopNavVisibility } from '../components/navigation-scroll';

describe('getNextDesktopNavVisibility', () => {
  it('keeps the navigation visible near the top of the list', () => {
    expect(
      getNextDesktopNavVisibility({
        currentScrollTop: 6,
        lastScrollTop: 28,
        isVisible: false,
      })
    ).toBe(true);
  });

  it('hides the navigation after scrolling down past the threshold', () => {
    expect(
      getNextDesktopNavVisibility({
        currentScrollTop: 80,
        lastScrollTop: 48,
        isVisible: true,
      })
    ).toBe(false);
  });

  it('shows the navigation again after scrolling up past the threshold', () => {
    expect(
      getNextDesktopNavVisibility({
        currentScrollTop: 64,
        lastScrollTop: 108,
        isVisible: false,
      })
    ).toBe(true);
  });

  it('ignores tiny scroll movements to avoid flicker', () => {
    expect(
      getNextDesktopNavVisibility({
        currentScrollTop: 72,
        lastScrollTop: 68,
        isVisible: false,
      })
    ).toBe(false);
  });
});
