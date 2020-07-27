class AutoArgStanceDancer {
    // Shared Stuff
    private stanceDanceRoutine: number;
    private badGuyHealthHTML: HTMLElement | null;
    private badGuyHealthMaxHTML: HTMLElement | null;

    // DE Farming Stuff
    private gatheringDarkEssence: boolean;
    private mapRepeatButtonHTML: Element | null;

    // Stance Dancing Stuff
    private isStanceDancing: boolean;
    private stanceDanceHealthThreshold: number;
    private stanceDanceFormations: number[];
    private currStanceDanceFormationIndex: number;
    private resetStanceIfNewSquadIsReady: boolean;

    constructor() {
        this.stanceDanceRoutine = -1;
        this.badGuyHealthHTML = document.getElementById("badGuyHealth");
        this.badGuyHealthMaxHTML = document.getElementById("badGuyHealthMax");

        this.gatheringDarkEssence = false;
        this.mapRepeatButtonHTML = document.getElementsByClassName("btn settingBtn0 fightBtn")[1];

        this.isStanceDancing = false;
        this.stanceDanceHealthThreshold = 0.5;
        this.stanceDanceFormations = [];
        this.currStanceDanceFormationIndex = 0;
        this.resetStanceIfNewSquadIsReady = false;
    }
    public StartStanceDancing = (healthThreshold: number, formations: number[], resetForNewSquad: boolean = false): string => {
        // Protect from bad input
        let newFormations: number[] = [];
        for(let i: number = 0; i < formations.length; i++) {
          if(!this.HasFormation(formations[i])) { continue; }
          newFormations.push(formations[i]);
        }
        if(healthThreshold < 0) { healthThreshold = 0; }
        else if(healthThreshold > 1) { healthThreshold = 1; }
    
        // Update values
        this.stanceDanceHealthThreshold = healthThreshold;
        this.stanceDanceFormations = newFormations;
        this.currStanceDanceFormationIndex = 0;
        this.isStanceDancing = true;

        // Can only 'reset' squads if D is available.
        this.resetStanceIfNewSquadIsReady = resetForNewSquad && this.HasFormation(2);

        // Kick off loop if needed
        if(this.stanceDanceRoutine < 0) {
            this.stanceDanceRoutine = setInterval(this.StanceDanceLogic.bind(this), 100);
        }
        return "Now stance dancing with health threshold set to " + this.stanceDanceHealthThreshold + " and formations to " + this.stanceDanceFormations.toString() + " and " + (this.resetStanceIfNewSquadIsReady ? "KILLING" : "not killing") + " squads when new squad is ready. If you don't have some formations unlocked, you may want to re-call this later when you do!!";
      }
    
        public StopStanceDancing = (): string => {
            this.isStanceDancing = false;
            if(this.gatheringDarkEssence) {
                return "Not stance-dancing, but still gathering dark essence!";
            }
            return "Not stance-dancing!";
        }
    
        public SetDarkEssenceGatherMode = (shouldGather: boolean): string => {
            if(!this.HasFormation(4)) { return "Can't gather dark essence if you don't have S!"; }
            this.gatheringDarkEssence = shouldGather;
            if(shouldGather) {
                if(this.stanceDanceRoutine < 0) {
                    this.stanceDanceRoutine = setInterval(this.StanceDanceLogic.bind(this), 100);
                }
                return "Gathering any available Dark Essence!";
            }
            else {
                if(this.isStanceDancing) {
                    return "Not gathering essence, but still stance-dancing!";
                }
                return "Not gathering essence";
            }
        }
    
    public StanceDanceLogic = () => {
        if(!this.gatheringDarkEssence && !this.isStanceDancing) {
            // Break out if not doing anything
            clearInterval(this.stanceDanceRoutine);
            this.stanceDanceRoutine = -1;
            return;
        }
        const gameGlobal = game.global;

        // Essence-gathering overrides normal stance-dancing.
        // Only applies if we aren't in maps, and are world 180 or above. (180 won't have drops but we want to prepare for 181.)
        const currStatus: string | undefined = (this.mapRepeatButtonHTML ? this.mapRepeatButtonHTML.textContent ? this.mapRepeatButtonHTML.textContent.toLowerCase() : undefined : undefined)
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
    
        if(this.isStanceDancing) {
            // Squad Ready reset-case
            if(this.resetStanceIfNewSquadIsReady) {
                if(game.resources.trimps.realMax() === game.resources.trimps.owned) {
                    this.currStanceDanceFormationIndex = 0;
                    setFormation("2");
                    return;
                }
            }
            // Full Health reset-case
            if(gameGlobal.soldierHealth == gameGlobal.soldierHealthMax) {
                this.currStanceDanceFormationIndex = 0;
                setFormation(this.stanceDanceFormations[this.currStanceDanceFormationIndex].toString());
            }
            // Cycle through remaining formations as health threshold is reached
            else if(this.currStanceDanceFormationIndex < this.stanceDanceFormations.length - 1
                && gameGlobal.soldierHealth <= gameGlobal.soldierHealthMax * this.stanceDanceHealthThreshold) {
                this.currStanceDanceFormationIndex++;
                setFormation(this.stanceDanceFormations[this.currStanceDanceFormationIndex].toString());
            }
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