export const toTitleCase = (str: string) => {
  if (!str || str === '') {
    return '';
  } else {
    return str.replace(
      /\w\S*/g,
      (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
  }
};
