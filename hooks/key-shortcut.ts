import { useEffect, useCallback } from "react";

type ModifierKey = "ctrlKey" | "altKey" | "shiftKey" | "metaKey";

type ShortcutOptions = {
  key: string;
  modifiers?: ModifierKey[];
  action: () => void;
};

const useKeyShortcut = ({ key, modifiers = [], action }: ShortcutOptions) => {
  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      const modifiersMatch = modifiers.every((mod) => e[mod]);
      if (e.key?.toLowerCase() === key.toLowerCase() && modifiersMatch) {
        action();
      }
    },
    [key, modifiers, action],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);
};

export default useKeyShortcut;
