import { useRef, useState, useCallback, useEffect } from "react";

/**
 * WordleInput — a row of single-character boxes for Wordle-style games.
 *
 * Props:
 *   wordLength  {3|4|5|6|7}   — number of letter boxes  (default: 5)
 *   value       {string[]}    — controlled array of letters, one per box
 *   onChange    {fn}          — called with updated string[] on every keystroke
 *   tileStates  {string[]}    — optional per-box colour state:
 *                               "correct" | "present" | "absent" | "" (default)
 *   disabled    {boolean}     — lock the whole row (e.g. a submitted guess)
 *   onSubmit    {fn}          — called when Enter is pressed on a complete word
 *   shake       {boolean}     — trigger a shake animation (invalid guess)
 */
export default function WordleInput({
  wordLength = 5,
  value,
  onChange,
  tileStates = [],
  disabled = false,
  onSubmit,
  shake = false,
  autoFocus = false,
}) {
  const [internal, setInternal] = useState(() => Array(wordLength).fill(""));
  const letters = value ?? internal;

  useEffect(() => {
    if (autoFocus) {
      focus(0);
    }
  }, [autoFocus]);

  const inputRefs = useRef([]);

  const focus = (idx) => {
    const el = inputRefs.current[idx];
    if (el) {
      el.focus();
      // Move caret to end so replacement works naturally
      requestAnimationFrame(() => el.setSelectionRange(1, 1));
    }
  };

  const update = useCallback(
    (idx, char) => {
      const next = [...letters];
      next[idx] = char.toUpperCase();
      if (onChange) onChange(next);
      else setInternal(next);
      return next;
    },
    [letters, onChange]
  );

  const handleKeyDown = (e, idx) => {
    if (disabled) return;

    const { key } = e;

    if (key === "Backspace") {
      e.preventDefault();
      if (letters[idx]) {
        // Clear current box
        update(idx, "");
      } else if (idx > 0) {
        // Move back and clear previous box
        update(idx - 1, "");
        focus(idx - 1);
      }
      return;
    }

    if (key === "ArrowLeft" && idx > 0) {
      e.preventDefault();
      focus(idx - 1);
      return;
    }
    if (key === "ArrowRight" && idx < wordLength - 1) {
      e.preventDefault();
      focus(idx + 1);
      return;
    }

    if (key === "Enter") {
      const full = letters.every((l) => l !== "");
      if (full && onSubmit) onSubmit(letters.join(""));
      return;
    }

    // Printable single character — letters only
    if (key.length === 1 && /^[a-zA-Z]$/.test(key)) {
      e.preventDefault();
      update(idx, key);
      if (idx < wordLength - 1) focus(idx + 1);
    }
  };

  // Handle paste: spread characters across boxes
  const handlePaste = (e, startIdx) => {
    if (disabled) return;
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/[^a-zA-Z]/g, "")
      .toUpperCase()
      .slice(0, wordLength - startIdx);

    if (!pasted) return;
    const next = [...letters];
    [...pasted].forEach((ch, i) => {
      if (startIdx + i < wordLength) next[startIdx + i] = ch;
    });
    if (onChange) onChange(next);
    else setInternal(next);

    const lastFilled = Math.min(startIdx + pasted.length, wordLength - 1);
    focus(lastFilled);
  };

  // Tile colour classes
  const tileColour = (state) => {
    switch (state) {
      case "correct":
        return "wordle-correct";
      case "present":
        return "wordle-present";
      case "absent":
        return "wordle-absent";
      default:
        return "";
    }
  };

  return (
    <>
      <style>{`
        .wordle-row {
          display: flex;
          gap: clamp(4px, 1vw, 8px);
        }
        .wordle-row.shake {
          animation: wordle-shake 0.5s ease;
        }
        @keyframes wordle-shake {
          0%, 100% { transform: translateX(0); }
          15%       { transform: translateX(-6px); }
          35%       { transform: translateX(6px); }
          55%       { transform: translateX(-4px); }
          75%       { transform: translateX(4px); }
          90%       { transform: translateX(-2px); }
        }

        .wordle-tile-wrapper {
          position: relative;
        }
        .wordle-tile-wrapper.pop .wordle-tile {
          animation: wordle-pop 0.1s ease;
        }
        @keyframes wordle-pop {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.12); }
          100% { transform: scale(1); }
        }

        .wordle-tile {
          /* Size scales with word length */
          width: var(--tile-size, 56px);
          height: var(--tile-size, 56px);
          border: 2px solid;
          border-radius: 4px;
          background: transparent;
          font-family: inherit;
          font-size: calc(var(--tile-size, 56px) * 0.45);
          font-weight: 700;
          text-align: center;
          text-transform: uppercase;
          caret-color: transparent;
          cursor: default;
          outline: none;
          transition: border-color 0.15s, background 0.2s, color 0.2s;

          /* Default (empty) colours — uses CSS vars so host app can override */
          border-color: var(--wordle-border-empty, #d3d6da);
          color:        var(--wordle-text, #ffffff);
        }
        .wordle-tile:not(:disabled):focus {
          border-color: var(--wordle-border-focus, #878a8c);
        }
        .wordle-tile:not(:disabled)[data-filled="true"] {
          border-color: var(--wordle-border-filled, #878a8c);
        }
        .wordle-tile:disabled {
          cursor: default;
        }

        /* Revealed states */
        .wordle-tile.wordle-correct {
          background: var(--wordle-correct, #6aaa64);
          border-color: var(--wordle-correct, #6aaa64);
          color: #fff;
        }
        .wordle-tile.wordle-present {
          background: var(--wordle-present, #c9b458);
          border-color: var(--wordle-present, #c9b458);
          color: #fff;
        }
        .wordle-tile.wordle-absent {
          background: var(--wordle-absent, #787c7e);
          border-color: var(--wordle-absent, #787c7e);
          color: #fff;
        }

        /* Flip reveal when a state is applied */
        .wordle-tile.wordle-correct,
        .wordle-tile.wordle-present,
        .wordle-tile.wordle-absent {
          animation: wordle-flip 0.4s ease forwards;
        }
        @keyframes wordle-flip {
          0%   { transform: rotateX(0deg); }
          50%  { transform: rotateX(-90deg); }
          100% { transform: rotateX(0deg); }
        }
      `}</style>

      <div
        className={`wordle-row${shake ? " shake" : ""}`}
        style={{
          /* tile size shrinks gracefully for longer words */
          "--tile-size": `${Math.min(62, Math.floor(340 / wordLength))}px`,
        }}
        role="group"
        aria-label={`${wordLength}-letter word input`}
      >
        {Array.from({ length: wordLength }, (_, idx) => {
          const letter = letters[idx] ?? "";
          const state = tileStates[idx] ?? "";
          const filled = letter !== "";

          return (
            <div
              key={idx}
              className={`wordle-tile-wrapper${filled && !state ? " pop" : ""}`}
            >
              <input
                ref={(el) => (inputRefs.current[idx] = el)}
                className={`wordle-tile${state ? ` ${tileColour(state)}` : ""}`}
                type="text"
                inputMode="text"
                maxLength={2} /* 2 so replacement works before we trim */
                value={letter}
                data-filled={filled}
                disabled={disabled}
                aria-label={`Letter ${idx + 1}`}
                onChange={(e) => {
                  // Handles mobile soft-keyboard input
                  const raw = e.target.value.replace(/[^a-zA-Z]/g, "");
                  if (!raw) return;
                  // Take the newly typed character (last one if 2 chars)
                  const ch = raw.slice(-1);
                  update(idx, ch);
                  if (idx < wordLength - 1) focus(idx + 1);
                }}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                onPaste={(e) => handlePaste(e, idx)}
                onFocus={(e) => e.target.select()}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="characters"
                spellCheck={false}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}
