// Fake hook into Trimps so TS doesn't whine :eyes:
// TODO: More accurate representations of Trimps game elements would be sweet
declare const game: any;

declare function mapsClicked(): void;
declare function setFormation(what: string): void;
declare function countRemainingEssenceDrops(): number;
declare function getGameTime(): number;
declare function selectAdvMapsPreset(num: number): void;
declare function buyMap(): number; // Returns 1 if map was created. Negative values are different errors.
declare function selectMap(mapId: string, force?: boolean): void;
declare function runMap(): void;

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



// AutoArg -- manually injected action triggering
// After loading Trimps, paste the following code into your console:
// (SetInterval is at the bottom and controls what actually happens)
class AutoArg {
  // Bone Farming Stuff
  private boneFarmRoutine: number;
  private lastKnownBoneZone: number;
  private lastKnownBoneCount: number;
  private lastKnownBoneTime: number;
  private boneTraderButtonHTML: HTMLElement;
  private boneFarmAlwaysRunMap: boolean;
  private boneFarmPresetOrder: number[];
  private boneFarmGoingToMap: boolean;

  // DE Farming Stuff
  private darkEssenceGatherRoutine: number;
  private gatheringDarkEssence: boolean;
  private essenceSensed: boolean;

  // Stance Dancing Stuff
  private stanceDanceRoutine: number;
  private stanceDanceHealthThreshold: number;
  private stanceDanceFormations: number[];
  private currStanceDanceFormationIndex: number;

  constructor() {
    this.boneFarmRoutine = -1;
    this.lastKnownBoneZone = -1;
    this.lastKnownBoneCount = -1;
    this.lastKnownBoneTime = -1;
    this.boneTraderButtonHTML = document.getElementById("boneBtnText");
    this.boneFarmGoingToMap = false;
    this.gatheringDarkEssence = false;
    this.essenceSensed = false;
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

    this.lastKnownBoneCount = this.CurrentBoneCount();
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

  public StartStanceDancing(healthThreshold: number, ...formations: number[]): string {
    if(formations == null || formations == []) { this.StopStanceDancing(); return; }

    let newFormations: number[] = [];
    for(let i: number = 0; i < formations.length; i++) {
      if(formations[i] < 0 || formations[i] > 4) { continue; }
      newFormations.push(formations[i]);
    }

    if(healthThreshold < 0.01) { healthThreshold = 0.01; }
    else if(healthThreshold > 0.99) { healthThreshold = 0.99; }

    this.stanceDanceHealthThreshold = healthThreshold;
    this.stanceDanceFormations = newFormations;
    this.currStanceDanceFormationIndex = 0;

    if(this.stanceDanceRoutine >= 0) {
      return "Already stance-dancing! Updated health threshold to " + this.stanceDanceHealthThreshold + " and formations to " + this.stanceDanceFormations.toString();
    }
    else {
      this.stanceDanceRoutine = setInterval(this.StanceDanceLogic, 100);
      return "Now stance dancing with health threshold set to " + this.stanceDanceHealthThreshold + " and formations to " + this.stanceDanceFormations.toString();
    }
  }

  public StopStanceDancing(): string {
    if(this.stanceDanceRoutine < 0) {
      return "Not stance dancing!";
    }
    else {
      clearInterval(this.stanceDanceRoutine);
      this.stanceDanceRoutine = -1;
    }
  }

  public SetDarkEssenceGatherMode(shouldGather: boolean): string {
    this.gatheringDarkEssence = shouldGather;
    this.essenceSensed = shouldGather;
    if(shouldGather) {
      if(this.darkEssenceGatherRoutine >= 0) { return "Already gathering Dark Essence!"; }
      else {
        this.darkEssenceGatherRoutine = setInterval(this.DarkEssenceGatheringLogic, 100);
        return "Gathering any Dark Essence! (Overrides any stance-dancing while in World cells)";
      }
    }
    else {
      if(this.darkEssenceGatherRoutine < 0) { return "Not gathering Dark Essence! No worries!"; }
      else {
        clearInterval(this.darkEssenceGatherRoutine);
        this.darkEssenceGatherRoutine = -1;
        return "No longer (deliberately) gathering Dark Essence!";
      }
    }
  }


  private DarkEssenceGatheringLogic() {
    // Uses S if there is essence on the map
    if(!game.global.mapsActive && countRemainingEssenceDrops() > 0) {
      setFormation('4'); // S
      this.essenceSensed = true;
    }
    else {
      this.essenceSensed = false;
    }
  }

  public StanceDanceLogic() {
    if(this.essenceSensed) { return; }

    // Full Health case
    if(game.global.soldierHealth == game.global.soldierHealthMax) {
      this.currStanceDanceFormationIndex = 0;
      setFormation(this.stanceDanceFormations[this.currStanceDanceFormationIndex].toString());
    }
    // Cycle through remaining formations as health threshold is reached
    else if(this.currStanceDanceFormationIndex < this.stanceDanceFormations.length - 1
      && game.global.soldierHealth <= game.global.soldierHealthMax * this.stanceDanceHealthThreshold) {
      this.currStanceDanceFormationIndex++;
      setFormation(this.stanceDanceFormations[this.currStanceDanceFormationIndex].toString());
    }
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
        let currBoneCount = this.CurrentBoneCount();
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

  private CurrentBoneCount(): number {
    return parseInt(this.boneTraderButtonHTML.innerText.substring("Trade ".length, this.boneTraderButtonHTML.innerText.indexOf(" Bones", 6)));
  }

  private GoToMapAtZoneAndCell(_zone, _cell): boolean {
    if(game.global.world == _zone && !game.global.preMapsActive && !game.global.mapsActive) {
      if(game.global.lastClearedCell + 2 == _cell) {
        mapsClicked();
        return true;
      }
    }
    return false;
  }
}
var autoArg = new AutoArg(); 

