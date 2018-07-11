module.exports = MediaServer;

function MediaServer() {
    var fs = require('fs');
    this.play = play;


    function play(req, res, fileName) {
        var stat = fs.statSync(fileName);
        range = req.headers.range;
        var readStream;

        if (range !== undefined) {
            var parts = range.replace(/bytes=/, "").split("-");

            var partial_start = parts[0];
            var partial_end = parts[1];

            if ((isNaN(partial_start) && partial_start.length > 1) || (isNaN(partial_end) && partial_end.length > 1)) {
                return res.sendStatus(500); //ERR_INCOMPLETE_CHUNKED_ENCODING
            }

            var start = parseInt(partial_start, 10);
            var end = partial_end ? parseInt(partial_end, 10) : stat.size - 1;
            var content_length = (end - start) + 1;

            res.status(206).header({
                'Content-Type': 'audio/wav',
                'Content-Length': content_length,
                'Content-Range': "bytes " + start + "-" + end + "/" + stat.size
            });

            readStream = fs.createReadStream(fileName, { start: start, end: end });
        } else {
            res.header({
                'Content-Type': 'audio/wav',
                'Content-Length': stat.size
            });
            readStream = fs.createReadStream(fileName);
        }
        readStream.pipe(res);
    }
}