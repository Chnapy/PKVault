import React from "react";
import { PokedexPage } from "./pokedex/pokedex-page";
import { SavePage } from "./saves/save-page";
import { StoragePage } from "./storage/storage-page";
import { Header } from "./ui/header/header";
import { HeaderItem } from "./ui/header/header-item";

function App() {
  const [currentPage, setCurrentPage] = React.useState<
    "pokedex" | "save" | "storage"
  >("pokedex");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        height: "100vh",
      }}
    >
      <Header>
        <HeaderItem
          selected={currentPage === "save"}
          onClick={() => setCurrentPage("save")}
        >
          Save management
        </HeaderItem>
        <HeaderItem
          selected={currentPage === "storage"}
          onClick={() => setCurrentPage("storage")}
        >
          Storage
        </HeaderItem>
        <HeaderItem
          selected={currentPage === "pokedex"}
          onClick={() => setCurrentPage("pokedex")}
        >
          Pokedex
        </HeaderItem>
      </Header>

      <div
        style={{
          position: "relative",
          overflow: "auto",
          padding: 16,
        }}
      >
        {currentPage === "save" && <SavePage />}
        {currentPage === "storage" && <StoragePage />}
        {currentPage === "pokedex" && <PokedexPage />}
      </div>
    </div>
  );
}

export default App;
