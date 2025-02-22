import { ConnectionPool } from 'mssql';

export const sqlConfig = {
    user: process.env.SQL_USER || '',
    password: process.env.SQL_PASSWORD || '',
    server: process.env.SQL_SERVER || '',
    database: process.env.SQL_DATABASE || '',
    options: {
        encrypt: true,
        connectTimeout: 30000
    }
};

let pool: ConnectionPool;

export const getDbConnection = async (): Promise<ConnectionPool> => {
    if (!pool) {
        pool = await new ConnectionPool(sqlConfig).connect();
        console.log("Database connected");
    }
    return pool;
};
