// Rutas internas del sitio.
// En GitHub Pages la web vive en una subcarpeta (/forja-art/). Astro expone esa base en
// import.meta.env.BASE_URL, pero según la versión puede venir SIN barra final ("/forja-art").
// Normalizamos aquí una sola vez para que ningún enlace quede como "/forja-artpixel/".
export const BASE = import.meta.env.BASE_URL.replace(/\/?$/, "/");

/** Une la base con una ruta interna: url("pixel/") → "/forja-art/pixel/" */
export const url = (path = "") => BASE + path.replace(/^\//, "");
