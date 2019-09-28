class AutoArgStanceDancer {
    // Shared Stuff
    private stanceDanceRoutine: number;

    // DE Farming Stuff
    private gatheringDarkEssence: boolean;
    private essenceSensed: boolean;

    // Stance Dancing Stuff
    private isStanceDancing: boolean;
    private stanceDanceHealthThreshold: number;
    private stanceDanceFormations: number[];
    private currStanceDanceFormationIndex: number;

    constructor() {
        this.stanceDanceRoutine = -1;

        this.gatheringDarkEssence = false;
        this.essenceSensed = false;
        
        this.isStanceDancing = false;
        this.stanceDanceHealthThreshold = 0.5;
        this.stanceDanceFormations = [];
        this.currStanceDanceFormationIndex = 0;
    }
    public StartStanceDancing(healthThreshold: number, ...formations: number[]): string {
        if(formations == null || formations == []) { return this.StopStanceDancing(); }
    
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
        
        this.isStanceDancing = true;
        if(this.stanceDanceRoutine >= 0) {
          return "Already stance-dancing! Updated health threshold to " + this.stanceDanceHealthThreshold + " and formations to " + this.stanceDanceFormations.toString();
        }
        else {
          this.stanceDanceRoutine = setInterval(this.StanceDanceLogic, 100);
          return "Now stance dancing with health threshold set to " + this.stanceDanceHealthThreshold + " and formations to " + this.stanceDanceFormations.toString();
        }
      }
    
      public StopStanceDancing(): string {
        if(this.stanceDanceRoutine < 0 || !this.isStanceDancing) {
          return "Wasn't stance-dancing!";
        }
        else {
            this.isStanceDancing = false;
            if(!this.gatheringDarkEssence) {
                clearInterval(this.stanceDanceRoutine);
                this.stanceDanceRoutine = -1;
                return "Stopped stance-dancing.";
            }
            return "Stopped stance-dancing, but still gathering essence";
        }
      }
    
      public SetDarkEssenceGatherMode(shouldGather: boolean): string {
        if(this.gatheringDarkEssence && shouldGather) {
            return "Already gathering Dark Essence!";
        } else if(!this.gatheringDarkEssence && !shouldGather) {
            return "Wasn't gathering Dark Essence!"
        }
        this.gatheringDarkEssence = shouldGather;
        this.essenceSensed = shouldGather;
        if(shouldGather) {
          if(this.stanceDanceRoutine >= 0) { return "Now gathering Dark Essence in addition to stance-dancing!"; }
          else {
            this.stanceDanceRoutine = setInterval(this.StanceDanceLogic, 100);
            return "Gathering any available Dark Essence!";
          }
        }
        else {
          if(this.stanceDanceRoutine < 0) { return "Not gathering Dark Essence! No worries!"; }
          else if(!this.isStanceDancing) {
            clearInterval(this.stanceDanceRoutine);
            this.stanceDanceRoutine = -1;
            return "No longer (deliberately) gathering Dark Essence!";
          }
          return "No longer gathering essence, but still stance-dancing!";
        }
      }
    
      public StanceDanceLogic() {
          if(this.gatheringDarkEssence) {
              this.essenceSensed = !game.global.mapsActive && countRemainingEssenceDrops() > 0;
              if(this.essenceSensed) { 
                setFormation('4');
                return; 
            }
          }
    
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
}