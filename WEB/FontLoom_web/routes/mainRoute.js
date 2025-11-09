import {Router} from "express";
import { title } from "process";
import { API_BASE_URL } from "../apiConfig.js";

const router = Router()

router.use((req, res, next) => {
  res.locals.currentUrl = req.path; 
  next();
});

router.get("/get-api-url", (req, res) => {
  // res.json({ apiUrl: "http://localhost:8000" });
  res.json({ apiUrl: "https://fontloom-model.onrender.com" });
});

router.get("/", (req, res) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.url}`);
  res.render("home", { title: "FontLoom | evokes craftsmanship and creativity", currentUrl: "/" });
});


router.get("/gallery", async (req, res) => {
  const content = { title: "Font Gallery | FontLoom", currentUrl: req.path,galleryData:[] };

  try {
      
    const response = await fetch(`https://fontloom-model.onrender.com/api/gallery`);
    // const response = await fetch(`${API_BASE_URL}/api/gallery`);
    if (!response.ok) throw new Error("Failed to fetch gallery data");

    const apiData = await response.json();
    content.galleryData = apiData.gallery_data; 
    
  } catch (error) {
    console.error("Error fetching gallery data:", error);
  }
  console.log(`${new Date().toISOString()} | ${req.method} ${req.url}`);
  res.render("gallery", content);
});


router.get("/personalization",(req,res)=>{
    const content = {
        title:"Personalization Picks  | FontLoom",currentUrl:req.path
    }
    console.log(`${new Date().toISOString()} | ${req.method} ${req.url}`);
    res.render("personalized",content);
});


router.get("/recommendation",(req,res)=>{
    const content = {
        title:"Select your Font  | FontLoom",currentUrl:req.path
    }
    console.log(`${new Date().toISOString()} | ${req.method} ${req.url}`);
    res.render("generator",content);
});

export default router;