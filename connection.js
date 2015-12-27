module.exports = new Connection();

var mysql = require('mysql');
var fs = require('fs');

function Connection() {
    return this;
}

Connection.prototype.initConnectionToDB = function () {
    var config = this.readConfig();
    var dataJson = JSON.parse(config);
    //var dbInfo = {
    //    host : dataJson['host'],
    //    user : dataJson['user'],
    //    password : dataJson['password'],
    //    database : dataJson['database'],
    //}
    //this.connection = mysql.createConnection(dbInfo);
    
    var poolConfig = {
        connectionLimit  : dataJson['connectionLimit'],
        host : dataJson['host'],
        user : dataJson['user'],
        password : dataJson['password'],
        database : dataJson['database'],
        debug : dataJson['debug'],
    }
    this.pool = mysql.createPool(poolConfig);
    console.log('init db done');
}

Connection.prototype.readConfig = function () {
    var config = fs.readFileSync('../dbconfig.json').toString();
    return config;
}

Connection.prototype.excuteQuery = function (query, finish) {
    this.pool.getConnection(function (err, connection) {
        if (err) {
            if (connection != undefined)
                connection.release();
            console.log(err);
            return;
        }
        else {
            //console.log('Connected as id: ' + connection.threadId);
            connection.query(query, function (err, row) {
                if (!err) {
                    if (finish != undefined) {
                        finish(row);
                    }
                }
                else {
                    console.log('Error while performing query...');
                }
            });
            
            connection.on('error', function (err) {
                console.log('Error while connect to database...');
                return;
            });
            if (connection != undefined)
                connection.release();
        }
    });
}

Connection.prototype.excuteUpdate = function (query, data, finish) {
    this.pool.getConnection(function (err, connection) {        
        if (err) {
            if (connection != undefined)
                connection.release();
            return;
        }
        else {
            //console.log('Connected as id: ' + connection.threadId);
            connection.query(query, data, function (err, row) {
                if (!err) {
                    if (finish != undefined) {
                        finish(row);
                    }
                }
                else {
                    console.log('Error while performing query...');
                }
            });
            
            connection.on('error', function (err) {
                console.log('Error while connect to database...');
                return;
            });
            if (connection != undefined)
                connection.release();
        }
    });
}