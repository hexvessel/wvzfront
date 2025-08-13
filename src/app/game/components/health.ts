export class Health {
    public MAX_HP: number;
    public hitpoints: number
    constructor(hp: number){
        this.hitpoints = hp;
        this.MAX_HP = hp;
    }
    public damage(damageAmount: number){
        this.hitpoints -= damageAmount;
    }
    public heal(healAmount: number){
        this.hitpoints -= healAmount;
    }
}