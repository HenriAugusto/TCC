class Tooltip {
    text;
    x;
    y;
    div;

    constructor(text, x, y, display=true){
        this.text = text;
        this.x = x;
        this.y = y;

        this.div = document.createElement("div");
        this.div.classList.add("tooltip");
        this.div.innerText = text;
        this.div.style.position = "absolute";
        this.div.style.left = x + "px";
        this.div.style.top = (y+25) + "px";

        if(display){
            this.display();
        }
    }

    display(){
        document.body.append(this.div);
    }

    destroy(){
        this.div.remove();
    }
}