var tessel = require('tessel');
var rfidlib = require('rfid-pn532');
var servoLib = require('servo-pca9685');

var rfid = rfidlib.use(tessel.port['A']); 
var servo = servoLib.use(tessel.port['B']);

var blinky;
var originMax = 10;
var min = 1, max = originMax;
var port = 1;

function randInRange(min, max, inclusive) {
	return Math.floor(Math.random() * (max - min + (+!!inclusive))) + min;
}

function slapThem() {
	// Do the slapping

	servo.read(port, function(err, reading) {
		console.log("READING: ",reading);

		servo.move(port, 0.5, function() {
			console.log('I slapped them');
			setTimeout(function() {
				servo.move(port, 0.05);
			}, 1000);
		});
	});
}

var rfidRdy = new Promise(function(resolve, reject) {
	rfid.on('ready', function(card) {
		resolve(card);
	});
});

var servoRdy = new Promise(function(resolve, reject) {
	servo.on('ready', function() {
		resolve();
	});
});

Promise.all([rfidRdy, servoRdy])
	.then(function(arr) {

		return new Promise(function(resolve, reject) {
			servo.configure(port, 0.05, 0.5, function() {
				resolve(arr);
			});
		});
	})
	.then(function(arr) {
		var card = arr[0];
		tessel.led[2].on();

		rfid.on('read', function(card) {
			if (!blinky){

				blinky = setInterval(function () {
					tessel.led[2].toggle();
					tessel.led[3].toggle();
				}, 200);

				setTimeout(function(){
					clearInterval(blinky);
					blinky = undefined;
					var rand = randInRange(min, max, true);
					var slapNumber = randInRange(min, max, true);
					console.log("RANDO NUM: ",rand);
					console.log("SLAP NUM: ",slapNumber);
					if (rand === slapNumber) {
						console.log('You got slapped!');
						slapThem();
						max = originMax;
					}
					else {
						max--;
						console.log('You\'re safe... for now');
						console.log('The new slapMaxx is ' + max);
					}
				}, 2000);
			}

		});
	})
	.catch(function(e) {
		console.log(e);
	});

rfid.on('ready', function (version) {
  console.log('Ready to read RFID card');


});

rfid.on('error', function (err) {
  console.error(err);
});