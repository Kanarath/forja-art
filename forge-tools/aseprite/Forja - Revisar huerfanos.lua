-- FORJA//ART · Forge Tools · Revisar huérfanos y clusters
-- Analiza la capa activa en el frame actual con las mismas reglas que el inspector de la academia:
--   · HUÉRFANO: un píxel que no toca ningún píxel de su color, ni por los lados ni en diagonal.
--   · SUELTO:   no toca ninguno de su color por los lados (quizá sí en diagonal).
--   · CLUSTER:  un grupo de píxeles del mismo color unidos por los lados. Muchos de 1–2 px = ruido.
-- Crea una capa «forja-revision» con los huérfanos en magenta y los sueltos en cian. Se deshace con Ctrl+Z.
-- Licencia MIT. Probado con la API de scripts de Aseprite 1.3 (verifica en tu versión).

local spr = app.activeSprite
if not spr then return app.alert("Abre un sprite primero.") end
local cel = app.activeCel
if not cel then return app.alert("La capa activa no tiene píxeles en este frame. Elige una capa con dibujo.") end

local img = cel.image
local pc = app.pixelColor
local mode = img.colorMode

-- Convierte un valor de píxel en una «clave de color», o nil si es transparente.
local function key(v)
  if mode == ColorMode.RGB then
    if pc.rgbaA(v) < 128 then return nil end
    return pc.rgba(pc.rgbaR(v), pc.rgbaG(v), pc.rgbaB(v), 255)
  elseif mode == ColorMode.GRAYSCALE then
    if pc.grayaA(v) < 128 then return nil end
    return pc.grayaV(v)
  else -- INDEXED
    if v == spr.transparentColor then return nil end
    return v
  end
end

local w, h = img.width, img.height
local grid = {}
for y = 0, h - 1 do
  for x = 0, w - 1 do grid[y * w + x] = key(img:getPixel(x, y)) end
end
local function at(x, y)
  if x < 0 or y < 0 or x >= w or y >= h then return nil end
  return grid[y * w + x]
end

local N4 = { {1, 0}, {-1, 0}, {0, 1}, {0, -1} }
local N8 = { {1, 0}, {-1, 0}, {0, 1}, {0, -1}, {1, 1}, {1, -1}, {-1, 1}, {-1, -1} }
local function touches(x, y, c, list)
  for _, d in ipairs(list) do
    if at(x + d[1], y + d[2]) == c then return true end
  end
  return false
end

local orphans, loose, opaque = {}, {}, 0
local seen, clusters, tiny = {}, 0, 0
for y = 0, h - 1 do
  for x = 0, w - 1 do
    local c = at(x, y)
    if c ~= nil then
      opaque = opaque + 1
      if not touches(x, y, c, N8) then table.insert(orphans, { x, y })
      elseif not touches(x, y, c, N4) then table.insert(loose, { x, y }) end
      if not seen[y * w + x] then
        -- relleno por inundación para medir el cluster
        local stack, size = { { x, y } }, 0
        seen[y * w + x] = true
        while #stack > 0 do
          local p = table.remove(stack)
          size = size + 1
          for _, d in ipairs(N4) do
            local nx, ny = p[1] + d[1], p[2] + d[2]
            if at(nx, ny) == c and not seen[ny * w + nx] then
              seen[ny * w + nx] = true
              table.insert(stack, { nx, ny })
            end
          end
        end
        clusters = clusters + 1
        if size <= 2 then tiny = tiny + 1 end
      end
    end
  end
end

-- Capa de revisión: una imagen del tamaño del sprite con las marcas en su sitio
local marked = #orphans + #loose
if marked > 0 then
  app.transaction("Forja: revisar huérfanos", function()
    local layer = spr:newLayer()
    layer.name = "forja-revision"
    local mark = Image(spr.spec)
    local ox, oy = cel.position.x, cel.position.y
    for _, p in ipairs(orphans) do mark:drawPixel(ox + p[1], oy + p[2], Color { r = 255, g = 0, b = 255 }) end
    for _, p in ipairs(loose) do mark:drawPixel(ox + p[1], oy + p[2], Color { r = 0, g = 230, b = 255 }) end
    spr:newCel(layer, app.activeFrame, mark, Point(0, 0))
  end)
  app.refresh()
end

local dlg = Dialog("Forja · Revisión de píxeles")
dlg:label { text = string.format("%d píxeles opacos en la capa «%s».", opaque, cel.layer.name) }
dlg:newrow()
dlg:label { text = string.format("Huérfanos (magenta): %d   ·   Sueltos (cian): %d", #orphans, #loose) }
dlg:newrow()
dlg:label { text = string.format("Clusters: %d, de ellos %d de 1–2 píxeles.", clusters, tiny) }
dlg:newrow()
if marked > 0 then
  dlg:label { text = "Revisa cada marca: un brillo puede ser un huérfano a propósito." }
  dlg:newrow()
  dlg:label { text = "Cuando acabes, borra la capa «forja-revision»." }
else
  dlg:label { text = "Ni huérfanos ni sueltos. ¡Limpio!" }
end
dlg:button { text = "Vale", focus = true }
dlg:show()
