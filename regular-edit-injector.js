var script = document.createElement("SCRIPT");
script.src = chrome.extension.getURL("regular-edit.js");
function inject()
{
 if ((window.document && document.documentElement))
 {
  document.documentElement.appendChild(script);
  console.log("Injected.");
 }
 else
 {
  setTimeout(inject, 10);
 }
}
inject();

