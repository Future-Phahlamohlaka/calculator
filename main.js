
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
let inRadians = true;
let typeOfFunction = []
let recoveredFunctions = []

let isFloat = false;
let isNumber = false;

let afterOperationWord = "solved";
let bracketOpenedForFunction = false;

function modeToggle(){
    inRadians = !inRadians;
    const buttons = document.querySelectorAll('.no-background');
    if (inRadians){
        buttons[1].classList.add("disabled");
        buttons[0].classList.remove("disabled");
    }
    else {
        buttons[0].classList.add("disabled");
        buttons[1].classList.remove("disabled");
    }
}


function buttonClicked(input){
    let length = inputArray.length;
    let prevInput = inputArray[length -1];
    if (inputArray[inputArray.length - 1] === afterOperationWord) {
        clearInput(input);
        afterOperationWord = "";
    }
    if (inputArray.length === 0 && (operators.includes(input) && input != "-")) return; 
    
    if (input === "Pre") input += "Ans";
    else if (invalidAdjacentSymbol2ndPos.includes(input) && invalidAdjacentSymbol1stPos.includes(prevInput)) {
        const validCombinations = [
            [",", "("], [")", ","], ["^", "("], [")", "^"],
            ["!", "("], [")", "!"], ["√", "("], [")", "√"],
            ["!", "!"], ["√", "√"], ["!", ")"], ["×", "-"]
        ];
    
        const isValid = validCombinations.some(([prev, curr]) => prevInput === prev && input === curr);
    
        if (!isValid) return;
    } 
    
    if (input === ")"){
        if (bracketOpened < 1) return; else {}
        recoveredFunctions.push(typeOfFunction[typeOfFunction.length -1]);
        typeOfFunction.pop(); 
        bracketOpened--;
        if (bracketOpenedForFunction) input = "}";

    } else if (input === "("){
        bracketOpened++;
        typeOfFunction.push(0);
        bracketOpenedForFunction = false;
    }
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
        inputArray.push("{");
        bracketOpened++;
        bracketOpenedForFunction = true;
    }
    
    displayInputArray();
}

function displayInputArray(extraString){
    if (extraString == undefined) extraString = ""
    document.getElementById('display').value = inputArray.map(x => {
        if (x === "{") return "(";
        else if (x === "}") return ")";
        else return x;
    }).join("") + extraString;
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
    if (bracketOpened > 0) {
        return;
    }
    let copyOfInputArray = [...inputArray];
    let parsedInput1stIteration = []
    let curr, prev;

    if (copyOfInputArray.length === 0) {
        document.getElementById('display').value = 0;
        return;
    }
    if (copyOfInputArray[0] == "-") copyOfInputArray = ["0", ...copyOfInputArray];
    while (copyOfInputArray.length > 0){
        prev = curr;
        curr = copyOfInputArray.pop();
        if (prev === "(") {
            if (curr === ")" || numbers.includes(curr) || constants.includes(curr)) parsedInput1stIteration.push("×"); else {}
        } else if (curr === ")") {
            if (numbers.includes(prev) || functions.includes(prev) || constants.includes(prev)) parsedInput1stIteration.push("×"); else {}
        }
        else if ((constants.includes(prev) || functions.includes(prev)) && numbers.includes(curr)) parsedInput1stIteration.push("×"); 
        else if (prev === "-" && curr === "#") parsedInput1stIteration.push("0"); 
        else if (prev === "-" && curr === "×") parsedInput1stIteration.push("0");
        else {}
        parsedInput1stIteration.push(curr);
    }


    parsedInput1stIteration = parsedInput1stIteration.reverse();

    let parsedInput2ndIteration = []
    prev, curr = null;
    while (parsedInput1stIteration.length > 0){
        curr = parsedInput1stIteration.pop();
        if (curr === "!"){
            parsedInput2ndIteration.push("}")
            prev = curr;
            curr = parsedInput1stIteration.pop();
            let nestedFactorials = 0;
            while (parsedInput1stIteration.length > 0) {
                if (
                    (operators.includes(curr) && !(prev === "!" && curr === prev)) || 
                    curr === "{"
                ) {
                    break;
                }
            
                if (curr === "!") {
                    nestedFactorials++;
                } else {
                    parsedInput2ndIteration.push(curr);
                }
            
                prev = curr;
                curr = parsedInput1stIteration.pop();
            }
                        
            if (parsedInput1stIteration.length === 0) {
                parsedInput2ndIteration = [...parsedInput2ndIteration, curr, "{", "fact" ];
            }
            else parsedInput2ndIteration = [...parsedInput2ndIteration, "{", "fact", curr];

            while(nestedFactorials > 0){
                parsedInput2ndIteration = ["}", ...parsedInput2ndIteration, "{", "fact"];
                nestedFactorials--;
            }

        }
        else {
            parsedInput2ndIteration.push(curr);
        }

    }

    parsedInput2ndIteration = parsedInput2ndIteration.reverse();


    let parsedInput3rdIteration = []
    prev, curr, prevprev = null;
    while (parsedInput2ndIteration.length > 0){
        prevprev = prev;
        prev = curr;
        curr = parsedInput2ndIteration.pop();
        if (curr === "^" || curr === "√"){
            let word;
            if (curr === "^") word = "pow"; else word = "root";
            let temp = [];
            if (parsedInput3rdIteration.length > 0) {
                prevprev = prev;
                prev = curr;
                curr = parsedInput3rdIteration.pop();
            }
            let openBrackets = 1;
            while (parsedInput3rdIteration.length > 0 && !operators.includes(curr) && openBrackets > 0){
                temp.push(curr);
                if (curr === "{") openBrackets ++;
                else if (curr === "}") openBrackets--;
                curr = parsedInput3rdIteration.pop();
            }
            temp.push(curr);
            parsedInput3rdIteration.push("}")
            while (temp.length > 0){
                curr = temp.pop();
                parsedInput3rdIteration.push(curr);
            }
            parsedInput3rdIteration.push(",");
            curr = parsedInput2ndIteration.pop();

            let nestedRoots = 0;
            while (parsedInput2ndIteration.length > 0) {
                if (
                    (operators.includes(curr) && !(prev === "√" && curr === prev)) || 
                    curr === "{"
                ) {
                    break;
                }
            
                if (curr === "√") {
                    nestedRoots++;
                } else {
                    parsedInput3rdIteration.push(curr);
                }
            
                prevprev;
                prev = curr;
                curr = parsedInput2ndIteration.pop();
            }

            if (parsedInput2ndIteration.length === 0) {
                parsedInput3rdIteration = [...parsedInput3rdIteration, curr, "{", word ];
            }
            else {
                parsedInput3rdIteration = [...parsedInput3rdIteration, "{", word];
                parsedInput2ndIteration.push(curr);
            }

            while(nestedRoots > 0){
                parsedInput3rdIteration = ["}", ...parsedInput3rdIteration, "{", "root"];
                nestedRoots--;
                curr = prevprev;
            }

        }
        
        else {
            parsedInput3rdIteration.push(curr);
        }
    }

    parsedInput3rdIteration = parsedInput3rdIteration.reverse().map(x => {
        if (x === "{") return "(";
        else if (x === "}") return ")";
        else return x;
    });
    
    console.log(parsedInput3rdIteration.join(""))

    let result = calculate(parsedInput3rdIteration);

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

        if (i === "sin") parsedArray.push([sin, 1, false]);
        else if (i === "cos") parsedArray.push([cos, 1, false]);
        else if (i === "tan") parsedArray.push([tan, 1, false]);
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

function cos(n){
    if (!inRadians) n = n/180*Math.PI;
    console.log(n);
    return Math.cos(n);
}

function sin(n){
    if (!inRadians) n = n/180*Math.PI;
    return Math.sin(n);
}

function tan(n){
    if (!inRadians) n = n/180*Math.PI;
    return Math.tan(n);
}
