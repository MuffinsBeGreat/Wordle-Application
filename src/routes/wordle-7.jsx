// 7-letter wordle game - basically guess the word but make it hard
import { Card } from "@/components/ui/card";
import WordleInput from "@/components/WordleInput";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GooeyNav from "@/components/GooeyNav";

const WORD_LENGTH = 7; // 3, 4, 5, 6, or 7
const MAX_GUESSES = WORD_LENGTH + 1;

// compares your guess to the actual word and returns whether letters are correct, present, or wrong
function scoreGuess(guess, secret) {
  const result = Array(secret.length).fill("absent");
  const used = Array(secret.length).fill(false);

  for (let i = 0; i < secret.length; i++) {
    if (guess[i] === secret[i]) {
      result[i] = "correct";
      used[i] = true;
    }
  }

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

// checks if the word is actually a real word using the dictionary API
const validateWord = async (word) => {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
    return res.ok;
  } catch {
    return false;
  }
};

// main game component - handles all the game logic
export default function Wordle7() { // rename to Wordle3, Wordle4, etc.
  const [secret, setSecret] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [current, setCurrent] = useState(Array(WORD_LENGTH).fill(""));
  const [shake, setShake] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [invalidWord, setInvalidWord] = useState(false);
  const [checking, setChecking] = useState(false);

  const nav = useNavigate();

  const loadWord = () => {
    setLoading(true);
    setError(null);
    fetch(`/api/words/random?length=${WORD_LENGTH}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.word) {
          setSecret(data.word);
        } else {
          setError("Could not load a word. Please try again.");
        }
      })
      .catch(() => setError("Could not load a word. Please try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadWord();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    nav("/");
  };

  const items = [
    { label: "Home", href: "/dashboard" },
    { label: "Search", href: "/search" },
    { label: "Logout", href: "/", onClick: handleLogout },
  ];

  const won = guesses.some((g) => g.states.every((s) => s === "correct"));

  // when user submits a word - validate it, score it, and check if they won
  const handleSubmit = async (word) => {
    if (gameOver || checking || !secret) return;
    setChecking(true);

    const isReal = await validateWord(word);
    setChecking(false);

    if (!isReal) {
      setInvalidWord(true);
      setShake(true);
      setTimeout(() => { setShake(false); setInvalidWord(false); }, 600);
      return;
    }

    const states = scoreGuess(word, secret);
    const newGuesses = [...guesses, { letters: [...current], states }];
    setGuesses(newGuesses);
    setCurrent(Array(WORD_LENGTH).fill(""));

    const justWon = states.every((s) => s === "correct");
    if (justWon || newGuesses.length >= MAX_GUESSES) setGameOver(true);
  };

  // resets everything and loads a new word - basically start over
  const handleNewGame = () => {
    setGuesses([]);
    setCurrent(Array(WORD_LENGTH).fill(""));
    setGameOver(false);
    setShake(false);
    setInvalidWord(false);
    loadWord();
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
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
      <br />
      <Card className="max-w-xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-2">7-Letter Wordle</h1>

        {loading && (
          <p className="text-center text-muted-foreground py-8">Loading word...</p>
        )}

        {error && (
          <p className="text-center text-red-500 py-8">{error}</p>
        )}

        {!loading && !error && (
          <div className="flex flex-col items-center gap-2">
            {guesses.map((g, i) => (
              <WordleInput
                key={i}
                wordLength={WORD_LENGTH}
                value={g.letters}
                tileStates={g.states}
                disabled
              />
            ))}

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
        )}

        {gameOver && (
          <div className="text-center mt-6 space-y-3">
            <p className="font-semibold">
              {won ? "You got it!" : `The word was ${secret}`}
            </p>
            <button
              onClick={handleNewGame}
              className="px-4 py-2 rounded bg-primary text-primary-foreground hover:opacity-90 transition"
            >
              Play Again
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}