/**
 * Created with JetBrains WebStorm.
 * User: jami
 * Date: 5.2.2013
 * Time: 15:28
 * To change this template use File | Settings | File Templates.
 */
// Entiteettien hallinta. Entiteetit sisältävät tiedon pelin fyysisten osien piirtämiseen ja luomiseen liittyvät tiedot.
// Tarjoaa myös create & draw -metodit entiteeteille
var entities = {
    definitions: {
        "car": {
            type: "car",
            density: 10,
            friction: 0.2,
            restitution: 0.3,
            width: 0.78,
            height: 1.5
        },
        "startline": {

        },
        "checkline": {

        }
    },
    create: function(entity) {
        var definition = entities.definitions[entity.name];
        if (!definition) {
            console.log ("Undefined entity name ", entity.name);
            return;
        }
        switch(entity.type) {
            case "car":
                entity.density = definition.density;
                entity.friction = definition.friction;
                entity.restitution = definition.restitution;
                entity.width = definition.width;
                entity.height = definition.height;
                entity.maxSteeringAngle = 0.20;
                entity.steeringAngle = 0;
                entity.steerSpeed = 20;
                entity.accelerate = false;
                entity.decelerate = false;
                entity.engineSpeed = 700;
                entity.outOfRoad = false;
                entity.health = 100;

                entity.sprite = loader.loadImage("assets/images/car200.png");
                entity.wheelSprite = loader.loadImage("assets/images/wheel200.png");
                entity.body = box2d.createCar(entity);

                break;
            case "startline":
                // Piirretään maaliviiva
                var tileSize = game.canvas.width/8;
                game.startLine = {
                    x:entity.x*.25*tileSize,
                    y:entity.y*tileSize -.6*tileSize,
                    w: 0.5*tileSize,
                    h: 0.2*tileSize
                }
                break;
            default:
                console.log("Undefined entity type", entity.type);
                break;
        }


    },
    draw: function(entity, position, angle) {
        game.context.save();
        game.context.translate(position.x*box2d.scale, position.y*box2d.scale);
        game.context.rotate(angle);

        switch(entity.type) {
            case "car":
                game.context.drawImage(entity.sprite,
                    -entity.width*box2d.scale*game.scale,
                    -entity.height*box2d.scale*game.scale,
                    entity.width*box2d.scale*game.scale*2,
                    entity.height*box2d.scale*game.scale*2);
            break;

            case "wheel":
                game.context.beginPath();
                game.context.rect(-entity.width*box2d.scale*game.scale, -entity.height*box2d.scale*game.scale, entity.width*2*box2d.scale*game.scale, entity.height*2*box2d.scale*game.scale);
                game.context.fillStyle = 'black';
                game.context.fill();
                game.context.closePath();
            break;
        }

        game.context.restore();


    }
};