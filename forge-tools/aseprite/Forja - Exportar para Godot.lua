-- FORJA//ART · Forge Tools · Exportar para Godot
-- Exporta el sprite activo como una hoja horizontal (un frame detrás de otro) más su JSON, junto al
-- archivo .aseprite, y te dice qué poner en Godot: hframes, FPS y bucle por etiqueta.
-- Usa las capas visibles, sin recortar ni añadir márgenes: cada frame mide lo mismo que el lienzo.
-- Licencia MIT. Probado con la API de scripts de Aseprite 1.3 (verifica en tu versión).

local spr = app.activeSprite
if not spr then return app.alert("Abre un sprite primero.") end
if not app.fs.isFile(spr.filename) then
  return app.alert("Guarda el sprite antes (Ctrl+S): la hoja se crea en la misma carpeta.")
end

local base = app.fs.filePathAndTitle(spr.filename)
local png, json = base .. "_hoja.png", base .. "_hoja.json"

app.command.ExportSpriteSheet {
  ui = false,
  askOverwrite = false,
  type = SpriteSheetType.HORIZONTAL,
  textureFilename = png,
  dataFilename = json,
  dataFormat = SpriteSheetDataFormat.JSON_ARRAY,
  borderPadding = 0, shapePadding = 0, innerPadding = 0,
  trim = false,
  openGenerated = false,
}

-- Duraciones: Godot usa FPS por animación, así que avisamos si los frames no duran lo mismo
local n = #spr.frames
local total, minD, maxD = 0, math.huge, 0
for _, f in ipairs(spr.frames) do
  total = total + f.duration
  minD = math.min(minD, f.duration)
  maxD = math.max(maxD, f.duration)
end
local fps = math.floor(n / total + 0.5)

local dlg = Dialog("Forja · Exportado para Godot")
dlg:label { text = "Hoja: " .. app.fs.fileName(png) .. "   ·   Datos: " .. app.fs.fileName(json) }
dlg:newrow()
dlg:label { text = string.format("%d frames de %d×%d px en una fila.", n, spr.width, spr.height) }
dlg:newrow()
dlg:separator { text = "En Godot" }
dlg:label { text = string.format("Sprite2D: Animation → hframes = %d, vframes = 1.", n) }
dlg:newrow()
dlg:label { text = "Importa el PNG con el filtro Nearest (sin suavizado)." }
dlg:newrow()
if maxD - minD < 0.001 then
  dlg:label { text = string.format("Todos los frames duran %d ms → FPS = %d en SpriteFrames.", math.floor(minD * 1000 + 0.5), fps) }
else
  dlg:label { text = string.format("Los frames duran entre %d y %d ms: FPS medio %d.", math.floor(minD * 1000 + 0.5), math.floor(maxD * 1000 + 0.5), fps) }
  dlg:newrow()
  dlg:label { text = "Para respetar el timing, ajusta la duración de cada frame en SpriteFrames o repite frames." }
end
if #spr.tags > 0 then
  dlg:separator { text = "Etiquetas (una animación cada una)" }
  for _, t in ipairs(spr.tags) do
    dlg:label { text = string.format("«%s»: frames %d a %d (en Godot, %d a %d).", t.name, t.fromFrame.frameNumber, t.toFrame.frameNumber, t.fromFrame.frameNumber - 1, t.toFrame.frameNumber - 1) }
    dlg:newrow()
  end
end
dlg:button { text = "Vale", focus = true }
dlg:show()
