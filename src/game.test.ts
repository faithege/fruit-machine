import { evaluateMachinePlay } from "./game";
import { State, Screen } from "./model";

const jackpotScreen: Screen = ['black', 'black', 'black', 'black']
const halfJackpotScreen: Screen = ['black', 'white','green', 'yellow']
const noPrizeScreen: Screen = ['black', 'green', 'black', 'yellow']

const fiveTimesPlayCostScreen1: Screen = ['black', 'black','green', 'yellow']
const fiveTimesPlayCostScreen2: Screen = ['yellow', 'black','black', 'yellow']
const fiveTimesPlayCostScreen3: Screen = ['green', 'black','yellow', 'yellow']


describe("evaluateMachinePlay", () => {
  it("returns the same state if a player doesn't have enough money", () => {

    // screen is irrelevant so can pass in as an empty array
    const testInitialState = generateState(1,0,[], 3)
    expect(evaluateMachinePlay(testInitialState, [])).toEqual(testInitialState);
  });

  it("returns the same state if a player doesn't have enough money even if there is a jackpot", () => {

    const testInitialState = generateState(1,0,[], 3)
    expect(evaluateMachinePlay(testInitialState, jackpotScreen)).toEqual(testInitialState);
  });

  it("gives the fund amount to the player from the machine if there is a jackpot", () => {
    
    const testInitialState = generateState(3, 10, [])
    const expectedState: State = generateState(13, 0, jackpotScreen)

    expect(evaluateMachinePlay(testInitialState, jackpotScreen)).toEqual(expectedState);
  });

  it("deducts the playCost from the player and gives to the machine if no jackpot", () => {
    const testInitialState = generateState(3, 10, [])
    const expectedState: State = generateState(2,11, noPrizeScreen)
  
    expect(evaluateMachinePlay(testInitialState, noPrizeScreen)).toEqual(expectedState);
  });

  it("pays out half the current money in the machine if each slot has a different colour", () => {

    // on playing the game - playCost should be deducted from playerWallet/added to machine fundAmount first
    // then the screen outcome should be evaluated and jackpot (if any) given to the player

    // if the machine had a fund of £100 and a play cost of £1, and player has wallet of £2
    const testInitialState = generateState(2,100,[])

    // if the player were to get four different fruit - the player should get half the current money in the machine (100+1)/2 > 50.5
    // machine only hands out integer amounts > 51 (but remember have to pay to play so in reality get 50)
    // if machine is empty returns 1 - separate test case

    const expectedState: State = generateState(52,50,halfJackpotScreen)

    expect(evaluateMachinePlay(testInitialState, halfJackpotScreen)).toEqual(expectedState);
  });

  it("empty machine pays out playCost if each slot has a different colour", () => {

    const testInitialState = generateState(2,0,[])
    const expectedState: State = generateState(2,0,halfJackpotScreen)

    expect(evaluateMachinePlay(testInitialState, halfJackpotScreen)).toEqual(expectedState);

  });

  it("pays out 5x playCost if two adjacent slots match", () => {

    const testState = generateState(2,50,[])

    // 5 x playcost is 5 minus playcost(1) = transfer of 4

    const expectedState1: State = generateState(6,46,fiveTimesPlayCostScreen1)
    const expectedState2: State = generateState(6,46,fiveTimesPlayCostScreen2)
    const expectedState3: State = generateState(6,46,fiveTimesPlayCostScreen3)

    expect(evaluateMachinePlay(testState, fiveTimesPlayCostScreen1)).toEqual(expectedState1);
    expect(evaluateMachinePlay(testState, fiveTimesPlayCostScreen2)).toEqual(expectedState2);
    expect(evaluateMachinePlay(testState, fiveTimesPlayCostScreen3)).toEqual(expectedState3);


  });

  it("does not deduct play cost if credits are available", () => {
    const testState = generateState(3,30,[],1, 5)

    const expectedState = generateState(3,30, noPrizeScreen, 1, 4)
    expect(evaluateMachinePlay(testState, noPrizeScreen)).toEqual(expectedState);

  });

  it("paying with credit: pays out all credits if cannot pay out prize money at all", () => {
    //scenario only works if paying with credits to begin with (otherwise will always be partial pay/credits)
    const testState = generateState(3,0,[],1, 1)

    const expectedState = generateState(3,0, fiveTimesPlayCostScreen1, 1, 5)

    expect(evaluateMachinePlay(testState, fiveTimesPlayCostScreen1)).toEqual(expectedState);

  });

  it("paying with credit: pays out partial credits if cannot pay out full prize money", () => {

    const testState = generateState(2,3,[],1, 1)

    // pay with 1 credit
    // five times jackpot winnings are 5
    // should receive 3 in machine plus 2 credits

    const expectedState = generateState(5,0, fiveTimesPlayCostScreen1, 1, 2)

    expect(evaluateMachinePlay(testState, fiveTimesPlayCostScreen1)).toEqual(expectedState);


  });

  it("paying with cash: pays out partial credits if cannot pay out full prize money", () => {

    const testState = generateState(5,5,[],5, 0)

    // pay with cash
    // five times jackpot winnings are 25
    // should receive 10 in machine plus 3 credits

    const expectedState = generateState(10,0, fiveTimesPlayCostScreen1, 5, 3)

    expect(evaluateMachinePlay(testState, fiveTimesPlayCostScreen1)).toEqual(expectedState);


  });

  function generateState(walletAmount: number, fundAmount: number, screen: Screen, playCost=1, credits=0){
    return {
      player: {
        walletAmount
      },
      machine: {
        playCost,
        screen,
        fundAmount,
        credits
      }
    }
  }
});


//