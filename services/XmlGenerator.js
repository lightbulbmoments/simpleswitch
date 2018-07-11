module.exports = XmlGenerator;

function XmlGenerator(config) {
    var self = this;
    self.getUser = getUser;
    self.getOutFlow = getOutFlow;
    self.getInFlow = getInFlow;
    self.getCallFlow = getCallFlow;
    self.getNotFoundXML = getNotFoundXML;

    var oodb = require('./Oodb');
    oodb = new oodb();

    function getUser(req, cb) {
        var xml = '';
        var pass = '';
        if (req && req.body && req.body.sip_auth_username) {
            var host = req.body.domain;
            var userid = req.body.sip_auth_username;
            var data = {};
            data.tableName = 'users';
            data.query = { username: userid }

            oodb.query(data, function(res) {
                console.log(res);
                if (res.status == 200 && res.data.length > 0) {
                    xml = '<document type="freeswitch/xml">' +
                        '<section name="directory">' +
                        '<domain name="' + host + '">' +
                        '<user id="' + userid + '">' +
                        '<params><param name="password" value="' + res.data[0].password + '"/>' +
                        '</params>' +
                        '<variables>' +
                        '<variable name="user_context" value="default"/>' +
                        '</variables>' +
                        '</user>' +
                        '</domain>' +
                        '</section>' +
                        '</document>';
                    cb(xml);
                } else {
                    getNotFoundXML(cb);
                }
            });
        } else {
            getNotFoundXML(cb);
        }
    }

    function getCallFlow(req, cb) {
        console.log('Call Profile:' + req.body['variable_sofia_profile_name']);
        if (req.body['variable_sofia_profile_name'] == 'internal') {
            getOutFlow(req, cb);
        } else {
            getInFlow(req, cb);
        }
    }

    function getOutFlow(req, cb) {
        var from = req.body['variable_sip_from_user'];
        var dialPrefix = from.charAt(0);
        var to = req.body['variable_sip_to_user'];
        xml = '<document type="freeswitch/xml">' +
            '<section name="dialplan">' +
            '<context name="default">' +
            '<extension name="Call from ss node to goip node">' +
            '<condition>' +
            // '<action application="set" data="ccdata=' + userdata + '"/>' +
            // '<action application="set" data="enable_heartbeat_events=' + pulserate + '"/>' +
            //'<action application="set" data="media_bug_answer_req=true"/>'+
            '<action application="record_session" data="/home/audiofiles/${strftime(%Y-%m-%d)}/${uuid}.wav"/>' +
            '<action application="set" data="hangup_after_bridge=true"/>' +
            '<action application="set" data="continue_on_fail=true"/>' +
            '<action application="bridge" data="{absolute_codec_string=PCMA,PCMU}sofia/external/' + dialPrefix + to + '@' + config.goipIP + '"/>' +

            '</condition>' +
            '</extension>' +
            '</context>' +
            '</section>' +
            '</document>';
        cb(xml);
    }

    function getInFlow(req, cb) {
        var from = req.body['variable_sip_from_user'];
        var to = req.body['variable_sip_to_user'];
        xml = '<document type="freeswitch/xml">' +
            '<section name="dialplan">' +
            '<context name="default">' +
            '<extension name="Call from goip node to ss node">' +
            '<condition field="destination_number" expression="' + req.body['Hunt-Destination-Number'] + '">' +
            '<action application="record_session" data="/home/audiofiles/${strftime(%Y-%m-%d)}/${uuid}.wav"/>' +
            '<action application="set" data="hangup_after_bridge=true"/>' +
            '<action application="set" data="continue_on_fail=true"/>' +
            '<action application="bridge" data="sofia/internal/' + to + '%'+config.hostIP+'"/>' +
            '</condition>' +
            '</extension>' +
            '</context>' +
            '</section>' +
            '</document>';
        cb(xml)
    }

    function getNotFoundXML(cb) {
        var xml = '<document type="freeswitch/xml">' +
            '<section name="result">' +
            '<result status="not found" />' +
            '</section>' +
            '</document>';
        cb(xml);
    }
}