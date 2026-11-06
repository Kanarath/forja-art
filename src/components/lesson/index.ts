// Componentes disponibles dentro de cualquier lección .mdx SIN tener que importarlos.
// La página de lección los pasa a MDX con <Content components={lessonComponents} />.
import Block from "./Block.astro";
import Step from "./Step.astro";
import Keys from "./Keys.astro";
import Why from "./Why.astro";
import Tip from "./Tip.astro";
import Warn from "./Warn.astro";
import ToolNote from "./ToolNote.astro";
import Sprite from "./Sprite.astro";
import Mistake from "./Mistake.astro";
import Checklist from "./Checklist.astro";
import Quiz from "./Quiz.astro";

export const lessonComponents = { Block, Step, Keys, Why, Tip, Warn, ToolNote, Sprite, Mistake, Checklist, Quiz };
