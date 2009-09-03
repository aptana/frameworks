This directory contains data needed to run the Rico LiveGrid Plus ASP and PHP examples.

Data is available in 3 formats:

1) northwind.mdb - this is the standard Northwind database provided by Microsoft, with the exception that the [Order Details] table has been renamed to Order_Details

2) mysql-northwind.sql - a backup file for MySQL (created using MySQL version 4.1)

3) ORA-EXPDAT.DMP - an Oracle export file for the Northwind schema -- generated using the "exp" utility in Oracle XE. The password for this schema is "password".

A version for MS SQL Server 2005 is available as a free download from msdn.microsoft.com. After installing it, you will need to either rename the [Order Details] table  to Order_Details, or create a view named Order_Details that contains "select * from [Order Details]".
