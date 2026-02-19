import { describe, it, expect, afterEach, vi } from "vitest"
import { Input } from "../../src/engine/Input"
import type { Scene } from "../../src/engine/types"

// vi is a utility object, built-in to vitest
// we don't want to literally render scenes when we run tests
// function makeScene is a mock function - records calls made to it e.g. in a secret notebook
// makeScene creates object that satisfies Scene interface

function makeScene(): Scene {
    return {
        init: vi.fn(), // each vi.fn() call creates a separate fake function w/ its own secret notebook
        update: vi.fn(), 
        render: vi.fn(),
        onKeyDown: vi.fn(),
        onKeyUp: vi.fn(),
        onKeyHold: vi.fn(),
        destroy: vi.fn(),
    }
}

function fireKey(type: "keydown" | "keyup", code: string, opts?: Partial<KeyboardEvent>) {
    const event = new KeyboardEvent(type, { code, ...opts })
    window.dispatchEvent(event)
    return event
}

describe("Input – current behavior", () => {
    let input: Input

    afterEach(() => {
        input.destroy()
    })

    // --- lifecycle ---

    it("registers keydown and keyup listeners on construction", () => {
        const spy = vi.spyOn(window, "addEventListener") // wraps existing method to watch calls without changing its behavior
        input = new Input()
        expect(spy).toHaveBeenCalledWith("keydown", expect.any(Function))
        expect(spy).toHaveBeenCalledWith("keyup", expect.any(Function))
        spy.mockRestore()
    })

    it("removes listeners on destroy", () => {
        const spy = vi.spyOn(window, "removeEventListener")
        input = new Input()
        input.destroy()
        expect(spy).toHaveBeenCalledWith("keydown", expect.any(Function))
        expect(spy).toHaveBeenCalledWith("keyup", expect.any(Function))
        spy.mockRestore()
    })

    // --- event forwarding ---

    it("forwards keydown to scene.onKeyDown with the key code", () => {
        input = new Input()
        const scene = makeScene() 
        input.setScene(scene) // Input has a reference to the makeScene object

        fireKey("keydown", "KeyD") // runs line 25 with this.scene?.onKeyDown

        expect(scene.onKeyDown).toHaveBeenCalledWith("KeyD")
    })

    it("forwards keyup to scene.onKeyUp with the key code", () => {
        input = new Input()
        const scene = makeScene()
        input.setScene(scene)

        fireKey("keyup", "KeyJ")

        expect(scene.onKeyUp).toHaveBeenCalledWith("KeyJ")
    })

    it("forwards non-game keys to the scene too", () => {
        input = new Input()
        const scene = makeScene()
        input.setScene(scene)

        fireKey("keydown", "KeyA")

        expect(scene.onKeyDown).toHaveBeenCalledWith("KeyA")
    })

    it("does not throw when no scene is set", () => {
        input = new Input()
        expect(() => fireKey("keydown", "KeyD")).not.toThrow()
        expect(() => fireKey("keyup", "KeyD")).not.toThrow()
    })

    // --- preventDefault ---

    it("calls preventDefault for game keys (KeyD, KeyF, KeyJ, KeyK, Esc)", () => {
        input = new Input()
        const scene = makeScene()
        input.setScene(scene)

        for (const code of ["KeyD", "KeyF", "KeyJ", "KeyK", "Esc"]) {
            const event = new KeyboardEvent("keydown", { code, cancelable: true })
            window.dispatchEvent(event)
            expect(event.defaultPrevented, `expected preventDefault for ${code}`).toBe(true)
        }
    })

    it("does NOT preventDefault for non-game keys", () => {
        input = new Input()

        const event = new KeyboardEvent("keydown", { code: "KeyA", cancelable: true })
        window.dispatchEvent(event)
        expect(event.defaultPrevented).toBe(false)
    })

    // --- scene switching ---

    it("forwards to the most recently set scene", () => {
        input = new Input()
        const scene1 = makeScene()
        const scene2 = makeScene()

        input.setScene(scene1)
        fireKey("keydown", "KeyD")
        expect(scene1.onKeyDown).toHaveBeenCalledTimes(1)

        input.setScene(scene2)
        fireKey("keydown", "KeyF")
        expect(scene2.onKeyDown).toHaveBeenCalledWith("KeyF")
        expect(scene1.onKeyDown).toHaveBeenCalledTimes(1) // no extra calls
    })

    it("stops forwarding after setScene(null)", () => {
        input = new Input()
        const scene = makeScene()
        input.setScene(scene)

        fireKey("keydown", "KeyD")
        expect(scene.onKeyDown).toHaveBeenCalledTimes(1)

        input.setScene(null)
        fireKey("keydown", "KeyF")
        expect(scene.onKeyDown).toHaveBeenCalledTimes(1) // no new call
    })
})

// Step 3 – These tests describe desired behavior that Input.ts does NOT yet support.
// They will FAIL until Input.ts is updated in step 5.

describe("Input – desired behavior", () => {
    let input: Input

    afterEach(() => {
        input.destroy()
    })

    // --- repeat filtering ---

    it("ignores keydown events where repeat is true", () => {
        input = new Input()
        const scene = makeScene()
        input.setScene(scene)

        fireKey("keydown", "KeyD")                          // first press
        fireKey("keydown", "KeyD", { repeat: true })        // OS repeat
        fireKey("keydown", "KeyD", { repeat: true })        // OS repeat

        expect(scene.onKeyDown).toHaveBeenCalledTimes(1)    // only the first press
    })

    // --- held set ---

    it("adds key to held set on keydown", () => {
        input = new Input()

        fireKey("keydown", "KeyD")

        expect(input.held.has("KeyD")).toBe(true)
    })

    it("removes key from held set on keyup", () => {
        input = new Input()

        fireKey("keydown", "KeyD")
        fireKey("keyup", "KeyD")

        expect(input.held.has("KeyD")).toBe(false)
    })

    it("tracks multiple held keys simultaneously", () => {
        input = new Input()

        fireKey("keydown", "KeyD")
        fireKey("keydown", "KeyF")

        expect(input.held.has("KeyD")).toBe(true)
        expect(input.held.has("KeyF")).toBe(true)

        fireKey("keyup", "KeyD")

        expect(input.held.has("KeyD")).toBe(false)
        expect(input.held.has("KeyF")).toBe(true)
    })
})
