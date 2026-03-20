// biome-ignore lint/style/noRestrictedGlobals: injecting global mock mp
if (typeof mp === 'undefined') {
  window.mp = {
    events: {
      on(...args) {
        console.log('MP.ON', ...args);
      },
      off(...args) {
        console.log('MP.OFF', ...args);
      },
      emit(...args) {
        console.log('MP.EMIT', ...args);
      },
    },
  };
}
