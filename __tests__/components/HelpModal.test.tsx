import { render, screen, fireEvent, act } from "@testing-library/react"
import HelpModal from "@/components/HelpModal"

describe("HelpModal", () => {
  it("should not render initially", () => {
    render(<HelpModal />)
    expect(screen.queryByText("Welcome to MirrorMatch")).not.toBeInTheDocument()
  })

  it("should open when Shift+? is pressed", () => {
    render(<HelpModal />)
    
    // Simulate Shift+? (Shift+/)
    act(() => {
      fireEvent.keyDown(window, {
        key: "/",
        shiftKey: true,
        ctrlKey: false,
        metaKey: false,
      })
    })
    
    expect(screen.getByText("Welcome to MirrorMatch")).toBeInTheDocument()
  })

  it("should close when Escape is pressed", () => {
    render(<HelpModal />)
    
    // Open modal first
    act(() => {
      fireEvent.keyDown(window, {
        key: "/",
        shiftKey: true,
        ctrlKey: false,
        metaKey: false,
      })
    })
    
    expect(screen.getByText("Welcome to MirrorMatch")).toBeInTheDocument()
    
    // Close with Escape
    act(() => {
      fireEvent.keyDown(window, {
        key: "Escape",
      })
    })
    
    // Modal should close
    expect(screen.queryByText("Welcome to MirrorMatch")).not.toBeInTheDocument()
  })

  it("should not open with Ctrl+? (should require Shift only)", () => {
    render(<HelpModal />)
    
    // Simulate Ctrl+? (Ctrl+Shift+/)
    act(() => {
      fireEvent.keyDown(window, {
        key: "/",
        shiftKey: true,
        ctrlKey: true, // Should prevent opening
        metaKey: false,
      })
    })
    
    // Modal should not open when Ctrl is also pressed
    expect(screen.queryByText("Welcome to MirrorMatch")).not.toBeInTheDocument()
  })

  it("should toggle when Shift+? is pressed multiple times", () => {
    render(<HelpModal />)
    
    // First press - should open
    act(() => {
      fireEvent.keyDown(window, {
        key: "/",
        shiftKey: true,
        ctrlKey: false,
        metaKey: false,
      })
    })
    
    expect(screen.getByText("Welcome to MirrorMatch")).toBeInTheDocument()
    
    // Second press - should close
    act(() => {
      fireEvent.keyDown(window, {
        key: "/",
        shiftKey: true,
        ctrlKey: false,
        metaKey: false,
      })
    })
    
    expect(screen.queryByText("Welcome to MirrorMatch")).not.toBeInTheDocument()
  })

  it("should display help content when open", () => {
    render(<HelpModal />)
    
    // Open modal
    act(() => {
      fireEvent.keyDown(window, {
        key: "/",
        shiftKey: true,
        ctrlKey: false,
        metaKey: false,
      })
    })
    
    // Check for key content sections
    expect(screen.getByText("What is MirrorMatch?")).toBeInTheDocument()
    expect(screen.getByText("How to Play")).toBeInTheDocument()
    expect(screen.getByText("Key Features")).toBeInTheDocument()
    expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument()
    expect(screen.getByText("Tips")).toBeInTheDocument()
  })
})
