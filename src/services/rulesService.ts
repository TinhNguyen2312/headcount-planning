import { categoryFromRuleIndex } from "@/constants/domain";
import type { CreateRuleInput, Rule } from "@/types";

const MOCK_DELAY_MS = 250;

function resolveAfterDelay<T>(value: T, ms = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

let draftSequence = 0;

export const rulesService = {
  createRule(input: CreateRuleInput): Promise<Rule> {
    draftSequence += 1;
    const rule: Rule = {
      id: `rule-draft-${Date.now()}-${draftSequence}`,
      category: categoryFromRuleIndex(input.code),
      ...input,
    };
    return resolveAfterDelay(rule);
  },
};
