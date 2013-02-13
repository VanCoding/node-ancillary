var crypto = require("crypto");

module.exports = function(data){
    var hash = crypto.createHash("md5");
    hash.update(data,"utf8");
    return hash.digest("hex");
}