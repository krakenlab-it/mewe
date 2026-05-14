import "@testing-library/jest-dom/vitest";

HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  canvas: {},
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  closePath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  measureText: vi.fn(() => ({ width: 10 })),
  setTransform: vi.fn(),
  resetTransform: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  scale: vi.fn(),
  createLinearGradient: vi.fn(() => ({
    addColorStop: vi.fn(),
  })),
  createRadialGradient: vi.fn(() => ({
    addColorStop: vi.fn(),
  })),
  setLineDash: vi.fn(),
  getLineDash: vi.fn(() => []),
  fillText: vi.fn(),
  strokeText: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
}));
