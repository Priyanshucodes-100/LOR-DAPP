import React from "react";
import { getContract } from "./contract";

function App() {

  async function addStudent() {

    try {

      const contract = await getContract();

      const tx = await contract.addStudent(
        1,
        "Priyanshu",
        "Blockchain",
        "priyanshu@email.com"
      );

      await tx.wait();

      alert("Student Added Successfully");

    } catch (error) {

      console.error(error);
      alert(error.message);

    }
  }

  async function viewStudent() {

    try {

      const contract = await getContract();

      const student = await contract.getStudent(1);

      alert(
        "ID: " + student.studentId +
        "\nName: " + student.name +
        "\nCourse: " + student.course +
        "\nEmail: " + student.email +
        "\nApproved: " + student.approved
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