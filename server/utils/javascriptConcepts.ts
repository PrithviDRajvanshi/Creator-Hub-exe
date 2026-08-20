/**
 * Demonstrates JavaScript Function Declaration Hoisting.
 * Returns the result of calling a function before its declaration in the source code.
 */
export const demonstrateFunctionHoisting = (): string => {
  // Invoking hoistedFunction before it is declared below in source code.
  // JavaScript hoists the entire function declaration to the top of its enclosing scope during compilation.
  return hoistedFunction();

  function hoistedFunction() {
    return 'function declaration was hoisted';
  }
};

/**
 * Demonstrates JavaScript `var` Hoisting.
 * Shows that `var` variable declarations are hoisted and initialized to `undefined`,
 * while assignment occurs at runtime.
 */
export const demonstrateVarHoisting = () => {
  // Use new Function to cleanly isolate the JS runtime execution from TypeScript's static analyzer
  const testHoisting = new Function(`
    var valueBeforeInitialization = hoistedVar;
    var hoistedVar = 'initialized value';
    return {
      valueBeforeInitialization: valueBeforeInitialization,
      valueAfterInitialization: hoistedVar
    };
  `);

  return testHoisting();
};

/**
 * Demonstrates the Temporal Dead Zone (TDZ) for `let`/`const`.
 * Attempting to access `let` or `const` variables before initialization throws a ReferenceError.
 */
export const demonstrateTDZ = () => {
  try {
    const testTDZ = new Function(`
      const x = tdzVariable;
      let tdzVariable = 'I am in TDZ';
      return x;
    `);
    testTDZ();
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message
      };
    }
    return {
      name: 'UnknownError',
      message: 'An unknown error occurred'
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

/**
 * PROMISES VS CALLBACKS DEMONSTRATION
 * 
 * Demonstrates multi-step Promise chaining for dependent asynchronous operations
 * in an AI-CreatorHub workflow:
 * Step 1: Fetch User Context
 * Step 2: Fetch User Draft
 * Step 3: Generate AI Enhancements
 */
export interface UserContext {
  userId: string;
  email: string;
  plan: string;
}

export interface UserDraft {
  userId: string;
  draftId: string;
  topic: string;
}

export interface EnhancedDraft {
  draftId: string;
  topic: string;
  enhancedContent: string;
  completedAt: string;
}

// Stage 1: Simulates fetching user profile asynchronously
export const fetchUserContext = (userId: string): Promise<UserContext> => {
  return Promise.resolve({
    userId,
    email: 'creator@example.com',
    plan: 'PRO',
  });
};

// Stage 2: Simulates fetching draft content using context from Stage 1
export const fetchUserDraft = (context: UserContext): Promise<UserDraft> => {
  return Promise.resolve({
    userId: context.userId,
    draftId: `draft-for-${context.userId}`,
    topic: 'Generative AI Workflows',
  });
};

// Stage 3: Simulates calling AI processing service using draft data from Stage 2
export const generateAIEnhancements = (draft: UserDraft): Promise<EnhancedDraft> => {
  return Promise.resolve({
    draftId: draft.draftId,
    topic: draft.topic,
    enhancedContent: `AI-Generated Outline for ${draft.topic}`,
    completedAt: '2026-08-20T20:00:00Z',
  });
};

/**
 * Executes a 3-step Promise chain representing an AI-CreatorHub pipeline.
 * Demonstrates explicit .then().then().then().catch() chaining.
 */
export const demonstratePromiseChain = (userId: string): Promise<EnhancedDraft> => {
  return fetchUserContext(userId)
    .then((context) => {
      // Pass result of Stage 1 into Stage 2
      return fetchUserDraft(context);
    })
    .then((draftData) => {
      // Pass result of Stage 2 into Stage 3
      return generateAIEnhancements(draftData);
    })
    .catch((error) => {
      console.error('Pipeline error in Promise chain:', error);
      throw error;
    });
};

/**
 * Demonstrates equivalent nested callbacks ("Callback Hell") for comparison:
 * 
 * getUserContext(userId, (err, context) => {
 *   if (err) return handleError(err);
 *   getUserDraft(context, (err, draft) => {
 *     if (err) return handleError(err);
 *     generateAIEnhancements(draft, (err, enhanced) => {
 *       if (err) return handleError(err);
 *       // process final result
 *     });
 *   });
 * });
 * 
 * WHY PROMISES ARE SUPERIOR TO CALLBACKS:
 * 1. Flattens Callback Hell into a linear `.then()` pipeline.
 * 2. Provides centralized error handling via a single `.catch()` at the end of the chain.
 * 3. Naturally forwards returned values from one stage to the next.
 * 4. Prevents duplicate callback invocations or unhandled asynchronous exceptions.
 * 5. Serves as the foundation for clean `async/await` syntax.
 */
