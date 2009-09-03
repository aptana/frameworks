<%@ LANGUAGE="VBSCRIPT" %>
<% Session.Codepage=65001  ' ensure QueryString is interpreted as UTF-8 %>
<!-- #INCLUDE FILE = "applib.vbs" --> 
<!-- #INCLUDE FILE = "../../plugins/asp/ricoXmlResponse.vbs" --> 
<%
dim oXmlResp,id,offset,size,total

id=trim(Request.QueryString("id"))
offset=trim(Request.QueryString("offset"))
size=trim(Request.QueryString("page_size"))
total=lcase(Request.QueryString("get_total"))
if offset="" then offset="0"
if total="" then total="false"

response.clear
Response.CacheControl = "no-cache"
Response.AddHeader "Pragma", "no-cache"
Response.Expires = -1
Response.ContentType="text/xml"
Response.write "<?xml version='1.0' encoding='iso-8859-1'?>" & vbLf

response.write vbLf & "<ajax-response><response type='object' id='" & id & "_updater'>"
if id="" then
  ErrorResponse "No ID provided!"
elseif not IsNumeric(offset) then
  ErrorResponse "Invalid offset!"
elseif not IsNumeric(size) then
  ErrorResponse "Invalid size!"
elseif IsEmpty(session.contents(id)) then
  ErrorResponse "Your connection with the server was idle for too long and timed out. Please refresh this page and try again."
elseif not OpenDB then
  ErrorResponse server.htmlencode(oDB.LastErrorMsg)
else
  oDB.DisplayErrors=false
  oDB.ErrMsgFmt="MULTILINE"
  set oXmlResp=new ricoXmlResponse
  oXmlResp.sendDebugMsgs=true
  oXmlResp.Query2xml session.contents(id),CLng(offset),CLng(size),(total<>"false"),session.contents(id & ".filters")
  if not IsEmpty(oDB.LastErrorMsg) then
    response.write vbLf & "<error>"
    response.write server.htmlencode(oDB.LastErrorMsg)
    response.write "</error>"
  end if
  set oXmlResp=Nothing
end if
CloseApp
response.write vbLf & "</response></ajax-response>"

sub ErrorResponse(msg)
  response.write vbLf & "<rows update_ui='false' /><error>"
  response.write msg
  response.write "</error>"
end sub

%>
