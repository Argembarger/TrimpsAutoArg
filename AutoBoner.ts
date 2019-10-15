class AutoBoner {
    private boneFarmRoutine: number;
    private lastKnownBoneZone: number;
    private lastKnownBoneCount: number;
    private boneFarmingMinutes: number;
    private boneTraderButtonHTML: HTMLElement | null;
    public boneFarmAlwaysRunMap: boolean;
    public boneFarmPresetOrder: number[];
    private boneFarmGoingToChamber: boolean;
    private boneFarmingExtraMinutes: number;

    constructor() {
        this.boneFarmRoutine = -1;
        this.lastKnownBoneZone = -1;
        this.lastKnownBoneCount = -1;
        this.boneFarmingMinutes = 45;
        this.boneFarmingExtraMinutes = 0;
        this.boneTraderButtonHTML = document.getElementById("boneBtnText");
        this.boneFarmAlwaysRunMap = false;
        this.boneFarmPresetOrder = [];
        this.boneFarmGoingToChamber = false;
    }

    public StartBoneFarming(runMap: boolean, mapPresets: number[], kob2: boolean = false, extraMins: number = 0.0): string {
        if(this.lastKnownBoneCount == -1) {
            this.lastKnownBoneCount = this.CurrentBoneCount();

            if(this.lastKnownBoneCount == null || this.lastKnownBoneCount < 0) { 
                return "Bone count was " + this.lastKnownBoneCount + "! Cannot proceed!"; 
            }
        }
        
        this.boneFarmAlwaysRunMap = runMap;
        this.boneFarmPresetOrder = [];
        this.boneFarmGoingToChamber = false;
        this.boneFarmingMinutes = (kob2 ? 35 : 45) + extraMins;
        this.boneFarmingExtraMinutes = extraMins;

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
        ", current bone count: " + this.lastKnownBoneCount + ", last known bone drop time: " + game.global.lastSkeletimp +
        ", running maps: " + this.boneFarmAlwaysRunMap + ", presets: " + this.boneFarmPresetOrder +
        ", farming minutes: " + this.boneFarmingMinutes + ", extra minutes: " + this.boneFarmingExtraMinutes;
    }

    public StopBoneFarming(): string {
        if(this.boneFarmRoutine < 0) { return "Not bone farming! Don't worry!"; }
    
        clearInterval(this.boneFarmRoutine);
        this.boneFarmRoutine = -1;
        return "Stopped bone farming!";
    }

    // All the bone farming logic. Checked once per 100 ticks
  private BoneFarmingLogic() {
    let secondsInZone: number = (getGameTime() - game.global.zoneStarted) / 1000;
    let secondsSinceLastBone: number = (getGameTime() - game.global.lastSkeletimp) / 1000;

    if(!game.global.preMapsActive && !game.global.mapsActive) {
        // IN WORLD
        let currBoneCount = this.CurrentBoneCount();
        if(currBoneCount > this.lastKnownBoneCount) {
            this.lastKnownBoneCount = currBoneCount;
            this.lastKnownBoneZone = game.global.world;
        }
        if(game.global.world > 5
            && (secondsSinceLastBone <= (this.boneFarmingMinutes * 60) || secondsInZone <= (this.boneFarmingExtraMinutes * 60))) {
            // MUST NOT MOVE ON
            this.boneFarmGoingToChamber = this.GoToMapAtZoneAndCell(game.global.world, 100);
        }
    } else if(!game.global.preMapsActive) {
        // IN MAPS. Inverse of conditions used to leave world
        if(!game.global.switchToMaps 
            && (secondsSinceLastBone > (this.boneFarmingMinutes * 60) && secondsInZone > (this.boneFarmingExtraMinutes * 60))) {
            // ALLOWED TO GO BACK
            mapsClicked();
        }
    } else {
        // IN MAP CHAMBER. Inverse of conditions used to leave world
        if(!game.global.switchToMaps 
            && (secondsSinceLastBone > (this.boneFarmingMinutes * 60) && secondsInZone > (this.boneFarmingExtraMinutes * 60))) {
            // ALLOWED TO GO BACK
            mapsClicked();
        }
        else if(this.boneFarmGoingToChamber) {
            // MAPPING. "boneFarmGoingToChamber" prevents accidental spamming of maps.
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
                        if(this.RunMapMatchingPreset(this.boneFarmPresetOrder[i])) {
                            this.boneFarmGoingToChamber = false;
                            return;
                        }
                        if(game.global.selectedMapPreset != this.boneFarmPresetOrder[i]) {
                            selectAdvMapsPreset(this.boneFarmPresetOrder[i]);
                        }
                        if(buyMap() >= 0) {
                            break; 
                        }
                    }
                }
                // Backup -- run last map in list (if the list has any at all...)
                if(game.global.mapsOwnedArray.length > 0) {
                    selectMap(game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].id); // Select latest map
                    runMap();
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

  // Selects and runs a map (and returns true) if one is found matching the preset number.
  // Preset numbers are 1, 2, 3
  // Returns false if no map matching preset is found.
  public RunMapMatchingPreset(preset: number): boolean {
    if(preset < 1 || preset > 3) return false;

    let autoArgPresetInfo: any;
    if(preset == 1) { autoArgPresetInfo = game.global.mapPresets.p1; }
    else if(preset == 2) { autoArgPresetInfo = game.global.mapPresets.p2; }
    else { autoArgPresetInfo = game.global.mapPresets.p3; }

    let autoArgPresetZone: number = game.global.world + autoArgPresetInfo.offset;
    let autoArgPresetSpecMod: string = autoArgPresetInfo.specMod;
    // No check for perfect maps (yet)
    // Certainly no check for general map slider values
    
    //console.log("preset zone: " + autoArgPresetZone + ", spec mod: " + autoArgPresetSpecMod);
    // Searching from end of list for arguably faster matching
    for(let i: number = game.global.mapsOwnedArray.length - 1; i >= 0; i--) {
        if(game.global.mapsOwnedArray[i].level == autoArgPresetZone
        && game.global.mapsOwnedArray[i].bonus == autoArgPresetSpecMod) {
            selectMap(game.global.mapsOwnedArray[i].id); // Select latest map
            runMap();
            return true;
        }
        //console.log("checked map " + i + " with level " + game.global.mapsOwnedArray[i].level + " and specmod " + game.global.mapsOwnedArray[i].bonus);
    }

    return false;
  }
}