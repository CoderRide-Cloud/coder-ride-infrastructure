import { useState, useCallback, useRef } from "react";
import { tagApi } from "@/lib/api";

// debounce utility
const debounce = (fn: Function, delay: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};

// filter tags
function filterTags(suggestedNames: string[], filterText: string) {
    const filtered = suggestedNames.filter((tag: string) => 
        tag.toLowerCase().includes(filterText.toLowerCase())
    );

    return filtered;
}

// --- hook ---
export const useTagSuggestions = () => {
  const [tagSearchResults, setTagSearchResults] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);

  const fetchSuggestions = async (query: string, currentTags: string[]) => {
    if (query.length < 2) {
      setTagSearchResults([]);
      return;
    }
    try {
      const res = await tagApi.search(query);
      const tagNames = res.data.map((t: { name: string }) => t.name);
      const filtered = filterTags(tagNames, query);
      setTagSearchResults(filtered);
      setShowSuggestions(true);
    } catch (err) {
      console.error("Tag suggestion fetch error:", err);
      setTagSearchResults([]);
    }
  };

  const debouncedFetchSuggestions = useCallback(
    debounce(fetchSuggestions, 300),
    []
  );

  return {
    tagInputRef,
    tagSearchResults,
    showSuggestions,
    setShowSuggestions,
    debouncedFetchSuggestions,
  };
};
