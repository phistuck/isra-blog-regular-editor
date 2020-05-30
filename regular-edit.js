function ToggleEditModes()
{
 if ($("input[name=_original-text]:checked").val() == "1" && $("input[name=code]").val() != "-1")
 {
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
            data = data.replace(/^[\d\D]*<iframe[ ]*frameborder="0"[ ]*id="edit"[^>]*>[^,]*<style[^<]*<\/style>[^<]*<body[^>]*>[\s\t\n]+([\d\D]*)\n[\s\t]+<\/body>[\d\D]*.*BUTTONS AND SMILIES[\d\D]*$/,"$1").trim();
            if (RichEditMode)
             RegularEditController.val(RemoveInitialComments(data, false));
            else
            {
             if (window.tinyMCE)
              tinyMCE.get('blogtextnew').setContent(data);
             else
              $(RichEditTextContent.contentDocument).find("body").html(data);
            }
           }
         });
 }
 else
 {
  if (RichEditMode)
  {
   if (window.tinyMCE)
    RegularEditController.val(RemoveInitialComments(tinyMCE.get('blogtextnew').getContent().trim(), false));
   else
    RegularEditController.val(RemoveInitialComments($(RichEditTextContent.contentDocument).find("body").html().trim(), false));
  }
  else
  {
   if (window.tinyMCE)
    tinyMCE.get('blogtextnew').setContent(GetRegularEditText());
   else
    $(RichEditTextContent.contentDocument).find("body").html(GetRegularEditText());
  }
 }
 RichEditMode = !RichEditMode;
 if (window.tinyMCE)
  $("#divEditor").slideToggle();
 else
  RichEditControllers.slideToggle();
 RegularEditController.slideToggle();
 RegularEditPluginContainer.slideToggle();
 if (window.tinyMCE)
 {
  if (RichEditMode)
  {
   eval("window.doSubmit = " + doSubmit.toString().replace(/\$\("#blogtextnew"\).val\(RemoveInitialComments\(RegularEditController\.val\(\)\)\)/, "document.frmBlog.blogtextnew.value = tinyMCE.get('blogtextnew').getContent()").replace(/RegularEditController\.val\(\)/, "tinyMCE.get('blogtextnew').getContent()").replace("tinyMCE.get('blogtextnew').remove();","").replace("window.onbeforeunload = null;}", "}"));
   eval("window.previewPost = " + previewPost.toString().replace("RegularEditController.val()", "tinyMCE.get('blogtextnew').getContent()"));
  }
  else
  {
   eval("window.doSubmit = " + doSubmit.toString().replace(/document\.frmBlog\.blogtextnew\.value = tinyMCE\.get\('blogtextnew'\)\.getContent\(\)/g, "tinyMCE.get('blogtextnew').remove();$(\"#blogtextnew\").val(RemoveInitialComments(RegularEditController.val()))").replace(/tinyMCE\.get\('blogtextnew'\)\.getContent\(\)/g, "RegularEditController.val()").replace(/\}$/,"window.onbeforeunload = null;}"));
   eval("window.previewPost = " + previewPost.toString().replace("tinyMCE.get('blogtextnew').getContent()", "RemoveInitialComments(RegularEditController.val(), true)"));
  }
 }
 else
  getEditText = (RichEditMode? GetRichEditText: GetRegularEditText);
}

function RemoveInitialComments(Text, Saving)
{
 if (Text.indexOf("<!--") == 0)
 {
  Text = Text.replace(/^<!--/,"<!");
  Text = Text.replace(/-->/,">");
 }
 if (!RichEditMode || Saving)
  Text = Text.replace(/\n/g, "<br/>");
 else
  Text = Text.replace(/<br>|<br\/>|<br \/>/g, "\n");
 return Text;
}

function GetRegularEditText()
{
 return RemoveInitialComments(RegularEditController.val(), true);
}

function InitializeEditingModeChanger()
{
 if (typeof localStorage["OriginalText"] == "undefined")
  localStorage["OriginalText"] = "0";
 if (window.tinyMCE)
 {
  RichEditControllers = $("#divEditor");
  RichEditParent = RichEditControllers.parent();
 }
 else
 {
  RichEditTextContent = $("#edit")[0];
  RichEditControllers = $("TD.rightM>DIV.Toolbar, #edit, td.left");
  RichEditParent = RichEditControllers.parent(".right");
 }
 RegularEditController = RichEditParent.append("<textarea id=\"RegularWriter\"/>").children("#RegularWriter").css({"font-family": "Arial", "width": "99%", "height": "250px"}).hide();
 RegularEditPluginContainer = RichEditParent.append("<div id=\"RegularEditorPluginContainer\" class=\"rowTitle\"/>").children("#RegularEditorPluginContainer").hide();
 $("#moodicon").parent().append("<div class=\"rowTitle\">" +
                                 "<a href=\"javascript:ToggleEditModes()\">שנה סוג עריכה<\/a>" +
                                 "<br/>" +
                                 "העדפה בעריכת קטע קיים -" +
                                 "<br/>" +
                                 "<label><input type=\"radio\" onclick=\"localStorage['OriginalText'] = 0\" name=\"_original-text\" value=\"0\">השתמש בקטע הקיים בעמוד (עם כל השינויים)</label>" +
                                 "<br/>" +
                                 "<label><input type=\"radio\" onclick=\"localStorage['OriginalText'] = 1\" name=\"_original-text\" value=\"1\">השתמש בקטע השמור המקורי</label>" +
                                 "<br/>" +
                                 "<br/>" +
                                "</div>");
 $("input[name=_original-text][value=" + localStorage["OriginalText"] + "]").attr("checked", "checked");
 for (var i = 0; i < RegularEditorPluginInitializers.length; i++)
  RegularEditorPluginInitializers[i]();
}

var RichEditControllers, RichEditParent, RichEditTextContent, RegularEditPluginContainer;
if (window.tinyMCE)
 var getEditText = function() { tinyMCE.get("blogtextnew").getContent() };
var GetRichEditText = getEditText;
var RichEditMode = true;
if (!window.RegularEditorPluginInitializers)
 var RegularEditorPluginInitializers = [];
if (!window.RegularEditorPluginObjects)
 var RegularEditorPluginObjects = [];
window.addEventListener("load", InitializeEditingModeChanger, false);