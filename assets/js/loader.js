/**
 * Created with JetBrains WebStorm.
 * User: jami
 * Date: 5.2.2013
 * Time: 15:28
 * To change this template use File | Settings | File Templates.
 */
// Vastaa peliin liittyvän kuva- ja äänidatan lataamisesta sekä erillisestä loading-ruudusta, joka näytetään ennen pelin
// alkua, mikäli kaikki tarvittava data ei ole vielä ladattu
var loader = {

    loaded: true,
    loadedCount: 0,
    totalCount: 0,

    init: function() {
        var mp3Support, oggSupport;
        var audio = document.createElement('audio');
        if (audio.canPlayType) {
            mp3Support = "" !=audio.canPlayType('audio/meg');
            oggSupport = "" !=audio.canPlayType('audio/ogg; codecs="vorbis"');
        } else {
            mp3Support = false;
            oggSupport = false;
        }

        loader.soundFileExtn = oggSupport?".ogg":mp3Support?".mp3":undefined;
    },

    loadImage: function(url) {
        this.totalCount++;
        this.loaded = false;
        $('#loadingscreen').show();
        var image = new Image();
        image.src=url;
        image.onload=loader.itemLoaded;
        return image;
    },

    soundFileExtn:".ogg",

    loadSound: function(url) {
        this.totalCount++;
        this.loaded = false;
        $('#loadingscreen').show();
        var audio = new Audio();
        audio.src=url+loader.soundFileExtn;
        audio.addEventListener("canplaythrough", loader.itemLoaded, false);
        return audio;
    },

    itemLoaded: function() {
        loader.loadedCount++;
        $('#loadingmessage').html('Loaded ' +loader.loadedCount+' of '+loader.totalCount);
        if (loader.loadedCount === loader.totalCount) {
            // Loader on valmis
            loader.loaded = true;
            // Piilotetaan latausviesti
            $('#loadingscreen').hide();
            // Kutsutaan loader.onloadia, jos sellainen löytyy
            if (loader.onload) {
                loader.onload();
                loader.onload = undefined;
            }

        }
    },

    loadJSON: function(url) {
        this.totalCount++;
        this.loaded = false;
        $('#loadingscreen').show();

        $.getJSON(url, loader.JSONCallback);

    },

    JSONCallback: function(data) {
        game.currentTrack.trackData = data;
        loader.itemLoaded();
        console.log("json loaded");

    }
};