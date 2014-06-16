(function() {
  var Game = {
	    rows : 65,
      columns : 130,

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
        totalCellArea : null, // ensures cell division between the gray background
        width : null,
        height : null,
	      cellsAge : null, // dead == 0 / alive > 0 / the higher the number, the older the cell is

        init : function() {
            this.canvasElement = document.getElementById('canvas');
            this.context = this.canvasElement.getContext('2d');
            this.cellSize = 7; // XXX magic number
            this.totalCellArea = 1; // XXX magic number

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
  				this.cellsAge = [];
  				for (var i = 0; i < Game.columns; i++) {
  					this.cellsAge[i] = [];
  					for (var j = 0; j < Game.rows; j++) {
  						this.cellsAge[i][j] = 0;
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
            for (var col = 0 ; col < Game.columns; col++) {
              for (var row = 0 ; row < Game.rows; row++) {
                if (this.cellsAge[col][row] > 0) {
                  this.drawCell(col, row, true);
                } else {
                  this.drawCell(col, row, false);
                }
              }
            }
          },

          drawCell : function(x, y, alive) {
            if (alive) {
              /* a live cell is blue */
              this.context.fillStyle = "#0000FF";
            } else {
              /* a dead cell is white */
              this.context.fillStyle = "#FFFFFF";
            }

            this.context.fillRect((1 + (this.totalCellArea * x) + (this.cellSize * x)),
                                  (1 + (this.totalCellArea * y) + (this.cellSize * y)),
                                  this.cellSize, this.cellSize);
          },

          switchCell : function(x, y) {
            if (this.isCellAlive(x, y)) {
              this.changeCellToDead(x, y);
            } else {
              this.changeCellToAlive(x, y);
            }
          },

          isCellAlive : function(x, y) {
            if (this.cellsAge[x][y] > 0) {
              return true;
            } else {
              return false;
            }
          },

          changeCellToDead : function(x, y) {
            if (x >= 0 && x < Game.columns && y >= 0 && y < Game.rows) {
              this.drawCell(x, y, false);
              this.cellsAge[x][y] = 0;
              Game.algorithm.removeCell(x, y);
            }
          },

          changeCellToAlive : function(x, y) {
            if (x >= 0 && x < Game.columns && y >= 0 && y < Game.rows) {
              this.drawCell(x, y, true);
              this.cellsAge[x][y] = 1;
              Game.algorithm.addCell(x, y);
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
    			//	ceil(x - 1) was used instead of floor(x) because of floating-point rounding
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
        cellAlive : false,

        canvasMouseDown : function(event) {
          var coords = Game.helpers.getMouseCoords(event);
          if (Game.canvas.isCellAlive(coords.x, coords.y)) {
            cellAlive = true;
          } else {
            cellAlive = false;
          }
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
              if (cellAlive && Game.canvas.isCellAlive(coords.x, coords.y)) {
                Game.canvas.changeCellToDead(coords.x, coords.y);
              } else if (!cellAlive && !Game.canvas.isCellAlive(coords.x, coords.y)){
                Game.canvas.changeCellToAlive(coords.x, coords.y);
              }
    					lastX = coords.x;
    					lastY = coords.y;
    				}
          }
        }
      },

    	algorithm : {
        livingCellsMap : {}, // where 'x' is the key

        addCell : function (x, y) {
          if (this.livingCellsMap[x] === undefined) {
              this.livingCellsMap[x] = [];
          }
          this.livingCellsMap[x].push(y);
        },

        removeCell : function (x, y) {
          if (this.livingCellsMap[x] !== undefined) {
              var index = this.livingCellsMap[x].indexOf(y);
              this.livingCellsMap[x][index] = null
          }
        },

        checksForTopNeighbors : function (x, y) {
          if (this.livingCellsMap[++x] !== undefined) {

          }
        },

        checksForSideNeighbors : function (x, y) {
  				if (this.livingCellsMap[++x] !== undefined) {

  				}
        },

        checksForLowNeighbors : function (x, y) {
          if (this.livingCellsMap[++x] !== undefined) {

          }
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
