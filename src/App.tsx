import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Photo from "./pages/Photo";
import Admin from "./pages/Admin";
import Modal from "./components/Modal";
import images from "./data/images.json";
import type { ImageProps } from "./utils/types";

function App() {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location };

  return (
    <>
      {/* Main content - Always visible */}
      <Routes location={state?.backgroundLocation || location}>
        <Route path="/" element={<Home />} />
        <Route path="/p/:photoId" element={<Photo />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>

      {/* Modal - Shows ON TOP if we have a background state */}
      {state?.backgroundLocation && (
        <Routes>
          <Route 
            path="/p/:photoId" 
            element={
              <Modal 
                images={images as ImageProps[]} 
              />
            } 
          />
        </Routes>
      )}
    </>
  );
}

export default App;
