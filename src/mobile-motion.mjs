// Deliberate vertical gestures only; short taps and sideways movement must snap back.
export function shouldDismissSheet({dx=0,dy=0,elapsed=0,height=400}) {
  if (![dx,dy,elapsed,height].every(Number.isFinite)||dy<=0||dy<Math.abs(dx)*1.2) return false;
  return dy>=Math.min(112,Math.max(72,height*.24)) || (dy>=32&&elapsed>0&&dy/elapsed>.7);
}
export function motionDuration(reduced,desktop=false,closing=false) {
  return reduced||desktop?0:closing?170:240;
}
