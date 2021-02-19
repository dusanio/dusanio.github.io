const linesContainer = document.getElementById("lines");
const lineElements = [...linesContainer.getElementsByTagName("span")];

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

(async function () {
  for (const lineEl of lineElements) {
    const line = lineEl.textContent;
    const lineHTML = lineEl.innerHTML;

    lineEl.textContent = "";
    lineEl.classList.remove("hidden");

    for (const char of line) {
      lineEl.textContent += char;
      await sleep(55);
    }

    lineEl.innerHTML = lineHTML;
    await sleep(400);
  }

  /* setInterval(() => {
    const lastLine = lineElements[lineElements.length - 1];

    if (lastLine.textContent.endsWith("|")) {
      lastLine.textContent = lastLine.textContent.substring(
        0,
        lastLine.textContent.length - 1
      );
    } else {
      lastLine.textContent += "|";
    }
  }, 600);*/
})();
