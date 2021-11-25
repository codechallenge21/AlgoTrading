import mysql.connector

class Db:
    inittoken = {"tporderid":-1,"dcaorderid":-1,"averageprice":[],"totalqty":[],"deals_id":-1,"dcalevel":0,"dcatp":[],"openprice":0,"dcalimit":[],"stoploss":0,"dcatrlevel":[],'trprice':0}
    def __init__(self, host, user,password,database):
        
        self.mydb = mysql.connector.connect(
                host=host,
                user=user,
                password=password,
                database=database
                )
    def addq(self,data):
        return "'"+str(data)+"'"
    def addqc(self,data):
        return "`"+str(data)+"`"

    def get_insert_sql(self,data,table):
    
        columns = ''
        values = ''
        for key in data:
            columns = columns+(self.addqc(key) if columns=='' else ","+self.addqc(key))
            values = values + (self.addq(data[key]) if values=='' else ","+self.addq(data[key]))

        sqlquery = "INSERT INTO `{}` ({}) VALUES ({})".format(table,columns,values)
        return sqlquery

    def get_update_sql(self,id,data,table,idfield='id'):    
        values = ''
        for key  in data:
            f = self.addqc(key)+"="+self.addq(data[key])
            values = values + (f if values=='' else ','+f)
        sqlquery = "UPDATE  {} set {} where {}={}".format(table,values,idfield,id)
        return(sqlquery)
    def insert_deals (self,data):
        sqlquery = self.get_insert_sql(data,"deals")
        print('sqlquery',sqlquery)
        mycursor = self.mydb.cursor()
        mycursor.execute(sqlquery)
        self.mydb.commit()
        return(mycursor.lastrowid)

    def update_deals(self,id,data):
        sqlquery = self.get_update_sql(id,data,'deals')
        mycursor = self.mydb.cursor()
        result = mycursor.execute(sqlquery)
        return(result)

    def insert_errors(self,data):
        sqlquery = self.get_insert_sql(data,"errors")
        mycursor = self.mydb.cursor()
        mycursor.execute(sqlquery)
        self.mydb.commit()
        return(mycursor.lastrowid)

    def insert_orders(self,data):
        sqlquery = self.get_insert_sql(data,"orders");
        mycursor = self.mydb.cursor()
        mycursor.execute(sqlquery)
        self.mydb.commit()
        return(mycursor.lastrowid)

    def update_orders(self,id,data):
        sqlquery = self.get_update_sql(id,data,'orders','order_id')
        mycursor = self.mydb.cursor()
        result = mycursor.execute(sqlquery)
        return(result)
