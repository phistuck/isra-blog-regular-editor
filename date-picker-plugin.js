/*jslint white: true, sloppy: true, newcap: true, browser: true, maxlen: 80*/
/*global RegularEditor, console, confirm, $*/
if (!window.RegularEditor)
{
 window.RegularEditor = { Plugins: [] };
}
(function()
{
 var pluginID = RegularEditor.Plugins.length;
 function updatePostDate(dateString)
 {
  var date;
  if (!dateString)
  {
   return;
  }
  date = new Date(dateString);
  if (!date)
  {
   return;
  }
  date.setHours(date.getHours() - (date.getTimezoneOffset() / 60));
  $("input[name=\"blogtime\"]").val(
   date.toISOString().replace("T", " ").replace(/:\d\d\..+$/, ""));
  $("input[name=\"hebblogtime\"]").val(
   date.toISOString().replace("T", " ").replace(/:\d\d\..+$/, ""));
 }
 function initialize()
 {
  var now = new Date();
  now.setHours(now.getHours() - (now.getTimezoneOffset() / 60));
  var pluginElement = $("<div class=\"plugin-" + this.PluginID + "\">");
  pluginElement.append(
   "<input type=datetime-local " +
          "value=" + now.toISOString().replace(/:\d\d\..+$/, "") + " " +
          "onchange=\"RegularEditor.Plugins[" + this.PluginID +
                      "].UpdatePostDate(this.value);\"/>");
  RegularEditor.Elements.PluginContainer.append(pluginElement);
  this.PluginElement = pluginElement;
 }
 RegularEditor.Plugins[pluginID] =
  {
   "Initialize": initialize,
   "PluginID": pluginID,
   "UpdatePostDate": updatePostDate
  };
}());