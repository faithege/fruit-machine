// @ts-ignore
import readline from 'readline-promise'; 
import { evaluateMachinePlay, generateSlots } from './game';
import { Machine, Player, State } from './model';



async function repl(readline:any){ //game play here
    const initialMachineFund = 10
    const initialScreen = generateSlots()
    const initialMachine: Machine = {
        screen: initialScreen,
        fundAmount: initialMachineFund,
        playCost: 1,
        credits: 0
    }
    const initialPlayer: Player = {
        walletAmount: 6
    }

    // one mutable variable, no need to affect initial constants
    let state: State = {
        machine: initialMachine,
        player: initialPlayer
    }
    // could log history of state with state[], and current state would be first/last element
    
    do {
        console.log(`PRIZE MONEY: ${state.machine.fundAmount}`)
        console.log(state.machine.screen)
        console.log(`Free credits available: ${state.machine.credits}`)
        console.log(`Your wallet contains: ${state.player.walletAmount}`)


        await readline.questionAsync("Press enter to pull the lever ->")
        const nextScreen = generateSlots()
        
        state = evaluateMachinePlay(state, nextScreen)
    }
    while (true)
    
}

// Start Game - top level async function then immediately called using ()
(async () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true
        })

    try {
        await repl(rl)
    } catch (error) {
        console.log(error)
    }
    finally {
        rl.close()
    }
})(); // IIFE - calls the function immediately