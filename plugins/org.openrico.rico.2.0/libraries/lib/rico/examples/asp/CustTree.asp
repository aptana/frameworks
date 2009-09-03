<%@ LANGUAGE="VBSCRIPT" %>
<!-- #INCLUDE FILE = "applib.vbs" --> 
<!-- #INCLUDE FILE = "ricoXmlResponse.vbs" --> 
<%
dim id,parent,oXmlResp

id=trim(Request.QueryString("id"))
parent=trim(Request.QueryString("Parent"))
response.clear
Response.CacheControl = "no-cache"
Response.AddHeader "Pragma", "no-cache"
Response.Expires = -1
Response.ContentType="text/xml"
Response.write "<?xml version='1.0' encoding='iso-8859-1'?>" & vbLf
response.write vbLf & "<ajax-response><response type='object' id='" & id & "_updater'>"

if id="" then
  response.write vbLf & "<rows update_ui='false' /><error>"
  response.write vbLf & "No ID provided!"
  response.write vbLf & "</error>"
elseif not OpenDB then
  response.write vbLf & "<rows update_ui='false' /><error>"
  response.write vbLf & server.htmlencode(oDB.LastErrorMsg)
  response.write vbLf & "</error>"
else
  oDB.DisplayErrors=false
  oDB.ErrMsgFmt="MULTILINE"
  set oXmlResp=new ricoXmlResponse

  response.write vbLf & "<rows update_ui='true' offset='0'>"
  if parent <> "" then
    oXmlResp.Query2xmlRaw "SELECT '" & parent & "',CustomerID,CompanyName,'L',1 FROM customers where CompanyName like '" & parent & "%'",0,99
  else
    oXmlResp.WriteTreeRow "","root","Customer names starting with...","C",0
    oXmlResp.Query2xmlRaw "SELECT distinct 'root',left(CompanyName,1),left(CompanyName,1),'C',0 FROM customers",0,99
  end if
  response.write vbLf & "</rows>"

  if not IsEmpty(oDB.LastErrorMsg) then
    response.write vbLf & "<error>"
    response.write vbLf & server.htmlencode(oDB.LastErrorMsg)
    response.write vbLf & "</error>"
  end if
  set oXmlResp=Nothing
end if
CloseApp
response.write vbLf & "</response></ajax-response>"

%>