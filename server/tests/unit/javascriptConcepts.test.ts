import { describe, it, expect } from 'vitest';
import {
  demonstrateFunctionHoisting,
  demonstrateVarHoisting,
  demonstrateTDZ,
  demonstrateEventLoopOrder
} from '../../utils/javascriptConcepts.js';

describe('JavaScript Runtime Concepts - Milestone 3', () => {
  describe('Hoisting Demonstrations', () => {
    
    it('should demonstrate function declaration hoisting', () => {
      // Function declaration hoisting allows invoking a function before its declaration
      const result = demonstrateFunctionHoisting();
      expect(result).toBe('I am hoisted!');
    });

    it('should demonstrate var hoisting', () => {
      // 'var' declarations are hoisted and initialized with undefined
      const result = demonstrateVarHoisting();
      expect(result.valueBeforeInitialization).toBeUndefined();
      expect(result.valueAfterInitialization).toBe('initialized value');
    });

    it('should demonstrate Temporal Dead Zone (TDZ) for let/const', () => {
      // 'let' and 'const' declarations are hoisted but not initialized, resulting in ReferenceError
      const result = demonstrateTDZ() as { name: string; message: string };
      // It should throw an error, which we caught and returned as an object
      expect(result.name).toBe('ReferenceError');
      // The exact error message might vary by engine, but it usually mentions initialization
      expect(result.message).toMatch(/access|initializ/i);
    });
  });

  describe('Event Loop Demonstrations', () => {
    
    it('should demonstrate event loop execution order (Sync -> Microtask -> Macrotask)', async () => {
      // Awaits the promise which resolves when the setTimeout macrotask runs
      const executionOrder = await demonstrateEventLoopOrder();
      
      // Verification of the Event Loop order:
      // 1. Synchronous code executes immediately
      // 2. Promise callbacks (Microtasks) execute after sync code finishes
      // 3. setTimeout callbacks (Macrotasks) execute in a future tick of the event loop
      expect(executionOrder).toEqual([
        'sync-start',
        'sync-end',
        'promise-microtask',
        'timer-macrotask'
      ]);
    });
  });
});
