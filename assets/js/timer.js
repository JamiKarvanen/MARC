/**
 * Created with JetBrains WebStorm.
 * User: jami
 * Date: 5.2.2013
 * Time: 15:29
 * To change this template use File | Settings | File Templates.
 */
var timer = {
    lapTimes: [],
    timeStarted: {},

    init: function() {
        this.timeStarted = new Date();
    },
    reset: function() {
        this.timeStarted = undefined;
        this.lapTimes = new Array();
        $("#scorescreen span").html("00:00:00");
    },
    updateLapTime: function(timeDifference) {
        this.lapTimes.push(timeDifference);
        $("#scorescreen #lap"+game.lap+" span").html(this.formatLapTime(timeDifference));
    },
    getTimeElapsed: function() {
        return new Date()-timer.timeStarted;
    },
    formatLapTime: function(timeDifference) {
        var minutes = Math.floor(timeDifference/60000);
        if (minutes < 10) minutes = "0"+minutes;
        var seconds = Math.floor(timeDifference%60000/1000);
        if (seconds < 10) seconds = "0"+seconds;
        var milliseconds = Math.floor(timeDifference%60000%1000/10)
        if (milliseconds < 10) milliseconds = "0"+milliseconds;

        return minutes+":"+seconds+":"+milliseconds;
    },
    getBestLap: function() {
        var bestLap = this.lapTimes[0];
        for (var i = 1; i < this.lapTimes.length; i++) {
            if (this.lapTimes[i] < bestLap) {
                bestLap = this.lapTimes[i];
            }
        }
        return this.formatLapTime(bestLap);
    }
}