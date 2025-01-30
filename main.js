
let inputArray = [];
const invalidClosingBracket = ["(", ".", "+", "-", "×", "÷", ","];
const invalidAdjacentSymbol = [".", "+", "-", "×", "÷", ")", , ","];
const functions = ["cos", "sin", "ln", "tan", "log", "pow", "root", "fact", "inv"];
const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "."]
let answer = 0;
let bracketOpened = 0;
let inRadians = false;
let typeOfFunction = [] // 2 represents 2 args 1 for 1 arg 0 arg normal brackets
let recoveredFunctions = []

let isFloat = []
let isNumber = false;


function buttonClicked(input){
    let length = inputArray.length;
    let adjacent = inputArray[length -1];
    if (invalidAdjacentSymbol.includes(input) && invalidClosingBracket.includes(adjacent)){
        if ((!(adjacent==="," && input==="(")) || (!(adjacent===")" && input===","))) return; 
    }

    if (input === ")"){
        if (bracketOpened < 1) return;
        if (typeOfFunction[typeOfFunction.length -1] === 2) return;
        if (recoveredFunctions[recoveredFunctions.length -1] < 2) recoveredFunctions.push(typeOfFunction[typeOfFunction.length -1]);
        typeOfFunction.pop(); 
        bracketOpened--;
    }
    else if (input === "("){
        bracketOpened++;
        typeOfFunction.push(0);
    }

    else if (input === ",") {
        if (typeOfFunction.length < 1) return;
        if (typeOfFunction[typeOfFunction.length -1] <= 1) return;
        typeOfFunction[typeOfFunction.length -1]--;
        recoveredFunctions.push(2);
    }

    // if (!numbers.includes(input)) {
    //     isFloat = false;
    // }

    // if (input == "." && isFloat) return; 
    // else if (input == ".") isFloat = true;

    inputArray.push(input);
    
    if (functions.includes(input)){
        if (input === "pow" || input === "root"){
            typeOfFunction.push(2);
        }
        else typeOfFunction.push(1);
        inputArray.push("(");
        bracketOpened++;
    }

    
    document.getElementById('display').value = inputArray.join("");
}

function clearInput(){
    inputArray = [];
    bracketOpened = 0;
    typeOfFunction = [];
    recoveredFunctions = [];
    document.getElementById('display').value = 0;
    isFloat = false;
}

function backSpace(){
    if (inputArray.length < 1) {
        document.getElementById('display').value = 0;
        return;
    }

    let length = inputArray.length;

    if (inputArray[length -1] === ".") isFloat = false;
    if (length>1 && functions.includes(inputArray[length -2])) {
        inputArray.pop();
        bracketOpened--;
    }
    else if (inputArray[length -1] === ")"){
        bracketOpened++;
        if (recoveredFunctions[recoveredFunctions.length -1] < 2) {
            typeOfFunction.push(recoveredFunctions[recoveredFunctions.length -1]);
            recoveredFunctions.pop();
        }
        else {
            recoveredFunctions[recoveredFunctions.length -1]--;
            typeOfFunction.push(1);
        }
    }
    else if (inputArray[length -1] === "(") {
        bracketOpened--;
        typeOfFunction.pop();
    }
    else if (inputArray[length -1] === ","){
        typeOfFunction[typeOfFunction.length -1]++;
        recoveredFunctions.pop();
    }
    inputArray.pop();
    if (inputArray.length < 1) document.getElementById('display').value = 0;
    else document.getElementById('display').value = inputArray.join("");
}

function partitionArray(parsedArray, i){
    let smallerArray = [];
    let openBrackets = 0;
    for (let j=i; j< parsedArray.length; j++, i++){
        smallerArray.push(parsedArray[j]);
        if (parsedArray[j] === "(") openBrackets++;
        else if (parsedArray[j] === ")") openBrackets--;
        if (openBrackets === 0) break;
    }

    return [smallerArray, i]
}

function evaluate(stack) {
    if (stack.length === 0) return 0;
    
    let tempStack = [];
    

    for (let i = 0; i < stack.length; i++) {
        let element = stack[i];
        
        if (typeof element === 'number') {
            tempStack.push(element);
        } else if (Array.isArray(element)) {
            const [func, argCount, isOperator] = element;

            if (func === multiply) {
                let val1 = tempStack.pop();
                let val2 = stack[++i];
                tempStack.push(val1 * val2);
            } else if (func === divide) {
                let val1 = tempStack.pop();
                let val2 = stack[++i];
                tempStack.push(val1 / val2);
            } else {
                tempStack.push(element);
            }
        }
    }

    let result = tempStack[0];
    for (let i = 1; i < tempStack.length; i++) {
        let element = tempStack[i];
        
        if (Array.isArray(element)) {
            const [func, argCount, isOperator] = element;
            
            if (func === sum) {
                result += tempStack[++i];
            } else if (func === subtract) {
                result -= tempStack[++i];
            }
        }
    }

    
    return result;
}





function solve(parsedArray) {
    let stack = []; 
    for (let i = 0; i < parsedArray.length; i++) {
        const element = parsedArray[i];
        if (typeof element === 'number') {
            stack.push(element);
        } else if (Array.isArray(element)) {
            const [func, argCount, isOperator] = element;

            if (argCount === 1) {
                let result = partitionArray(parsedArray, ++i);
                i = result[1];
                let lookahead = solve(result[0]);
                stack.push(func(lookahead));
            } else if (argCount === 2 && !isOperator) {
                let result = partitionArray(parsedArray, ++i);
                i = result[1];
                let lookahead1 = solve(result[0]);
                result = partitionArray(parsedArray, ++i);
                i = result[1];
                let lookahead2 = solve(result[0]);
                stack.push(func(lookahead1, lookahead2));
            }
            else {
                let lookahead = parsedArray[++i];
                stack.push(element);

                if (typeof lookahead == 'number'){
                    stack.push(lookahead);
                }
                else if (lookahead === "("){
                    let result = partitionArray(parsedArray, i);
                    i = result[1];
                    let lookahead = solve(result[0]);
                    stack.push(lookahead);
                }
            }
        }
        else if (element === "("){
            let result = partitionArray(parsedArray, i);
            i = result[1];
            let lookahead = solve(result[0].slice(1, result[0].length - 1));
            stack.push(lookahead);
        }
    }


    return evaluate(stack);
}

function equals() {
    const parsedArray = [];
    let number = "";

    for (const i of inputArray) {
        if (numbers.includes(i)) {
            number += i;
            continue;
        } else {
            if (number !== "") {
                parsedArray.push(parseFloat(number)); 
                number = "";
            }
        }

        if (i === "sin") parsedArray.push([Math.sin, 1, false]);
        else if (i === "cos") parsedArray.push([Math.cos, 1, false]);
        else if (i === "tan") parsedArray.push([Math.tan, 1, false]);
        else if (i === "pow") parsedArray.push([Math.pow, 2, false]);
        else if (i === "log") parsedArray.push([Math.log10, 1, false]);
        else if (i === "ln") parsedArray.push([Math.log, 1, false]);
        else if (i === "fact") parsedArray.push([factorial, 1, false]);
        else if (i === "root") parsedArray.push([nthRoot, 2, false]);
        else if (i === "inv") parsedArray.push([nthRoot, 2, false]);
        else if (i === "π") parsedArray.push(Math.PI);
        else if (i === "Ans") parsedArray.push(answer);
        else if (i === "e") parsedArray.push(Math.E); 
        else if (i === "+") parsedArray.push([sum, 2, true]);
        else if (i === "-") parsedArray.push([difference, 2, true]);
        else if (i === "×") parsedArray.push([multiply, 2, true]);
        else if (i === "÷") parsedArray.push([divide, 2, true]);
        else if (i === "(" || i === ")") parsedArray.push(i);
        else if (i === ",") {
            parsedArray.push(")");
            parsedArray.push("(");
        }

    }

    if (number !== "") {
        parsedArray.push(parseFloat(number)); 
    }


    const result = solve(parsedArray);

    const expression = inputArray.join("");
    answer = result;
    clearInput();

    document.getElementById('display').value = expression+" = "+result;
    
}

function inverse(a){
    if (a === 0) throw "Can't divide with zero";
    return 1/a;
}


function sum(a, b) {
    return a + b;
}

function difference(a, b) {
    return a - b;
}

function multiply(a, b) {
    return a * b;
}

function divide(a, b) {
    if (b === 0) {
        throw "Error: Division by zero";
    }
    return a / b;
}

function factorial(n) {
    if (n === 0 || n === 1) {
        return 1;
    } else {
        return n * factorial(n - 1);
    }
}

function nthRoot(x, n) {
    if (n === 0) {
        throw "Error: Root index cannot be zero";
    }
    return Math.pow(x, 1 / n);
}
