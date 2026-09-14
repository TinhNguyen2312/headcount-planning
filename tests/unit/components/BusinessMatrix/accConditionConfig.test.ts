import { describe, expect, it } from "vitest"
import {
  type AccConditionBuilderState,
  buildAccConditionString,
  parseAccConditionString,
} from "@/components/BusinessMatrix/accConditionConfig"

describe("accConditionConfig - buildAccConditionString", () => {
  it("returns empty string if no rules are set", () => {
    const state: AccConditionBuilderState = {
      factor: "submittal",
      rules: [],
    }
    expect(buildAccConditionString(state)).toBe("")
  })

  it("builds condition string for single rule", () => {
    const state: AccConditionBuilderState = {
      factor: "submittal",
      rules: [{ id: "1", field: "type", value: "Thi công", operator: "OR" }],
    }
    expect(buildAccConditionString(state)).toBe('submittal[type="Thi công"]')
  })

  it("joins multiple rules of same field with OR operator", () => {
    const state: AccConditionBuilderState = {
      factor: "submittal",
      rules: [
        { id: "1", field: "type", value: "Thi công", operator: "OR" },
        { id: "2", field: "type", value: "Kiểm tra", operator: "OR" },
      ],
    }
    expect(buildAccConditionString(state)).toBe(
      'submittal[type="Thi công"ORtype="Kiểm tra"]',
    )
  })

  it("joins multiple rules with AND operator between them", () => {
    const state: AccConditionBuilderState = {
      factor: "submittal",
      rules: [
        { id: "1", field: "type", value: "Thi công", operator: "OR" },
        { id: "2", field: "type", value: "Kiểm tra", operator: "AND" },
        { id: "3", field: "package", value: "Gói 1", operator: "OR" },
      ],
    }
    expect(buildAccConditionString(state)).toBe(
      'submittal[type="Thi công"ORtype="Kiểm tra"ANDpackage="Gói 1"]',
    )
  })

  it("builds condition string for rfis factor with new fields", () => {
    const state: AccConditionBuilderState = {
      factor: "rfis",
      rules: [
        { id: "1", field: "discipline", value: "MEP", operator: "AND" },
        { id: "2", field: "priority", value: "High", operator: "AND" },
        { id: "3", field: "costImpact", value: "Yes", operator: "OR" },
      ],
    }
    expect(buildAccConditionString(state)).toBe(
      'rfis[discipline="MEP"ANDpriority="High"ANDcostImpact="Yes"]',
    )
  })
})

describe("accConditionConfig - parseAccConditionString", () => {
  it("returns default state for null or empty string", () => {
    expect(parseAccConditionString(null)).toEqual({
      factor: "submittal",
      rules: [],
    })
    expect(parseAccConditionString("")).toEqual({
      factor: "submittal",
      rules: [],
    })
  })

  it("parses factor and multiple OR rules of same field", () => {
    const raw = 'submittal[type="Thi công"ORtype="Kiểm tra"]'
    const parsed = parseAccConditionString(raw)
    expect(parsed.factor).toBe("submittal")
    expect(parsed.rules).toHaveLength(2)
    expect(parsed.rules[0].field).toBe("type")
    expect(parsed.rules[0].value).toBe("Thi công")
    expect(parsed.rules[0].operator).toBe("OR")
    expect(parsed.rules[1].field).toBe("type")
    expect(parsed.rules[1].value).toBe("Kiểm tra")
  })

  it("parses factor and rules with AND and OR operators", () => {
    const raw = 'submittal[type="Thi công"ORtype="Kiểm tra"ANDpackage="Gói 1"]'
    const parsed = parseAccConditionString(raw)
    expect(parsed.factor).toBe("submittal")
    expect(parsed.rules).toHaveLength(3)
    expect(parsed.rules[0].field).toBe("type")
    expect(parsed.rules[0].value).toBe("Thi công")
    expect(parsed.rules[0].operator).toBe("OR")
    expect(parsed.rules[1].field).toBe("type")
    expect(parsed.rules[1].value).toBe("Kiểm tra")
    expect(parsed.rules[1].operator).toBe("AND")
    expect(parsed.rules[2].field).toBe("package")
    expect(parsed.rules[2].value).toBe("Gói 1")
  })

  it("parses custom fields and other factors like rfis and schedule", () => {
    const raw = 'rfis[discipline="MEP"ORcustom_status="Draft"]'
    const parsed = parseAccConditionString(raw)
    expect(parsed.factor).toBe("rfis")
    expect(parsed.rules).toHaveLength(2)
    expect(parsed.rules[0].field).toBe("discipline")
    expect(parsed.rules[0].value).toBe("MEP")
    expect(parsed.rules[1].field).toBe("custom_status")
    expect(parsed.rules[1].value).toBe("Draft")
  })
})

describe("accConditionConfig - normalizeFieldKey", () => {
  it("normalizes custom field keys to valid identifiers", async () => {
    const { normalizeFieldKey } = await import(
      "@/components/BusinessMatrix/accConditionConfig"
    )
    expect(normalizeFieldKey("My Field")).toBe("My_Field")
    expect(normalizeFieldKey("  custom-tag!  ")).toBe("custom_tag")
    expect(normalizeFieldKey("discipline")).toBe("discipline")
  })
})
