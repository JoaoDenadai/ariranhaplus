import mysql, { Pool, RowDataPacket } from "mysql2/promise";
import { Log } from "../Core/Logs/Logs";
import Errno from "../Core/Errno/Errno";


interface SQLBase {
    host: string,
    user: string,
    password: string,
    database: string
}


export class SQL {
    private pool: Pool;

    constructor(Config: SQLBase) {
        this.pool = mysql.createPool(Config);
    }

    async query(sql: string, params?: any[]): Promise<any> {
        try {
            const [rows]: any = await this.pool.query(sql, params);
            return rows;
        } catch (err) {
            Log.New().Error(`SQL.query`, "Não foi possível efetuar a consulta via base de dados: " + Errno.onError(err));
            return;
        }
    }

    async close() {
        await this.pool.end();
    }
}
