var conn = require('./connection.js');
conn.initConnectionToDB();

var sql = 'select * from article_list';
conn.excuteQuery(sql, function (row) {
    console.log(row);
});