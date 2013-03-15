/**
 * Created with JetBrains WebStorm.
 * User: jami
 * Date: 5.2.2013
 * Time: 15:29
 * To change this template use File | Settings | File Templates.
 */
var box2d = {
    scale: 6,
    car: undefined,
    init: function() {
        // Koska peli on kuvattu ylhäältäpäin, painovoimaksi määritellään 0
        var gravity = new b2Vec2(0,0);
        box2d.world = new b2World(gravity, true);

        // Pelialue rajataan kiintein seinin
        box2d.createWall(game.canvas.width/2/box2d.scale, 0, game.canvas.width/2/box2d.scale, 5/box2d.scale); // x, y, w, h
        box2d.createWall(game.canvas.width/2/box2d.scale, game.canvas.height/box2d.scale, game.canvas.width/2/box2d.scale, 5/box2d.scale);
        box2d.createWall(game.canvas.width/box2d.scale, game.canvas.height/2/box2d.scale, 5/box2d.scale, game.canvas.width/2/box2d.scale);
        box2d.createWall(0, game.canvas.height/2/box2d.scale, 5/box2d.scale, game.canvas.width/2/box2d.scale);


        // Määritellään debug-piirto
        var debugContext = document.getElementById('debugcanvas').getContext('2d');
         var debugDraw = new b2DebugDraw();
         debugDraw.SetSprite(debugContext);
         debugDraw.SetDrawScale(box2d.scale);
         debugDraw.SetFillAlpha(0.3);
         debugDraw.SetLineThickness(1.0);
         debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
         box2d.world.SetDebugDraw(debugDraw);

        // Määritellään collision detection
        var listener = new b2Dynamics.b2ContactListener;
        listener.PostSolve = function(contact, impulse) {
            var body1 = contact.GetFixtureA().GetBody();
            var body2 = contact.GetFixtureB().GetBody();
            var entity1 = body1.GetUserData();
            var entity2 = body2.GetUserData();

            var impulseAlongNormal = Math.abs(impulse.normalImpulses[0]);
            if (impulseAlongNormal> 15) {
                if (entity1.health) {
                    entity1.health -= impulseAlongNormal/100;
                }

                if (entity2 && entity2.health) {
                    entity2.health -= impulseAlongNormal/100;
                }
            }
        };
        box2d.world.SetContactListener(listener);

    },
    // Pelialueen seinät pystyttävä funktio
    createWall: function(x, y, w, h) {
        var bodyDef = new b2BodyDef;
        bodyDef.type = b2Body.b2_staticBody;
        bodyDef.position.Set(x,y);
        var fixDef = new b2FixtureDef;
        fixDef.density = 100;
        fixDef.friction = 1;
        fixDef.restitution = 0;
        fixDef.shape = new b2PolygonShape;
        fixDef.shape.SetAsBox(w, h);
        var body = box2d.world.CreateBody(bodyDef);
        body.CreateFixture(fixDef);

        return body
    },
    createCar: function(entity) {

        var bodyDef = new b2BodyDef;
        bodyDef.type = b2Body.b2_dynamicBody;
        bodyDef.position.Set(entity.x/box2d.scale,entity.y/box2d.scale);

        var fixDef = new b2FixtureDef;
        fixDef.density = entity.density;
        fixDef.friction = entity.friction;
        fixDef.restitution = entity.restitution;
        fixDef.shape = new b2PolygonShape;
        fixDef.shape.SetAsBox(entity.width, entity.height);

        var body = box2d.world.CreateBody(bodyDef);

        body.CreateFixture(fixDef);

        var x = body.GetWorldCenter().x;
        var y = body.GetWorldCenter().y;

        // Renkaat
        entity.wheels = {};
        entity.wheels["fr"] = box2d.createWheel(x+entity.width+.2,y-entity.height+.6);
        entity.wheels["fl"] = box2d.createWheel(x-entity.width-.2,y-entity.height+.6);
        entity.wheels["rr"] = box2d.createWheel(x+entity.width+.2,y+entity.height-.6, true);
        entity.wheels["rl"] = box2d.createWheel(x-entity.width-.2,y+entity.height-.6, true);

        // Renkaat runkoon yhdistävät liitokset
        entity.bodyJoint_FR = box2d.createRevJoint(body,entity.wheels["fr"]);
        entity.bodyJoint_FL = box2d.createRevJoint(body,entity.wheels["fl"]);
        entity.bodyJoint_RR = box2d.createRevJoint(body,entity.wheels["rr"]);
        entity.bodyJoint_RL = box2d.createRevJoint(body,entity.wheels["rl"]);

        // Apuvektorit
        entity.p1r = new b2Vec2();
        entity.p2r = new b2Vec2();
        entity.p3r = new b2Vec2();

        entity.p1l = new b2Vec2();
        entity.p2l = new b2Vec2();
        entity.p3l = new b2Vec2();

        body.SetUserData(entity);
        box2d.car = entity;
        body.SetAngle(entity.angle);
        for (var wheel in entity.wheels) {
            entity.wheels[wheel].SetAngle(entity.angle);
        }
        return body;
    },
    createWheel: function(x, y, powered) {
        var bodyDef = new b2BodyDef;
        bodyDef.type = b2Body.b2_dynamicBody;
        bodyDef.position.Set(x,y);

        var fixDef = new b2FixtureDef;
        fixDef.density = 1;
        fixDef.friction = 1;
        fixDef.restitution = 0.1;
        fixDef.shape = new b2PolygonShape;
        fixDef.shape.SetAsBox(.2,.4);
        fixDef.isSensor = true;
        var body = box2d.world.CreateBody(bodyDef);
        body.CreateFixture(fixDef);

        // lisätään entity-data piirtämistä varten
        var entity = {};
        entity.type = "wheel";
        entity.width = .2;
        entity.height = .4;
        entity.powered = powered;
        body.SetUserData(entity);

        return body;
    },
    createCheckLine: function() {

    },
    // Luo auton rungon ja renkaan yhdistävän "akselin"
    createRevJoint: function(carBody, wheelBody) {
        var revoluteJointDef = new b2RevoluteJointDef();
        revoluteJointDef.Initialize(carBody, wheelBody, wheelBody.GetWorldCenter());
        revoluteJointDef.enableMotor = true;
        revoluteJointDef.motorSpeed = 0;
        revoluteJointDef.maxMotorTorque = 1000;
        revoluteJoint = box2d.world.CreateJoint(revoluteJointDef);
        return revoluteJoint;
    },
    updateSteer: function(car) {
        // kääntyminen
        var mspeed = car.steeringAngle - car.bodyJoint_FL.GetJointAngle();
        car.bodyJoint_FL.SetMotorSpeed(mspeed * car.steerSpeed);
        mspeed = car.steeringAngle - car.bodyJoint_FR.GetJointAngle();
        car.bodyJoint_FR.SetMotorSpeed(mspeed * car.steerSpeed);
    },
    updateAcceleration: function(car) {

        if (car.decelerate == true) {
            car.wheels["fr"].ApplyForce(new b2Vec2(car.p3r.x,car.p3r.y),car.wheels["fr"].GetWorldPoint(new b2Vec2(0,0)));
            car.wheels["fl"].ApplyForce(new b2Vec2(car.p3l.x,car.p3l.y),car.wheels["fl"].GetWorldPoint(new b2Vec2(0,0)));
        }
        if (car.accelerate == true) {
            car.wheels["fr"].ApplyForce(new b2Vec2(-car.p3r.x,-car.p3r.y),car.wheels["fr"].GetWorldPoint(new b2Vec2(0,0)));
            car.wheels["fl"].ApplyForce(new b2Vec2(-car.p3l.x,-car.p3l.y),car.wheels["fl"].GetWorldPoint(new b2Vec2(0,0)));
        }
    },
    updateFriction: function(car) {

        // mitätöidään sivuttaiskiihtyvyys rengaskohtaisesti
        for (var key in car.wheels) {

            var wheelBody = car.wheels[key];

            var impulse = box2d.getLateralVelocity(wheelBody).GetNegative();

            // Sallitaan luisto, jos korjaava impulssi nousee kynnysarvon yli
            /*if (impulse.Length() > 16) {
             impulse.Multiply(16/impulse.Length());
             }*/
            wheelBody.ApplyImpulse(impulse, wheelBody.GetWorldCenter());


            // luodaan dragforce, jotta pyörä ei pyöri loputtomasti
            // Jos auto on nurmikolla, skaalataan dragforce suuremmaksi -> meno hidastuu
            var multiplier = -3;
            if (box2d.car.outOfRoad == true) {
                multiplier = -60;
            }

            var currentForwardNormal = box2d.getForwardVelocity(wheelBody);
            var dragForceMagnitude = multiplier * currentForwardNormal.Normalize();
            var force = new b2Vec2(currentForwardNormal.x*dragForceMagnitude, currentForwardNormal.y*dragForceMagnitude);
            wheelBody.ApplyForce( force, wheelBody.GetWorldCenter() );
        }

        car.p1r = car.wheels["fr"].GetWorldCenter();
        car.p2r = car.wheels["fr"].GetWorldPoint(new b2Vec2(0,1));
        car.p3r.x = (car.p2r.x - car.p1r.x)*car.engineSpeed;
        car.p3r.y = (car.p2r.y - car.p1r.y)*car.engineSpeed;

        car.p1l = car.wheels["fl"].GetWorldCenter();
        car.p2l = car.wheels["fl"].GetWorldPoint(new b2Vec2(0,1));
        car.p3l.x = (car.p2l.x - car.p1l.x)*car.engineSpeed;
        car.p3l.y = (car.p2l.y - car.p1l.y)*car.engineSpeed;
    },
    getLateralVelocity: function(body) {
        return this.getVelocity(body, new b2Vec2(1,0));
    },
    getForwardVelocity: function (body) {
        return this.getVelocity(body, new b2Vec2(0,1));
    },
    getVelocity: function (body, normal) {
        var currentForwardNormal = body.GetWorldVector(normal);

        var currentBodyVelocity = body.GetLinearVelocity();
        var dotProduct = currentForwardNormal.x*currentBodyVelocity.x + currentForwardNormal.y*currentBodyVelocity.y;

        return new b2Vec2(currentForwardNormal.x*dotProduct, currentForwardNormal.y*dotProduct);
    },
    step: function(timeStep) {

        if (timeStep > 2/60) {
            timeStep = 2/60
        }

        box2d.world.ClearForces();
        box2d.updateFriction(box2d.car);
        box2d.updateAcceleration(box2d.car);
        box2d.updateSteer(box2d.car);

        //console.log(this.car.health);

        // velocityIterations = 8, positionIterations = 3
        box2d.world.Step(timeStep, 8, 3);

    }
};