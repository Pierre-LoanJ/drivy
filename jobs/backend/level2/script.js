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
};
var applySale = function(days, price) {
	function applyXPercentForNDays(discount, nDays) {
		if (discount >= 100) {
			console.log("Error: discount >= 100, therefore discount won't be applied");
			discount = 0;
		}
		var priceWithXPercent = price * (1 - discount / 100);
		return priceWithXPercent * nDays;
	}
	var sum = price;										// on day one we apply full price
	days--;
	if (days > 0) {
		if (days >= 3) {
			sum += applyXPercentForNDays(10, 3);				// from day 1 to day 4 (so i = 3) we get 10% off
			days -= 3;
		}
		else {
			sum += applyXPercentForNDays(10, days);
			days = 0;
		}
		if (days > 0) {
			if (days >= 6) {
				sum += applyXPercentForNDays(30, 6);				// from day 4 to day 10 (so i = 5) we get 30% off
				days -= 6;
			}
			else {
				sum += applyXPercentForNDays(30, days);
				days = 0;
			}
		}
		if (days > 0) {
			sum += applyXPercentForNDays(50, days);				// from day 10 we get 50% off
		}
	}
	return sum;
};
var computeTimeComp = function(cars, start, end, carId) {
    var priceDay = -1;
    priceDay = getPrice(cars, carId, "price_per_day");
    
    var time = getDuration(start, end);
    if (time < 0 || priceDay < 0) return -1;
	
	var priceWithSale = applySale(time, priceDay);
	return priceWithSale;
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


