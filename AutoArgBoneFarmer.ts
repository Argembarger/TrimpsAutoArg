class AutoArgBoneFarmer {
    private boneFarmRoutine: number;
    private lastKnownBoneZone: number;
    private lastKnownBoneCount: number;
    private lastKnownBoneTime: number;
    private boneTraderButtonHTML: HTMLElement | null;
    public boneFarmAlwaysRunMap: boolean;
    public boneFarmPresetOrder: number[];
    private boneFarmGoingToMap: boolean;

    constructor() {
        this.boneFarmRoutine = -1;
        this.lastKnownBoneZone = -1;
        this.lastKnownBoneCount = -1;
        this.lastKnownBoneTime = -1;
        this.boneTraderButtonHTML = document.getElementById("boneBtnText");
        this.boneFarmAlwaysRunMap = false;
        this.boneFarmPresetOrder = [];
        this.boneFarmGoingToMap = false;
    }

    public StartBoneFarming(runMap: boolean, ...mapPresets: number[]): string {
        if(this.boneFarmRoutine >= 0) { 
          return "Already bone farming!"; 
        }
    
        // DO NOT ATTEMPT IF LESS THAN ZONE 5
        if(game.global.world < 6) { 
          return "Cannot (yet) bone farm less than World 6, since you cannot map yet!"; 
        }
        
        if(this.boneTraderButtonHTML == null) { 
          return "Couldn't find bone trader button! Cannot proceed!"; 
        }
    
        let bone_trade_btn_text = this.boneTraderButtonHTML.innerText;
    
        if(bone_trade_btn_text.indexOf("Trade ") == -1 || bone_trade_btn_text.indexOf(" Bones", 6) == -1) { 
          return "Bone trader button seems weird! Cannot proceed!"; 
        }
    
        this.lastKnownBoneCount = -1;
        if(this.boneTraderButtonHTML != null) { 
            this.lastKnownBoneCount = parseInt(this.boneTraderButtonHTML.innerText.substring("Trade ".length, this.boneTraderButtonHTML.innerText.indexOf(" Bones", 6))); 
        }
        if(this.lastKnownBoneCount == null || this.lastKnownBoneCount < 0) { return "Bone count was " + this.lastKnownBoneCount + "! Cannot proceed!"; }
        
        this.boneFarmAlwaysRunMap = runMap;
        this.boneFarmPresetOrder = [];
        this.boneFarmGoingToMap = false;
        if(mapPresets != null) {
          for(let i: number = 0; i < mapPresets.length; i++) {
            if(mapPresets[i] < 1 || mapPresets[i] > 3) { continue; }
            this.boneFarmPresetOrder.push(mapPresets[i]);
          }
        }
    
        this.boneFarmRoutine = setInterval(this.BoneFarmingLogic, 100);
        return "Now bone farming! Last bone drop zone: " + this.lastKnownBoneZone + ", current bone count: " + this.lastKnownBoneCount + ", last known bone drop time: " + this.lastKnownBoneTime;
    }

    public StopBoneFarming(): string {
        if(this.boneFarmRoutine < 0) { return "Not bone farming! Don't worry!"; }
    
        clearInterval(this.boneFarmRoutine);
        this.boneFarmRoutine = -1;
        return "Stopped bone farming!";
    }

    // All the bone farming logic. Checked once per 100 ticks
  private BoneFarmingLogic() {
    let secondsSinceLastBone: number = (getGameTime() - this.lastKnownBoneTime) / 1000;
    // BASE CASE: It has been more than 45 minutes since the last bone,
    // or else the last bone was found in a previous zone.
    // Go back to world.
    if(this.lastKnownBoneZone < game.global.world
      || secondsSinceLastBone > (45 * 60)) {
        this.boneFarmGoingToMap = false;

      // If in map and not switching to map chamber, do so
      if(game.global.mapsActive && !game.global.switchToMaps) {
        mapsClicked();
      }
      // If on map screen and not switching to world, do so
      if(game.global.preMapsActive && !game.global.switchToMaps) {
        mapsClicked();
      }
    }

    // Case where we're fighting in the world
    else if(!game.global.preMapsActive && !game.global.mapsActive && game.global.fighting) {
      // Subcase where we already know we have found a bone in this zone less than 45 minutes ago
      if(this.lastKnownBoneZone == game.global.world) {
        if(secondsSinceLastBone <= (45 * 60)) {
          // Only have to really worry about mapping on cell 100
          this.boneFarmGoingToMap = this.GoToMapAtZoneAndCell(game.global.world, 100);
        }
      } else { // Haven't found a bone yet.
        // Try to detect a bone??
        let currBoneCount = -1;
        if(this.boneTraderButtonHTML != null) { 
            currBoneCount = parseInt(this.boneTraderButtonHTML.innerText.substring("Trade ".length, this.boneTraderButtonHTML.innerText.indexOf(" Bones", 6))); 
        }
        if(currBoneCount > this.lastKnownBoneCount) {
          this.lastKnownBoneCount = currBoneCount;
          this.lastKnownBoneZone = game.global.world;
          this.lastKnownBoneTime = getGameTime();
        }
      }
    }
      
    // Case where we're returning to map in order to farm, and have arrived at the chamber.
    // TODO: Would be great if it detected appropriate maps that already existed, and just ran those.
    else if(this.boneFarmGoingToMap && game.global.preMapsActive && !game.global.mapsActive && !game.global.fighting) {
      this.boneFarmGoingToMap = false;
      if(this.boneFarmAlwaysRunMap) {
        for(let i: number = 0; i < this.boneFarmPresetOrder.length; i++) {
          if(game.global.selectedMapPreset != this.boneFarmPresetOrder[i]) {
            selectAdvMapsPreset(this.boneFarmPresetOrder[i]);
          }
          if(buyMap() >= 0) { break; }
        }
        selectMap(game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].id); // Select latest map
        runMap();
      }
    }
  }

  private GoToMapAtZoneAndCell(_zone: number, _cell: number): boolean {
    if(game.global.world == _zone && !game.global.preMapsActive && !game.global.mapsActive) {
      if(game.global.lastClearedCell + 2 == _cell) {
        mapsClicked();
        return true;
      }
    }
    return false;
  }
}