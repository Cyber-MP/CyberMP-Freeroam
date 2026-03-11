// biome-ignore lint/style/noRestrictedGlobals: injecting global mock mp
if (typeof mp === 'undefined') {
  window.mp = {
    events: {
      on(...args) {},
      off(...args) {},
      emit(...args) {},
    },
  };
}
