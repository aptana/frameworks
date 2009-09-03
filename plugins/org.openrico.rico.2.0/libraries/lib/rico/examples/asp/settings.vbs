<%
dim style,menu,frozen,sort,hide,filter,resize,highlt,sqltext

menu=GetQSitem("menu","dblclick")
frozen=GetQSitem("frozen","1")
highlt=GetQSitem("highlt","none")
style=GetQSitem("style","greenHdg")
if request.querystring="" then
  sort="true"
  hide="true"
  if IsEmpty(sqltext) then filter="false" else filter="true"
  resize="true"
else
  sort=GetQSitem("sort","false")
  hide=GetQSitem("hide","false")
  filter=GetQSitem("filter","false")
  resize=GetQSitem("resize","false")
end if

function GetQSitem(name,default)
  dim result
  result=request.querystring(name)
  if result="" then result=default
  GetQSitem=result
end function

sub setStyle()
  if style<>"" then response.write "Rico.include('" & style & ".css');"
end sub

sub GridSettingsMenu()
  response.write "{}"
end sub

sub GridSettingsScript()
  response.write "menuEvent     : '" & menu & "'," & vbLf
  response.write "frozenColumns : " & frozen & "," & vbLf
  response.write "canSortDefault: " & sort & "," & vbLf
  response.write "canHideDefault: " & hide & "," & vbLf
  response.write "allowColResize: " & resize & "," & vbLf
  response.write "canFilterDefault: " & filter & "," & vbLf
  response.write "highlightElem: '" & highlt & "'"
end sub

sub GridSettingsTE(oTE)
  oTE.options("menuEvent")=menu
  oTE.options("canSortDefault")=CBool(sort="true")
  oTE.options("canHideDefault")=CBool(hide="true")
  oTE.options("allowColResize")=CBool(resize="true")
  oTE.options("canFilterDefault")=CBool(filter="true")
  oTE.options("frozenColumns")=frozen
  oTE.options("highlightElem")=highlt
end sub

sub GridSettingsForm()
  response.write "<form id='settings'><table border='0' cellspacing='5' cellpadding='0'>"
  response.write vbLf & "<tr><td colspan='2'><input type='submit' value='Change Settings' style='font-size:small'></td></tr>"
  response.write vbLf & "<tr valign=top><td>"
  
  response.write vbLf & "<table border='0' cellspacing='0' cellpadding='0'>"
  
  response.write vbLf & "<tr><td>Style:</td><td><select name='style' style='margin:0'>"
  SettingOpt "greenHdg","Green Heading",style
  SettingOpt "tanChisel","Tan chisel",style
  SettingOpt "warmfall","Warm Fall",style
  SettingOpt "iegradient","IE gradient",style
  SettingOpt "coffee-with-milk","Coffee with milk",style
  SettingOpt "grayedout","Grayed out",style
  response.write "</select></td></tr>"

  response.write vbLf & "<tr><td>Menu&nbsp;event:</td><td><select name='menu' style='margin:0'>"
  SettingOpt "click","Click",menu
  SettingOpt "dblclick","Double-click",menu
  SettingOpt "contextmenu","Right-click",menu
  SettingOpt "none","None",menu
  response.write "</select></td></tr>"

  response.write vbLf & "<tr><td>Highlight:</td><td><select name='highlt' style='margin:0'>"
  SettingOpt "cursorCell","Cursor Cell",highlt
  SettingOpt "cursorRow","Cursor Row",highlt
  SettingOpt "menuCell","Menu Cell",highlt
  SettingOpt "menuRow","Menu Row",highlt
  SettingOpt "selection","Selection",highlt
  SettingOpt "none","None",highlt
  response.write "</select></td></tr>"

  response.write vbLf & "<tr><td>Frozen columns:</td><td><select name='frozen' style='margin:0'>"
  for i=0 to 3
    if CInt(frozen)=i then sel=" selected" else sel=""
    response.write "<option value='" & i & "'" & sel & ">" & i & "</option>"
  next
  response.write "</select></td></tr>"

  response.write "</table>"
  response.write "</td><td>"
  response.write "<table border='0' cellspacing='0' cellpadding='0'>"

  SettingChkBx "sort",sort,"Sorting?",false
  SettingChkBx "filter",filter,"Filtering?",IsEmpty(sqltext)
  SettingChkBx "hide",hide,"Hide/Show?",false
  SettingChkBx "resize",resize,"Resizing?",false

  response.write "</td></tr></table>"

  response.write vbLf & "</table></form>"
end sub

sub SettingChkBx(name,value,desc,disable)
  dim chk
  if value="true" then chk=" checked" else chk=""
  response.write "<tr><td><input type='checkbox' value='true' name='" & name & "'" & chk
  if disable then response.write " disabled"
  response.write "></td><td>" & desc & "</td></tr>"
end sub

sub SettingOpt(value,desc,default)
  dim sel
  if value=default then sel=" selected" else sel=""
  response.write vbLf & "<option value='" & value & "'" & sel & ">" & desc & "</option>"
end sub
%>
