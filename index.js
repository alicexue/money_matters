var demData = {
    "Hillary Clinton": {
	"True": 0.24,
	"Mostly True": 0.27,
	"Half True": 0.21,
	"Mostly False": 0.14,
	"False": 0.13,
	"Pants on Fire": 0.01
    },
    "Bernie Sanders": {
	"True": 0.15,
	"Mostly True": 0.36,
	"Half True": 0.19,
	"Mostly False": 0.15,
	"False": 0.14,
	"Pants on Fire": 0.00
    }
};

var repData = {
    "Donald Trump": {
	"True": 0.03,
	"Mostly True": 0.06,
	"Half True": 0.15,
	"Mostly False": 0.16,
	"False": 0.42,
	"Pants on Fire": 0.19
    },
    "Ted Cruz": {
	"True": 0.06,
	"Mostly True": 0.16,
	"Half True": 0.13,
	"Mostly False": 0.29,
	"False": 0.30,
	"Pants on Fire": 0.07
    },
    "John Kasich": {
	"True": 0.25,
	"Mostly True": 0.26,
	"Half True": 0.16,
	"Mostly False": 0.15,
	"False": 0.13,
	"Pants on Fire": 0.05
    }
};

var showingDems = true;
var party = demData;

var chart = function(data,newChart){
    var svg = d3.select("body")
	.append("svg")
	.append("g")

    svg.append("g")
	.attr("class", "slices");
    svg.append("g")
	.attr("class", "labels");
    svg.append("g")
	.attr("class", "lines");

    var width = 800,
    height = 300,
    radius = Math.min(width , height) / 2;

    var pie = d3.layout.pie()
	.sort(null)
	.value(function(d) {
	    return d.value;
	});

    var arc = d3.svg.arc()
	.outerRadius(radius * 0.8)
	.innerRadius(radius * 0.4);

    var outerArc = d3.svg.arc()
	.innerRadius(radius * 0.9)
	.outerRadius(radius * 0.9);

    //svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    svg.attr("transform", "translate(" + (radius+120) + "," + radius + ")");

    var key = function(d){ return d.data.label; };

    var color = d3.scale.ordinal()
	.domain(["True", "Mostly True", "Half True", "Mostly False", "False", "Pants on Fire"])
	.range(["#71BF44", "#C3D52D", "#FFD503", "#EE9022", "#E71F28", "#961F28"]);
    change(fillData(data));

    function fillData(data) {
	labels = color.domain();
	return labels.map(function(label){
	    return { label: label, value: data[label] }
	});
    };

    function changeParty() {
	if (showingDems == true) {
	    for (var candidate in repData) {
		change(fillData(repData[candidate]));
	    }
	    showingDems = false;
	} else {
	    for (var candidate in demData) {
		change(fillData(demData[candidate]));
	    }
	    showingDems = true;
	}
    };    
    
    
    d3.select("body")
	.on("click", function(){
	    console.log("clicked");
	    changeParty();
	});

    function change(data) {
	
	/* ------- PIE SLICES -------*/
	var slice = svg.select(".slices").selectAll("path.slice")
	    .data(pie(data), key);

	slice.enter()
	    .insert("path")
	    .style("fill", function(d) { return color(d.data.label); })
	    .attr("class", "slice");

	slice		
	    .transition().duration(1000)
	    .attrTween("d", function(d) {
		this._current = this._current || d;
		var interpolate = d3.interpolate(this._current, d);
		this._current = interpolate(0);
		return function(t) {
		    return arc(interpolate(t));
		};
	    })

	slice.exit()
	    .remove();

	/* ------- TEXT LABELS -------*/

	var text = svg.select(".labels").selectAll("text")
	    .data(pie(data), key);

	text.enter()
	    .append("text")
	    .attr("dy", ".35em")
	    .text(function(d) {
		return d.data.label;
	    });
	
	function midAngle(d){
	    return d.startAngle + (d.endAngle - d.startAngle)/2;
	}

	text.transition().duration(1000)
	    .attrTween("transform", function(d) {
		this._current = this._current || d;
		var interpolate = d3.interpolate(this._current, d);
		this._current = interpolate(0);
		return function(t) {
		    var d2 = interpolate(t);
		    var pos = outerArc.centroid(d2);
		    pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
		    return "translate("+ pos +")";
		};
	    })
	    .styleTween("text-anchor", function(d){
		this._current = this._current || d;
		var interpolate = d3.interpolate(this._current, d);
		this._current = interpolate(0);
		return function(t) {
		    var d2 = interpolate(t);
		    return midAngle(d2) < Math.PI ? "start":"end";
		};
	    });

	text.exit()
	    .remove();

	/* ------- SLICE TO TEXT POLYLINES -------*/

	var polyline = svg.select(".lines").selectAll("polyline")
	    .data(pie(data), key);
	
	polyline.enter()
	    .append("polyline");

	polyline.transition().duration(1000)
	    .attrTween("points", function(d){
		this._current = this._current || d;
		var interpolate = d3.interpolate(this._current, d);
		this._current = interpolate(0);
		return function(t) {
		    var d2 = interpolate(t);
		    var pos = outerArc.centroid(d2);
		    pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
		    return [arc.centroid(d2), outerArc.centroid(d2), pos];
		};			
	    });
	
	polyline.exit()
	    .remove();
    };
};


function update() {
    if (showingDems == true) {
	for (var candidate in demData) {
	    chart(demData[candidate]);
	}
    } else {
	for (var candidate in repData) {
	    chart(repData[candidate]);
	}
    }
};   


update();
