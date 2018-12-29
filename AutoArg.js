// AutoArg -- manually injected action triggering
// After loading Trimps, paste the following code into your console:
// (SetInterval is at the bottom and controls what actually happens)
class AutoArg {
	constructor() {
    this.autoArgMapAtZoneAndCell = function(_zone, _cell) {
      if(game.global.world == _zone && !game.global.preMapsActive && !game.global.mapsActive) {
        if(game.global.lastClearedCell + 2 == _cell) {
          mapsClicked();
        }
      }
    };
    this.autoArgEssenceFarm = function() {
      // Uses S if there is essence on the map
      if(!game.global.mapsActive && countRemainingEssenceDrops() > 0) {
        setFormation('4'); // S
        return true;
      }
      return false;
    };
    this.autoArgStanceDance = function() {
      if(this.autoArgEssenceFarm() == true) return;
      // Very basic stancedancing
      else if(game.global.formation == 2 && game.global.soldierHealth <= game.global.soldierHealthMax * 0.125) {
        setFormation('0');
      }
      else if(game.global.formation == 0 && game.global.soldierHealth <= game.global.soldierHealthMax * 0.125) {
        setFormation('1')
      }
      else if(game.global.formation == 1 && game.global.soldierHealth == game.global.soldierHealthMax) {
        setFormation('2');
      }
    };
    this.autoArgBoneFarm = function() {
      // If have been in map for 45 mins, go back to world.
      if(((getGameTime() - game.global.zoneStarted) / 1000) > (45 * 60)) {		
        // If in map and not switching to maps
        if(game.global.mapsActive && !game.global.switchToMaps) {
          mapsClicked();
        }
        // If on map screen and not switching to world
        if(game.global.preMapsActive && !game.global.switchToMaps) {
          mapsClicked();
        }
      }
      else {
        // If in world and fighting, go to map screen.
        if(!game.global.preMapsActive && !game.global.mapsActive && game.global.fighting) {
          this.autoArgMapAtZoneAndCell(game.global.world, 100);
        }
        // If on map screen, try to farm.
        else if(game.global.preMapsActive && !game.global.mapsActive && !game.global.fighting) {
          // Presets are used as priorities in this system.
          // If can't buy preset 1, buy preset 2, else buy preset 3, else give up and farm.
		if(game.global.selectedMapPreset != 1) {
			selectAdvMapsPreset(1);
			if(buyMap() < 0) {
				selectAdvMapsPreset(2);
				if(buyMap() < 0) {
					selectAdvMapsPreset(3);
					buyMap()
				}
			}
		}
		selectMap('map' + game.global.mapsOwned); // Select latest map
		runMap();
        }
      }
    };
  }
}
var autoArg = new AutoArg(); 
setInterval(function() {
  autoArg.autoArgStanceDance();
  autoArg.autoArgBoneFarm();
}, 100); // 100 ms interval


// USEFUL VARIABLES AND FUNCTIONS
// Current zone number: game.global.world
// Current world cell: (game.global.lastClearedCell + 2)
// Current map cell: (game.global.lastClearedMapCell + 2)
// On map menu but not in map: game.global.preMapsActive

// Time since zone in seconds: (getGameTime() - game.global.zoneStarted) / 1000

// Click "m": mapsClicked();

// setFormation('x'); where 0 = X, 1 = H, 2 = D, 3 = B, 4 = S
// game.global.formation
// game.global.soldierHealthMax // Matches current formation
// game.global.soldierHealth

// Print to console: console.log("string");

