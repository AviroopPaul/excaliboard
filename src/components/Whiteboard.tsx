import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Excalidraw, MainMenu, WelcomeScreen } from "@excalidraw/excalidraw";
import { db } from "../lib/db";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "../lib/useTheme";
import { ArrowLeft, Loader2 } from "lucide-react";

// Simple debounce implementation
function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

export function Whiteboard() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [boardName, setBoardName] = useState("");

  // Use a key to force re-mounting of Excalidraw when initialData is ready
  const [excalidrawKey, setExcalidrawKey] = useState(0);

  const loadedRef = useRef(false);

  useEffect(() => {
    if (!boardId) return;

    const loadBoard = async () => {
      try {
        const board = await db.boards.get(boardId);
        if (!board) {
          navigate("/");
          return;
        }

        setBoardName(board.name);

        // We must set initialData only once, and it must be the complete state.
        // If content exists, we load it.
        // If appState exists, we load it; otherwise we provide sensible defaults
        // to prevent "huge zoom" (which often happens when Excalidraw auto-zooms to empty content).

        const initialContent =
          board.content && board.content.length > 0 ? board.content : [];

        // Set background color based on current theme
        const backgroundColor = theme === "dark" ? "#1e1e1e" : "#ffffff";

        const initialAppState = board.appState || {
          viewBackgroundColor: backgroundColor,
          scrollX: 0,
          scrollY: 0,
          zoom: { value: 1 },
        };

        setInitialData({
          elements: initialContent,
          appState: {
            ...initialAppState,
            theme: theme,
          },
          scrollToContent: false, // Explicitly disable auto-scroll to prevent jumpiness
        });

        // Force re-render of Excalidraw component
        setExcalidrawKey((prev) => prev + 1);
      } catch (error) {
        console.error("Failed to load board", error);
      } finally {
        setLoading(false);
        loadedRef.current = true;
      }
    };
    loadBoard();
  }, [boardId, navigate, theme]);

  const saveToDb = async (elements: readonly any[], appState: any) => {
    if (!boardId) return;
    try {
      const { viewBackgroundColor, scrollX, scrollY, zoom, gridSize, theme } =
        appState;

      await db.boards.update(boardId, {
        content: elements,
        appState: {
          viewBackgroundColor,
          scrollX,
          scrollY,
          zoom,
          gridSize,
          theme,
        },
        updatedAt: Date.now(),
      });
    } catch (err) {
      console.error("Error saving board:", err);
    }
  };

  const saveToDbRef = useRef(saveToDb);
  saveToDbRef.current = saveToDb;

  const debouncedSave = useRef(
    debounce((elements: readonly any[], appState: any) => {
      saveToDbRef.current(elements, appState);
    }, 1000)
  ).current;

  const onChange = (elements: readonly any[], appState: any) => {
    if (!loadedRef.current) return;
    debouncedSave(elements, appState);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-white dark:bg-gray-900">
      <div className="h-14 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 bg-white dark:bg-gray-800 shrink-0 z-10 relative shadow-sm justify-between">
        <div className="flex items-center">
          <Link
            to="/"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full mr-3 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div className="font-semibold text-gray-800 dark:text-gray-100 truncate max-w-md">
            {boardName}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Auto-save enabled
          </div>
          <ThemeToggle />
        </div>
      </div>
      <div className="flex-1 w-full h-full relative excalidraw-wrapper">
        <Excalidraw
          key={excalidrawKey}
          initialData={initialData}
          onChange={onChange}
          theme={theme}
        >
          <MainMenu>
            <MainMenu.DefaultItems.ClearCanvas />
            <MainMenu.DefaultItems.SaveAsImage />
            <MainMenu.DefaultItems.ChangeCanvasBackground />
            <MainMenu.DefaultItems.Export />
            <MainMenu.DefaultItems.Help />
          </MainMenu>
          <WelcomeScreen>
            <WelcomeScreen.Hints.MenuHint />
            <WelcomeScreen.Hints.ToolbarHint />
            <WelcomeScreen.Center>
              <WelcomeScreen.Center.Logo>
                <img src="/favicon.png" className="w-12 h-12" />
                <h1>ExcaliBoard</h1>
              </WelcomeScreen.Center.Logo>

              <WelcomeScreen.Center.Heading>
                Best Alternative to Excalidraw+
              </WelcomeScreen.Center.Heading>
              <WelcomeScreen.Center.Menu>
                <WelcomeScreen.Center.MenuItemHelp />
              </WelcomeScreen.Center.Menu>
            </WelcomeScreen.Center>
          </WelcomeScreen>
        </Excalidraw>
      </div>
    </div>
  );
}
