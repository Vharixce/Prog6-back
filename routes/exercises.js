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
            href: `${process.env.LOCALURL}/exercises/${exercise._id}`
        },
        collection: {
            href: `${process.env.LOCALURL}/exercises`
        }

    }
});


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

// PUT route voor het bewerken van een bestaande oefening
router.put("/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        const { title, muscles, description } = req.body;

        if (!title && !muscles && !description) {
            return res.status(400).json({ error: "At least one field (title, muscles, description) must be provided to update" });
        }

        const updatedExercise = await Exercise.findByIdAndUpdate(
            req.params.id,
            { title, muscles, description },
            { new: true, runValidators: true }
        );

        if (!updatedExercise) {
            return res.status(404).json({ error: "Exercise not found" });
        }

        res.json(updatedExercise);
    } catch (e) {
        console.error(e);
        res.status(400).json({ error: e.message });
    }
});




// Detail route (GET /exercises/:id)
router.get("/:id", async (req, res) => {
    try {
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const exercise = await Exercise.findById(req.params.id);

        if (!exercise) {
            return res.status(404).json({ error: "Exercise not found" });
        }

        // Voeg het correcte _links-object toe
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


// POST route for seeding database (POST /exercises/seed)
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

export default router;
