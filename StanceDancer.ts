class AutoArgStanceDancer {
    // Shared Stuff
    private stanceDanceRoutine: number;
    private badGuyHealthHTML: HTMLElement | null;
    private badGuyHealthMaxHTML: HTMLElement | null;

    // DE Farming Stuff
    private gatheringDarkEssence: boolean;
    private mapRepeatButtonHTML: Element | null;

    // Stance Dancing Stuff
    private currStanceDanceFormationIndex: number;

    private isDefaultStanceDancing: boolean;
    private stanceDanceDefaultHealthThreshold: number;
    private stanceDanceDefaultFormations: number[];
    private stanceDanceDefaultSquadFlush: boolean;

    private isMapStanceDancing: boolean;
    private stanceDanceMapHealthThreshold: number;
    private stanceDanceMapFormations: number[];
    private stanceDanceMapSquadFlush: boolean;

    constructor() {
        this.stanceDanceRoutine = -1;
        this.badGuyHealthHTML = document.getElementById("badGuyHealth");
        this.badGuyHealthMaxHTML = document.getElementById("badGuyHealthMax");

        this.gatheringDarkEssence = false;
        this.mapRepeatButtonHTML = document.getElementById("togglerepeatUntil");

        this.currStanceDanceFormationIndex = 0;

        this.isDefaultStanceDancing = false;
        this.stanceDanceDefaultHealthThreshold = 0.5;
        this.stanceDanceDefaultFormations = [];
        this.stanceDanceDefaultSquadFlush = false;

        this.isMapStanceDancing = false;
        this.stanceDanceMapHealthThreshold = 0.5;
        this.stanceDanceMapFormations = [];
        this.stanceDanceMapSquadFlush = false;
    }
    public StartStanceDancing = (healthThreshold: number = 0.5, formations: number[] = [2,0,1], resetForNewSquad: boolean = false, 
                                mapHealthThreshold: number = 0.5, mapFormations: number[] = [], mapResetForNewSquad: boolean = false): string => {
        this.currStanceDanceFormationIndex = 0;

        // Protect from bad input
        let detectedInvalidFormation: boolean = false;
        const wasAlreadyStanceDancing: boolean = this.stanceDanceRoutine >= 0 && (this.isDefaultStanceDancing || this.isMapStanceDancing);
        const unlockedD = this.HasFormation(2);
        
        let validDefaultFormations: number[] = [];
        for(let i: number = 0; i < formations.length; i++) {
          if(!this.HasFormation(formations[i])) { detectedInvalidFormation = true; continue; }
          validDefaultFormations.push(formations[i]);
        }
        this.isDefaultStanceDancing = validDefaultFormations.length > 0;
        this.stanceDanceDefaultHealthThreshold = Math.max(0, Math.min(1, healthThreshold));
        this.stanceDanceDefaultFormations = validDefaultFormations;
        this.stanceDanceDefaultSquadFlush = resetForNewSquad && unlockedD;

        let validMapFormations: number[] = [];
        for(let i: number = 0; i < mapFormations.length; i++) {
            if(!this.HasFormation(mapFormations[i])) { detectedInvalidFormation = true; continue; }
            validMapFormations.push(mapFormations[i]);
        }
        this.isMapStanceDancing = validMapFormations.length > 0;
        this.stanceDanceMapHealthThreshold = mapHealthThreshold;
        this.stanceDanceMapFormations = validMapFormations;
        this.stanceDanceMapSquadFlush = mapResetForNewSquad && unlockedD;

        // Kick off loop if needed
        const outputReport: string = (this.stanceDanceRoutine < 0 ? "Now stance dancing " : ("Was already " + (wasAlreadyStanceDancing ? ("stance dancing" + (this.gatheringDarkEssence ? " AND gathering Dark Essence, but now " : ", but now ")) : "gathering Dark Essence, but now ")))
        + "with default health threshold = " + this.stanceDanceDefaultHealthThreshold 
        + ", formations = " + this.stanceDanceDefaultFormations.toString() 
        + ", squadflush = " + this.stanceDanceDefaultSquadFlush
        + "; " + (!this.isMapStanceDancing ? "doing the exact same on maps." : ("for maps the health threshold = " + this.stanceDanceMapHealthThreshold + ", formations = " + this.stanceDanceMapFormations.toString() + ", squadFlush = " + this.stanceDanceMapSquadFlush));

        if(this.stanceDanceRoutine < 0) {
            this.stanceDanceRoutine = setInterval(this.FormationManagingLogic.bind(this), 100);
        }
        return outputReport 
            + (detectedInvalidFormation ? "... Detected attempted use of unavailable or invalid formations..." : "!")
            + (!unlockedD ? " Also, you need to have unlocked D to use squad flushing." : "");
      }
    
        public StopStanceDancing = (): string => {
            this.isDefaultStanceDancing = false;
            this.isMapStanceDancing = false;
            if(this.gatheringDarkEssence) {
                return "Not stance-dancing, but still gathering dark essence!";
            } else {
                // Break out if not doing anything
                clearInterval(this.stanceDanceRoutine);
                this.stanceDanceRoutine = -1;
                return "No longer stance-dancing, and wasn't gathering essence either, so stopped the whole process!";
            }
        }
    
        public SetDarkEssenceGatherMode = (shouldGather: boolean): string => {
            if(!this.HasFormation(4)) { return "Can't gather dark essence if you don't have S!"; }
            this.gatheringDarkEssence = shouldGather;
            if(shouldGather) {
                if(this.stanceDanceRoutine < 0) {
                    this.stanceDanceRoutine = setInterval(this.FormationManagingLogic.bind(this), 100);
                    return "Now actively gathering Dark Essence!";
                }
                return "Was already stance-dancing, now also gathering Dark Essence!";
            }
            else {
                if(this.isDefaultStanceDancing || this.isMapStanceDancing) {
                    return "Not gathering essence, but still stance-dancing!";
                }
                else {
                    // Break out if not doing anything
                    clearInterval(this.stanceDanceRoutine);
                    this.stanceDanceRoutine = -1;
                    return "No longer stance-dancing, and wasn't gathering essence either, so stopped the whole process!";
                }
            }
        }
    
    public FormationManagingLogic = () => {
        const gameGlobal = game.global;

        // Essence-gathering overrides normal stance-dancing.
        // Only applies if we aren't in maps, and are world 180 or above. (180 won't have drops but we want to prepare for 181.)
        const currStatus: string | undefined = (this.mapRepeatButtonHTML ? this.mapRepeatButtonHTML.innerHTML ? this.mapRepeatButtonHTML.innerHTML.toLowerCase() : undefined : undefined)
        if(this.gatheringDarkEssence && gameGlobal.world > 179
            && (!gameGlobal.mapsActive 
                || (gameGlobal.mapsActive && (gameGlobal.switchToMaps || (currStatus != undefined && currStatus !== "repeat forever")))) ) {
            // If there are available drops,
            // or if we're fighting an almost-dead boss, so that we can have S enabled the entire time.
            if(countRemainingEssenceDrops() > 0
            || (game.global.lastClearedCell == 98 && this.BadGuyCurrentHealthRatio() <= 0.05)) {
                // Essence-gathering overrides standard stance-dancing
                setFormation('4');
                return; 
            }
        }
    
        if(this.isDefaultStanceDancing || this.isMapStanceDancing) {
            if(this.isMapStanceDancing && gameGlobal.mapsActive) {
                // Map-Specific Case (only runs on maps)
                this.RunStanceDanceLogic(gameGlobal, this.stanceDanceMapHealthThreshold, this.stanceDanceMapFormations, this.stanceDanceMapSquadFlush);
            } else if(this.isDefaultStanceDancing && !gameGlobal.preMapsActive) {
                // World/Default Case (does not run in map chamber)
                this.RunStanceDanceLogic(gameGlobal, this.stanceDanceDefaultHealthThreshold, this.stanceDanceDefaultFormations, this.stanceDanceDefaultSquadFlush);
            } else if(gameGlobal.preMapsActive) {
                // Reset index when switching between map and world, but do not mess with formations.
                this.currStanceDanceFormationIndex = 0;
            }
        }
    }

    // Only run this once per frame. A way to avoid duplicate code between maps and default stancedance logic.
    // THIS MODIFIES this.currStanceDanceFormationIndex.
    private RunStanceDanceLogic = (gameGlobal: any, healthThreshold: number, formations: number[], flush: boolean): void => {
        // Squad Ready reset-case
        if(flush) {
            if(game.resources.trimps.realMax() === game.resources.trimps.owned) {
                this.currStanceDanceFormationIndex = 0;
                setFormation("2");
                return;
            }
        }
        // Full Health reset-case
        if(gameGlobal.soldierHealth == gameGlobal.soldierHealthMax) {
            this.currStanceDanceFormationIndex = 0;
            setFormation(formations[this.currStanceDanceFormationIndex].toString());
        }
        // Cycle through remaining formations as health threshold is reached. This stops bothering to check health if we're out of bounds.
        else if(this.currStanceDanceFormationIndex < formations.length - 1
            && gameGlobal.soldierHealth <= gameGlobal.soldierHealthMax * healthThreshold) {
            this.currStanceDanceFormationIndex++;
            setFormation(formations[this.currStanceDanceFormationIndex].toString());
        }
    }

    // Use this while setting up, not during the interval-function... It's expensive
    public HasFormation(formation: string | number) {
        const formHTML: HTMLElement | null = document.getElementById("formation" + formation);
        const formDisp: string | null | undefined = (formHTML != null ? formHTML.style.display : null);
        return (formDisp != null && formDisp != undefined && formDisp !== ""); // formDisp would be "block" if it's available.
    }

    private BadGuyCurrentHealthRatio = (): number => {
        if(this.badGuyHealthHTML == null || this.badGuyHealthMaxHTML == null) {return 1.0;}
        return (Number(this.badGuyHealthHTML.innerHTML) / Number(this.badGuyHealthMaxHTML.innerHTML));
    }
}