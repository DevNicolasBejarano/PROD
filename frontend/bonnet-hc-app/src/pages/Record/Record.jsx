import React from "react";
import AudioRecorder from "./AudioRecorder";
import Navbar from "../../components/Navbar/Navbar";

const Record = () => {
  return (
    <>
      <Navbar />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <header className="App-header">
          <h1>Grabación historia clínica</h1>
          <AudioRecorder />
        </header>
      </div>
    </>
  );
};

export default Record;
