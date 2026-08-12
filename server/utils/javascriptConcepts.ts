/**
 * Demonstrates JavaScript Function Declaration Hoisting.
 * Returns the result of calling a function before its declaration in the source code.
 */
export const demonstrateFunctionHoisting = (): string => {
  // Invoking hoistedFunction before it is declared below
  return hoistedFunction();

  function hoistedFunction() {
    return 'I am hoisted!';
  }
};

/**
 * Demonstrates JavaScript `var` Hoisting.
 * Returns the value of a `var` variable before it is initialized.
 */
export const demonstrateVarHoisting = () => {
  // @ts-ignore - we are intentionally testing var hoisting behavior which TS complains about
  const valueBeforeInitialization = hoistedVar;
  
  var hoistedVar = 'initialized value';
  
  return {
    valueBeforeInitialization, // Will be undefined
    valueAfterInitialization: hoistedVar // Will be 'initialized value'
  };
};

/**
 * Demonstrates the Temporal Dead Zone (TDZ) for `let`/`const`.
 * Attempting to access the variable before initialization will throw a ReferenceError.
 */
export const demonstrateTDZ = () => {
  try {
    // @ts-ignore - intentional TDZ violation for demonstration
    const x = tdzVariable;
    let tdzVariable = 'I am in TDZ';
    return x;
  } catch (error: any) {
    return {
      name: error.name,
      message: error.message
    };
  }
};

/**
 * Demonstrates the JavaScript Event Loop execution order.
 * Returns a promise that resolves to an array of execution steps.
 * 
 * Order of execution demonstrated:
 * 1. Synchronous operations (executed immediately on the call stack)
 * 2. Microtasks (Promise callbacks, executed after current macro task finishes but before next event loop tick)
 * 3. Macrotasks (setTimeout callbacks, executed in a subsequent event loop tick)
 */
export const demonstrateEventLoopOrder = (): Promise<string[]> => {
  return new Promise((resolve) => {
    const executionOrder: string[] = [];

    // 1. Synchronous Code
    executionOrder.push('sync-start');

    // 3. Macrotask (Timer)
    setTimeout(() => {
      executionOrder.push('timer-macrotask');
      // Resolve after the macrotask executes to finish the demonstration
      resolve(executionOrder);
    }, 0);

    // 2. Microtask (Promise)
    Promise.resolve().then(() => {
      executionOrder.push('promise-microtask');
    });

    // 1. Synchronous Code
    executionOrder.push('sync-end');
  });
};
