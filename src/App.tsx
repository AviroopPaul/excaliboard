import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./components/Dashboard";
import { Whiteboard } from "./components/Whiteboard";
import { Modal } from "./components/Modal";
import { Heart } from "lucide-react";
import { useState } from "react";

function App() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(() => {
    // Check if user name is already stored
    const storedName = localStorage.getItem("userName");
    // Show welcome modal on first visit if no name is stored
    return !storedName;
  });

  const handleWelcomeConfirm = (name: string) => {
    localStorage.setItem("userName", name);
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event("userNameUpdated"));
  };

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/folder/:folderId" element={<Dashboard />} />
            <Route path="/board/:boardId" element={<Whiteboard />} />
          </Routes>
        </div>

        <footer className="py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-8 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
              <span>Made with</span>
              <Heart className="w-4 h-4 fill-red-500 text-red-500" />
              <span>by</span>
              <a
                href="https://github.com/avirooppaul"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
              >
                Avi
              </a>
            </div>
          </div>
        </footer>
      </div>

      <Modal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        onConfirm={handleWelcomeConfirm}
        title="Welcome! 👋"
        placeholder="Enter your name"
        confirmText="Get Started"
      />
    </BrowserRouter>
  );
}

export default App;
