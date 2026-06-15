const http = require("http");
const fs = require("fs");

const PORT = 3000;
const FILE = "students.json";

// Read students
function readData() {
  try {
    const data = fs.readFileSync(FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Save students
function writeData(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// Create server
const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");

  // GET all students
  if (req.method === "GET" && req.url === "/students") {
    const students = readData();
    res.end(JSON.stringify(students));
  }
  
  // GET student by ID
  else if (req.method === "GET" && req.url.startsWith("/students/")) {
    const id = Number(req.url.split("/")[2]);
    const students = readData();
    const student = students.find(s => s.id === id);
    
    if (student) {
      res.end(JSON.stringify(student));
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ message: "Student not found" }));
    }
  }
  
  // POST add student
  else if (req.method === "POST" && req.url === "/students") {
    let body = "";
    req.on("data", chunk => {
      body += chunk.toString();
    });
    
    req.on("end", () => {
      const students = readData();
      const newStudent = JSON.parse(body);
      newStudent.id = students.length > 0 ? students[students.length - 1].id + 1 : 1;
      students.push(newStudent);
      writeData(students);
      res.statusCode = 201;
      res.end(JSON.stringify({ message: "Student added", student: newStudent }));
    });
  }
  
  // PUT update student
  else if (req.method === "PUT" && req.url.startsWith("/students/")) {
    const id = Number(req.url.split("/")[2]);
    let body = "";
    req.on("data", chunk => {
      body += chunk.toString();
    });
    
    req.on("end", () => {
      const students = readData();
      const index = students.findIndex(s => s.id === id);
      
      if (index === -1) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ message: "Student not found" }));
      }
      
      const updatedStudent = JSON.parse(body);
      updatedStudent.id = id;
      students[index] = updatedStudent;
      writeData(students);
      res.end(JSON.stringify({ message: "Student updated", student: updatedStudent }));
    });
  }
  
  // DELETE student
  else if (req.method === "DELETE" && req.url.startsWith("/students/")) {
    const id = Number(req.url.split("/")[2]);
    const students = readData();
    const newStudents = students.filter(student => student.id !== id);
    
    if (students.length === newStudents.length) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ message: "Student not found" }));
    }
    
    writeData(newStudents);
    res.end(JSON.stringify({ message: "Student deleted" }));
  }
  
  // Wrong route
  else {
    res.statusCode = 404;
    res.end(JSON.stringify({ message: "Invalid route" }));
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
