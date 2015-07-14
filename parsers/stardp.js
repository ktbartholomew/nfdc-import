var fs = require('fs');
var path = require('path');
var dms2decimal = require('../lib/dms2decimal');


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

    var splitDMS = function (string) {
        if (string.length === 8) {
            return {
                degrees: parseInt(string.substr(1,2)),
                minutes: parseInt(string.substr(3,2)),
                seconds: parseInt(string.substr(5,3)) / 10,
                inclination: string.substr(0,1)
            };
        }
        else {
            return {
                degrees: parseInt(string.substr(1,3)),
                minutes: parseInt(string.substr(4,2)),
                seconds: parseInt(string.substr(6,3)) / 10,
                inclination: string.substr(0,1)
            };
        }
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
                airports: [],
                legs: []
            };
        }

        var procedure = stardpDict[line.sequenceNumber];

        if(line.facilityType == 'AA') {
            procedure.airports.push({
                identifier: line.identifier,
                lat: dms2decimal(splitDMS(line.latitude)),
                lon: dms2decimal(splitDMS(line.longitude))
            });
        }

        if(line.computerCode) {
            procedure.legs.push({
                computerCode: line.computerCode,
                name: line.name,
                points: []
            });

            activeLeg = procedure.legs.length - 1;
        }

        procedure.legs[activeLeg].points.push({
            identifier: line.identifier,
            type: line.facilityType,
            lat: dms2decimal(splitDMS(line.latitude)),
            lon: dms2decimal(splitDMS(line.longitude))
        });
    });

    return stardpDict;
};
