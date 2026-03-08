if (typeof mp === 'undefined') {
  window.mp = {
    events: {
      on(...args) {},
      off(...args) {},
      emit(...args) {},
    },
  };
}
