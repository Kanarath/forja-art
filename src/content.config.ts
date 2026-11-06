// ESQUEMA DE CONTENIDO
// Define la forma obligatoria del frontmatter de cada lección. Si un archivo no cumple,
// el build falla con un mensaje que dice qué campo está mal: una lección rota nunca
// llega a la web.
//
// Las comprobaciones que necesitan ver VARIAS lecciones a la vez (que un prerrequisito
// exista, que no haya ids repetidos…) están en src/lib/lessons.ts.
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const TOOLS = ["aseprite", "pixelorama", "magicavoxel", "blender", "godot"] as const;
const PREFIX = { pixel: "p", voxel: "v", fundamentos: "f" } as const;

const lessons = defineCollection({
  // Un archivo .mdx por lección dentro de src/content/lessons/<disciplina>/
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/lessons" }),
  schema: z
    .object({
      id: z.string().regex(/^[pvf]\d{1,2}-\d{2}$/, "El id debe tener la forma p1-02, v0-01 o f02-01"),
      discipline: z.enum(["pixel", "voxel", "fundamentos"]),
      level: z.number().int().min(0).max(10),
      order: z.number().int().min(1),
      title: z.string().min(4),
      summary: z.string().min(10).max(200),
      duration: z.number().int().min(10).max(60), // minutos: el PRD fija 30–45, con margen
      status: z.enum(["borrador", "revisada", "publicada"]),
      prerequisites: z.array(z.string()).default([]),
      fundamentals: z.array(z.string()).default([]),
      objectives: z.array(z.string()).min(1).max(5),
      tools: z.array(z.enum(TOOLS)).min(1),
      piece: z.object({
        name: z.string(),
        canvas: z.string().optional(), // "16x16" en pixel, "16x16x16" en voxel
      }),
      xp: z.object({
        concept: z.number().int().min(0),
        guided: z.number().int().min(0),
        piece: z.number().int().min(1),
      }),
      achievements: z.array(z.string()).default([]),
      review: z
        .object({
          examplesChecked: z.boolean().default(false), // ejemplos revisados a nivel de píxel/vóxel
          shortcutsVerifiedIn: z.string().optional(), // versión del programa en la que se verificaron los atajos
          testedByLearner: z.boolean().default(false), // solo tú puedes poner esto a true
        })
        .default({}),
    })
    // Reglas que relacionan campos de la MISMA lección:
    .refine((l) => l.id.startsWith(PREFIX[l.discipline]), {
      message: "El id no coincide con la disciplina (p = pixel, v = voxel, f = fundamentos)",
      path: ["id"],
    })
    .refine((l) => l.xp.piece >= 0.6 * (l.xp.concept + l.xp.guided + l.xp.piece), {
      message: "Al menos el 60 % de la XP debe venir de registrar la pieza (regla del PRD)",
      path: ["xp", "piece"],
    })
    .refine((l) => l.status !== "publicada" || (l.review.examplesChecked && l.review.testedByLearner), {
      message: "Una lección solo puede estar «publicada» si sus ejemplos están revisados y tú la has probado",
      path: ["status"],
    }),
});

// ENCARGOS: proyectos libres que no dependen de una lección. Se completan registrando
// `count` piezas asociadas al encargo en el portfolio.
const commissions = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/commissions" }),
  schema: z.object({
    id: z.string().regex(/^c-[a-z0-9-]+$/, "El id de un encargo empieza por c-"),
    title: z.string().min(4),
    discipline: z.enum(["pixel", "voxel", "fundamentos"]),
    count: z.number().int().min(1).max(20),
    xp: z.number().int().min(10).max(500),
    difficulty: z.enum(["inicio", "medio", "avanzado"]),
    brief: z.string().min(10),
    constraints: z.array(z.string()).min(1),
    tools: z.array(z.enum(TOOLS)).min(1),
  }),
});

export const collections = { lessons, commissions };
