/*jslint browser: true, white: true, sloppy: true, maxlen: 80, devel: true*/
/*global RegularEditor, $, tinyMCE*/
if (!window.RegularEditor)
{
 window.RegularEditor = { Plugins: [] };
}
RegularEditor.Settings = {};
RegularEditor.Elements = {};
RegularEditor.RunForEveryPlugin =
 function (callback)
 {
  try
  {
   /*jslint plusplus: true*/
   for (i = 0, length = RegularEditor.Plugins.length; i < length; i++)
   {
   /*jslint plusplus: false*/
    try
    {
      callback(RegularEditor.Plugins[i]);
    }
    catch (e)
    {
     console.log(
      "There was a problem with the \"Initialize\" " +
      "function of one of the plugins.\n", e);
    }
   }
  }
  catch (e1)
  {
   console.log("There was a problem during the plugin initialization.", e1);
  }
 };
RegularEditor.CanSubmit =
 function ()
 {
  var canSubmit = true;
  RegularEditor.RunForEveryPlugin(
   function (plugin)
   {
    if (plugin.CanSubmit && !plugin.CanSubmit())
    {
     canSubmit = false;
    }
   });
   return canSubmit;
 };
RegularEditor.ToggleEditModes =
function ()
 {
  function callback()
  {
   RegularEditor.Settings.RichEditMode = !RegularEditor.Settings.RichEditMode;
   if (window.tinyMCE)
   {
    $("#divEditor").slideToggle();
   }
   else
   {
    RegularEditor.Elements.RichEditControllers.slideToggle();
   }
   RegularEditor.Elements.RegularEditController.slideToggle();
   RegularEditor.Elements.PluginContainer.slideToggle();
   RegularEditor.ResizeWindow();
   if (window.tinyMCE)
   {
    /*jslint evil: true, regexp: true, maxlen: 100*/
    if (RegularEditor.Settings.RichEditMode)
    {
     eval(
      "window.doSubmit = " +
       window.doSubmit.toString()
        .replace(
         /RegularEditor.PrepareTextForSubmitting\(\);/,
         "document.frmBlog.blogtextnew.value = " +
         "tinyMCE.get('blogtextnew').getContent()")
        .replace(
         /RegularEditor\.Elements\.RegularEditController\.val\(\)/,
         "tinyMCE.get('blogtextnew').getContent()")
        .replace("tinyMCE.get('blogtextnew').remove();","")
        .replace("window.onbeforeunload = null;}", "}"));
     eval(
      "window.previewPost = " +
      window.previewPost.toString()
       .replace(
        "RegularEditor.RemoveInitialComments(" +
         "RegularEditor.Elements.RegularEditController.val(), true)",
        "tinyMCE.get('blogtextnew').getContent()"));
    }
    else
    {
     eval(
      "window.doSubmit = " +
      window.doSubmit.toString()
       .replace(
        /{/, "{ if (!RegularEditor.CanSubmit()) { return; }")
       .replace(
        /document\.frmBlog\.blogtextnew\.value = tinyMCE\.get\('blogtextnew'\)\.getContent\(\)/g,
        "RegularEditor.PrepareTextForSubmitting();")
       .replace(
        /tinyMCE\.get\('blogtextnew'\)\.getContent\(\)/g,
        "RegularEditor.Elements.RegularEditController.val()")
       .replace(/\}$/,"window.onbeforeunload = null;}"));
     eval(
      "window.previewPost = " +
      window.previewPost.toString()
       .replace(
        "tinyMCE.get('blogtextnew').getContent()",
        "RegularEditor.RemoveInitialComments(" +
         "RegularEditor.Elements.RegularEditController.val(), true)"));
    }
    /*jslint evil: false, regexp: false*/
   }
   else
   {
    window.getEditText =
     (RegularEditor.Settings.RichEditMode?
       RegularEditor.GetRichEditText:
       RegularEditor.GetRegularEditTextForSubmitting);
   }
  }
  if ($("input[name=_regular-editor-original-text]:checked").val() === "1" &&
      $("input[name=code]").val() !== "-1")
  {
   RegularEditor.FetchOriginalPost(callback);
  }
  else
  {
   if (RegularEditor.Settings.RichEditMode)
   {
    if (window.tinyMCE)
    {
     RegularEditor.Elements.RegularEditController.val(
      RegularEditor.RemoveInitialComments(
       RegularEditor.FixMCELineBreaks(
        tinyMCE.get('blogtextnew').getContent().trim()), false));
    }
    else
    {
     RegularEditor.Elements.RegularEditController.val(
      RegularEditor.RemoveInitialComments(
       $(RegularEditor.Elements.RichEditTextContent.contentDocument)
        .find("body").html().trim(),
       false));
    }
   }
   else
   {
    if (window.tinyMCE)
    {
     tinyMCE.get('blogtextnew').setContent(RegularEditor.GetRegularEditText());
    }
    else
    {
     $(RegularEditor.Elements.RichEditTextContent.contentDocument)
      .find("body").html(RegularEditor.GetRegularEditText());
    }
   }
   callback();
  }
 };
RegularEditor.PrepareTextForSubmitting =
 function ()
 {
  tinyMCE.get("blogtextnew").remove();
  $("#blogtextnew").val(
   RegularEditor.FixDropOmittingAndUnicodeStuff(
    RegularEditor.RemoveInitialComments(
     RegularEditor.Elements.RegularEditController.val())));
 };
RegularEditor.FetchOriginalPost =
 function (callback)
 {
  var request;
  function immediateCallback()
  {
   if (RegularEditor.Settings.RichEditMode)
   {
    RegularEditor.Elements.RegularEditController.val(
     RegularEditor.RemoveInitialComments(RegularEditor.OriginalPost, false));
   }
   else
   {
    if (window.tinyMCE)
    {
     tinyMCE.get('blogtextnew').setContent(RegularEditor.OriginalPost);
    }
    else
    {
     $(RegularEditor.Elements.RichEditTextContent.contentDocument).find("body")
      .html(RegularEditor.OriginalPost);
    }
   }
  }

  if (!RegularEditor.OriginalPost)
  {
   request = new XMLHttpRequest();
   request.open("POST", "/edit/blogrichedit_m.asp", true);
   request.responseType = "document";
   request.onload =
    function ()
    {
     var eIFrame = request.response.getElementById("edit"),
         content = eIFrame.textContent;
         content = content.substring(content.indexOf("<body"));
         content = content.replace(/<body[^>]+>|<\/body>/g, "").trim();
     content = content.replace(/ -shadow/g, " drop-shadow");
     RegularEditor.OriginalPost = content;
     immediateCallback();
     callback();
    };
   request.setRequestHeader(
    "Content-Type", "application/x-www-form-urlencoded");
   request.send(
    "code=" + document.frmBlog.code.value +
    "&submitted=1" +
    "&doThis=edit");
  }
  else
  {
   immediateCallback();
  }
 };
RegularEditor.FixMCELineBreaks =
 function (Text)
 {
  return Text.replace(/\n<div/g, "<div").replace(/<\/div>\n/g, "</div>");
 };
RegularEditor.RemoveInitialComments =
 function (Text, Saving)
 {
  if (Text.indexOf("<!--") === 0)
  {
   Text = Text.replace(/^<!--/,"<!");
   Text = Text.replace(/-->/,">");
  }
  if (!RegularEditor.Settings.RichEditMode || Saving)
  {
   Text = Text.replace(/\r\n|\n/g, "<br/>");
  }
  else
  {
   Text = Text.replace(/<br>|<br\/>|<br \/>/g, "\n");
  }
  return Text;
 };
RegularEditor.GetRegularEditText =
 function ()
 {
  return RegularEditor.RemoveInitialComments(
          RegularEditor.Elements.RegularEditController.val(), true);
 };
RegularEditor.GetRegularEditTextForSubmitting =
 function ()
 {
  return RegularEditor.FixDropOmittingAndUnicodeStuff(
          RegularEditor.GetRegularEditText());
 };
RegularEditor.FixDropOmittingAndUnicodeStuff =
 function (text)
 {
  text =
   text.replace(
    new RegExp(
     "[" + String.fromCharCode(8235) + String.fromCharCode(8236) + "]", "g"),
    "");
  if (document.location.host.indexOf("israblog") !== -1)
  {
   return text.replace(/drop/g, "drdropop");
  }
  return text;
 };
RegularEditor.InitializeEditingModeChanger = 
 function ()
 {
  var i, length;
  if (typeof localStorage["UseOriginalText"] === "undefined")
  {
   localStorage["UseOriginalText"] = "1";
  }
  if (window.tinyMCE)
  {
   RegularEditor.Elements.RichEditControllers = $("#divEditor");
   RegularEditor.Elements.RichEditParent =
    RegularEditor.Elements.RichEditControllers.parent();
  }
  else
  {
   RegularEditor.Elements.RichEditTextContent = $("#edit")[0];
   RegularEditor.Elements.RichEditControllers =
    $("TD.rightM>DIV.Toolbar, #edit, td.left");
   RegularEditor.Elements.RichEditParent =
    RegularEditor.Elements.RichEditControllers.parent(".right");
  }
  RegularEditor.Elements.RegularEditController =
   RegularEditor.Elements.RichEditParent.append(
    "<textarea id=\"RegularWriter\"/>")
    .children("#RegularWriter").css(
     {
      "font-family": "Arial",
      "width": "99%",
      "height": "250px"
     }).hide();
  RegularEditor.Elements.PluginContainer =
   RegularEditor.Elements.RichEditParent.append(
    "<div id=\"RegularEditorPluginContainer\" class=\"rowTitle\"/>")
    .children("#RegularEditorPluginContainer").hide();
  $("#moodicon").parent().append(
   "<div class=\"rowTitle\">" +
    "<a href=\"javascript:RegularEditor.ToggleEditModes()\">שנה סוג עריכה" +
    "<\/a>" +
    "<br/>" +
    "העדפה בעריכת קטע קיים -" +
    "<br/>" +
    "<label><input type=\"radio\" " +
                  "onclick=\"localStorage['UseOriginalText'] = 1\" " +
                  "name=\"_regular-editor-original-text\" " +
                  "value=\"1\">השתמש בקטע השמור המקורי</label>" +
    "<br/>" +
    "<label><input type=\"radio\" " +
                  "onclick=\"localStorage['UseOriginalText'] = 0\" " +
                  "name=\"_regular-editor-original-text\" " +
                  "value=\"0\">" +
     "השתמש בקטע הקיים בעמוד (עם כל השינויים)</label>" +
    "<br/>" +
    "<br/>" +
   "</div>");
  $(
   "input[name=_regular-editor-original-text]" +
        "[value=" + localStorage["UseOriginalText"] + "]")
   .attr("checked", "checked");
  RegularEditor.RunForEveryPlugin(
   function (plugin)
   {
    plugin.Initialize();
   });
  RegularEditor.ResizeWindow();
 };

if (window.tinyMCE)
{
 window.getEditText =
  function ()
  {
   tinyMCE.get("blogtextnew").getContent();
  };
}
RegularEditor.GetOriginalRichEditText = window.getEditText;
RegularEditor.GetRichEditText =
 function ()
 {
  RegularEditor.GetOriginalRichEditText();
 };
RegularEditor.ResizeWindow =
 function ()
 {
  try
  {
   window.parent.resizeIframe(
    parseInt(window.getComputedStyle(document.body).height, 10) + 300);
  }
  catch (e)
  {
  }
 };
RegularEditor.Settings.RichEditMode = true;
window.addEventListener(
 "load", RegularEditor.InitializeEditingModeChanger, false);