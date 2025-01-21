import express from "express";
import Exercise from "../models/Exercise.js";
import mongoose from "mongoose";

const router = express.Router();

// Collection route (GET /exercises)
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
    try {
        const exercises = await Exercise.find({});
        res.json({
            items: exercises.map(exerciseList), // Transformed items
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
    res.header("Allow", "GET,POST,OPTIONS");
    res.status(204).send(); // No Content response
});

// PUT route to edit an existing exercise
router.put("/:id", async (req, res) => {
    try {
        const id = req.params.id;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        const { title, muscles, description } = req.body;

        // Ensure at least one field is provided for update
        if (!title && !muscles && !description) {
            return res.status(400).json({
                error: "At least one field (title, muscles, description) must be provided to update",
            });
        }

        // Find and update the document
        const updatedExercise = await Exercise.findByIdAndUpdate(
            id,
            { title, muscles, description },
            { new: true, runValidators: true } // Return the updated document
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
    try {
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const exercise = await Exercise.findById(req.params.id);

        if (!exercise) {
            return res.status(404).json({ error: "Exercise not found" });
        }

        // Add the correct _links object
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

router.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;

        // Valideer ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        // Zoek en verwijder de oefening
        const deletedExercise = await Exercise.findByIdAndDelete(id);

        if (!deletedExercise) {
            return res.status(404).json({ error: "Exercise not found" });
        }

        // Stuur een correcte status en respons terug
        res.status(200).json({
            message: "Exercise successfully deleted",
            deletedExercise, // Optioneel: de verwijderde oefening teruggeven
        });
    } catch (e) {
        console.error("Error in DELETE route:", e.message);
        res.status(400).json({ error: "Internal Server Error" });
    }
});






export default router;
