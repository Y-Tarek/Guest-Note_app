const sql = require('mssql/msnodesqlv8');

const sqlConfig = new sql.ConnectionPool({
    database: process.env.DATABASE_NAME,
    server: process.env.DATABASE_SERVER,
    driver: "msnodesqlv8",
    options: {
      trustedConnection: true
    }
  });


const connect = async()=>{
    try {
      await sqlConfig.connect();
    } catch (error) {
        console.log("ErrorIs:", error);
    }
 
}

module.exports = {connect, sqlConfig};