class AutoArgStanceDancer {
    // Shared Stuff
    private stanceDanceRoutine: number;

    // DE Farming Stuff
    private gatheringDarkEssence: boolean;

    // Stance Dancing Stuff
    private isStanceDancing: boolean;
    private stanceDanceHealthThreshold: number;
    private stanceDanceFormations: number[];
    private currStanceDanceFormationIndex: number;

    constructor() {
        this.stanceDanceRoutine = -1;

        this.gatheringDarkEssence = false;
        
        this.isStanceDancing = false;
        this.stanceDanceHealthThreshold = 0.5;
        this.stanceDanceFormations = [];
        this.currStanceDanceFormationIndex = 0;
    }
    public StartStanceDancing(healthThreshold: number, formations: number[]): string {
        // Interpret being called without formations provided as a "stop"
        if(formations == null || formations == []) { return this.StopStanceDancing(); }
    
        // Protect from bad input
        let newFormations: number[] = [];
        for(let i: number = 0; i < formations.length; i++) {
          if(formations[i] < 0 || formations[i] > 4) { continue; }
          newFormations.push(formations[i]);
        }
        if(healthThreshold < 0.01) { healthThreshold = 0.01; }
        else if(healthThreshold > 0.99) { healthThreshold = 0.99; }
    
        // Update values
        this.stanceDanceHealthThreshold = healthThreshold;
        this.stanceDanceFormations = newFormations;
        this.currStanceDanceFormationIndex = 0;
        this.isStanceDancing = true;

        // Kick off loop if needed
        if(this.stanceDanceRoutine < 0) {
            this.stanceDanceRoutine = setInterval(this.StanceDanceLogic.bind(this), 100);
        }
        return "Now stance dancing with health threshold set to " + this.stanceDanceHealthThreshold + " and formations to " + this.stanceDanceFormations.toString();
      }
    
      public StopStanceDancing(): string {
        this.isStanceDancing = false;
        if(this.gatheringDarkEssence) {
            return "Not stance-dancing, but still gathering dark essence!";
        }
        return "Not stance-dancing!";
      }
    
      public SetDarkEssenceGatherMode(shouldGather: boolean): string {
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
    
      public StanceDanceLogic() {
        if(!this.gatheringDarkEssence && !this.isStanceDancing) {
            // Break out if not doing anything
            clearInterval(this.stanceDanceRoutine);
            this.stanceDanceRoutine = -1;
            return;
        }

        if(this.gatheringDarkEssence) {
            if(!game.global.mapsActive && countRemainingEssenceDrops() > 0) {
                // Essence-gathering overrides standard stance-dancing
                setFormation('4');
                return; 
            }
        }
    
        if(this.isStanceDancing) {
            // Full Health reset-case
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
    }
}