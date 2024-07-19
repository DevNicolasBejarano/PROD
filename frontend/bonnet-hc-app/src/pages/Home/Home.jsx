import React from "react";
import Navbar from "../../components/Navbar/Navbar";
import PantientCard from "../../components/Cards/PantientCard";

const Home = () => {
  return (
    <>
      <Navbar />
      <div className="container mx-auto">
        <PantientCard
          title="Bejarano Montes Nicolas Orlando"
          date="26/02/2024"
          content="Histórico de consultas:"
          tags="HCE"
          isPinned={true}
          onEdit={() =>{}}
          onDelete={() =>{}}
          onPinPatient={() =>{}}
        />
      </div>
    </>
  );
};

export default Home;
