var getPrice = function(cars, carId, priceType) {
    var price = -1;
    for (var i = 0; i < cars.length; i++) {
        var car = cars[i];
        if (car.id == carId) {
            price = car[priceType];
            return price; 
        }
    }
    console.log("Error: car_id not found");
    return price;
};
var getDuration = function(start, end) {
    var dateFin = new Date(end);
    var dateDeb = new Date(start);
    if (dateFin < dateDeb) {
        console.log("Error: dateFin < dateDeb");
        return -1;
    }
    var duration = Math.abs(dateFin.getTime() - dateDeb.getTime());
    var nDays = Math.floor(duration / (1000 * 3600 * 24));
	// if car is returned the same day we count 1 day of rental
	if (nDays == 0) nDays = 1;
    return nDays;
}

var computeTimeComp = function(cars, start, end, carId) {
    var priceDay = -1;
    priceDay = getPrice(cars, carId, "price_per_day");
    
    var time = getDuration(start, end);
    if (time < 0 || priceDay < 0) return -1;
    else return time * priceDay;
};

var computeDistanceComp = function(cars, distance, carId) {
    var priceKm = getPrice(cars, carId, "price_per_km");

    if (priceKm < 0) {
        console.log("Error: priceKm=", priceKm);
        return -1;
    }
    else if (distance < 0) {
        console.log("Error: distance=", distance);
        return -1;
    }
    else return priceKm * distance;
};
function readSingleFile(e) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var contents = e.target.result;
    main(contents);
  };
  reader.readAsText(file);
}

var main = function(text) {
    var obj_in = JSON.parse(text);
	var obj_out = {};
    obj_out.rentals = [];

	var j = 0;
    for (var i = 0; i < obj_in.rentals.length; i++) {
        var rental = obj_in.rentals[i];
        var rentalId = rental.id;
		var cars = obj_in.cars;
		
        var tComp = computeTimeComp(cars, rental.start_date, rental.end_date, rental.car_id);
        var dComp = computeDistanceComp(cars, rental.distance, rental.car_id);

        if (tComp > 0 && dComp > 0) obj_out.rentals[j++] = { "id" : rentalId, "price": tComp + dComp };
        else if (tComp < 0) console.log("Error: tComp=", tComp);
        else if (dComp < 0) console.log("Error: tDist=", dComp);
    }
	var s_out = JSON.stringify(obj_out, null, 2);
	var element = document.getElementById('file-content');
	element.textContent = s_out;
	download(s_out, 'output.js', 'text/plain');
};
function download(text, name, type) {
  var a = document.getElementById("a");
  var file = new Blob([text], {type: type});
  a.href = URL.createObjectURL(file);
  a.download = name;
}
document.getElementById('file-input')
  .addEventListener('change', readSingleFile, false);


