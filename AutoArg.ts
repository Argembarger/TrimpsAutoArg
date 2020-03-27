///<reference path="AutoBoner.ts" />
///<reference path="StanceDancer.ts" />

// Fake hook into Trimps so TS doesn't whine :eyes:
// TODO: More accurate representations of Trimps game elements would be sweet
declare const game: any;
/*declare const game: { 
  global: { 
    lastSkeletimp: number; 
    zoneStarted: number; 
    preMapsActive: boolean; 
    mapsActive: boolean; 
    world: number; 
    switchToMaps: boolean; 
    mapsOwnedArray: { 
      id: string; 
    }[]; 
    selectedMapPreset: number; 
    lastClearedCell: number; 
    mapPresets: { ...; }; 
    soldierHealth: number; 
    soldierHealthMax: number; }; }*/

declare function mapsClicked(): void;
declare function setFormation(what: string): void;
declare function countRemainingEssenceDrops(): number;
declare function getGameTime(): number;
declare function selectAdvMapsPreset(num: number): void;
declare function buyMap(): number; // Returns 1 if map was created. Negative values are different errors.
declare function selectMap(mapId: string, force?: boolean): void;
declare function runMap(): void;
declare function recycleBelow(confirm: boolean): void;
declare function toggleSetting(settingName: string): void;


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
  private m_AutoBoner: AutoBoner;
  private m_StanceDancer: AutoArgStanceDancer;


  constructor() {
    this.m_AutoBoner = new AutoBoner();
    this.m_StanceDancer = new AutoArgStanceDancer();
  }

  public StartBoneFarming(runMap: boolean, mapPresets: number[], kob2: boolean = false, extraMins: number = 0.0): string {
    return this.m_AutoBoner.StartBoneFarming(runMap, mapPresets, kob2, extraMins);
  }

  public StopBoneFarming(): string {
    return this.m_AutoBoner.StopBoneFarming();
  }

  public StartStanceDancing(healthThreshold: number, formations: number[], resetForNewSquad: boolean = false): string {
    return this.m_StanceDancer.StartStanceDancing(healthThreshold, formations, resetForNewSquad);
  }

  public StopStanceDancing(): string {
    return this.m_StanceDancer.StopStanceDancing();
  }

  public SetDarkEssenceGatherMode(shouldGather: boolean): string {
    return this.m_StanceDancer.SetDarkEssenceGatherMode(shouldGather);
  }
}
var autoArg = new AutoArg(); 

