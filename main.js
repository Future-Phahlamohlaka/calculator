
let inputArray = [];
const invalidAdjacentSymbol1stPos = ["(", ".", "+", "-", "×", "÷", ",", "!", "^", "√"];
const operators = ["!", "^", "+", "-", "×", "÷", "√"]
const invalidAdjacentSymbol2ndPos = [".", "+", "-", "×", "÷", ")", "!", "^", "√"];
const functions = ["cos", "sin", "ln", "tan", "log", "inv", "fact", "pow", "root", "abs"];
const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
const constants = ["e", "Ans", "π"]
let answer = 0;
let preAnswer = 0;
let bracketOpened = 0;
let inRadians = false;
let typeOfFunction = []
let recoveredFunctions = []

let isFloat = false;
let isNumber = false;

let afterOperationWord = "solved";


function buttonClicked(input){
    let length = inputArray.length;
    let prevInput = inputArray[length -1];
    if (inputArray.length === 0 && (operators.includes(input) && input != "-")) return; 
    else if (inputArray[inputArray.length - 1] === afterOperationWord) {
        clearInput(input);
        return;
    }
    else if (invalidAdjacentSymbol2ndPos.includes(input) && invalidAdjacentSymbol1stPos.includes(prevInput)) {
        const validCombinations = [
            [",", "("], [")", ","], ["^", "("], [")", "^"],
            ["!", "("], [")", "!"], ["√", "("], [")", "√"],
            ["!", "!"], ["√", "√"], ["!", ")"]
        ];
    
        const isValid = validCombinations.some(([prev, curr]) => prevInput === prev && input === curr);
    
        if (!isValid) return;
    } 
    else if (input === ")"){
        if (bracketOpened < 1) return; else {}
        recoveredFunctions.push(typeOfFunction[typeOfFunction.length -1]);
        typeOfFunction.pop(); 
        bracketOpened--;
    }
    else if (input === "("){
        bracketOpened++;
        typeOfFunction.push(0);
    }
    else if (input === "Pre") input += "Ans";
    else if (input === "."){
        if (isFloat) return;
        if (inputArray.length < 1) inputArray.push("0");
        isFloat = true;
    } 
    else if (numbers.includes(input)){}
    else {
        isFloat = false;
    }

    inputArray.push(input);

    if (functions.includes(input)){
        typeOfFunction.push(1);
        inputArray.push("(", "#");
        bracketOpened++;
    }
    
    displayInputArray();
}

function displayInputArray(extraString){
    if (extraString == undefined) extraString = ""
    document.getElementById('display').value = inputArray.filter((x) => x != '#').join("") + extraString;
}

function clearInput(input){
    inputArray = [];
    bracketOpened = 0;
    typeOfFunction = [];
    recoveredFunctions = [];
    if (!input) input = 0;
    document.getElementById('display').value = input;
    isFloat = false;
}

function backSpace(){
    if (inputArray.length < 1) {
        document.getElementById('display').value = 0;
        return;
    }

    let length = inputArray.length;

    let curr = inputArray[length -1];
    let prev;
    if (length>1) prev = inputArray[length -2];

    if (curr === ".") isFloat = false;
    if (prev && prev === ".") isFloat = true;
    if (prev && functions.includes(prev)) {
        inputArray.pop();
        bracketOpened--;
    }
    else if (curr === ")"){
        bracketOpened++;
        typeOfFunction.push(recoveredFunctions[recoveredFunctions.length -1]);
        recoveredFunctions.pop();
    }
    else if (inputArray[length -1] === "(") {
        bracketOpened--;
        typeOfFunction.pop();
    }

    inputArray.pop();
    if (inputArray.length < 1) document.getElementById('display').value = 0;
    else displayInputArray();
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
                else if (Array.isArray(element)){
                    i--;
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
            } else if (func === difference) {
                result -= tempStack[++i];
            }
        }
    }

    
    return result;
}


function parse(){
    while (bracketOpened > 0) {
        inputArray.push(")");
        bracketOpened--;
    }
    let copyOfInputArray = [...inputArray];
    let parsedInput1stInteration = []
    let curr, prev;

    if (copyOfInputArray.length === 0) {
        document.getElementById('display').value = result;
        return;
    }
    if (copyOfInputArray[0] == "-") copyOfInputArray = ["0", ...copyOfInputArray];
    while (copyOfInputArray.length > 0){
        curr = copyOfInputArray.pop();
        if (prev === "(") {
            if (curr === ")" || numbers.includes(curr) || constants.includes(curr)) parsedInput1stInteration.push("×"); else {}
        } else if (curr === ")") {
            if (numbers.includes(prev) || functions.includes(prev) || constants.includes(prev)) parsedInput1stInteration.push("×"); else {}
        }
        else if ((constants.includes(prev) || functions.includes(prev)) && numbers.includes(curr)) parsedInput1stInteration.push("×"); 
        else if (prev === "-" && curr === "#") parsedInput1stInteration.push("0");
        else {}
        parsedInput1stInteration.push(curr);
        prev = curr;
    }


    parsedInput1stInteration = parsedInput1stInteration.reverse();

    let parsedInput2ndInteration = []
    while (parsedInput1stInteration.length > 0){
        curr = parsedInput1stInteration.pop();
        if (curr === "!"){
            parsedInput2ndInteration.push(")")
            curr = parsedInput1stInteration.pop();
            while (parsedInput1stInteration.length > 0 && !operators.includes(curr) && curr!="#"){
                parsedInput2ndInteration.push(curr);
                curr = parsedInput1stInteration.pop();
            }
            if (parsedInput1stInteration.length === 0) {
                parsedInput2ndInteration = [...parsedInput2ndInteration, curr, "(", "fact" ];
            }
            else parsedInput2ndInteration = [...parsedInput2ndInteration, "(", "fact", curr];
        }
        else {
            parsedInput2ndInteration.push(curr);
        }
    }

    parsedInput2ndInteration = parsedInput2ndInteration.reverse();

    let parsedInput3rdInteration = []
    while (parsedInput2ndInteration.length > 0){
        curr = parsedInput2ndInteration.pop();
        if (curr === "^" || curr === "√"){
            let word;
            if (curr === "^") word = "pow"; else word = "root";
            let temp = [];
            if (parsedInput3rdInteration.length > 0) curr = parsedInput3rdInteration.pop();
            while (parsedInput3rdInteration.length > 0 && !operators.includes(curr) && curr!="#"){
                temp.push(curr);
                curr = parsedInput3rdInteration.pop();
            }
            temp.push(curr);
            temp = temp.reverse();
            parsedInput3rdInteration.push(")")
            while (temp.length > 0){
                curr = temp.pop();
                parsedInput3rdInteration.push(curr);
            }
            parsedInput3rdInteration.push(",");
            curr = parsedInput2ndInteration.pop();

            while (parsedInput2ndInteration.length > 0 && !operators.includes(curr) && curr!="#"){
                parsedInput3rdInteration.push(curr)
                curr = parsedInput2ndInteration.pop();
            }
            if (parsedInput2ndInteration.length === 0) {
                parsedInput3rdInteration = [...parsedInput3rdInteration, curr, "(", word ];
            }
            else parsedInput3rdInteration = [...parsedInput3rdInteration, "(", word, curr];
        }
        
        else {
            parsedInput3rdInteration.push(curr);
        }
    }

    parsedInput3rdInteration = parsedInput3rdInteration.reverse().filter(x => x!="#");

    let result = calculate(parsedInput3rdInteration);

    preAnswer = answer;
    answer = result;

    
    displayInputArray(" = "+result);

    inputArray.push(afterOperationWord);
}

function calculate(parsedInput) {
    const parsedArray = [];
    let number = "";

    for (const i of parsedInput) {
        if (numbers.includes(i) || i === ".") {
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
        else if (i === "inv") parsedArray.push([inverse, 2, false]);
        else if (i === "abs") parsedArray.push([Math.abs, 1, false]);
        else if (i === "π") parsedArray.push(Math.PI);
        else if (i === "Ans") parsedArray.push(answer);
        else if (i === "PreAns") parsedArray.push(preAnswer);
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

    return result;
    
}

function inverse(a){
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
    if (n < 1) {
        return 1;
    } else {
        return n * factorial(n - 1);
    }
}

function nthRoot(x, n) {
    return Math.pow(n, 1 / x);
}
