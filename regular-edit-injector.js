var script = document.createElement("SCRIPT");
script.src = chrome.extension.getURL("regular-edit.js");
document.head.appendChild(script);
console.log("Injected.");