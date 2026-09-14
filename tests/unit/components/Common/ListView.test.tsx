import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ListView } from "@/components/Common/Management/ListView"

describe("ListView (SCRUM-110)", () => {
  const items = [
    { id: 1, name: "Aqua - Đảo 5", thumbnail: "https://example.com/thumb.jpg" },
    { id: 2, name: "Aqua - Đảo 2", thumbnail: "" },
  ]

  it("renders Avatar when getImageSrc returns URL, and placeholder when getImageSrc returns empty string", () => {
    const { container } = render(
      <ListView items={items} getImageSrc={(item) => item.thumbnail} />,
    )

    expect(screen.getByText("Aqua - Đảo 5")).toBeTruthy()
    expect(screen.getByText("Aqua - Đảo 2")).toBeTruthy()

    // First item has image Avatar
    const img = container.querySelector("img")
    expect(img).toBeTruthy()
    expect(img?.getAttribute("src")).toBe("https://example.com/thumb.jpg")

    // Only 1 img should exist, item 2 shouldn't render broken img tag with empty src
    const allImgs = container.querySelectorAll("img")
    expect(allImgs).toHaveLength(1)
  })
})
