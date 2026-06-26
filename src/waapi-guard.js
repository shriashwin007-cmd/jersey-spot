/**
 * Safari WAAPI guard.
 *
 * Framer-motion v12 "accelerates" independent transform values (rotateY, scale,
 * x, etc.) by calling `element.animate({ rotateY: [...] }, ...)`. Safari/WebKit
 * does NOT recognize these independent transform properties as animatable
 * keyframe keys (no Houdini CSS.registerProperty support for them) and throws a
 * synchronous `TypeError: Type error`. That exception bubbles out of framer's
 * mount path and crashes the whole React tree → blank black screen.
 *
 * We wrap Element.prototype.animate so that if the native call throws, we return
 * a no-op Animation stub instead of crashing. The motion value still renders via
 * framer's main-thread JS render loop, so animations keep working — we just lose
 * the (broken-in-Safari) WAAPI acceleration for those specific keys.
 *
 * Must run before any framer-motion code executes.
 */
if (typeof Element !== 'undefined' && Element.prototype.animate) {
  const nativeAnimate = Element.prototype.animate;

  const makeStub = () => {
    let onfinish = null;
    const finished = Promise.resolve();
    finished.catch(() => {});
    return {
      // settable callbacks
      get onfinish() { return onfinish; },
      set onfinish(fn) { onfinish = fn; },
      oncancel: null,
      onremove: null,
      // playback controls (no-ops)
      play() {},
      pause() {},
      finish() {},
      cancel() {},
      reverse() {},
      persist() {},
      commitStyles() {},
      updatePlaybackRate() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() { return false; },
      // readable / writable props
      currentTime: 0,
      startTime: 0,
      playbackRate: 1,
      playState: 'finished',
      pending: false,
      replaceState: 'active',
      effect: null,
      timeline: null,
      rangeStart: undefined,
      rangeEnd: undefined,
      id: '',
      finished,
      ready: finished,
    };
  };

  Element.prototype.animate = function (...args) {
    try {
      return nativeAnimate.apply(this, args);
    } catch {
      return makeStub();
    }
  };
}
