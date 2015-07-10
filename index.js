var fs = require('fs');
var path = require('path');
var stardpParser = require('./parsers/stardp');

var STARDP_FILE = './data/STARDP.txt';

console.log(stardpParser(STARDP_FILE));
