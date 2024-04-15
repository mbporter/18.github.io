const express = require("express");
const app = express();
const Joi = require("joi");
const multer = require("multer");
const cors = require("cors");
const mongoose = require("mongoose");

app.use(cors());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads")); // Serve uploaded images

app.use(express.json());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/images/");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage: storage });

mongoose
    .connect("mongodb+srv://Mbporter:<Darcy123123>@cluster0.sefh4en.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => console.log("Connected to MongoDB..."))
    .catch((err) => console.error("Could not connect to MongoDB...", err));

const craftSchema = new mongoose.Schema({
    name: String,
    img: String,
    description: String,
    supplies: [String]
});

const Craft = mongoose.model("Craft", craftSchema);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/api/crafts", async (req, res) => { // Fixed endpoint URL
    try {
        const crafts = await Craft.find();
        res.send(crafts);
    } catch (error) {
        console.error("Error fetching crafts:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/api/crafts/:id", async (req, res) => { // Fixed endpoint URL
    try {
        const craft = await Craft.findById(req.params.id);
        if (!craft) return res.status(404).send("Craft not found");
        res.send(craft);
    } catch (error) {
        console.error("Error fetching craft:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/api/crafts", upload.single("img"), async (req, res) => {
    const result = validateCraft(req.body);

    if (result.error) {
        res.status(400).json({ errors: result.error.details.map(detail => detail.message) });
        return;
    }

    const craft = new Craft({
        name: req.body.name,
        description: req.body.description,
        supplies: req.body.supplies.split(","),
    });

    if (req.file) {
        craft.img = req.file.filename;
    }

    try {
        const savedCraft = await craft.save();
        res.send(savedCraft);
    } catch (error) {
        console.error("Error creating craft:", error);
        res.status(500).send("Internal Server Error");
    }
});

// PUT and DELETE endpoints remain unchanged

const validateCraft = (craft) => {
    const schema = Joi.object({
        _id: Joi.allow(""),
        supplies: Joi.allow(""),
        name: Joi.string().min(3).required(),
        description: Joi.string().min(3).required(),
    });
    return schema.validate(craft);
};

app.listen(3000, () => {
    console.log("Serving port 3000");
});
