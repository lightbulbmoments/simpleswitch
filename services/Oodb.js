module.exports = Oodb;
function Oodb(){
	var self = this;
	self.query = query;

	var MongoClient = require('mongodb').MongoClient;
	var dbconn;
	var dbIp = '127.0.0.1';
	var dbPort = '27017';
	var dbName = 'simpleswitch';

	function connectDb(cb){
		var url = 'mongodb://' + dbIp + ':' + dbPort;
        MongoClient.connect(url, function(err, client) {
            if (!err) {
                dbconn = client.db(dbName);
                cb(null, dbconn);
            } else {
                console.log("Error happened connecting to db::::" + url);
                console.log(err, err.stack.split("\n"))
                cb({ status: 500, msg: "Unable to get db connection" });
            }
        });
	}

	function getConnection(cb){
		if (dbconn && dbconn.serverConfig.isConnected()) {
            cb(null, dbconn);
        } else {
            connectDb(function(err, db) {
                if (err) {
                    cb(err);
                } else {
                    dbconn = db;
                    cb(null, db);
                }
            });
        }
	}

	function query(data, callback) {
        getConnection(function(err, db) {
            if (err) {

            } else {
            	console.log(data);
                var dataList = [];
                var fields = {}
                if (data.options == undefined) {
                    data.options = {};
                }
                if (data.query.id) {
                    data.query._id = ObjectId(data.query.id);
                    delete data.query.id;
                }
                if (data.exclude != undefined) {
                    for (var i = data.exclude.length - 1; i >= 0; i--) {
                        fields[data.exclude[i]] = 0;
                    };
                }
                if (data.include != undefined) {
                    for (var i = data.include.length - 1; i >= 0; i--) {
                        fields[data.include[i]] = 1;
                    };
                }
                
                data.options.fields = fields;
                if (isNaN(data.limit)) {
                    if (!data.limit) {
                        data.limit = 0;
                    }
                    if (!data.skip) {
                        data.skip = 0;
                    }
                    var cursor = db.collection(data.tableName).find(data.query, data.options).sort(data.sort).skip(data.skip).limit(data.limit);
                    cursor.each(function(err, doc) {
                        if (doc != null) {
                            dataList.push(doc);
                        } else {
                            callback({ status: 200, data: dataList });
                        }
                    });
                } else {
                    var cursor = db.collection(data.tableName).find(data.query, data.options);
                    cursor.each(function(err, doc) {
                        if (doc != null) {
                            dataList.push(doc);
                        } else {
                            callback({ status: 200, data: dataList });
                        }
                    });
                }
            }
        });
    }
}