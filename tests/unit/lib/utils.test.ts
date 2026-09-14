import { describe, expect, it } from "vitest"
import {
  cn,
  formatAttachmentInfo,
  isAccUrl,
  isWebUrl,
  parseRequirements,
  parseTaskMetadata,
  stringifyTaskMetadata,
} from "@/lib/utils"

describe("utils", () => {
  describe("cn", () => {
    it("merges class names correctly", () => {
      expect(cn("px-2 py-1", "bg-primary")).toBe("px-2 py-1 bg-primary")
    })
  })

  describe("attachment and requirement link helpers", () => {
    it("detects web and Autodesk ACC URLs", () => {
      const accUrl =
        "https://acc.autodesk.com/build/submittals/projects/f6bae78a/items/fb6da64b"
      const normalUrl = "https://example.com/docs"
      const fileUrl = "/data/uploads/image.png"

      expect(isWebUrl(accUrl)).toBe(true)
      expect(isWebUrl(normalUrl)).toBe(true)
      expect(isWebUrl(fileUrl)).toBe(false)
      expect(isAccUrl(accUrl)).toBe(true)
      expect(isAccUrl(normalUrl)).toBe(false)
    })

    it("formats Autodesk ACC attachments with friendly labels and web link flag", () => {
      const accUrl =
        "https://acc.autodesk.com/build/submittals/projects/f6bae78a-4f16-4188-9866-eb364b005825/items/fb6da64b-fd57-4127-819e-2b08c5b622dc"
      const info = formatAttachmentInfo(accUrl)
      expect(info.isWebLink).toBe(true)
      expect(info.isAcc).toBe(true)
      expect(info.label).toBe("Autodesk ACC - Hồ sơ đệ trình (Submittal)")
    })

    it("parses requirements string array into IMAGE, VIDEO, FILE, LINK types", () => {
      const stringArray = [
        "https://acc.autodesk.com/build/submittals/123",
        "https://server.com/photo.jpg",
        "https://server.com/clip.mp4",
        "https://server.com/report.pdf",
      ]
      const parsed = parseRequirements(stringArray)
      expect(parsed).toHaveLength(4)
      expect(parsed[0]).toEqual({
        type: "LINK",
        url: "https://acc.autodesk.com/build/submittals/123",
      })
      expect(parsed[1]).toEqual({
        type: "IMAGE",
        url: "https://server.com/photo.jpg",
      })
      expect(parsed[2]).toEqual({
        type: "VIDEO",
        url: "https://server.com/clip.mp4",
      })
      expect(parsed[3]).toEqual({
        type: "FILE",
        url: "https://server.com/report.pdf",
      })

      expect(parseRequirements(null)).toEqual([])
      expect(parseRequirements(undefined)).toEqual([])
      expect(parseRequirements([])).toEqual([])
    })

    it("parses task metadata from JSON string, object, and handles empty/null gracefully", () => {
      const jsonStr = JSON.stringify({
        acc: {
          submittalId: "sub-123",
          packageName: "Gói thầu TVT",
        },
      })
      const parsed = parseTaskMetadata(jsonStr)
      expect(parsed?.acc?.submittalId).toBe("sub-123")
      expect(parsed?.acc?.packageName).toBe("Gói thầu TVT")

      const obj = { accItemId: "uuid-123", customField: 42 }
      const parsedObj = parseTaskMetadata(obj)
      expect(parsedObj).toBe(obj)
      expect(parsedObj?.customField).toBe(42)

      expect(parseTaskMetadata(null)).toBeNull()
      expect(parseTaskMetadata(undefined)).toBeNull()
      expect(parseTaskMetadata("")).toBeNull()
      expect(parseTaskMetadata("   ")).toBeNull()
      expect(parseTaskMetadata("null")).toBeNull()
      expect(parseTaskMetadata("{}")).toBeNull()

      expect(parseTaskMetadata("not-a-valid-json")).toBeNull()
      expect(parseTaskMetadata(12345)).toBeNull()
    })

    it("stringifies task metadata safely", () => {
      expect(stringifyTaskMetadata({ key: "value" })).toBe('{"key":"value"}')
      expect(stringifyTaskMetadata('{"key":"value"}')).toBe('{"key":"value"}')
      expect(stringifyTaskMetadata(null)).toBe("{}")
      expect(stringifyTaskMetadata(undefined)).toBe("{}")
    })
  })
})
