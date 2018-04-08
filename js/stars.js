/* InfoVis Project By Armando Cincotti*/

var w = window.innerWidth,
    h = window.innerHeight,
    margin = {top:10, right:50, bottom: 30, left: 10};

var minSize = 10,
	maxSize = 80;

var maxDistance = Math.sqrt(Math.pow(w-margin.right,2)+Math.pow(h-margin.right,2))

var duration = d3.scale.linear().domain([minSize,maxSize]).range([1000,3000]);
var mycolors = d3.scale.ordinal()
		.domain(d3.range(10))
		.range(['#009933','#FFFF00','#FF6600','#FF0000','#66FF33','#CC00FF','#3399FF','#00FFFF','#FFFFFF','#737373']);

function starPoints(centerX, centerY, arms, outerRadius, innerRadius){
   var results = "";
   var angle = Math.PI / arms;
   var rotation=Math.PI/2*3;

   for (var i = 0; i < 2 * arms; i++)
   {
      var r = (i%2) == 0 ? outerRadius : innerRadius;
      
      var x = centerX + Math.cos(rotation) * r;
      var y = centerY + Math.sin(rotation) * r;

      rotation += angle;

      if (i == 0)
      {
         results = x + " " + y;
      }
      
      results += " " + x + " " + y;
   }

   return results;
}

function getRandomInt(min, max) {
        return Math.round(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
        return Math.random() * (max - min + 1) + min;
}

function distanceBetween(from, to) {
	var x1 = from[0],
		x2 = to[0],
		y1 = from[1],
		y2 = to[1];
	var result = Math.pow((x2-x1),2) + Math.pow((y2-y1),2);
	return Math.sqrt(result)/100;
}

function motionDuration(radius, distance){
	var speed = 100/radius;
	var time = distance/speed;

	return time*1000 //duration(time);
}

function fillDataSet(numberOfStars){
	var dataSet = d3.range(numberOfStars).map(
		function(){
			var randomRadius = getRandomFloat(minSize,maxSize),
				randomX = getRandomFloat(maxSize,w-maxSize),
				randomY = getRandomFloat(maxSize,h-maxSize);
			return {
				radius: randomRadius,
				centerX: randomX,
				centerY: randomY,
				points: starPoints( randomX, randomY, 5, randomRadius, randomRadius*(2/5) ),
				color: mycolors(getRandomInt(0,9))
			}
		});
	return dataSet;
}

function handleMousemove(coords){
	var mx = coords[0],
		my = coords[1];
	var stars = svg.selectAll(".star").data(dataSet);

	stars.transition().duration(function(d) {
			var distance = distanceBetween( [d.centerX,d.centerY], coords );
			return motionDuration(d.radius, distance);//*/// duration(d.radius);
		})
		.attr("transform", function(d){return "translate("+ (mx-d.centerX) +","+ (my-d.centerY) +")" })
		.transition().duration(0)
		/*.attr("points", function(d,i){
		//	var newCenterX = getRandomFloat(maxSize,w-maxSize);
			var newCenterY = getRandomFloat(maxSize,h-maxSize);
			dataSet[i].centerX = newCenterX;
			dataSet[i].centerY = newCenterY;
			dataSet[i].points = starPoints(newCenterX,newCenterY,5,d.radius,d.radius*(2/5))
			return starPoints(newCenterX,newCenterY,5,d.radius,d.radius*(2/5))});*/
		.attr("transform", function(d){
		return "translate("+ (getRandomFloat(0,w-margin.right)-d.centerX) +","+ (getRandomFloat(0,h-margin.right)-d.centerY) +")" });
}

var dataSet = fillDataSet(3);

var svg = d3.select("body").append("svg")
    .attr("width", w-margin.right)
    .attr("height", h-margin.right)
    .style("background-color", "#000022")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .on("mousemove", function(){ 
    	var coords = d3.mouse(this);
    	handleMousemove(coords);
    });

var stars = svg.selectAll("polygon").data(dataSet);

stars.enter()
	.append("polygon")
	.attr("class", "star")
	.attr("points", function(d) { return d.points })
	.style("fill", function(d){return d.color })
	.style("fill-opacity", .5)
	.style("stroke", function(d){return d.color })

var svgBorder = svg.append("rect")
	.attr("x",0)
	.attr("y",0)
	.attr("height", h-margin.right)
	.attr("width", w-margin.right)
	.style("stroke", "cyan")
	.style("stroke-width", 5)
	.style("fill", "transparent")

var svg2 = d3.select("body").append("svg")
	.attr("width",700)
	.attr("height",100)

var view = svg2.selectAll("rect").data(d3.range(10))

view.enter()
.append("rect")
.attr("width",50)
.attr("height",50)
.attr("x",function(d,i){return 50+(i*60)})
.attr("y",50)
.style("fill", function(d,i){return mycolors(i)})
