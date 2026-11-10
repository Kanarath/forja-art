-- FORJA//ART · Forge Tools · Rampa en grises
-- Mide el VALOR (luminancia percibida, Rec. 709, la misma fórmula que la academia) de los colores
-- seleccionados en el panel de paleta, en el orden en que están. Si no hay al menos dos seleccionados,
-- usa la paleta entera. Avisa si dos pasos seguidos están demasiado cerca o si la rampa no va en un
-- solo sentido, y puede crear un sprite nuevo con las muestras en color y en grises para compararlas.
-- Licencia MIT. Probado con la API de scripts de Aseprite 1.3 (verifica en tu versión).

local spr = app.activeSprite
if not spr then return app.alert("Abre un sprite primero.") end
local pal = spr.palettes[1]

local indices = {}
local sel = app.range.colors
if sel and #sel >= 2 then
  for _, i in ipairs(sel) do table.insert(indices, i) end
  table.sort(indices)
else
  for i = 0, #pal - 1 do table.insert(indices, i) end
end
if #indices > 32 then
  return app.alert("Selecciona en el panel de paleta los colores de UNA rampa (entre 2 y 32).")
end

local function luma(c) return (0.2126 * c.red + 0.7152 * c.green + 0.0722 * c.blue) / 255 * 100 end

local MIN_STEP = 8 -- por debajo de 8 puntos, dos pasos casi no se distinguen en grises
local values, lines, warnings = {}, {}, {}
for k, i in ipairs(indices) do
  local c = pal:getColor(i)
  values[k] = luma(c)
  table.insert(lines, string.format("%3d  #%02x%02x%02x   valor %3d %%", i, c.red, c.green, c.blue, math.floor(values[k] + 0.5)))
end
local dir = 0
for k = 2, #values do
  local d = values[k] - values[k - 1]
  if math.abs(d) < MIN_STEP then
    table.insert(warnings, string.format("Los colores %d y %d están a solo %d puntos de valor.", indices[k - 1], indices[k], math.floor(math.abs(d) + 0.5)))
  end
  local s = d > 0 and 1 or (d < 0 and -1 or 0)
  if s ~= 0 then
    if dir ~= 0 and s ~= dir then
      table.insert(warnings, string.format("La rampa cambia de sentido en el color %d: debería ir siempre de oscuro a claro (o al revés).", indices[k]))
    end
    dir = s
  end
end

local function makeSwatches()
  local S = 8
  local out = Sprite(#indices * S, S * 2, ColorMode.RGB)
  local im = out.cels[1].image
  for k, i in ipairs(indices) do
    local c = pal:getColor(i)
    local g = math.floor(values[k] / 100 * 255 + 0.5)
    for y = 0, S - 1 do
      for x = 0, S - 1 do
        im:drawPixel((k - 1) * S + x, y, Color { r = c.red, g = c.green, b = c.blue })
        im:drawPixel((k - 1) * S + x, S + y, Color { r = g, g = g, b = g })
      end
    end
  end
  app.refresh()
end

local dlg = Dialog("Forja · Rampa en grises")
for _, l in ipairs(lines) do dlg:label { text = l } dlg:newrow() end
dlg:separator()
if #warnings == 0 then
  dlg:label { text = "La rampa va en un solo sentido y cada paso se distingue." }
  dlg:newrow()
else
  for _, w in ipairs(warnings) do dlg:label { text = "⚠ " .. w } dlg:newrow() end
end
dlg:button { text = "Crear muestras en grises", onclick = function() dlg:close() makeSwatches() end }
dlg:button { text = "Cerrar", focus = true }
dlg:show()
