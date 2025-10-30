import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import mainRoute from "./routes/mainRoute.js";
import ejsMate from "ejs-mate";

const app = express();
const port = 3000;


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// HTML templates
app.engine('ejs',ejsMate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

// CSS/JS/IMAGES static files
app.use(express.static(path.join(__dirname,"public")));

app.use("/",mainRoute);
app.listen(port,()=>
console.log(`Server running on http://localhost:${port}`)
);