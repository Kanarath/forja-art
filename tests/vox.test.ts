// Tests del formato .vox. Ejecuta: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { writeVox, readVox } from "../src/lib/voxel/vox.mjs";

test("un .vox se lee igual que se escribió (posiciones y colores)", () => {
  const voxels = [{ x: 0, y: 0, z: 0, c: "#ff0000" }, { x: 2, y: 1, z: 3, c: "#00ff00" }, { x: 1, y: 1, z: 1, c: "#ff0000" }];
  const back = readVox(writeVox(voxels));
  assert.deepEqual(back.size, { x: 3, y: 2, z: 4 });
  const key = (v: { x: number; y: number; z: number; c: string }) => `${v.x},${v.y},${v.z},${v.c}`;
  assert.deepEqual(back.voxels.map(key).sort(), voxels.map(key).sort());
});

test("las coordenadas negativas se desplazan al origen", () => {
  const back = readVox(writeVox([{ x: -3, y: -1, z: 0, c: "#123456" }, { x: 0, y: 0, z: 2, c: "#123456" }]));
  assert.deepEqual(back.size, { x: 4, y: 2, z: 3 });
});

test("el archivo empieza por la firma VOX y la versión 150", () => {
  const f = writeVox([{ x: 0, y: 0, z: 0, c: "#ffffff" }]);
  assert.equal(String.fromCharCode(...f.slice(0, 4)), "VOX ");
  assert.equal(new DataView(f.buffer).getUint32(4, true), 150);
  assert.throws(() => readVox(new Uint8Array(16)), /No es un archivo .vox/);
});
