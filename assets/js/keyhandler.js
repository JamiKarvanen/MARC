/**
 * Created with JetBrains WebStorm.
 * User: jami
 * Date: 5.2.2013
 * Time: 15:29
 * To change this template use File | Settings | File Templates.
 */
var keyhandler = {
    init: function() {
        $(window).keydown(function(e) {
            var code = e.keyCode;
            //    console.log(code);
            if(code == 37) { // Vasen
                e.preventDefault();
                box2d.car.steeringAngle = -box2d.car.maxSteeringAngle;
            }
            if(code == 39) { // Oikea
                e.preventDefault();
                box2d.car.steeringAngle = box2d.car.maxSteeringAngle;
            }
            if(code == 38) { // Eteen
                e.preventDefault();
                box2d.car.accelerate = true;
            }
            if(code == 40) { // Taakse
                e.preventDefault();
                box2d.car.decelerate = true;
            }
        });
        $(window).keyup(function(e) {
            var code2 = e.keyCode;

            if(code2 == 37) {
                e.preventDefault();
                box2d.car.steeringAngle = 0;
            }
            if(code2 == 39) {
                e.preventDefault();
                box2d.car.steeringAngle = 0;
            }
            if(code2 == 38) {
                e.preventDefault();
                box2d.car.accelerate = false;
            }
            if(code2 == 40) {
                e.preventDefault();
                box2d.car.decelerate = false;
            }
        });
    }
}