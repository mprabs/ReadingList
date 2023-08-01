/* eslint-disable no-undef */
// contentScript.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getContent") {
    const title = document.title;
    const image = document.querySelector("img")?.src || "";
    const content = getAllParagraphText();
    const url = window.location.href;
    const date = new Date();

    sendResponse({ content: { title, image, content, url, date } });
  }
  return true;
});

function getAllParagraphText() {
  const paragraphs = document.getElementsByTagName("p");
  const textContentArray = [];

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i];
    const textContent = paragraph.textContent.trim();
    if (textContent) {
      textContentArray.push(textContent);
    }
  }

  return textContentArray.join("\n");
}
