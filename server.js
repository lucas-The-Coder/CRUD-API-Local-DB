const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DB_FILE = "./db.json";

app.use(bodyParser.json());

// Read from DB
function readData() {
  if (!fs.existsSync(DB_FILE)) return [];
  const data = fs.readFileSync(DB_FILE);
  return JSON.parse(data);
}

// Add to DB
function writeData(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Create
app.post("/items", (req, res) => {
  const items = readData();
  const newItem = { id: Date.now(), ...req.body };
  items.push(newItem);
  writeData(items);
  res.status(201).json(newItem);
});

// Read all
app.get("/items", (req, res) => {
  res.json(readData());
});

// Read one
app.get("/items/:id", (req, res) => {
  const items = readData();
  const item = items.find((i) => i.id == req.params.id);
  if (item) res.json(item);
  else res.status(404).json({ error: "Not found" });
});

// Update
app.put("/items/:id", (req, res) => {
  let items = readData();
  const index = items.findIndex((i) => i.id == req.params.id);
  if (index === -1) return res.status(404).json({ error: "Not found" });

  items[index] = { ...items[index], ...req.body };
  writeData(items);
  res.json(items[index]);
});

// Delete
app.delete("/items/:id", (req, res) => {
  let items = readData();
  const filtered = items.filter((i) => i.id != req.params.id);
  if (filtered.length === items.length)
    return res.status(404).json({ error: "Not found" });

  writeData(filtered);
  res.json({ message: "Deleted successfully" });
});

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);

app.get("/", (req, res) => {
  res.send("Welcome to my CRUD API! Try GET /items");
});
