
/*Thanks:
 Iwan Gabovitch (http://opengameart.org/users/qubodup) for the red car sprite
 Oskar Tranberry Lindqvist (http://opengameart.org/users/trbry) for track tiles
 Søren "Shiu" Nielsen (http://opengameart.org/content/grayscale-icons) for some icons
 and Erin Catto for the magnificent Box2D physics engine!*/


// RequestAnimationFrame polyfill
(function() {
    var lastTime=0;
    var vendors=['ms', 'moz', 'webkit', 'o'];
    for (var x=0; x<vendors.length && !window.requestAnimationFrame; x++) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame =
            window[vendors[x]+'CancelAnimationFrame'] ||
                window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime.timeToCall); },
                timeToCall);
            lastTime = currTime+timeToCall;
            return id;
        };
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

// Määritellään käytetyt Box2D-muuttujat
var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Fixture = Box2D.Dynamics.b2Fixture;
var b2World = Box2D.Dynamics.b2World;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
var b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;
var b2Dynamics = Box2D.Dynamics;

$(window).ready(function() {
    game.init();
});

var game = {

    mode: "intro",
    lap: 0,

    init: function() {


        $('.gamelayer').hide();
        $('#gamestartscreen').show();

        this.canvas = $('#gamecanvas')[0];
        this.trackcanvas = $('#trackcanvas')[0];

        //game.setScale();

        /*game.canvas.width = window.innerWidth;
        game.canvas.height = window.innerHeight;
        game.trackcanvas.width = window.innerWidth;
        game.trackcanvas.height = window.innerHeight;*/


        this.setScale();

        this.context = game.canvas.getContext('2d');
        this.trackcontext = game.trackcanvas.getContext('2d');

        box2d.init();
        tracks.init();
        keyhandler.init();
        loader.init();

    },

    setScale: function() {

        this.scale = window.innerHeight/720;

        $(".gamecanvas").each(function() {
            this.height = window.innerHeight;
            this.width = 1280*game.scale;
        });

    },

    start: function() {
        $('.gamelayer').hide();

        // Näytetään pelicanvas ja kierrosajat
        $('#trackcanvas').show();
        $('#gamecanvas').show();
        $('#scorescreen').show();

        // Piirretään rata
        tracks.draw();

        game.mode = "driving";
        timer.init();
        game.ended = false;
        game.animationFrame = window.requestAnimationFrame(game.animate, game.canvas);
    },

    animate: function() {

        // Siivotaan pelicanvas
        game.context.clearRect(0, 0, game.canvas.width, game.canvas.height);

        // Tarkistetaan ollaanko ulkona radalta
        game.checkOutOfRoad();

        // Piirretään suditusjäljet
        game.drawSkidMarks();

        // Edetään fysiikanmallinnuksessa
        var currentTime = new Date().getTime();
        var timeStep;
        if (game.lastUpdateTime) {
            timeStep = (currentTime - game.lastUpdateTime)/1000;
            box2d.step(timeStep);
        }
        game.lastUpdateTime = currentTime;

        // Päivitetään juokseva kierroslaskuri
        if (game.lap > 0) {
            $("#scorescreen #currentlap span").html(timer.formatLapTime(timer.getTimeElapsed()));
        }

        // Päivitetään kierrokset, jos ylitetään maaliviiva
        if (game.checkFinishLine() && !game.ended) {
            game.incrementLap();
        }

        // Piirretään auto(t)
        game.drawAllBodies();


        if (game.ended) {
            game.showEndingScreen();
        }
        else {
            game.animationFrame = window.requestAnimationFrame(game.animate, game.canvas);
        }
    },
    showEndingScreen: function() {
        $("#endingscreen #message span").html(timer.getBestLap());
        $("#endingscreen").show();
    },
    reset: function() {
        game.lastUpdateTime = undefined;
        timer.reset();
        box2d.init();
        tracks.load(game.currentTrack.number);
        game.trackcontext.clearRect(0,0,800,600);
        this.lap = 0;

    },
    checkFinishLine: function() {
        var position = box2d.car.body.GetWorldCenter();
        return (0/box2d.scale < position.x && position.x < 130/box2d.scale && 270/box2d.scale < position.y && position.y < 285/box2d.scale);
    },
    // Piirtää kaikki box2d-bodyt, joilta löytyy entity-määrittely
    drawAllBodies: function() {
        box2d.world.DrawDebugData();

        for (var body = box2d.world.GetBodyList(); body; body = body.GetNext()) {
            var entity = body.GetUserData();

            if (entity) {
                entities.draw(entity, body.GetPosition(), body.GetAngle());
            }
        }
    },
    drawSkidMarks: function() {
        if (box2d.getLateralVelocity(box2d.car.body).Length() > 20 && !box2d.car.outOfRoad) {

            for (var wheel in box2d.car.wheels) {

                if (box2d.car.wheels[wheel].GetUserData().powered) {
                    var wheel = box2d.car.wheels[wheel];

                    var position = wheel.GetWorldCenter();
                    var angle = wheel.GetAngle();
                    var width = wheel.GetUserData().width*box2d.scale;
                    var height = wheel.GetUserData().height*box2d.scale;

                    game.trackcontext.translate(position.x*box2d.scale, position.y*box2d.scale);
                    game.trackcontext.rotate(angle);


                    game.trackcontext.beginPath();
                    game.trackcontext.rect(0, 0, width, height);
                    game.trackcontext.fillStyle = 'rgba(0,0,0,0.5)';
                    game.trackcontext.fill();

                    game.trackcontext.rotate(-angle);
                    game.trackcontext.translate(-position.x*box2d.scale, -position.y*box2d.scale);
                }
            }

        }
    },
    incrementLap: function() {
        var timeElapsed = timer.getTimeElapsed();

        if (game.lap == 0 || timeElapsed > 2000) {
            if (this.lap > 0) {
                timer.updateLapTime(timeElapsed);
            }
            if (this.lap > 2) {
                game.ended = true;
            }

            this.lap++;

            timer.timeStarted = new Date();
        }
    },
    showLevelScreen: function() {
        $('.gamelayer').hide();
        $('#levelselectscreen').show('slow');
    },
    checkOutOfRoad: function() {

        var position = box2d.car.body.GetWorldCenter();
        var imgd = game.trackcontext.getImageData(position.x*box2d.scale, position.y*box2d.scale, 1, 1);
        var pix = imgd.data;
        if (pix[3] == 0) {
            box2d.car.outOfRoad = true;
        }
        else {
            box2d.car.outOfRoad = false;
        }
    }
};