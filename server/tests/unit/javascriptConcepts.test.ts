import { describe, it, expect } from 'vitest';
import {
  demonstrateFunctionHoisting,
  demonstrateVarHoisting,
  demonstrateTDZ,
  demonstrateEventLoopOrder,
  demonstratePromiseChain,
  fetchUserContext,
  fetchUserDraft,
  generateAIEnhancements,
} from '../../utils/javascriptConcepts.js';

describe('JavaScript Runtime Concepts - Milestone 3', () => {
  describe('Hoisting Demonstrations', () => {
    it('should demonstrate function declaration hoisting by invoking function before declaration in source code', () => {
      // Function declaration hoisting allows invoking a function before its declaration in code order
      const result = demonstrateFunctionHoisting();
      expect(result).toBe('function declaration was hoisted');
    });

    it('should demonstrate var hoisting (declaration hoisted with undefined initialization)', () => {
      // 'var' declarations are hoisted and initialized with undefined before runtime assignment
      const result = demonstrateVarHoisting();
      expect(result.valueBeforeInitialization).toBeUndefined();
      expect(result.valueAfterInitialization).toBe('initialized value');
    });

    it('should demonstrate Temporal Dead Zone (TDZ) for let/const (throws ReferenceError)', () => {
      // 'let' and 'const' declarations are hoisted but remain uninitialized in TDZ, throwing ReferenceError
      const result = demonstrateTDZ() as { name: string; message: string };
      expect(result.name).toBe('ReferenceError');
      expect(result.message).toMatch(/access|initializ/i);
    });
  });

  describe('Event Loop Demonstrations', () => {
    it('should demonstrate event loop execution order (Sync -> Microtask -> Macrotask)', async () => {
      // Awaits the promise which resolves when the setTimeout macrotask runs
      const executionOrder = await demonstrateEventLoopOrder();
      
      // Verification of Event Loop order:
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

  describe('Promises vs Callbacks Demonstrations', () => {
    it('should execute a 3-step Promise chain sequentially and pass data across stages', async () => {
      const userId = 'user-creator-123';
      const result = await demonstratePromiseChain(userId);

      // Verify final output produced by the 3-step Promise pipeline (.then().then().then())
      expect(result).toBeDefined();
      expect(result.draftId).toBe('draft-for-user-creator-123');
      expect(result.topic).toBe('Generative AI Workflows');
      expect(result.enhancedContent).toContain('AI-Generated Outline for Generative AI Workflows');
    });

    it('should verify individual stage Promise resolutions in the pipeline', async () => {
      const context = await fetchUserContext('user-456');
      expect(context.userId).toBe('user-456');
      expect(context.plan).toBe('PRO');

      const draft = await fetchUserDraft(context);
      expect(draft.draftId).toBe('draft-for-user-456');

      const enhanced = await generateAIEnhancements(draft);
      expect(enhanced.enhancedContent).toBe('AI-Generated Outline for Generative AI Workflows');
    });
  });
});
