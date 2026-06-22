export const setBodyVisibility = (visible: boolean) => {
  document.body.dataset.visible = visible.toString();
};

export const toggleBodyVisibility = () => {
  if (document.body.dataset.visible === 'true') {
    document.body.dataset.visible = 'false';
  } else {
    document.body.dataset.visible = 'true';
  }
};

export const getHudVisibility = () => {
  return document.body.dataset.visible === 'true';
};
