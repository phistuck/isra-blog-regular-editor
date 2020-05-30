if (!window.RegularEditor)
 window.RegularEditor = { Plugins: [] };
RegularEditor.Settings = {};
RegularEditor.Elements = {};
RegularEditor.ToggleEditModes =
function()
{
 if ($("input[name=_regular-editor-original-text]:checked").val() == "1" && $("input[name=code]").val() != "-1")
 {
  RegularEditor.FetchOriginalPost();
 }
 else
 {
  if (RegularEditor.Settings.RichEditMode)
  {
   if (window.tinyMCE)
    RegularEditor.Elements.RegularEditController.val(RegularEditor.RemoveInitialComments(RegularEditor.FixMCELineBreaks(tinyMCE.get('blogtextnew').getContent().trim()), false));
   else
    RegularEditor.Elements.RegularEditController.val(RegularEditor.RemoveInitialComments($(RegularEditor.Elements.RichEditTextContent.contentDocument).find("body").html().trim(), false));
  }
  else
  {
   if (window.tinyMCE)
    tinyMCE.get('blogtextnew').setContent(RegularEditor.GetRegularEditText());
   else
    $(RegularEditor.Elements.RichEditTextContent.contentDocument).find("body").html(RegularEditor.GetRegularEditText());
  }
 }
 RegularEditor.Settings.RichEditMode = !RegularEditor.Settings.RichEditMode;
 if (window.tinyMCE)
  $("#divEditor").slideToggle();
 else
  RegularEditor.Elements.RichEditControllers.slideToggle();
 RegularEditor.Elements.RegularEditController.slideToggle();
 RegularEditor.Elements.PluginContainer.slideToggle();
 RegularEditor.ResizeWindow();
 if (window.tinyMCE)
 {
  if (RegularEditor.Settings.RichEditMode)
  {
   eval("window.doSubmit = " + window.doSubmit.toString().replace(/\$\("#blogtextnew"\).val\(RegularEditor\.RemoveInitialComments\(RegularEditor\.Elements\.RegularEditController\.val\(\)\)\)/, "document.frmBlog.blogtextnew.value = tinyMCE.get('blogtextnew').getContent()").replace(/RegularEditor\.Elements\.RegularEditController\.val\(\)/, "tinyMCE.get('blogtextnew').getContent()").replace("tinyMCE.get('blogtextnew').remove();","").replace("window.onbeforeunload = null;}", "}"));
   eval("window.previewPost = " + window.previewPost.toString().replace("RegularEditor.RemoveInitialComments(RegularEditor.Elements.RegularEditController.val(), true)", "tinyMCE.get('blogtextnew').getContent()"));
  }
  else
  {
   eval("window.doSubmit = " + window.doSubmit.toString().replace(/document\.frmBlog\.blogtextnew\.value = tinyMCE\.get\('blogtextnew'\)\.getContent\(\)/g, "tinyMCE.get('blogtextnew').remove();$(\"#blogtextnew\").val(RegularEditor.RemoveInitialComments(RegularEditor.Elements.RegularEditController.val()))").replace(/tinyMCE\.get\('blogtextnew'\)\.getContent\(\)/g, "RegularEditor.Elements.RegularEditController.val()").replace(/\}$/,"window.onbeforeunload = null;}"));
   eval("window.previewPost = " + window.previewPost.toString().replace("tinyMCE.get('blogtextnew').getContent()", "RegularEditor.RemoveInitialComments(RegularEditor.Elements.RegularEditController.val(), true)"));
  }
 }
 else
  window.getEditText = (RegularEditor.Settings.RichEditMode? RegularEditor.GetRichEditText: RegularEditor.GetRegularEditText);
}
RegularEditor.FetchOriginalPost =
function ()
{
 if (!RegularEditor.OriginalPost)
  $.ajax({global: false,
          async: false,
          type: "POST",
          url: "/edit/blogrichedit_m.asp",
          data:
           {
            code: document.frmBlog.code.value,
            submitted: 1,
            doThis: "edit"
           },
          success: function (data)
           {
            RegularEditor.OriginalPost = data.replace(/^[\d\D]*<iframe[ ]*frameborder="0"[ ]*id="edit"[^>]*>[^,]*<style[^<]*<\/style>[^<]*<body[^>]*>[\s\t\n]+([\d\D]*)\n[\s\t]+<\/body>[\d\D]*.*BUTTONS AND SMILIES[\d\D]*$/,"$1").trim();
           }
         });
 if (RegularEditor.Settings.RichEditMode)
  RegularEditor.Elements.RegularEditController.val(RegularEditor.RemoveInitialComments(RegularEditor.OriginalPost, false));
 else
 {
  if (window.tinyMCE)
   tinyMCE.get('blogtextnew').setContent(RegularEditor.OriginalPost);
  else
   $(RegularEditor.Elements.RichEditTextContent.contentDocument).find("body").html(RegularEditor.OriginalPost);
 }
}
RegularEditor.FixMCELineBreaks =
function (Text)
{
 return Text.replace(/\n<div/g, "<div").replace(/<\/div>\n/g, "</div>");
}
RegularEditor.RemoveInitialComments =
function (Text, Saving)
{
 if (Text.indexOf("<!--") == 0)
 {
  Text = Text.replace(/^<!--/,"<!");
  Text = Text.replace(/-->/,">");
 }
 if (!RegularEditor.Settings.RichEditMode || Saving)
  Text = Text.replace(/\r\n|\n/g, "<br/>");
 else
  Text = Text.replace(/<br>|<br\/>|<br \/>/g, "\n");
 return Text;
}

RegularEditor.GetRegularEditText =
function ()
{
 return RegularEditor.RemoveInitialComments(RegularEditor.Elements.RegularEditController.val(), true);
}

RegularEditor.InitializeEditingModeChanger = 
function ()
{
 if (typeof localStorage["UseOriginalText"] == "undefined")
  localStorage["UseOriginalText"] = "0";
 if (window.tinyMCE)
 {
  RegularEditor.Elements.RichEditControllers = $("#divEditor");
  RegularEditor.Elements.RichEditParent = RegularEditor.Elements.RichEditControllers.parent();
 }
 else
 {
  RegularEditor.Elements.RichEditTextContent = $("#edit")[0];
  RegularEditor.Elements.RichEditControllers = $("TD.rightM>DIV.Toolbar, #edit, td.left");
  RegularEditor.Elements.RichEditParent = RegularEditor.Elements.RichEditControllers.parent(".right");
 }
 RegularEditor.Elements.RegularEditController = RegularEditor.Elements.RichEditParent.append("<textarea id=\"RegularWriter\"/>").children("#RegularWriter").css({"font-family": "Arial", "width": "99%", "height": "250px"}).hide();
 RegularEditor.Elements.PluginContainer = RegularEditor.Elements.RichEditParent.append("<div id=\"RegularEditorPluginContainer\" class=\"rowTitle\"/>").children("#RegularEditorPluginContainer").hide();
 $("#moodicon").parent().append("<div class=\"rowTitle\">" +
                                 "<a href=\"javascript:RegularEditor.ToggleEditModes()\">שנה סוג עריכה<\/a>" +
                                 "<br/>" +
                                 "העדפה בעריכת קטע קיים -" +
                                 "<br/>" +
                                 "<label><input type=\"radio\" onclick=\"localStorage['UseOriginalText'] = 0\" name=\"_regular-editor-original-text\" value=\"0\">השתמש בקטע הקיים בעמוד (עם כל השינויים)</label>" +
                                 "<br/>" +
                                 "<label><input type=\"radio\" onclick=\"localStorage['UseOriginalText'] = 1\" name=\"_regular-editor-original-text\" value=\"1\">השתמש בקטע השמור המקורי</label>" +
                                 "<br/>" +
                                 "<br/>" +
                                "</div>");
 $("input[name=_regular-editor-original-text][value=" + localStorage["UseOriginalText"] + "]").attr("checked", "checked");
 try
 {
  for (var i = 0; i < RegularEditor.Plugins.length; i++)
   RegularEditor.Plugins[i].Initialize();
 }
 catch (e)
 {
  console.log("There was a problem with the \"Initialize\" function of one of the plugins.\n",e);
 }
 RegularEditor.ResizeWindow();
}

if (window.tinyMCE)
 window.getEditText = function() { tinyMCE.get("blogtextnew").getContent() };
RegularEditor.GetOriginalRichEditText = window.getEditText;
RegularEditor.GetRichEditText =
function()
{
 RegularEditor.GetOriginalRichEditText();
}

RegularEditor.ResizeWindow = function() { try { window.parent.resizeIframe(parseInt(window.getComputedStyle(document.body).height) + 300); } catch (e) {} }
RegularEditor.Settings.RichEditMode = true;
window.addEventListener("load", RegularEditor.InitializeEditingModeChanger, false);