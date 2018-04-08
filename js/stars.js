/* InfoVis Project By Armando Cincotti*/

var w = window.innerWidth,
    h = window.innerHeight,
    margin = {top:10, right:50, bottom: 30, left: 10};

var minSize = 10,
	maxSize = 80;

var numberOfStars = 30;

var maxDistance = Math.sqrt(Math.pow(w-margin.right,2) + Math.pow(h-margin.right,2)); //massima distanza possibile all'interno del mio svg

var mycolors = d3.scale.ordinal()
		.domain(d3.range(10))
		.range(['#009933','#FFFF00','#FF6600','#FF0000','#66FF33','#CC00FF','#3399FF','#00FFFF','#FFFFFF','#737373']);

/*Calcola i punti del polygon che disegna la stella: arms sono il numero di punte della stella e outer e inner radius sono i raggi delle
circonferenze che vengono usate per determinare i punti. Infatti le stelle vengono viste come un insieme di 10 punti di cui 5 stanno
sulla circonferenza più grande e 5 sulla circonferenza più piccola*/
function starPoints(centerX, centerY, arms, outerRadius, innerRadius){
   var results = "";
   var angle = Math.PI / arms; //angle è l'angolo di ciascun punto sulla circonferenza
   var rotation = Math.PI/2*3; //fa in modo di disegnare dritta la stella, in modo che il primo punto sia disegnato ai 90°

   for (var i = 0; i < 2*arms; i++) //faccio un for per disegnare i 10 punti
   {
      var r = (i%2) == 0 ? outerRadius : innerRadius; //operatore condizionale: se la condizione (i%2)==0 è verificata fai ciò che sta dopo il "?" altrimenti fai ciò che sta dopo i ":". É come l'if else.
      													//devo alternatamente selezionare outerRadius o innerRadius.
      var x = centerX + Math.cos(rotation) * r; 
      var y = centerY + Math.sin(rotation) * r;

      rotation += angle;
      if (i == 0){
         results = x + " " + y;
      }
      results += " " + x + " " + y;
   }
   return results;
}

/*ritorna un numero intero random nell'intervallo [min,max]*/
function getRandomInt(min, max) {
        return Math.round(Math.random() * (max - min + 1)) + min;
}

/*ritorna un numero float random nell'intervallo [min,max]*/
function getRandomFloat(min, max) {
        return Math.random() * (max - min + 1) + min;
}

/*ritorna la distanza tra due punti*/
function distanceBetween(from, to) {
	var x1 = from[0],
		x2 = to[0],
		y1 = from[1],
		y2 = to[1];
	var result = Math.pow((x2-x1),2) + Math.pow((y2-y1),2);
	return Math.sqrt(result);
}

/*calcola un tempo(durata della transizione) in proporzionale a raggio della stella e alla distanza della stella dal mouse*/
function motionDuration(radius, distance){
	var speed = 5/radius;
	var time = distance/speed;

	return time;
}

/*crea un array fatto da oggeti che contengono le informazioni sulle stelle da disegnare*/
function fillDataSet(numberOfStars){
	var i = -1;
	var dataSet = d3.range(numberOfStars).map(
		function(){
			var randomRadius = getRandomFloat(minSize,maxSize),
				randomX = getRandomFloat(maxSize,w-maxSize),
				randomY = getRandomFloat(maxSize,h-maxSize);
			i++;
			return {
				id: "star-"+i,
				radius: randomRadius,
				centerX: randomX,
				centerY: randomY,
				points: starPoints( randomX, randomY, 5, randomRadius, randomRadius*(2/5) ),
				color: mycolors(getRandomInt(0,9))
			}
		});
	return dataSet;
}

/*gestisce il movimento del mouse all'interno dell'svg*/
function handleMousemove(coords){

	var mx = coords[0], //coordinata x del mouse
		my = coords[1]; //coordinata y del mouse
	var stars = svg.selectAll(".star").data(dataSet); //seleziono le stelle nel DOM
	var translations = []; //array che conterrà la traslazione applicata a ciascuna stella; serve per trovare successivamente le coordinate correnti del centro delle stelle

	for (j=0; j<numberOfStars; j++){ //per ciascuna stella
		var current = d3.transform(d3.select("#star-"+j).attr("transform")).translate; //seleziona l'attributo transform translate (ritorna un array di 2 elementi) 
		translations.push(current); //aggiungo la traslazione all'array delle traslazioni
	}
	
	stars.transition().duration(function(d,i) {
			var distance = distanceBetween( [d.centerX+translations[i][0], d.centerY+translations[i][1]], coords ); //calcolo la distanza del centro di ciascuna stella dal mouse
			return motionDuration(d.radius, distance); //calcolo la durata della transizione
		})
		.attr("transform", function(d){return "translate("+ (mx-d.centerX) +","+ (my-d.centerY) +")" }) //muovo ciascuna stella verso il mouse
		//.transition().duration(300).style("fill-opacity", 0).style("stroke-width", 0)
		.transition().duration(0)
		.attr("transform", function(d){
			return "translate("+ (getRandomFloat(0,w-margin.right)-d.centerX) +","+ (getRandomFloat(0,h-margin.right)-d.centerY) +")" }) //muovo ciascuna stella in un punto random dell'svg
		//.transition().duration(300).style("fill-opacity", .5).style("stroke-width", 1);
}

var dataSet = fillDataSet(numberOfStars);

var svg = d3.select("body").append("svg")
    .attr("width", w-margin.right)
    .attr("height", h-margin.right)
    .style("background-color", "#000022")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .on("mousemove", function(){ //quando si muove il mouse all'interno dell'svg
    	var coords = d3.mouse(this); //trova le coordinate correnti del mouse
    	handleMousemove(coords); //chiama la funzione che gestisce il movimento del mouse
    });

var stars = svg.selectAll("polygon").data(dataSet);

stars.enter()
	.append("polygon")
	.attr("class", "star")
	.attr("id", function(d) { return d.id })
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
	.style("fill", "transparent");