export type Fruit = "black" | "green" | "white" | "yellow"
export type Screen = Fruit[] //tuple of 4?
export type Prize = "jackpot" | "halfJackpot" | "fiveTimesPlayCost" | "nothing"

export interface Machine {
    screen: Screen
    fundAmount: number
    playCost: number
    // add outstanding credits
}

export interface Player {
    walletAmount: number
}

export interface State {
    machine: Machine
    player: Player
}
