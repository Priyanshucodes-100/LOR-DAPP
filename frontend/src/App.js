import React from "react";
import { getContract } from "./contract";

function App() {

  async function addStudent() {

    try {

      const contract = await getContract();

      console.log("Using contract:", contract.address);

      const tx = await contract.addStudent(
        "Priyanshu",
        "Blockchain",
        "priyanshu@email.com"
      );

      console.log("Transaction hash:", tx.hash);

      await tx.wait();

      alert("Student Added Successfully");

    } catch (error) {

      console.error("Add student error:", error);

      alert("Error: " + error.message);

    }
  }

  async function viewStudent() {

  try {

    const contract = await getContract();

    const student = await contract.getStudent(1);

    alert(
      "ID: " + student[0] +
      "\nName: " + student[1] +
      "\nCourse: " + student[2] +
      "\nEmail: " + student[3] +
      "\nRequested: " + student[4] +
      "\nApproved: " + student[5]
    );

  } catch (error) {

    console.error(error);
    alert(error.message);

  }
}

  return (
    <div style={{ padding: "20px" }}>

      <h1>LoR DApp</h1>

      <button onClick={addStudent}>
        Add Student
      </button>

      <br /><br />

      <button onClick={viewStudent}>
        View Student
      </button>

    </div>
  );
}

export default App;