import React from "react"
import {screen, render, fireEvent, act} from "@testing-library/react"

import {MyTest} from "./my-test";

describe("MyTest", () => {
    it("should render the component", () => {
        render(<MyTest contentLanguage="en_US" message="World"/>);

        expect(screen.getByText(/Sign in using a popup first/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Sign In via Popup/i })).toBeInTheDocument();
    })

    it("should open the popup when Sign In is clicked", () => {
        const openSpy = jest.spyOn(window, "open").mockImplementation(() => ({ closed: false }) as Window);
        render(<MyTest contentLanguage="en_US" message="World"/>);

        fireEvent.click(screen.getByRole("button", { name: /Sign In via Popup/i }));

        expect(openSpy).toHaveBeenCalled();
        // Chatbot is not embedded until the popup is closed.
        expect(screen.queryByTitle(/StackAI Chatbot/i)).not.toBeInTheDocument();

        openSpy.mockRestore();
    })

    it("should embed the chatbot automatically after the popup is closed", () => {
        jest.useFakeTimers();
        const popup = { closed: false } as Window;
        const openSpy = jest.spyOn(window, "open").mockImplementation(() => popup);
        render(<MyTest contentLanguage="en_US" message="World"/>);

        fireEvent.click(screen.getByRole("button", { name: /Sign In via Popup/i }));

        // Simulate the user finishing sign-in and closing the popup.
        (popup as { closed: boolean }).closed = true;
        act(() => {
            jest.advanceTimersByTime(600);
        });

        expect(screen.getByTitle(/StackAI Chatbot/i)).toBeInTheDocument();

        openSpy.mockRestore();
        jest.useRealTimers();
    })

    it("should show a popup-blocked message when window.open returns null", () => {
        const openSpy = jest.spyOn(window, "open").mockImplementation(() => null);
        render(<MyTest contentLanguage="en_US" message="World"/>);

        fireEvent.click(screen.getByRole("button", { name: /Sign In via Popup/i }));

        expect(screen.getByText(/Popup was blocked/i)).toBeInTheDocument();

        openSpy.mockRestore();
    })
})
