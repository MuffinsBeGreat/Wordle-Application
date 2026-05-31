import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import "./SearchBar.css";

export default function SearchBar({ onSelect }) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!input) {
      setSuggestions([]);
      return;
    }

    // debounce so we don’t spam PHP
    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      fetch(`/api/search?q=${input}`)
        .then((res) => res.json())
        .then((data) => {
          setSuggestions(data);
          setShowDropdown(true);
        })
        .catch((err) => console.error(err));
    }, 250);

    return () => clearTimeout(timeoutRef.current);
  }, [input]);

  const handleSelect = (item) => {
    setInput(item.word);
    setShowDropdown(false);
    setSuggestions([]);

    if (typeof onSelect === "function") {
      onSelect(item);
    }
  };

  return (
    <div className="search-wrapper">
      <input
        className="search-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search words..."
        onFocus={() => setShowDropdown(true)}
      />

      {showDropdown && suggestions.length > 0 && (
        <ul className="dropdown">
          {suggestions.map((item) => (
            <li key={item.word} className="dropdown-item">
              <button
                type="button"
                className="w-full text-left"
                onClick={() => handleSelect(item)}
              >
                <strong>{item.word}</strong>
                <span>{item.description}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

SearchBar.propTypes = {
  onSelect: PropTypes.func,
};