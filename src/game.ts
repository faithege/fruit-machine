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
            return fundAmount
        case "halfJackpot":
            return Math.ceil(fundAmount/2) //only need to deal with half pounds in this case
        case "fiveTimesPlayCost":
            return 5 * playCost
        case "nothing": //best to have an explicit case rather than a default case
            return 0
      }
}

function payForGo(initialState: State, slots: Screen, payingWithCredit: boolean): State {

    return {
        machine:{
            ...initialState.machine, //rather than specifying playCost which doesn't change
            fundAmount: payingWithCredit ? initialState.machine.fundAmount : initialState.machine.fundAmount + initialState.machine.playCost,
            screen: slots,
            credits: payingWithCredit ? initialState.machine.credits - 1 : 0
        },
        player:{
            walletAmount: payingWithCredit ? initialState.player.walletAmount : initialState.player.walletAmount - initialState.machine.playCost,
        }
    }
}

function payOutWinnings(postPayState: State, winningsAmount: number): State {
    const winningsTransferAmount = winningsAmount < postPayState.machine.fundAmount ? winningsAmount : postPayState.machine.fundAmount
    const newCredits = Math.ceil((winningsAmount - winningsTransferAmount)/postPayState.machine.playCost) // 0 if we can pay out!

    const newWalletAmount = postPayState.player.walletAmount + winningsTransferAmount
    const newFundAmount = postPayState.machine.fundAmount - winningsTransferAmount
    const newCreditsAmount = postPayState.machine.credits + newCredits

    return {
        machine:{
            ...postPayState.machine, //rather than specifying playCost which doesn't change
            fundAmount: newFundAmount,
            credits: newCreditsAmount
        },
        player:{
            walletAmount: newWalletAmount
        }
    }
}

        
export function evaluateMachinePlay(initialState: State, slots: Screen): State {
    // 3 phases with intermediate state

    // phase 1 - pay for go
    const payingWithCredit: boolean = initialState.machine.credits >= 1
    if(initialState.player.walletAmount < initialState.machine.playCost && !payingWithCredit){
        //if player doesn't have money the screen will not change - break out of function
        return initialState // okay as not changing the original state
    }
    const postPayState = payForGo(initialState, slots, payingWithCredit)
    
      
    // phase 2 - determine prize and generate winnings
    // no updated state required
    const prize = determinePrize(slots) //here we know if 5x cost case activated
    const winningsAmount = generateWinnings(prize, postPayState.machine.fundAmount, postPayState.machine.playCost)

    // phase 3 - pay or credit user
    // do we have enough money for  the winnings?
    // could use math.min to get smaller of the two but below is more explicit
    const postWinningsState = payOutWinnings(postPayState, winningsAmount)
    return postWinningsState
}