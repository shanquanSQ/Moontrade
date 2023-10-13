export const toggleTheme = () => {
  const htmlElement = document.documentElement;
  if (htmlElement.getAttribute("data-theme") === "dark") {
    htmlElement.removeAttribute("data-theme");
  } else {
    htmlElement.setAttribute("data-theme", "dark");
  }
};
