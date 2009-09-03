Running Rico examples in an ASP environment
-------------------------------------------

When running these examples under IIS, the "Parent Paths" option in IIS must be enabled.
In IIS 5, this setting is enabled by default. In IIS 6, this setting is DISABLED by default.
To enable "Parent Paths":

1.	Click Start, click Administrative Tools, and then click Internet Information Services (IIS) Manager.
2.	Double-click your computer name in the left pane, and then double-click Web Sites.
3.	Locate the Web site and directory that houses the ASP application.
4.	Right-click the application site or directory, and then click Properties.
5.	Select Home Directory, and then click Configuration.
6.	Click Options, and then click to select the Enable Parent Paths check box.
7.	Click OK two times.
