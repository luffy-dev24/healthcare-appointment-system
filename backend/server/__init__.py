import pymysql
pymysql.install_as_MySQLdb()

# Fix for Django mysqlclient version check
pymysql.version_info = (2, 2, 1, "final", 0)