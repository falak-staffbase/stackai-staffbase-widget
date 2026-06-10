/*!
 * Copyright 2026, Staffbase SE and contributors.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { ReactElement, useEffect, useRef, useState } from "react";
import { BlockAttributes } from "widget-sdk";

const PROJECT_URL = 'https://www.stackai.com/embed/4c7ea626-82f1-42ca-823c-f9d2291702dd/8feaa5a8-b4f6-4d5a-92a2-dee422c1e7a7/69e74453365f34cfa301c3b4';

// How long to wait after the iframe loads before assuming the embedded view
// is likely still showing a login screen (cross-origin content can't be read).
const EMBED_CHECK_TIMEOUT_MS = 6000;

export interface MyTestProps extends BlockAttributes {}

export const MyTest = (_props: MyTestProps): ReactElement => {
  const [isChatbotVisible, setIsChatbotVisible] = useState(false);
  const [isPopupBlocked, setIsPopupBlocked] = useState(false);
  const [showEmbedFallback, setShowEmbedFallback] = useState(false);
  const embedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popupWatcher = useRef<ReturnType<typeof setInterval> | null>(null);

  // Best-effort: if StackAI ever posts a "ready"/"authenticated" message from
  // the iframe, treat it as success and hide the fallback. Browsers block us
  // from reading the iframe DOM directly, so postMessage is the only signal.
  useEffect(() => {
    const handleMessage = (event: MessageEvent): void => {
      let origin = "";
      try {
        origin = new URL(PROJECT_URL).origin;
      } catch {
        origin = "";
      }
      if (origin && event.origin !== origin) {
        return;
      }
      const data = typeof event.data === "string" ? event.data.toLowerCase() : "";
      if (data.includes("ready") || data.includes("authenticated") || data.includes("loaded")) {
        if (embedTimer.current) {
          clearTimeout(embedTimer.current);
          embedTimer.current = null;
        }
        setShowEmbedFallback(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      if (embedTimer.current) {
        clearTimeout(embedTimer.current);
      }
      if (popupWatcher.current) {
        clearInterval(popupWatcher.current);
      }
    };
  }, []);

  // Watch a sign-in window (popup or new tab): as soon as the user finishes
  // signing in and closes it, automatically embed the chatbot.
  const watchSignInWindow = (win: Window): void => {
    if (popupWatcher.current) {
      clearInterval(popupWatcher.current);
    }
    popupWatcher.current = setInterval(() => {
      if (win.closed) {
        if (popupWatcher.current) {
          clearInterval(popupWatcher.current);
          popupWatcher.current = null;
        }
        setIsChatbotVisible(true);
      }
    }, 500);
  };

  const startPopupLogin = (): void => {
    const popup = window.open(PROJECT_URL, "stackai-login", "width=520,height=740,noopener,noreferrer");

    if (!popup) {
      setIsPopupBlocked(true);
      return;
    }

    setIsPopupBlocked(false);
    watchSignInWindow(popup);
  };

  const startNewTabLogin = (): void => {
    const tab = window.open(PROJECT_URL, "_blank", "noopener,noreferrer");

    if (!tab) {
      return;
    }

    setIsPopupBlocked(false);
    watchSignInWindow(tab);
  };

  const handleIframeLoad = (): void => {
    // We cannot inspect cross-origin iframe content, so after a short delay we
    // surface a fallback link in case the embed is still on the login screen
    // (common when third-party cookies are blocked, e.g. Safari / mobile app).
    if (embedTimer.current) {
      clearTimeout(embedTimer.current);
    }
    embedTimer.current = setTimeout(() => {
      setShowEmbedFallback(true);
    }, EMBED_CHECK_TIMEOUT_MS);
  };

  const openChatbotDirectly = (): void => {
    window.open(PROJECT_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div>
      <p style={{ marginBottom: "12px" }}>
        Sign in using a popup first. Once you close the sign-in window, the chatbot
        appears below automatically.
      </p>
      <button type="button" onClick={startPopupLogin}>
        Sign In via Popup
      </button>

      {isPopupBlocked && (
        <div style={{ marginTop: "12px" }}>
          <p style={{ marginBottom: "8px" }}>
            Popup was blocked. Allow popups for this site and try again, or sign in
            in a new tab instead:
          </p>
          <button type="button" onClick={startNewTabLogin}>
            Sign In in a New Tab
          </button>
        </div>
      )}

      {isChatbotVisible && (
        <>
          {showEmbedFallback && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                border: "1px solid #e0a800",
                borderRadius: "6px",
                background: "#fff8e1",
              }}
            >
              <p style={{ margin: "0 0 8px" }}>
                Still seeing a sign-in screen below? Your browser may be blocking the
                embedded session (common on Safari and the mobile app). Open the chatbot
                directly instead:
              </p>
              <button type="button" onClick={openChatbotDirectly}>
                Open Chatbot in a New Tab
              </button>
            </div>
          )}

          <iframe
            title="StackAI Chatbot"
            src={PROJECT_URL}
            onLoad={handleIframeLoad}
            style={{ width: "100%", height: "640px", border: "none", marginTop: "16px" }}
            allow="clipboard-read; clipboard-write"
          />

          <p style={{ marginTop: "8px", fontSize: "13px" }}>
            Chatbot not loading or asking you to sign in again?{" "}
            <button
              type="button"
              onClick={openChatbotDirectly}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                color: "#0a66c2",
                textDecoration: "underline",
                cursor: "pointer",
                font: "inherit",
              }}
            >
              Open Chatbot in a New Tab
            </button>
          </p>
        </>
      )}
    </div>
  );
};

