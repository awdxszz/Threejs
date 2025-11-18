export function getAdjustedContentSize({
  containerEl,
  sidebarSelector,
  headerSelector,
  minWidth = 1,
  minHeight = 1,
} = {}) {
  const baseRect = containerEl
    ? containerEl.getBoundingClientRect()
    : document.documentElement.getBoundingClientRect();
  let width = Math.floor(baseRect.width);
  let height = Math.floor(baseRect.height);
  const sidebarEl = sidebarSelector
    ? document.querySelector(sidebarSelector)
    : null;
  if (sidebarEl) {
    const sw = Math.floor(sidebarEl.getBoundingClientRect().width);
    width = Math.max(minWidth, width - sw);
  }
  const headerEl = headerSelector
    ? document.querySelector(headerSelector)
    : null;
  if (headerEl) {
    const hh = Math.floor(headerEl.getBoundingClientRect().height);
    height = Math.max(minHeight, height - hh);
  }
  return { width, height };
}

export function resizeRendererToLayout({
  containerSelector,
  containerEl,
  camera,
  renderer,
  sidebarSelector,
  headerSelector,
  minWidth = 1,
  minHeight = 1,
  onResized,
} = {}) {
  const baseEl =
    containerEl ||
    (containerSelector ? document.querySelector(containerSelector) : null) ||
    (renderer && renderer.domElement && renderer.domElement.parentElement) ||
    document.documentElement;
  const { width, height } = getAdjustedContentSize({
    containerEl: baseEl,
    sidebarSelector,
    headerSelector,
    minWidth,
    minHeight,
  });
  if (camera) {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  if (renderer) {
    renderer.setSize(width, height, false);
  }
  if (typeof onResized === "function") {
    onResized({ width, height });
  }
  return { width, height };
}

export function getContainerLayoutSize({
  containerSelector,
  containerEl,
  sidebarSelector,
  headerSelector,
  minWidth = 1,
  minHeight = 1,
} = {}) {
  const baseEl =
    containerEl ||
    (containerSelector ? document.querySelector(containerSelector) : null) ||
    document.documentElement;
  const { width: lw, height: lh } = getAdjustedContentSize({
    containerEl: baseEl,
    sidebarSelector,
    headerSelector,
    minWidth,
    minHeight,
  });
  const cw = baseEl?.clientWidth || lw;
  const ch = baseEl?.clientHeight || lh;
  return { width: Math.min(cw, lw), height: Math.min(ch, lh) };
}
