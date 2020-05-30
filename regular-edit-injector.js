var script = document.createElement("SCRIPT");
script.src = chrome.extension.getURL("regular-edit.js");
document.documentElement.appendChild(script);
console.log("Injected.");