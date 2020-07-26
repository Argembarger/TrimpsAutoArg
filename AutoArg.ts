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
  public HelloText: string;


  constructor() {
    this.m_AutoBoner = new AutoBoner();
    this.m_StanceDancer = new AutoArgStanceDancer();
    this.HelloText = "AutoArg is now running. Type autoArg.HelpMe() for help.";
  }

  public HelpMe() {
    console.log("Until the glorious day when there is UI for this tool, you'll have to interact with it much as you just did, through the autoArg object.");
    console.log("Each basic state has a Start and Stop and Help command.");
    console.log("The states are BoneFarming, WeaponFarming, StanceDancing, and GatheringDarkEssence.");
    console.log("Hopefully, they should auto-fill the parameter names when you start typing them.");
    console.log("For further help, use autoArg.HelpBoneFarming(); autoArg.HelpWeaponFarming(); autoArg.HelpStanceDancing(); autoArg.HelpGatheringDarkEssence();");
    console.log("You can also call autoArg.Status() at any time.");
  }

  public Status = () => {
    console.log("Status: " + this.HelloText);
    console.log("Farming status: " + JSON.stringify(this.m_AutoBoner));
    console.log("Stance status: " + JSON.stringify(this.m_StanceDancer));
  }

  public StartBoneFarming = (runMaps: boolean | null = null, mapPresets: number[] | null = null, kob2: boolean | null = null, extraMins: number | null = null): string => {
    // All of these basic functions just return their output strings, which makes for handy state-logging when called directly in the console.
    return this.m_AutoBoner.StartBoneFarming(runMaps, mapPresets, kob2, extraMins);
  }
  public StopBoneFarming = (): string => {
    return this.m_AutoBoner.StopBoneFarming();
  }
  public HelpBoneFarming = (): string => {
    return "Usages: StartBoneFarming(runMaps, mapPresets, kob2, extraMins); StopBoneFarming();\n"
      + "You can leave everything out and just call autoArg.StartBoneFarming(); It will use default values. It's not polymorphic though so you'll have to declare any variables up to and including the one you want.\n"
      + "All values can also be passed in as null, which will use either a default or a pre-existing value.\n"
      + "Both bone farming and weapon farming share the map and map preset logic, you can always change it with another Start call.\n"
      + "runMaps can be true or false, if true will try to buy/enter maps, if false will just sit on map chamber until bones are ready. Defaults to true.\n"
      + "mapPresets is an array of integers 1 through 3, denoting the order you want your actual presets to be used. [] would only run maps, never try to buy. [1, 3] would try to run/buy your first, followed by your third preset. [1,2,3] is default.\n"
      + "kob2 can be true or false, default is false. Set to true if you have the mastery.\n"
      + "extraMins can be used if you want to farm above and beyond what is needed for your bones. Is just a number, defaults to 0. Can be negative (but why?)\n"
      + "Some examples: autoArg.StartBoneFarming(true, [2], true, 100); autoArg.StartBoneFarming(); autoArg.StartBoneFarming(true, [], false);";
  }

  public StartWeaponFarming = (runMaps: boolean | null = null, mapPresets: number[] | null): string => {
    return this.m_AutoBoner.StartWeaponFarming(runMaps, mapPresets);
  }
  public StopWeaponFarming = (): string => {
    return this.m_AutoBoner.StopWeaponFarming();
  }
  public HelpWeaponFarming = (): string => {
    return "Usages: StartWeaponFarming(runmaps, mapPresets); StopWeaponFarming();\n"
    + "This works very similarly to StartBoneFarming but has fewer parameters.\n"
    + "Both bone farming and weapon farming share the map and map preset logic, you can always change it with another Start call.\n"
    + "You can leave everything out and just call autoArg.StartWeaponFarming(); It will use default values. It's not polymorphic though so you'll have to declare any variables up to and including the one you want.\n"
    + "All values can also be passed in as null, which will use either a default or a pre-existing value.\n"
    + "runMaps can be true or false, if true will try to buy/enter maps, if false will just sit on map chamber until the weapons are bought. Pretty useless to disable because it would take forever, and defaults to true.\n"
    + "mapPresets is an array of integers 1 through 3, denoting the order you want your actual presets to be used. [] would only run maps, never try to buy. [1, 3] would try to run/buy your first, followed by your third preset. [1,2,3] is default.\n"
    + "Some examples: autoArg.StartWeaponFarming(true, [2,1,3]); autoArg.StartWeaponFarming(); autoArg.StartWeaponFarming(true, []);";

  }

  public StartStanceDancing = (healthThreshold: number = 0.5, formations: number[] = [2,0,1], resetForNewSquad: boolean = false): string => {
    return this.m_StanceDancer.StartStanceDancing(healthThreshold, formations, resetForNewSquad);
  }

  public StopStanceDancing = (): string => {
    return this.m_StanceDancer.StopStanceDancing();
  }
  public HelpStanceDancing = (): string => {
    return "Usages: StartStanceDancing(healthThreshold, formations, resetForNewSquad); StopStanceDancing();\n"
    + "Note that autoArg prioritizes Dark Essence gathing over Stance Dancing.\n"
    + "You can leave everything out and just call autoArg.StartStanceDancing(); It will use default values. It's not polymorphic though so you'll have to declare any variables up to and including the one you want.\n"
    + "All values can also be passed in as null, which will use either a default or a pre-existing value.\n"
    + "healthThreshold is a number between 0 and 1 telling it how hurt you want your trimps to be to move to the next stance. Default is 0.5.\n"
    + "formations is an array of numbers relating to your formations. 0 = X, 1 = H, 2 = D, 3 = B, 4 = S, 5 = N, etc. Default is [2,0,1], D, X, H.\n"
    + "resetForNewSquad can be true or false, and if true will switch to D when a new squad is ready.\n"
    + "Some examples: autoArg.StartStanceDancing(0.333, [3,0,1], true); autoArg.StartStanceDancing(); autoArg.StartStanceDancing(0.8, [2,3], true)";
  }

  public StartGatheringDarkEssence = (): string => {
    return this.m_StanceDancer.SetDarkEssenceGatherMode(true);
  }
  public StopGatheringDarkEssence = (): string => {
    return this.m_StanceDancer.SetDarkEssenceGatherMode(false);
  }
  public HelpGatheringDarkEssence = (): string => {
    return "Usages: StartGatheringDarkEssence(); StopGatheringDarkEssence();\n"
    + "Note that autoArg prioritizes Dark Essence Gathering over Stance Dancing.\n"
    + "Just call autoArg.StartGatheringDarkEssence(); to use, and autoArg.StopGatheringDarkEssence(); to stop.\n"
    + "Will make sure you are on S if you are on the world when dark essence is available. Tries its best, but may potentially miss cell-1 dess."
  }
}
var autoArg = new AutoArg();
console.log(autoArg.HelloText); 

