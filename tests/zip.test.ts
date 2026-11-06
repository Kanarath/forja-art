// Tests del zip de la copia de seguridad. Ejecuta: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { createZip, readZip, crc32, textEntry, entryText } from "../src/lib/zip.ts";

test("crc32 coincide con el valor de referencia", () => {
  assert.equal(crc32(new TextEncoder().encode("123456789")), 0xcbf43926);
});

test("un zip se lee igual que se escribió (ida y vuelta)", () => {
  const img = new Uint8Array([137, 80, 78, 71, 0, 255, 1, 2, 3]);
  const zip = createZip([textEntry("manifest.json", '{"ñ":"ok"}'), { name: "images/a.png", data: img }]);
  const back = readZip(zip);
  assert.equal(back.length, 2);
  assert.equal(entryText(back[0]), '{"ñ":"ok"}');
  assert.deepEqual([...back[1].data], [...img]);
});

test("un zip dañado se detecta", () => {
  const zip = createZip([textEntry("a.txt", "hola mundo")]);
  zip[35] ^= 0xff; // alteramos un byte de los datos
  assert.throws(() => readZip(zip), /dañado/);
  assert.throws(() => readZip(new Uint8Array(10)), /no es un archivo .zip/i);
});

// Compatibilidad comprobada a mano: Expand-Archive de Windows abre la copia y el PNG sale idéntico.
