export class Mana {
    public MAX_MANA: number;
    public mana: number;
    constructor(mana: number = 3){
        this.mana = mana;
        this.MAX_MANA = mana;
    }
    public UseMana(){
        if(this.mana < 1) return;
        this.mana -= 1;
    }
    public ReplenishMana(){
        if(this.mana > this.MAX_MANA - 1) return;
        this.mana += 1;
    }
}