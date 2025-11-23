import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./components/Dashboard";
import { Whiteboard } from "./components/Whiteboard";
import { Heart } from "lucide-react";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    // Check if user name is already stored
    const storedName = localStorage.getItem("userName");

    if (!storedName) {
      // Prompt user for their name on first visit
      const name = prompt("Welcome! What's your name?");
      if (name && name.trim()) {
        localStorage.setItem("userName", name.trim());
      }
    }
  }, []);

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/folder/:folderId" element={<Dashboard />} />
            <Route path="/board/:boardId" element={<Whiteboard />} />
          </Routes>
        </div>

        <footer className="py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-8 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <span>Made with</span>
              <Heart className="w-4 h-4 fill-red-500 text-red-500" />
              <span>by</span>
              <a
                href="https://github.com/avirooppaul"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                Avi
              </a>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
