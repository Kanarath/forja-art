# FORJA//ART — Registro de decisiones

Decisiones tomadas después del PRD. Cada entrada: qué se decidió, por qué y qué implica.

## D13 · Dirección visual del dashboard (2026-11-06, tarea 1.2)

**Decisión:** la maqueta **A · La Forja** es la base, con dos ideas de la **B · Estudio**:
- **Paleta de logros**: cada logro es una muestra de color que se «pinta» al conseguirlo.
- **Portfolio como línea de tiempo**: tus piezas en fila, como los frames de una animación.

**Por qué:** A es la más clara y motivadora y sigue la línea de Forja Mecha. Las dos ideas de B hacen que la interfaz hable el idioma de las herramientas creativas sin la densidad de un editor completo.

**Implica:**
- Base grafito con acentos por disciplina: pixel magenta/ámbar, voxel cian/turquesa, fundamentos oro.
- PIXEL FORGE: bordes duros, sombra escalonada sin desenfoque, rótulos en fuente pixel (Silkscreen, OFL).
- VOXEL FORGE: sombras suaves y miniaturas isométricas.
- Las maquetas quedan en `/maquetas/` como referencia (no indexadas).

## D14 · Qué lecciones se ven en producción (2026-11-06, tarea 1.4)

**Decisión:**
- `borrador`: solo en local (`npm run dev`).
- `revisada`: también en la web, con la etiqueta **«En prueba»**.
- `publicada`: en la web, sin etiqueta. Exige `review.examplesChecked` y `review.testedByLearner`.

**Por qué:** el PRD decía «solo publicadas en producción», pero para publicar una lección tienes que haberla probado, y lo natural es probarla en la web. Sin este cambio sería un círculo cerrado.

**Implica:** el esquema impide marcar `publicada` sin las dos casillas de revisión.
