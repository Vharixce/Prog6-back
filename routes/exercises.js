import express from "express";
import Exercise from "../models/Exercise.js";
import mongoose from "mongoose";

const router = express.Router();

// Helper voor het transformeren van een oefening
const exerciseList = (exercise) => ({
    id: exercise._id,
    title: exercise.title,
    muscles: exercise.muscles,
    description: exercise.description,
    _links: {
        self: {
            href: `${process.env.LOCALURL}/exercises/${exercise._id}`,
        },
        collection: {
            href: `${process.env.LOCALURL}/exercises`,
        },
    },
});

// GET all exercises
router.get("/", async (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    try {
        const exercises = await Exercise.find({});
        res.json({
            items: exercises.map(exerciseList),
            _links: {
                self: {
                    href: `${process.env.LOCALURL}/exercises`,
                },
                collection: {
                    href: `${process.env.LOCALURL}/exercises`,
                },
            },
        });
    } catch (e) {
        console.error(e);
        res.status(400).json({ error: e.message });
    }
});

// OPTIONS route for /exercises
router.options("/", (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', '*')
    res.header("Allow", "GET,POST,OPTIONS");
    res.status(204).send(); // No Content response
});

// OPTIONS route for /exercises/:id
router.options("/:id", (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', '*')
    res.header("Allow", "GET,PUT,DELETE,OPTIONS");
    res.status(204).send();
});

// PUT route to edit an existing exercise
router.put("/:id", async (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    try {
        const id = req.params.id;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        const { title, muscles, description } = req.body;

        if (!title && !muscles && !description) {
            return res.status(400).json({
                error: "At least one field (title, muscles, description) must be provided to update",
            });
        }

        const updatedExercise = await Exercise.findByIdAndUpdate(
            id,
            { title, muscles, description },
            { new: true, runValidators: true }
        );

        if (!updatedExercise) {
            return res.status(404).json({ error: "Exercise not found" });
        }

        res.json(updatedExercise);
    } catch (e) {
        console.error("Error in PUT route:", e.message);
        res.status(400).json({ error: "Internal Server Error" });
    }
});

// GET exercise by ID
router.get("/:id", async (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    try {
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const exercise = await Exercise.findById(req.params.id);

        if (!exercise) {
            return res.status(404).json({ error: "Exercise not found" });
        }

        res.json({
            ...exercise.toJSON(),
            _links: {
                self: {
                    href: `${baseUrl}/exercises/${exercise._id}`,
                },
                collection: {
                    href: `${baseUrl}/exercises`,
                },
            },
        });
    } catch (e) {
        console.error(e);
        res.status(400).json({ error: e.message });
    }
});

// POST route to create a new exercise
router.post("/", async (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    try {
        const { title, muscles, description } = req.body;

        if (!title || !muscles || !description) {
            return res.status(400).json({ error: "Title, muscles, and description are required" });
        }

        const exercise = await Exercise.create({
            title,
            muscles,
            description,
        });

        res.status(201).json(exercise);
    } catch (e) {
        console.error(e);
        res.status(400).json({ error: e.message });
    }
});

// DELETE route to remove an exercise
router.delete("/:id", async (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        const deletedExercise = await Exercise.findByIdAndDelete(id);

        if (!deletedExercise) {
            return res.status(404).json({ error: "Exercise not found" });
        }

        return res.status(204).send(); // No Content
    } catch (e) {
        console.error("Error in DELETE route:", e.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
