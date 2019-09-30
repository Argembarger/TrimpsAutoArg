class AutoArgBoneFarmer {
    private boneFarmRoutine: number;
    private lastKnownBoneZone: number;
    private lastKnownBoneCount: number;
    private lastKnownBoneTime: number;
    private boneTraderButtonHTML: HTMLElement | null;
    public boneFarmAlwaysRunMap: boolean;
    public boneFarmPresetOrder: number[];
    private boneFarmGoingToChamber: boolean;

    constructor() {
        this.boneFarmRoutine = -1;
        this.lastKnownBoneZone = -1;
        this.lastKnownBoneCount = -1;
        this.lastKnownBoneTime = -1;
        this.boneTraderButtonHTML = document.getElementById("boneBtnText");
        this.boneFarmAlwaysRunMap = false;
        this.boneFarmPresetOrder = [];
        this.boneFarmGoingToChamber = false;
    }

    public StartBoneFarming(runMap: boolean, mapPresets: number[]): string {
        // DO NOT ATTEMPT IF LESS THAN ZONE 5
        if(game.global.world < 6) { 
            return "Cannot (yet) bone farm less than World 6, since you cannot map yet!"; 
        }

        if(this.lastKnownBoneCount == -1) {
            this.lastKnownBoneCount = this.CurrentBoneCount();

            if(this.lastKnownBoneCount == null || this.lastKnownBoneCount < 0) { 
                return "Bone count was " + this.lastKnownBoneCount + "! Cannot proceed!"; 
            }
        }
        
        this.boneFarmAlwaysRunMap = runMap;
        this.boneFarmPresetOrder = [];
        this.boneFarmGoingToChamber = false;
        if(mapPresets != null) {
          for(let i: number = 0; i < mapPresets.length; i++) {
            if(mapPresets[i] < 1 || mapPresets[i] > 3) { continue; }
            this.boneFarmPresetOrder.push(mapPresets[i]);
          }
        }
        
        if(this.boneFarmRoutine < 0) {
            this.boneFarmRoutine = setInterval(this.BoneFarmingLogic.bind(this), 100);
        }
        return "Bone farming active! Last bone drop zone: " + this.lastKnownBoneZone + 
        ", current bone count: " + this.lastKnownBoneCount + ", last known bone drop time: " + this.lastKnownBoneTime +
        ", running maps: " + this.boneFarmAlwaysRunMap + ", presets: " + this.boneFarmPresetOrder;
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

    if(!game.global.preMapsActive && !game.global.mapsActive) {
        // IN WORLD
        let currBoneCount = this.CurrentBoneCount();
        if(currBoneCount > this.lastKnownBoneCount) {
            this.lastKnownBoneCount = currBoneCount;
            this.lastKnownBoneZone = game.global.world;
            this.lastKnownBoneTime = getGameTime();
            secondsSinceLastBone = 0;
        }
        if(secondsSinceLastBone <= (45 * 60)) {
            // MUST NOT MOVE ON
            this.boneFarmGoingToChamber = this.GoToMapAtZoneAndCell(game.global.world, 100);
        }
    } else if(!game.global.preMapsActive) {
        // IN MAPS
        if(secondsSinceLastBone > (45 * 60) && !game.global.switchToMaps) {
            // ALLOWED TO GO BACK
            this.boneFarmGoingToChamber = true;
            mapsClicked();
        }
    } else {
        // IN MAP CHAMBER
        if(this.boneFarmGoingToChamber) {
            if(secondsSinceLastBone > (45 * 60) && !game.global.switchToMaps) {
                // ALLOWED TO GO BACK
                mapsClicked();
            }
            else {
                // MAPPING
                if(this.boneFarmAlwaysRunMap) {
                    if(this.boneFarmPresetOrder.length > 0) {
                        // First recycle maps if over 50
                        if(game.global.mapsOwnedArray.length > 50) {
                            let mapHTML: any | null = document.getElementById("mapLevelInput");
                            if(mapHTML != null) {
                                mapHTML.value = (game.global.world - 3);
                                recycleBelow(true);
                            }
                        }
                        for(let i: number = 0; i < this.boneFarmPresetOrder.length; i++) {
                            if(game.global.selectedMapPreset != this.boneFarmPresetOrder[i]) {
                                selectAdvMapsPreset(this.boneFarmPresetOrder[i]);
                            }
                            if(buyMap() >= 0) {
                                break; 
                            }
                        }
                    }
                    if(game.global.mapsOwnedArray.length > 0) {
                        selectMap(game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].id); // Select latest map
                        runMap();
                    }
                }
            }
            this.boneFarmGoingToChamber = false;
        }
    }
  }

  private CurrentBoneCount(): number {
    if(this.boneTraderButtonHTML != null) { 
        return parseInt(this.boneTraderButtonHTML.innerText.substring("Trade ".length, this.boneTraderButtonHTML.innerText.indexOf(" Bones", 6))); 
    }
    return -1;
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