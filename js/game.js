(function() { 
    var Game = {
				rows: 65, // setar novamente em load config
        columns : 130, // setar novamente em load config
        
        /**
         * On window load
         * */
        start : function() { 
            // init / reset algorithm
            // load config
            Game.canvas.init();
            // register button events
        },
        
        canvas : {
            canvasElement : null,
            context : null,
            cellSize: null,
            totalCellSpace : null, // ensures cell division between the gray background
            width : null,
            height : null,
			ages : null, // dead == 0 / alive > 0 / the higher the number, the older the cell is
            
            init : function() {
                this.canvasElement = document.getElementById('canvas');
                this.context = this.canvasElement.getContext('2d');
                this.cellSize = 7;
                this.totalCellArea = 1;
                
                Game.helpers.registerEvent(this.canvasElement, "mousedown", Game.handlers.canvasMouseDown, false);
                Game.helpers.registerEvent(this.canvasElement, "mouseup", Game.handlers.canvasMouseUp, false);
                Game.helpers.registerEvent(this.canvasElement, "mousemove", Game.handlers.canvasMouseMove, false);

				this.resetWorld();
				this.drawWorld(); // FIXME -- this must be moved 
            },
			
			/*
			 * Clear world
			 */
			resetWorld : function() {
				this.ages = [];
				for (var i = 0; i < Game.columns; i++) {
					this.ages[i] = [];
					for (var j = 0; j < Game.rows; j++) {
						this.ages[i][j] = 0;
					}
				}
			},
			          
            drawWorld : function() {
                /* set canvas size dynamically according to number of cells */
                this.width = 1 + (this.cellSize * Game.columns) + (this.totalCellArea * Game.columns);
                this.height = 1 + (this.cellSize * Game.rows) + (this.totalCellArea * Game.rows);
                
                this.canvasElement.width = this.width;
                this.canvasElement.height = this.height;
                
                
                /* draw gray background */
                this.context.fillStyle = "#E6E6E6"; 
                this.context.fillRect(0, 0, this.width, this.height);
                
                /* draw cells starting from the top, left to right */
                for (var i = 0 ; i < Game.columns; i++) {
                    for (var j = 0 ; j < Game.rows; j++) {
                        if (this.ages[i][j] > 0) {
							this.drawCell(i, j, true); 
                        } else {
							this.drawCell(i, j, false);
                        }
                    }
                }
            },
				
            drawCell : function(x, y, alive) {
                if (alive) {
                    this.context.fillStyle = "#0000FF";
                } else {
                    this.context.fillStyle = "#FFFFFF";
                }
                
                this.context.fillRect(  1 + (this.totalCellArea * x) + (this.cellSize * x), 
                                        1 + (this.totalCellArea * y) + (this.cellSize * y),  
                                        this.cellSize, this.cellSize); 
                
            },
                
            switchCell : function(x, y) {
                if (this.ages[x][y] > 0) {
					this.changeCellToDead(x, y);
                } else {
					this.changeCellToAlive(x, y);
				}
            },
            
            changeCellToDead : function(x, y) {
                if (x >= 0 && x < Game.columns && y >= 0 && y < Game.rows) {
                    this.drawCell(x, y, false);
					this.ages[x][y] = 0;
					
                }
            },
            
            changeCellToAlive : function(x, y) {
                if (x >= 0 && x < Game.columns && y >= 0 && y < Game.rows) {
                    this.drawCell(x, y, true);
					this.ages[x][y] = 1;
                }
            }
        },
        
        helpers : { 
			/** 
			*	Register Event 
			*/
			registerEvent : function(element, event, handler, capture) {
			// ex: var regex = /pattern/flags;
			// 'i' - insensitive mode flag
				if (/msie/i.test(navigator.userAgent)) {
				  element.attachEvent('on' + event, handler);
				} else {
				  element.addEventListener(event, handler, capture);
				}
			},

			/** 
			*	Get mouse coords within the <canvas> element 
			*/
			getMouseCoords : function(event){
				var totalOffsetX = 0,
					totalOffsetY = 0,
					canvasX = 0,
					canvasY = 0,
					currentElement =  document.getElementById('canvas');

				totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
				totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;

				
				//	(Game.canvas.cellSize + 1) == cell plus gray area.
				//	ceil(... - 1) instead of floor(...) because of floating-point rounding 
				//	near right border of each cell, which would make 4.9 turn into floor(5) instead of floor(4.9) 
				canvasX = Math.ceil(((event.pageX - totalOffsetX) / (Game.canvas.cellSize + 1)) - 1);
				canvasY = Math.ceil(((event.pageY - totalOffsetY) / (Game.canvas.cellSize + 1)) - 1);
				return {x:canvasX, y:canvasY};
			}
        },
        
        handlers : {
            mouseDown : false,
            lastX : 0,
            lastY : 0,
            
            canvasMouseDown : function(event) {
                var coords = Game.helpers.getMouseCoords(event);
                Game.canvas.switchCell(coords.x, coords.y);
                Game.handlers.mouseDown = true;
				lastX = coords.x; 
				lastY = coords.y;
            },
            
            canvasMouseUp : function() {
                Game.handlers.mouseDown = false;
            },
            
            canvasMouseMove : function(event) {
                if (Game.handlers.mouseDown === true) {
                    var coords = Game.helpers.getMouseCoords(event);
					if (coords.x != lastX || coords.y != lastY) {
						Game.canvas.switchCell(coords.x, coords.y);
						lastX = coords.x;
						lastY = coords.y;
					}
                }
            }
            
        },
		
		algorithm : {
		   livingCells : [],
		
			cell : function (newX, newY) {
				this.x = newX;
				this.y = newY;
			},
		}
        
    };
    
    /**
     * entry point
     * */
    Game.helpers.registerEvent(window, 'load', function() {
        Game.start();
        }, false);
}());