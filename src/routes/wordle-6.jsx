import { Card } from "@/components/ui/card";
import WordleInput from "@/components/WordleInput";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GooeyNav from "@/components/GooeyNav";

const SECRET = "PHASES";
const WORD_LENGTH = 6;
const MAX_GUESSES = WORD_LENGTH + 1;

function scoreGuess(guess, secret) {
  const result = Array(secret.length).fill("absent");
  const used = Array(secret.length).fill(false);

  const nav = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    nav("/");
  }

  const items = [
    { label: "Search", href: "/search" },
    { label: "Logout", href: "/", onClick: handleLogout }
  ];

  // First pass: correct letters in correct position
  for (let i = 0; i < secret.length; i++) {
    if (guess[i] === secret[i]) {
      result[i] = "correct";
      used[i] = true;
    }
  }

  // Second pass: present letters
  for (let i = 0; i < guess.length; i++) {
    if (result[i] === "correct") continue;
    for (let j = 0; j < secret.length; j++) {
      if (guess[i] === secret[j] && !used[j]) {
        result[i] = "present";
        used[j] = true;
        break;
      }
    }
  }

  return result;
}

const validateWord = async (word) => {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
    return res.ok; // 200 = real word, 404 = not found
  } catch {
    return true; // If API fails, optimistically allow the guess
  }
};

export default function Wordle6() {
  const [guesses, setGuesses] = useState([]);
  const [current, setCurrent] = useState(Array(WORD_LENGTH).fill(""));
  const [shake, setShake] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [invalidWord, setInvalidWord] = useState(false);
  const [checking, setChecking] = useState(false);

  const activeRow = guesses.length;
  const won = guesses.some(g => g.states.every(s => s === "correct"));

  const handleSubmit = async (word) => {
    if (gameOver || checking) return;
    setChecking(true);

    const isReal = await validateWord(word);
    setChecking(false);

    if (!isReal) {
      setInvalidWord(true);
      setShake(true);
      setTimeout(() => { setShake(false); setInvalidWord(false); }, 600);
      return;
    }

    const states = scoreGuess(word, SECRET);
    const newGuesses = [...guesses, { letters: [...current], states }];
    setGuesses(newGuesses);
    setCurrent(Array(WORD_LENGTH).fill(""));

    const justWon = states.every(s => s === "correct");
    if (justWon || newGuesses.length >= MAX_GUESSES) setGameOver(true);
  };

  const handleInvalid = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  return (
    <div className="p-6">
      <GooeyNav
        items={items}
        particleCount={15}
        particleDistances={[90, 10]}
        particleR={100}
        initialActiveIndex={0}
        animationTime={600}
        timeVariance={300}
        colors={[1, 2, 3, 1, 2, 3, 1, 4]}
      />
      <Card className="max-w-xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-2">6-Letter Wordle</h1>

        <div className="flex flex-col items-center gap-2">
          {/* Submitted guesses */}
          {guesses.map((g, i) => (
            <WordleInput
              key={i}
              wordLength={WORD_LENGTH}
              value={g.letters}
              tileStates={g.states}
              disabled
            />
          ))}

          {/* Active row */}
          {!gameOver && (
            <>
              <WordleInput
                key={`active-${guesses.length}`}
                wordLength={WORD_LENGTH}
                value={current}
                onChange={setCurrent}
                onSubmit={handleSubmit}
                shake={shake}
                autoFocus
              />
              {invalidWord && (
                <p className="text-sm text-red-500 font-medium">Not a valid word!</p>
              )}
            </>
          )}

          {/* Empty rows */}
          {!gameOver && Array.from(
            { length: MAX_GUESSES - guesses.length - 1 },
            (_, i) => (
              <WordleInput
                key={`empty-${i}`}
                wordLength={WORD_LENGTH}
                value={Array(WORD_LENGTH).fill("")}
                disabled
              />
            )
          )}
        </div>

        {gameOver && (
          <p className="text-center mt-6 font-semibold">
            {won ? "You got it!" : `The word was ${SECRET}`}
          </p>
        )}
      </Card>
    </div>
  );
}
