/**
 * Created with JetBrains WebStorm.
 * User: jami
 * Date: 5.2.2013
 * Time: 15:28
 * To change this template use File | Settings | File Templates.
 */
var tracks = {

    // radat
    data:[
        {   //test
            name:'track1',
            trackTiles: [], // 8 * 5
            entities: [
                {type: "car", name: "car", x:100, y:350, angle: 0},
                {type: "startline", name: "startline", x:1, y: 3}]
        }],

    init: function() {
        var html = "";
        for (var i=0; i<tracks.data.length; i++) {
            var level = tracks.data[i];
            html += '<input type="button" value="'+(i+1)+'">';
        }
        $('#levelselectscreen').html(html);

        $('#levelselectscreen input').click(function() {
            tracks.load(this.value-1);
            $('#levelselectscreen').hide();
        })
    },

    // Ladataan kaikki tiettyyn rataan liittyvä data
    load: function(number) {

        var track = tracks.data[number];

        // Ladataan rata ja autot
        track.trackSprite = loader.loadImage("assets/images/tileset200.png");

        game.currentTrack = track;
        game.currentTrack.number = number;

        // Ladataan radan json
        loader.loadJSON('assets/tracks/'+track.name+'.json');

        // Luodaan entiteetit
        for (var i = track.entities.length -1; i >= 0; i--) {
            var entity = track.entities[i];
            entities.create(entity);
        }

        // Kutsutaan game.start()-funktiota vasta sitten kun rataan liittyvä media on haettu
        if(loader.loaded){
            game.start();
        } else {
            loader.onload=game.start;
        }
    },

    draw: function(number) {
        var track = game.currentTrack;
        var tileData = track.trackData.layers[0].data;

        var trackSprite = track.trackSprite;
        var width = track.trackData.width;
        var spriteTileWidth = track.trackData.tilesets[0].tilewidth;
        var tileWidth = game.canvas.width/8;
        var tileHeight = tileWidth;//game.canvas.height/4;

        for (var i = 0; i < tileData.length; i++) {
            var tileNumber = tileData[i]-1;
            var x;
            var y;
            var spriteX;
            var spriteY;

            if (tileNumber > 0) {

                if (i < width) {
                    x = i*tileWidth;
                    y = 0;
                }
                else {
                    x = (i%width)*tileWidth;
                    y = Math.floor(i/width)*tileHeight;
                }

                if (tileNumber < 7) {
                    spriteX = tileNumber*spriteTileWidth;
                    spriteY = 0;
                }
                else {
                    spriteX = (tileNumber%7)*spriteTileWidth;
                    spriteY = Math.floor(tileNumber/7)*spriteTileWidth;
                }

                game.trackcontext.drawImage(trackSprite,
                    spriteX,
                    spriteY,
                    spriteTileWidth,
                    spriteTileWidth,
                    x,
                    y,
                    tileWidth,
                    tileHeight);

                }

        }
        var startLine = game.startLine;
        game.trackcontext.fillRect(startLine.x,startLine.y,startLine.w,startLine.h);

    }
};