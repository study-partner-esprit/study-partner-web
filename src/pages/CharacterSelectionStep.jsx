import React from "react";
import { useNavigate } from "react-router-dom";
import CharacterSelector from "../components/Characters/CharacterSelector/CharacterSelector";

function CharacterSelectionStep() {
  const navigate = useNavigate();

  const handleCharacterSelected = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background pt-24 px-6 md:px-12 text-foreground">
      <div className="max-w-6xl mx-auto">
        <CharacterSelector onCharacterSelected={handleCharacterSelected} />
      </div>
    </div>
  );
}

export default CharacterSelectionStep;
