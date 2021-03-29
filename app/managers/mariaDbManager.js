"use strict";
const mariadb = require('mariadb/callback');
const conn = mariadb.createConnection({host: '127.0.0.1', user: 'root', password: 'riariaria'});



module.exports = {
    checkKeyUsers: async function checkKeyUsers(user_id, key) {

        return new Promise(async (resolve, reject) => {
            const  query = 'select riaData.users.key,key_active from riaData.users where id='+user_id+';';
            await conn.query(query, (err, res) => {
                if (err) return reject(err);
                if(res[0]){
                    let key_active = res[0].key_active.toJSON()
                     if (res[0].key === key && key_active.data[0] ){
                         resolve(true)
                     }else {
                         resolve(false);
                     }
                }else {
                    resolve(false);
                }

            });
        });
    },
    getQuery: async function  getQuery(id_query) {
        return new Promise(async (resolve, reject) => {
            const  query = 'select user_id , query  from riaData.queries_history where id='+id_query+';';
            await conn.query(query, (err, res) => {
                if (err) return reject(err);
                resolve(res);

            });
        });
    },
    addNewLog: async function addNewLog(query_id) {
        return new Promise(async (resolve, reject) => {
            let date = new Date()
            let string_date = date.toLocaleString().split(',');
            let string_time = string_date[1].split(':')
            const query = 'INSERT INTO riaData.logs(user_id,full_date,hour_date,minute_date,seconds_date,query_id) values('
                + 0 + `, '` + string_date[0] + `', ` + Number(string_time[0]) + ', ' + Number(string_time[1])
                + ', ' + Number(string_time[2]) + `,` + query_id + ");"
            await conn.query(query, (err, res) => {
                if (err) return reject(err);
                resolve(res);
            });
        });
    }
}