import { Fruit, Machine, Player, Prize, Screen, State } from "./model";


function getRandomInt(max: number) : number {
    return Math.floor(Math.random() * (max+1));
  }

export function generateSlots(): Screen {
    const fruitOptions: Fruit[] = ["black", "green", "white", "yellow"]

    /* 
    * _ denotes that we don't care about the element as we are replacing it
    * alone Array(x) is an abstract construct, we need to fill it for the array to be properly defined and iterable.
        we can fill with any dummy value (as it's being replaced), we chose undefined.
    */
    return Array(4).fill(undefined).map( _ => fruitOptions[getRandomInt(3)] )
}

function hasTwoAdjacentFruits(screen: Screen): boolean{
    //less code to literally check 0=1, 1=2, 2=3 than my fancy sliding window function + check functions (only worth using if was in a library)
    //removed unnecessary if as thing returning matched function returnee
    return screen[0]===screen[1] || screen[1]===screen[2] || screen[2]===screen[3]
}

function determinePrize(screen: Screen): Prize {
    if (new Set(screen).size === 1){
        return "jackpot"
    }
    if (new Set(screen).size === 4){
        return "halfJackpot"
    }
    if(hasTwoAdjacentFruits(screen)){
        return "fiveTimesPlayCost"
    }
    return "nothing"
}

function generateWinnings(prize: Prize, fundAmount: number, playCost: number): number {
    switch(prize) {
        case "jackpot":
            return fundAmount + playCost
        case "halfJackpot":
            return Math.ceil((fundAmount+playCost)/2) //only need to deal with half pounds in this case
        case "fiveTimesPlayCost":
            return 5 * playCost
        case "nothing": //best to have an explicit case rather than a default case
            return 0
      }
}

        
export function evaluateMachinePlay(state: State, slots: Screen): State {
    //we dont want to change the incoming state as that makes the function impure
    
    if(state.player.walletAmount < state.machine.playCost){
        //if player doesn't have money the screen will not change
        return state // okay as not changing the original state
    }

    const prize = determinePrize(slots)
    const transferAmount = generateWinnings(prize, state.machine.fundAmount, state.machine.playCost) - state.machine.playCost

    const newWalletAmount = state.player.walletAmount + transferAmount
    const newFundAmount = state.machine.fundAmount - transferAmount

    return {
        machine:{
            ...state.machine, //rather than specifying playCost which doesn't change
            fundAmount: newFundAmount,
            screen: slots
        },
        player:{
            //...state.player, //future proofing code in case add more fields
            walletAmount: newWalletAmount
        }
    }
}
// better solution - not mutating state -> purer function
// now not using lets - less error prone