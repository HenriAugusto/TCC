/**
 * A card that contains variations on a {@link INoteSequence}.
 * The variations are selected through a circle.
 * @extends SequenceCard
 */
 class VariationsCard extends SequenceCard {
     originalSequence;
    /**
     * Two-dimensional array.
     * First dimension means distance: closes means more similar (similarityDepths)
     * Second dimension is just different variations: differente angle means different variation (variationsPerDepth)
     */
    variations = [];
    similarityDepths = 5;
    variationsPerDepth = 10;
    similarityMinimum = 0.66;
    similarityMaximum = 0.95;
    circleSelector;
    circleRadius = 40;

    constructor(seq, title){
        super(seq, title, "VariationsCard");
        this.originalSequence = seq;
        this.getVariations(seq).then( () => {
            this.initCircleSelector();
        });
    }

    initCircleSelector(){
        let circleSel = document.createElement("div");
        circleSel.style.backgroundColor = "rgb(255,255,255)";
        //circleSel.style.background = "radial-gradient(circle, rgba(157,6,164,1) 0%, rgba(255,255,255,1) 100%);";
        circleSel.style.borderStyle = "solid";
        circleSel.style.borderColor = "black";
        circleSel.style.width= this.circleRadius+"%";
        //circleSel.style.height= this.circleRadius;
        circleSel.style.position = "relative";
        circleSel.style.margin = "5% "+((100-this.circleRadius)/2)+"%";
        circleSel.style.borderRadius= "50%"; //make it a circle

        
        this.cardDiv.appendChild( circleSel );
        //https://stackoverflow.com/questions/5445491/height-equal-to-dynamic-width-css-fluid-layout
        let dummy = document.createElement("div");
        dummy.style.marginTop = "100%";
        circleSel.appendChild( dummy );

        let boundFunc = this.circleSelHandler.bind(this);
        // MOUSE DOWN
        circleSel.addEventListener("mousedown", boundFunc);
        circleSel.addEventListener("mousedown", (e) => {
            // MOUSE OVER
            circleSel.addEventListener("mousemove", boundFunc);
            e.preventDefault();
        });
        // MOUSE UP
        circleSel.addEventListener("mouseup", (e) => {
            e.preventDefault();
            console.log("removing...")
            circleSel.removeEventListener("mousemove", boundFunc);
        });
        let pointer = document.createElement("div");
        pointer.classList.add("circleSelPointer");
        pointer.style.width = "10%";
        pointer.style.height = "10%";
        pointer.style.background = "black";
        pointer.style.position = "absolute";
        pointer.style.borderRadius = "50%";
        let centerX = Math.round( circleSel.offsetWidth/2 );
        let centerY = Math.round( circleSel.offsetHeight/2 );
        pointer.style.left = centerX+"px";
        pointer.style.top = centerY+"px";
        circleSel.appendChild( pointer );

        this.circleSelector = circleSel;
    }

    circleSelHandler(e){
        function distanceBetweenPoints(x1, y1, x2, y2){
            let leg1 = x2-x1;
            let leg2 = y2-y1;
            return Math.hypot(leg1, leg2);
        }
        
        function angleBetweenPoints(x1, y1, x2, y2){
            let leg1 = x2-x1;
            let leg2 = y2-y1;
            return Math.atan2(leg2, leg1);
        }
        e.preventDefault();
        console.log(e);
        let circleSel = this.circleSelector;
        let pointer = circleSel.querySelector(".circleSelPointer");
        let circleX = circleSel.offsetLeft;
        let circleY = circleSel.offsetTop;
        let w = circleSel.offsetWidth;
        let h = circleSel.offsetHeight;
        let radius = Math.round( w/2 );
        let centerX = Math.round( w/2 );
        let centerY = Math.round( h/2 );
        let clickX = e.offsetX;
        let clickY = e.offsetY;
        
        let distanceToCenter = distanceBetweenPoints(centerX, centerY, clickX, clickY);

        let angle = angleBetweenPoints(centerX, centerY, clickX, clickY);
        
        if(distanceToCenter > radius){
            // outside the circle
            return;
        }
        let pointerRadius = Math.round(pointer.offsetWidth/2);
        
        console.log("angle: "+angle);
        console.log("source pos: ["+circleX+", "+circleY+"]");
        console.log("dimensions: "+w+"x"+h);
        console.log("center: ["+centerX+", "+centerY+"]");
        console.log("click: ["+clickX+", "+clickY+"]");
        console.log("distance to center: "+distanceToCenter);

        let angleResult = Math.floor( ((angle+Math.PI)/(2*Math.PI))*this.variationsPerDepth );
        let radiusResult = Math.floor( (distanceToCenter/radius)*this.similarityDepths );

        let snapX = Math.cos( angleResult/this.variationsPerDepth*2*Math.PI-Math.PI )*radius*radiusResult/this.similarityDepths;
        let snapY = Math.sin( angleResult/this.variationsPerDepth*2*Math.PI-Math.PI )*radius*radiusResult/this.similarityDepths;

        if( distanceToCenter < radius/(3/2*this.similarityDepths)){
            this.setNoteSequence(this.originalSequence);
            snapX = 0;
            snapY = 0;
        }

        pointer.style.left = (centerX+snapX-pointerRadius)+"px";
        pointer.style.top = (centerY+snapY-pointerRadius)+"px";

        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        var svgNS = svg.namespaceURI;
        svg.classList.add("svgContainer");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.style.zIndex = 2;
        svg.style.position = "absolute";
        svg.style.top = 0;
        svg.style.left = 0;

        let line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", centerX);
        line.setAttribute("y1", centerY);
        line.setAttribute("x2", centerX+snapX);
        line.setAttribute("y2", centerY+snapY);
        line.style = "stroke:rgb(255,0,0);stroke-width:2";
        svg.appendChild(line);

        circleSel.querySelectorAll(".svgContainer").forEach( x=> x.remove() );
        circleSel.appendChild(svg);

        // Makes our pointer ignore pointer (mouse) events
        pointer.style.pointerEvents = "none"; //the irony...
        console.log("angleResult: " + angleResult);
        console.log("radiusResult: " + radiusResult);
        this.setNoteSequence(this.variations[radiusResult][angleResult]);
    }

    async getVariations(seq){
        for(let i=0; i<this.similarityDepths; i++){
            let similarity = this.similarityMaximum+(i/(this.similarityDepths-1)*(this.similarityMinimum-this.similarityMaximum));
            console.log("similarity: "+similarity);
            let depth = await VAE.similarSequencesRequest(seq, this.variationsPerDepth, similarity);
            this.variations.push( depth );
        }
        console.log(this.variations);
    }
    
}