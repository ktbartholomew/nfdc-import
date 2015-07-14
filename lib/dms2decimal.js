module.exports = function (dms) {
    var degrees = dms.degrees + (dms.minutes / 60) + (dms.seconds / 3600);

    if(dms.inclination === 'W' || dms.inclination === 'S') {
        degrees = degrees * -1;
    }
    return parseFloat(degrees.toFixed(7));
};
