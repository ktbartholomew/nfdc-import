var fs = require('fs');
var path = require('path');


module.exports = function (file) {
    var stardpText = fs.readFileSync(file, 'utf-8');
    var stardpLines = stardpText.split('\r\n');
    var stardpDict = {};

    var parseLine = function (line) {
        var subTrim = function (length, start) {
            return line.substr(start - 1, length).trimRight() || null;
        };

        return {
            sequenceNumber: subTrim(5, 1),
            facilityType: subTrim(2,11),
            latitude: subTrim(8,14),
            longitude: subTrim(9,22),
            identifier: subTrim(6,31),
            region: subTrim(2,37),
            computerCode: subTrim(13,39),
            name: subTrim(110, 52),
            numberedFixes: subTrim(62,162)
        };
    };

    var activeLeg = null;
    stardpLines.forEach(function (line, index, scope) {
        if(!line.trim()) {
            return;
        }

        line = parseLine(line);

        if(!stardpDict[line.sequenceNumber]) {
            stardpDict[line.sequenceNumber] = {
                type: (line.sequenceNumber.substr(0,1) === 'S') ? 'STAR' : 'DP',
                name: line.name,
                airports: {},
                legs: {}
            };
        }

        var procedure = stardpDict[line.sequenceNumber];

        if(line.facilityType == 'AA') {
            procedure.airports[
                line.identifier
            ] = {
                lat: line.latitude,
                lon: line.longitude
            };
        }

        if(line.computerCode) {
            procedure.legs[line.computerCode] = {
                name: line.name,
                points: {}
            };

            activeLeg = line.computerCode;
        }

        procedure.legs[activeLeg].points[line.name] = {
            type: line.facilityType,
            lat: line.latitude,
            lon: line.longitude
        };
    });

    return stardpDict;
};
