FirstTime = true;
function ToggleEditModes()
{
 if (RichEditMode)
 {
  if (FirstTime)
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
                RegularEditController.val(RemoveInitialComments(
                 data.replace(/^[\d\D]*<iframe frameborder="0"  id="edit"[^>]*>[^,]*<style[^<]*<\/style>[^<]*<body[^>]*>[\s\t\n]+([\d\D]*)\n[\s\t]+<\/body>[\d\D]*.*BUTTONS AND SMILIES[\d\D]*$/,"$1").trim(),
                 false))
               }
              });
   FirstTime = false;
  }
  else
  {
   RegularEditController.val(RemoveInitialComments($(RichEditTextContent.contentDocument).find("body").html().trim(), false));
  }
 }
 else
 {
  $(RichEditTextContent.contentDocument).find("body").html(GetRegularEditText());
 }
 RichEditMode = !RichEditMode;
 RichEditControllers.slideToggle();
 RegularEditController.slideToggle();
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
  Text = Text.replace(/\n/g, "<br/>")
 else
  Text = Text.replace(/<br>|<br\/>|<br \/>/g, "\n")
 return Text;
}
function GetRegularEditText()
{
 return RemoveInitialComments(RegularEditController.val(), true);
}
var RichEditTextContent = $("#edit")[0];
var RichEditControllers = $("TD.rightM>DIV.Toolbar, #edit, td.left");
var RegularEditController = RichEditControllers.parent(".right").append("<textarea id=\"RegularWriter\"/>").children("#RegularWriter").css({"font-family": "Arial", "width": "95%", "height": "250px"}).hide();
var GetRichEditText = getEditText;
var RichEditMode = true;
$("#moodicon").parent().append("<a href=\"javascript:ToggleEditModes()\">שנה סוג עריכה<\/a>");