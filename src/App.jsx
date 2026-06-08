import { useState, useMemo, useEffect, useCallback, useRef } from "react";

const SHEET_URL = "https://script.google.com/macros/s/AKfycbxNeeC7bIC4PH9x_6TEpMVTvjYKiqKuZxOrpV1IPyGf618IBor9_BRZV1iGOyP18H_iTw/exec";

const PROPERTIES = ["Eastway Court", "Grace Lane"];

const CATEGORIES = ["All", "Bathroom", "Plumbing", "Tile", "Outdoor", "Tools & Supplies", "Hardware"];
const categoryEmoji = { "Bathroom":"🚿","Plumbing":"🔧","Tile":"⬜","Outdoor":"🌿","Tools & Supplies":"🛠️","Hardware":"⚙️" };
const categoryColor = { "Bathroom":"#007AFF","Plumbing":"#34C759","Tile":"#AF52DE","Outdoor":"#30D158","Tools & Supplies":"#FF9F0A","Hardware":"#FF3B30" };

const T = {
  en: {
    appName:"ProMaint", catalog:"Catalog", jobTemplates:"Templates", inventory:"Inventory", assistant:"Assistant",
    search:"Search parts, brand, SKU...", addPart:"Add Part", edit:"Edit", remove:"Remove", cancel:"Cancel",
    save:"Save Changes", add:"Add Part", noPartsFound:"No parts found",
    itemName:"Item Name", sku:"SKU / Item #", brand:"Brand", category:"Category",
    price:"Unit Price ($)", qty:"Qty Per Unit", description:"Description", notes:"Notes",
    inStock:"In Stock", low:"Low", out:"Out", reorderList:"Reorder List",
    currentStock:"In Stock", minStock:"Min Stock", usage:"Usage Log",
    jobAssistant:"Job Assistant", describeJob:"Describe the job...", getPartsList:"Get Parts List",
    findingParts:"Finding parts...", jobSummary:"Job Summary", partsNeeded:"Parts Needed",
    notInCatalog:"Not in catalog — source separately", estimatedTotal:"Estimated Total",
    copyList:"Copy List", copied:"Copied!", clear:"Clear", proTip:"Pro tip",
    quickExamples:"Quick Examples", property:"Property", both:"Both Properties",
    estwayCourt:"Eastway Court", graceLane:"Grace Lane",
    settings:"Settings", connected:"Connected", disconnect:"Disconnect",
    scanBarcode:"Scan Barcode", scanning:"Scanning...", manualEntry:"Enter manually",
    tools:"Tools Needed", steps:"Steps", measurements:"Measurements", mistakes:"Common Mistakes",
    costPerUnit:"Est. cost / unit", partsShown:"parts",
    saving:"Saving...", loading:"Loading...", removing:"Removing...",
    addToInventory:"Set Stock Level", adjust:"Adjust",
  },
  es: {
    appName:"ProMaint", catalog:"Catálogo", jobTemplates:"Plantillas", inventory:"Inventario", assistant:"Asistente",
    search:"Buscar piezas, marca, SKU...", addPart:"Agregar", edit:"Editar", remove:"Eliminar", cancel:"Cancelar",
    save:"Guardar Cambios", add:"Agregar Pieza", noPartsFound:"No se encontraron piezas",
    itemName:"Nombre del Artículo", sku:"SKU / Núm. Artículo", brand:"Marca", category:"Categoría",
    price:"Precio Unitario ($)", qty:"Cant. Por Unidad", description:"Descripción", notes:"Notas",
    inStock:"En Stock", low:"Bajo", out:"Agotado", reorderList:"Lista de Reorden",
    currentStock:"En Stock", minStock:"Stock Mínimo", usage:"Registro de Uso",
    jobAssistant:"Asistente de Trabajo", describeJob:"Describe el trabajo...", getPartsList:"Obtener Lista",
    findingParts:"Buscando piezas...", jobSummary:"Resumen del Trabajo", partsNeeded:"Piezas Necesarias",
    notInCatalog:"No en catálogo — conseguir por separado", estimatedTotal:"Total Estimado",
    copyList:"Copiar Lista", copied:"¡Copiado!", clear:"Limpiar", proTip:"Consejo pro",
    quickExamples:"Ejemplos Rápidos", property:"Propiedad", both:"Ambas Propiedades",
    estwayCourt:"Eastway Court", graceLane:"Grace Lane",
    settings:"Ajustes", connected:"Conectado", disconnect:"Desconectar",
    scanBarcode:"Escanear Código", scanning:"Escaneando...", manualEntry:"Ingresar manualmente",
    tools:"Herramientas", steps:"Pasos", measurements:"Medidas", mistakes:"Errores Comunes",
    costPerUnit:"Costo est. / unidad", partsShown:"piezas",
    saving:"Guardando...", loading:"Cargando...", removing:"Eliminando...",
    addToInventory:"Establecer Stock", adjust:"Ajustar",
  }
};

const QUICK_PROMPTS = {
  en: ["Replace shower manifold and valves","Fix bathroom sink supply lines","Replace toilet supply line","Tile a bathroom floor","Replace grab bars","Replace water heater"],
  es: ["Reemplazar manifold de ducha","Reparar líneas de lavabo","Reemplazar línea de inodoro","Poner piso de baño","Reemplazar barras de apoyo","Reemplazar calentador de agua"],
};

const JOB_TEMPLATES = {
  en: [
    {
      id:1, title:"Replace Full Toilet", emoji:"🚽", property:"both",
      summary:"Complete toilet replacement. Standard rough-in is 12 inches. Eastway Court and Grace Lane both use SharkBite 1/2 to 3/8 inch connections.",
      measurements:["Rough-in distance: measure from wall to center of bolt caps (usually 12 inch)","Bowl shape: round or elongated","Supply line length: 12 inch maximum — no longer"],
      parts:["Toilet (match rough-in size)","Wax ring with horn (3x4 closet flange)","5/16 closet bolts","12-inch 3/8 x 3/8 supply line","SharkBite 1/2 to 3/8 inch stop valve","Mounting nuts and washers"],
      tools:["Adjustable wrench","Putty knife","Level","Bucket and sponge","SharkBite disconnect clip"],
      steps:["Shut off water at stop valve","Flush toilet and sponge out remaining water","Disconnect 12-inch supply line","Remove bolt caps and nuts at base","Rock toilet to break wax seal and lift off","Scrape old wax from flange","Install new wax ring on toilet horn","Set toilet on flange bolts, press down firmly","Hand tighten nuts — do not overtighten or bowl cracks","Reconnect 12-inch supply line using SharkBite 1/2 to 3/8 valve","Turn water on slowly and check for leaks","Caulk base if required"],
      mistakes:["Wrong rough-in measurement — always measure before buying","Reusing old wax ring — always use new","Overtightening bolts — cracks the porcelain","Supply line longer than 12 inches — use 12 inch only"],
    },
    {
      id:2, title:"Rebuild Toilet Interior", emoji:"⚙️", property:"both",
      summary:"Rebuild the inside of the toilet tank. Fixes running, phantom flushing, and weak flushes. No need to remove toilet from floor.",
      measurements:["Flush valve opening: 2-inch or 3-inch diameter","Tank length and width for correct fill valve height"],
      parts:["Fluidmaster 400A fill valve (adjustable 7 to 13 inch)","Fluidmaster 502 flapper (2-inch standard)","Flush handle with 8-inch arm","12-inch 3/8 supply line if replacing"],
      tools:["Adjustable wrench","Sponge and bucket","Towel"],
      steps:["Shut off water at stop valve","Flush to empty tank","Sponge out remaining water","Disconnect supply line at bottom of tank","Remove old fill valve by turning counterclockwise","Install new Fluidmaster 400A — adjust height to 1 inch below overflow tube","Remove old flapper from pegs on overflow tube","Snap new flapper onto pegs","Hook chain to handle arm — leave 1/2 inch slack","Reconnect supply line","Turn water on and adjust float to fill line marked inside tank","Test flush 3 times"],
      mistakes:["Chain too tight — prevents flapper from sealing","Chain too loose — gets caught under flapper","Float set too high — water runs into overflow tube constantly"],
    },
    {
      id:3, title:"Replace Shower Valve / Manifold", emoji:"🚿", property:"both",
      summary:"All shower connections are 1/2 inch throughout both properties. Uses 2 PEX lines, 4 SharkBite fittings, female adapter at manifold, Delta Foundations valve. Showerhead pipe is PVC or metal, 1/2 inch.",
      measurements:["Wall thickness for valve depth","Pipe spacing at stub-outs (1/2 inch)","Escutcheon plate size (Delta standard 7 x 7 inch)"],
      parts:["Delta Foundations shower valve (1/2 inch)","1/2-in x 5-ft Red PEX pipe (hot)","1/2-in x 5-ft Blue PEX pipe (cold)","2 x SharkBite 1/2-in straight connectors","2 x SharkBite 1/2-in 90-degree elbows","1/2-in female adapter to manifold","Shower trim kit to match Delta valve","Teflon tape","NOTE: Check manifold mixing valve to adjust temperature after install"],
      tools:["SharkBite disconnect clip","Utility knife or PEX cutter","Level","Hole saw","Adjustable wrench"],
      steps:["Shut off main water supply","Cut old supply lines leaving enough stub-out for SharkBite","Dry fit all fittings before connecting","Connect cold blue PEX to left port using SharkBite straight connector","Connect hot red PEX to right port using SharkBite straight connector","Use 90-degree SharkBite elbows to route lines to valve ports","Thread female adapter onto manifold — use Teflon tape","Mount valve in wall at correct depth per trim kit instructions","Install trim kit and escutcheon plate","Turn water on slowly — check all SharkBite connections for drips","Adjust manifold mixing valve to set max temperature","Test hot and cold flow"],
      mistakes:["Not checking mixing valve temperature after install","SharkBite not fully seated — push until you feel click","Using wrong size trim kit for valve model"],
    },
    {
      id:4, title:"Replace Kitchen Sink Supply Lines", emoji:"🍳", property:"both",
      summary:"Kitchen sink uses 1/2 inch to 3/8 inch straight SharkBite connection with shut-off valve. 30-inch supply line only.",
      measurements:["Confirm pipe size at wall: 1/2 inch","Confirm faucet inlet: 3/8 inch","Supply line length needed: 30 inch — no longer, no shorter"],
      parts:["30-inch 1/2 x 3/8 stainless braided supply line x2 (hot and cold)","SharkBite 1/2 to 3/8 straight connector with shut-off valve x2","Teflon tape"],
      tools:["Adjustable wrench","Bucket","Towel"],
      steps:["Shut off water at existing valves","Place bucket under supply lines","Disconnect old supply lines at valve and faucet","Install SharkBite 1/2 to 3/8 shut-off valve on 1/2 inch pipe stub-out — push until seated","Connect 30-inch supply line from valve to faucet inlet","Hand tighten then quarter turn with wrench","Turn water on slowly","Check all connections for leaks"],
      mistakes:["Using supply line longer or shorter than 30 inch — use 30 inch only","Not fully seating SharkBite fitting"],
    },
    {
      id:5, title:"Replace Bathroom Vanity Supply Lines", emoji:"🪥", property:"both",
      summary:"Vanity sink is 3/8 to 3/8 inch connection. 20-inch supply line maximum — do not use longer.",
      measurements:["Valve outlet: 3/8 inch compression","Faucet inlet: 3/8 inch","Supply line: 20 inch maximum"],
      parts:["20-inch 3/8 x 3/8 stainless braided supply line x2","3/8 to 3/8 compression fittings if needed","Teflon tape"],
      tools:["Adjustable wrench","Bucket","Towel"],
      steps:["Shut off water at stop valves under sink","Disconnect old supply lines","Connect new 20-inch lines — 3/8 compression at valve, 3/8 at faucet inlet","Hand tighten, then quarter turn with wrench","Turn water on and check for leaks"],
      mistakes:["Using supply line longer than 20 inch — always use 20 inch max","Cross-threading compression fittings"],
    },
    {
      id:6, title:"Replace Water Heater", emoji:"🔥", property:"both",
      summary:"Both properties use 28-gallon low boy water heaters. Set temperature to 125°F. Eastway Court (old units) has soldered copper lines at top — cut with pipe cutter, do not unscrew. Connect with SharkBite fittings.",
      measurements:["Confirm 28-gallon low boy size fits space","Inlet and outlet pipe diameter: 3/4 inch or 1/2 inch","Measure pipe length needed for SharkBite connection"],
      parts:["28-gallon low boy water heater","SharkBite 1/2-in or 3/4-in straight connectors x2","SharkBite ball valve x1","Teflon tape","Flexible water heater supply lines x2","Pressure relief valve (if not included)","Pipe cutter (for Eastway Court soldered lines)"],
      tools:["Pipe cutter","SharkBite disconnect clip","Adjustable wrench","Garden hose for draining","Flathead screwdriver"],
      steps:["Turn off gas or electric to heater","Connect garden hose to drain valve, run to floor drain","Open pressure relief valve to vent","Drain heater completely","EASTWAY COURT ONLY: Use pipe cutter to cut soldered copper lines at top — do not attempt to unscrew","GRACE LANE: Disconnect existing fittings normally","Remove old heater","Set new 28-gallon low boy in position","Connect cold inlet and hot outlet with SharkBite fittings","Install SharkBite ball valve on cold inlet line","Close drain valve, remove garden hose","Fill heater — open a hot faucet nearby to release air until steady flow","Check all connections for leaks","Light pilot or restore power","Set temperature dial to 125°F","Wait 2 hours before testing hot water temperature"],
      mistakes:["Trying to unscrew soldered lines at Eastway Court — always cut","Setting temperature above 125°F — scalding risk","Not fully draining before removing old unit","Forgetting to open a faucet when refilling — traps air"],
    },
    {
      id:7, title:"Install or Replace Grab Bars", emoji:"🦺", property:"both",
      summary:"ADA grab bars for shower and tub safety. Must hit wall studs or use heavy-duty toggle bolts rated 250+ lbs.",
      measurements:["Stud locations: studs are 16 inches on center from corner","ADA height: 33 to 36 inches from floor","Bar length needed: 12, 18, 24, or 36 inch"],
      parts:["18-inch SS Exposed Grab Bar or Concealed Screw Grab Bar","3-inch #10 wood screws (to hit studs)","Heavy-duty toggle bolts rated 250 lbs minimum (if no stud)"],
      tools:["Stud finder","Drill","Level","Tape measure","Pencil"],
      steps:["Locate studs with stud finder — mark with pencil","Hold bar at correct height and mark hole locations","Check with level before drilling","Drill pilot holes into studs","If no stud: use toggle bolts — drill correct size hole per bolt instructions","Mount bar with 3-inch screws into studs","Pull test bar firmly — should not move at all","Caulk around escutcheon plates if in wet area"],
      mistakes:["Not hitting studs — bar will pull out under weight","Bar not level","Using screws shorter than 3 inches into studs"],
    },
    {
      id:8, title:"Replace Bathroom Floor Tile", emoji:"⬜", property:"both",
      summary:"12x12 Bianco White Glazed tile throughout. Type 1 Mastic adhesive for walls — dry areas only. Calculate square footage and add 10% for cuts.",
      measurements:["Room square footage: length x width in feet","Add 10% overage for cuts and waste","Existing tile thickness: usually 3/8 inch","Doorway transition height"],
      parts:["12x12 Bianco White Glazed Tile (44-pack covers 44 sq ft)","Type 1 Mastic Adhesive 1 Gal (covers 50 sq ft)","Tile Spacers Handy-Pak","Unsanded grout for joints under 1/8 inch","Grout sealer","Tile transition strip for doorway"],
      tools:["3/16-inch V-notch trowel","Rubber mallet","Tile cutter or wet saw","Grout float","Large sponge","Bucket"],
      steps:["Remove old tile and clean subfloor completely","Check subfloor is flat — high spots cause tile to crack","Dry lay tiles from center of room to walls to plan cuts","Mix mastic per instructions","Spread mastic with notched trowel — work in 3x3 sections","Press tiles firmly, use spacers, check level with each row","Let set 24 hours before grouting","Mix grout to peanut butter consistency","Apply with grout float diagonally across joints","Clean excess with damp sponge — rinse frequently","Let dry 72 hours then apply grout sealer"],
      mistakes:["Using mastic in wet shower floor — use thinset instead","Skipping the dry lay — causes bad cuts at walls","Grouting before mastic fully cures","Not sealing grout — stains quickly"],
    },
  ],
  es: [
    { id:1, title:"Reemplazar Inodoro Completo", emoji:"🚽", property:"both", summary:"Reemplazo completo de inodoro. La distancia estándar es 12 pulgadas. Use conexión SharkBite 1/2 a 3/8 pulgadas.", measurements:["Distancia rough-in: medir de la pared al centro de los pernos (usualmente 12 pulgadas)","Forma del tazón: redondo o alargado","Línea de suministro: máximo 12 pulgadas"], parts:["Inodoro (coincidir tamaño rough-in)","Anillo de cera con cuerno","Pernos de 5/16","Línea de suministro de 12 pulgadas 3/8 x 3/8","Válvula SharkBite 1/2 a 3/8 pulgadas"], tools:["Llave ajustable","Espátula","Nivel","Cubeta y esponja"], steps:["Cerrar agua en la válvula","Jalar el agua y limpiar el resto","Desconectar línea de 12 pulgadas","Quitar tapas y tuercas de la base","Mover el inodoro para romper el sello de cera y levantar","Raspar cera vieja del flange","Instalar anillo de cera nuevo","Colocar inodoro en pernos del flange","Apretar tuercas a mano — no apretar demasiado","Reconectar línea de 12 pulgadas","Abrir agua lentamente y revisar fugas"], mistakes:["Medida incorrecta — siempre medir antes de comprar","Reusar anillo de cera viejo","Apretar demasiado los pernos — rompe la porcelana"] },
    { id:2, title:"Reconstruir Interior del Inodoro", emoji:"⚙️", property:"both", summary:"Reconstruir el interior del tanque. Corrige goteos y descargas débiles.", measurements:["Apertura de válvula de descarga: 2 o 3 pulgadas"], parts:["Válvula de llenado Fluidmaster 400A","Flapper Fluidmaster 502 (2 pulgadas)","Manija con brazo de 8 pulgadas"], tools:["Llave ajustable","Esponja y cubeta"], steps:["Cerrar agua","Jalar para vaciar tanque","Quitar válvula vieja","Instalar Fluidmaster 400A","Cambiar flapper","Reconectar línea de suministro","Ajustar flotador"], mistakes:["Cadena muy tensa — impide sello del flapper","Flotador muy alto — agua entra al tubo de desbordamiento"] },
    { id:3, title:"Reemplazar Válvula de Ducha", emoji:"🚿", property:"both", summary:"Todas las conexiones de ducha son de 1/2 pulgada. Usa 2 líneas PEX, 4 accesorios SharkBite, adaptador hembra en manifold, válvula Delta Foundations.", measurements:["Espesor de pared","Espaciado de tuberías (1/2 pulgada)"], parts:["Válvula de ducha Delta Foundations (1/2 pulgada)","Tubo PEX rojo 1/2 x 5 pies (agua caliente)","Tubo PEX azul 1/2 x 5 pies (agua fría)","2 x conectores rectos SharkBite 1/2 pulgada","2 x codos 90° SharkBite 1/2 pulgada","Adaptador hembra al manifold 1/2 pulgada","NOTA: Verificar válvula mezcladora para ajustar temperatura"], tools:["Clip desconector SharkBite","Cortador de PEX","Nivel","Sierra perforadora"], steps:["Cerrar agua principal","Cortar líneas viejas","Conectar PEX frío al puerto izquierdo con SharkBite","Conectar PEX caliente al puerto derecho","Usar codos SharkBite 90° para rutear líneas","Atornillar adaptador hembra al manifold con teflón","Montar válvula en pared","Instalar kit de acabado","Abrir agua y verificar conexiones","Ajustar válvula mezcladora a temperatura correcta"], mistakes:["No verificar temperatura de válvula mezcladora","SharkBite no completamente insertado"] },
    { id:4, title:"Reemplazar Líneas de Fregadero de Cocina", emoji:"🍳", property:"both", summary:"Cocina usa conexión SharkBite 1/2 a 3/8 pulgadas. Línea de suministro de 30 pulgadas únicamente.", measurements:["Tubería en pared: 1/2 pulgada","Entrada de grifo: 3/8 pulgada","Línea de suministro: 30 pulgadas exactas"], parts:["Línea de suministro de 30 pulgadas 1/2 x 3/8 x2","Conector SharkBite 1/2 a 3/8 con válvula de cierre x2"], tools:["Llave ajustable","Cubeta","Toalla"], steps:["Cerrar agua en válvulas","Desconectar líneas viejas","Instalar válvula SharkBite en tubería de 1/2 pulgada","Conectar línea de 30 pulgadas de válvula a grifo","Abrir agua y revisar fugas"], mistakes:["Usar línea diferente a 30 pulgadas","SharkBite no completamente insertado"] },
    { id:5, title:"Reemplazar Líneas de Lavabo del Baño", emoji:"🪥", property:"both", summary:"Lavabo es conexión 3/8 a 3/8 pulgadas. Máximo 20 pulgadas de línea de suministro.", measurements:["Salida de válvula: 3/8 pulgada","Entrada de grifo: 3/8 pulgada","Línea: máximo 20 pulgadas"], parts:["Línea de suministro 3/8 x 3/8 de 20 pulgadas x2"], tools:["Llave ajustable","Cubeta"], steps:["Cerrar agua","Desconectar líneas viejas","Conectar nuevas líneas de 20 pulgadas","Abrir agua y revisar fugas"], mistakes:["Usar línea de más de 20 pulgadas"] },
    { id:6, title:"Reemplazar Calentador de Agua", emoji:"🔥", property:"both", summary:"Calentadores de 28 galones tipo bajo. Temperatura: 125°F. Eastway Court tiene líneas soldadas — cortar con cortador de tubería, NO desenroscar.", measurements:["Confirmar tamaño 28 galones cabe en el espacio","Diámetro de tubería: 3/4 o 1/2 pulgada"], parts:["Calentador de agua 28 galones tipo bajo","Conectores rectos SharkBite x2","Válvula de bola SharkBite x1","Teflón","Líneas flexibles de calentador x2","Cortador de tubería (para Eastway Court)"], tools:["Cortador de tubería","Clip desconector SharkBite","Llave ajustable","Manguera de jardín"], steps:["Apagar gas o electricidad al calentador","Conectar manguera al drenaje y vaciar","EASTWAY COURT: Cortar líneas de cobre soldadas con cortador — NO desenroscar","GRACE LANE: Desconectar accesorios normalmente","Retirar calentador viejo","Instalar nuevo calentador de 28 galones","Conectar líneas con accesorios SharkBite","Llenar calentador — abrir grifo cercano para liberar aire","Revisar fugas","Encender piloto o restaurar electricidad","Ajustar temperatura a 125°F"], mistakes:["Intentar desenroscar líneas soldadas en Eastway Court — siempre cortar","Temperatura por encima de 125°F — riesgo de quemaduras","No drenar completamente antes de retirar"] },
    { id:7, title:"Instalar Barras de Apoyo", emoji:"🦺", property:"both", summary:"Barras de apoyo ADA para ducha y tina. Deben alcanzar los montantes de la pared.", measurements:["Montantes: cada 16 pulgadas desde la esquina","Altura ADA: 33 a 36 pulgadas desde el piso","Longitud de barra: 12, 18, 24 o 36 pulgadas"], parts:["Barra de apoyo de 18 pulgadas SS","Tornillos de madera #10 de 3 pulgadas","Pernos de palanca si no hay montante"], tools:["Detector de montantes","Taladro","Nivel","Cinta métrica"], steps:["Localizar montantes","Marcar posición de la barra a altura correcta","Verificar nivel","Taladrar agujeros piloto","Montar barra con tornillos de 3 pulgadas","Verificar firmeza — no debe moverse","Sellar con silicón en área húmeda"], mistakes:["No alcanzar montantes — la barra se desprenderá","Barra no nivelada"] },
    { id:8, title:"Reemplazar Piso de Baño con Azulejo", emoji:"⬜", property:"both", summary:"Azulejo Bianco Blanco Esmaltado 12x12. Mastic Tipo 1 para paredes en áreas secas. Calcular pies cuadrados más 10%.", measurements:["Pies cuadrados: largo x ancho","Agregar 10% por cortes","Grosor de azulejo existente: 3/8 pulgada"], parts:["Azulejo Bianco Blanco 12x12 (paquete de 44 cubre 44 pies cuadrados)","Adhesivo Mastic Tipo 1 1 galón","Separadores de azulejo","Lechada sin arena","Sellador de lechada"], tools:["Llana con muescas V 3/16 pulgada","Mazo de goma","Cortador de azulejo","Llana de lechada","Esponja grande"], steps:["Retirar azulejo viejo y limpiar el subpiso","Verificar que el subpiso esté nivelado","Colocar azulejos en seco para planear los cortes","Aplicar mastic con llana de muescas","Presionar azulejos firmemente con separadores","Dejar secar 24 horas antes de lechada","Aplicar lechada diagonalmente","Limpiar exceso con esponja húmeda","Selar lechada después de 72 horas"], mistakes:["Usar mastic en piso de ducha húmedo — usar thinset","Lechada antes de que seque el mastic","No sellar la lechada"] },
  ]
};

const INITIAL_PARTS = [
  {id:1,sku:"116776",name:"18-in SS Exposed Grab Bar",brand:"Unknown",category:"Bathroom",unitPrice:26.58,qtyPerUnit:1,description:"Stainless steel exposed grab bar for shower or tub safety. 18-inch length, mounts to wall studs with 3-inch screws.",notes:"Receipt 16-9"},
  {id:2,sku:"4979485",name:"PS 18in Concealed Screw Grab Bar",brand:"PS",category:"Bathroom",unitPrice:28.46,qtyPerUnit:1,description:"18-inch grab bar with hidden screws for a clean finished look. ADA compliant height 33-36 inches from floor.",notes:"Receipt 16-9"},
  {id:3,sku:"813456",name:"Delta Foundations Shower Valve",brand:"Delta",category:"Bathroom",unitPrice:75.05,qtyPerUnit:1,description:"Complete Delta shower faucet and valve. Main shower manifold — 1/2 inch connections throughout. Check mixing valve for temperature after install.",notes:""},
  {id:4,sku:"1821657",name:"Drain Vessel Basic Sink Strainer",brand:"Unknown",category:"Bathroom",unitPrice:3.59,qtyPerUnit:1,description:"Basic bathroom sink drain strainer. Fits standard 1-3/8 inch drain openings.",notes:""},
  {id:5,sku:"5351591",name:"Braided Faucet Supply Line",brand:"UCPFA",category:"Plumbing",unitPrice:18.98,qtyPerUnit:1,description:"Flexible braided stainless supply line. Connects shut-off valve to faucet.",notes:""},
  {id:6,sku:"751643",name:"3/8-in x 20-in SS Faucet Connector",brand:"Unknown",category:"Plumbing",unitPrice:12.12,qtyPerUnit:2,description:"20-inch stainless flexible faucet connector. Bathroom vanity: 3/8 to 3/8 inch, 20-inch max.",notes:""},
  {id:7,sku:"792072",name:"Fernco 1-1/2-in Flexible Coupling",brand:"Fernco",category:"Plumbing",unitPrice:15.70,qtyPerUnit:2,description:"Rubber flexible coupling for 1-1/2 inch drain connections. Bathtub drain size throughout both properties.",notes:""},
  {id:8,sku:"5233327",name:"1/2-in Blade Utility Adapter",brand:"Unknown",category:"Plumbing",unitPrice:22.20,qtyPerUnit:2,description:"1/2-inch utility push-fit adapter for PEX or CPVC piping.",notes:""},
  {id:9,sku:"5233287",name:"1/2-in x 3/8-in Push-Connect Stop Valve",brand:"Unknown",category:"Plumbing",unitPrice:25.80,qtyPerUnit:2,description:"Push-to-connect stop valve — no tools needed. Toilet: SharkBite 1/2 to 3/8 inch, 12-inch supply line max.",notes:""},
  {id:10,sku:"61327",name:"1/2-in Brass Drop Elbow",brand:"Unknown",category:"Plumbing",unitPrice:5.94,qtyPerUnit:1,description:"Brass 90-degree drop elbow. Routes water from wall stub-out to faucet or valve. All shower lines 1/2 inch.",notes:""},
  {id:11,sku:"5204305",name:"1/2-in SS Ball Shut-Off Valve",brand:"Unknown",category:"Plumbing",unitPrice:42.72,qtyPerUnit:1,description:"Full-port stainless steel ball valve. Kitchen sink: SharkBite 1/2 to 3/8 straight with shut-off valve, 30-inch supply line.",notes:""},
  {id:12,sku:"751645",name:"3/8-in x 30-in SS Kitchen Supply Line",brand:"Unknown",category:"Plumbing",unitPrice:16.50,qtyPerUnit:2,description:"30-inch stainless steel supply line for kitchen sink. 1/2 to 3/8 inch. Use 30-inch only — no longer, no shorter.",notes:""},
  {id:13,sku:"23764",name:"1/2-in CPVC Push-Fit Adapter",brand:"Unknown",category:"Plumbing",unitPrice:9.52,qtyPerUnit:4,description:"1/2-inch CPVC push-fit adapter. All shower and kitchen connections are 1/2 inch at wall.",notes:""},
  {id:14,sku:"55601",name:"1/2-in CPVC 90° Wing Elbow",brand:"Unknown",category:"Plumbing",unitPrice:1.69,qtyPerUnit:1,description:"1/2-inch CPVC 90-degree elbow with mounting wings. Anchors supply pipe to wall.",notes:""},
  {id:15,sku:"1642676",name:"1/2-in FIP x 3/8-in Compression Adapter",brand:"Unknown",category:"Plumbing",unitPrice:18.96,qtyPerUnit:2,description:"Connects female iron pipe shut-off to 3/8-inch compression supply line. Common under bathroom vanity sinks.",notes:""},
  {id:16,sku:"5233296",name:"SharkBite 1/2-in 90° Push-Connect Elbow",brand:"SharkBite",category:"Plumbing",unitPrice:19.54,qtyPerUnit:2,description:"SharkBite push-connect 90-degree elbow, 1/2 inch. For shower manifold — 2 of these per manifold job. No soldering.",notes:""},
  {id:17,sku:"972623B",name:"1/2-in x 5-ft Blue PEX Pipe (Cold)",brand:"Unknown",category:"Plumbing",unitPrice:3.06,qtyPerUnit:1,description:"5-foot blue PEX cold water pipe, 1/2 inch. Shower manifold uses 2 PEX lines — 1 red, 1 blue.",notes:""},
  {id:18,sku:"972623R",name:"1/2-in x 5-ft Red PEX Pipe (Hot)",brand:"Unknown",category:"Plumbing",unitPrice:3.06,qtyPerUnit:1,description:"5-foot red PEX hot water pipe, 1/2 inch. Shower manifold uses 2 PEX lines — 1 red, 1 blue.",notes:""},
  {id:19,sku:"1030381W",name:"12x12 Bianco White Glazed Tile — 44-pack",brand:"Bianco",category:"Tile",unitPrice:43.56,qtyPerUnit:1,description:"12x12 white glazed ceramic tile. 44-pack covers 44 sq ft. Standard tile throughout both properties. Add 10% for cuts.",notes:"~$0.99/tile"},
  {id:20,sku:"1030381S",name:"12x12 Bianco White Glazed Tile — 10-pack",brand:"Bianco",category:"Tile",unitPrice:9.90,qtyPerUnit:1,description:"12x12 white glazed ceramic tile. 10-pack for small repairs. Same tile as 44-pack.",notes:"~$0.99/tile"},
  {id:21,sku:"580215",name:"Tile Spacers — Handy-Pak",brand:"Unknown",category:"Tile",unitPrice:16.13,qtyPerUnit:1,description:"Tile spacers for consistent grout joints. Use 1/16-inch spacing for wall tile, 1/8-inch for floor tile.",notes:""},
  {id:22,sku:"43951",name:"Type 1 Mastic Tile Adhesive — 1 Gal",brand:"Unknown",category:"Tile",unitPrice:32.26,qtyPerUnit:1,description:"Type 1 mastic, 1 gallon covers 50 sq ft. For wall tile in dry areas only — do NOT use on wet shower floors.",notes:""},
  {id:23,sku:"5388937",name:"Roundup RTU Weed Killer — 1.25 Gal",brand:"Roundup",category:"Outdoor",unitPrice:31.88,qtyPerUnit:1,description:"Ready-to-use Roundup weed killer refill. For grounds maintenance at both properties.",notes:"Receipt SHOP"},
  {id:24,sku:"1160415",name:"Husqvarna .095 XP Trimmer Line — 200ft",brand:"Husqvarna",category:"Tools & Supplies",unitPrice:20.88,qtyPerUnit:1,description:"Heavy-duty .095-inch trimmer line, 200-foot spool. For commercial Husqvarna trimmers.",notes:"2-pack"},
  {id:25,sku:"1541076",name:"Husqvarna 2-Cycle Engine Oil — 12.8oz",brand:"Husqvarna",category:"Tools & Supplies",unitPrice:12.52,qtyPerUnit:1,description:"12.8oz 2-cycle oil for gas-powered trimmers and blowers. Mix with fuel per equipment specs.",notes:""},
];

const emptyForm = {sku:"",name:"",brand:"",category:"Plumbing",unitPrice:"",qtyPerUnit:1,description:"",notes:""};

// ── Helpers ──────────────────────────────────
async function apiGet(action) {
  try {
    const r = await fetch(${SHEET_URL}?action=${action});
    return await r.json();
  } catch { return {error:"Network error"}; }
}
async function apiPost(body) {
  try {
    const r = await fetch(SHEET_URL,{method:"POST",headers:{"Content-Type":"text/plain"},body:JSON.stringify(body)});
    return await r.json();
  } catch { return {error:"Network error"}; }
}

export default function App() {
  const [lang, setLang] = useState("en");
  const t = T[lang];
  const templates = JOB_TEMPLATES[lang];

  const [parts, setParts] = useState(INITIAL_PARTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("catalog");
  const [property, setProperty] = useState("both");
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [inventory, setInventory] = useState({});
  const [expandedTemplate, setExpandedTemplate] = useState(null);
  const [expandedSection, setExpandedSection] = useState({});
  const [jobQuery, setJobQuery] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [copied, setCopied] = useState(false);

  // Load from sheet
  const loadParts = useCallback(async () => {
    setLoading(true);
    const data = await apiGet("getParts");
    if (data && !data.error && Array.isArray(data) && data.length > 0) setParts(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadParts(); }, [loadParts]);

  // Inventory init
  useEffect(() => {
    const inv = {};
    parts.forEach(p => {
      if (!inventory[p.id]) inv[p.id] = {current:0,min:2};
      else inv[p.id] = inventory[p.id];
    });
    setInventory(prev => ({...inv,...prev}));
  }, [parts]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return parts.filter(p => {
      const matchSearch = !q || p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
      const matchCat = activeCategory === "All" || p.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [parts, activeCategory, search]);

  const categoryCounts = useMemo(() => {
    const c = {}; parts.forEach(p => { c[p.category] = (c[p.category]||0)+1; }); return c;
  }, [parts]);

  const lowStockParts = useMemo(() =>
    parts.filter(p => { const inv = inventory[p.id]; return inv && inv.current <= inv.min; }),
  [parts, inventory]);

  // CRUD
  async function savePart() {
    if (!form.name || !form.unitPrice) return;
    setSaving(true);
    const part = {...form, unitPrice:parseFloat(form.unitPrice), qtyPerUnit:parseInt(form.qtyPerUnit)};
    if (editId !== null) await apiPost({action:"updatePart",part:{...part,id:editId}});
    else await apiPost({action:"addPart",part});
    await loadParts();
    closeForm();
    setSaving(false);
  }

  async function deletePart(id) {
    setSaving(true);
    await apiPost({action:"deletePart",id});
    await loadParts();
    setDeleteConfirm(null);
    setSaving(false);
  }

  function openAdd() { setForm(emptyForm); setEditId(null); setShowForm(true); }
  function openEdit(p,e) { e.stopPropagation(); setForm({...p}); setEditId(p.id); setShowForm(true); }
  function closeForm() { setShowForm(false); setEditId(null); }

  function adjustInventory(id, delta) {
    setInventory(prev => {
      const cur = prev[id] || {current:0,min:2};
      return {...prev,[id]:{...cur,current:Math.max(0,cur.current+delta)}};
    });
  }

  function setMinStock(id, val) {
    setInventory(prev => {
      const cur = prev[id] || {current:0,min:2};
      return {...prev,[id]:{...cur,min:Math.max(0,parseInt(val)||0)}};
    });
  }

  function stockStatus(id) {
    const inv = inventory[id] || {current:0,min:2};
    if (inv.current === 0) return "out";
    if (inv.current <= inv.min) return "low";
    return "in";
  }

  // AI Assistant
  async function runAssistant(query) {
    const q = query || jobQuery;
    if (!q.trim()) return;
    setJobQuery(q);
    setAiLoading(true);
    setAiResult(null);
    setAiError("");
    const catalog = parts.map(p => ID:${p.id}|${p.name}|${p.brand}|${p.category}|$${p.unitPrice}|${p.description}).join("\n");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",max_tokens:1000,
          system:Apartment maintenance parts assistant. Return ONLY valid JSON no markdown.\nCatalog:\n${catalog}\nReturn:{"jobTitle":"","jobSummary":"","partsNeeded":[{"id":1,"reason":"","qtyNeeded":1}],"missingParts":[],"estimatedCost":0,"tips":""},
          messages:[{role:"user",content:q}]
        })
      });
      const data = await res.json();
      const text = (data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
      const parsed = JSON.parse(text.replace(/json|/g,"").trim());
      parsed.partsNeeded = (parsed.partsNeeded||[]).map(p=>({...p,part:parts.find(pt=>pt.id===p.id)})).filter(p=>p.part);
      setAiResult(parsed);
    } catch { setAiError(lang==="en"?"Couldn't generate parts list. Try again.":"No se pudo generar la lista. Intente de nuevo."); }
    setAiLoading(false);
  }

  function copyList() {
    if (!aiResult) return;
    const lines = [PARTS LIST — ${aiResult.jobTitle?.toUpperCase()},Date: ${new Date().toLocaleDateString()},"",aiResult.jobSummary,"","PARTS NEEDED:",...(aiResult.partsNeeded||[]).map((p,i)=>${i+1}. ${p.part.name} (SKU: ${p.part.sku})\n   Qty: ${p.qtyNeeded}  |  $${(p.part.unitPrice*p.qtyNeeded).toFixed(2)}\n   ${p.reason}),"",...(aiResult.missingParts?.length?[NOT IN CATALOG:\n${aiResult.missingParts.map(m=>• ${m}).join("\n")}]:[]),\nESTIMATED TOTAL: $${(aiResult.partsNeeded||[]).reduce((s,p)=>s+p.part.unitPrice*p.qtyNeeded,0).toFixed(2)},\nTIP: ${aiResult.tips}].join("\n");
    navigator.clipboard.writeText(lines).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});
  }

  function copyReorderList() {
    const lines = [REORDER LIST — ${new Date().toLocaleDateString()},"",...lowStockParts.map(p=>{const inv=inventory[p.id]||{current:0,min:2};const status=inv.current===0?"OUT OF STOCK":"LOW STOCK";return ${status}: ${p.name} (SKU: ${p.sku})\n  Have: ${inv.current} | Need min: ${inv.min} | $${p.unitPrice}/ea;})].join("\n");
    navigator.clipboard.writeText(lines).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),1500);});
  }

  function copyTemplateParts(tmpl) {
    const lines = [PARTS LIST — ${tmpl.title.toUpperCase()},Date: ${new Date().toLocaleDateString()},"",tmpl.summary,"","PARTS NEEDED:",...tmpl.parts.map((p,i)=>${i+1}. ${p}),"","TOOLS:",...tmpl.tools.map(t=>• ${t}),"","KEY MEASUREMENTS:",...tmpl.measurements.map(m=>• ${m})].join("\n");
    navigator.clipboard.writeText(lines).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),1500);});
  }

  // Styles
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
    body{background:#F2F2F7;font-family:'DM Sans',system-ui,sans-serif;}
    ::-webkit-scrollbar{display:none;}
    input,textarea,select{font-family:'DM Sans',system-ui,sans-serif;}
    .card{background:#fff;border-radius:20px;box-shadow:0 2px 12px rgba(0,0,0,.06);}
    .pill{border-radius:100px;}
    .btn{border:none;cursor:pointer;font-family:'DM Sans',system-ui,sans-serif;font-weight:600;transition:all .15s;-webkit-user-select:none;user-select:none;}
    .btn:active{transform:scale(.96);}
    .floating{box-shadow:0 8px 32px rgba(0,0,0,.12);}
    @keyframes slideUp{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    .slide-up{animation:slideUp .3s ease forwards;}
    .fade-in{animation:fadeIn .2s ease forwards;}
  `;

  const statusColors = {in:"#34C759",low:"#FF9F0A",out:"#FF3B30"};
  const statusBg = {in:"#F0FFF4",low:"#FFF8EC",out:"#FFF0F0"};

  return (
    <div style={{minHeight:"100vh",background:"#F2F2F7",paddingBottom:90,fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <style>{css}</style>

      {/* HEADER */}
      <div style={{background:"rgba(242,242,247,.92)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",position:"sticky",top:0,zIndex:40,padding:"16px 20px 12px",borderBottom:"1px solid rgba(0,0,0,.06)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div>
            <div style={{fontSize:22,fontWeight:700,color:"#1C1C1E",letterSpacing:"-0.5px"}}>{t.appName}</div>
            <div style={{fontSize:12,color:"#8E8E93",marginTop:1}}>
              {loading ? <span style={{color:"#FF9F0A"}}>⏳ {t.loading}</span> : saving ? <span style={{color:"#FF9F0A"}}>💾 {t.saving}</span> : <span style={{color:"#34C759"}}>● {t.connected}</span>}
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button className="btn pill" style={{background:"#E5E5EA",color:"#1C1C1E",padding:"7px 14px",fontSize:13}} onClick={()=>setLang(l=>l==="en"?"es":"en")}>
              {lang==="en"?"ES":"EN"}
            </button>
            {tab==="catalog" && <button className="btn pill floating" style={{background:"#007AFF",color:"#fff",padding:"9px 18px",fontSize:14}} onClick={openAdd}>+ {t.addPart}</button>}
          </div>
        </div>

        {/* Property selector */}
        <div style={{display:"flex",gap:6}}>
          {["both",...PROPERTIES].map(p=>(
            <button key={p} className="btn pill" style={{fontSize:12,fontWeight:600,padding:"6px 14px",background:property===p?"#1C1C1E":"#E5E5EA",color:property===p?"#fff":"#3A3A3C",flexShrink:0}} onClick={()=>setProperty(p)}>
              {p==="both"?t.both:p}
            </button>
          ))}
        </div>
      </div>

      {/* BODY */}
      <div style={{padding:"16px 16px 0",maxWidth:680,margin:"0 auto"}}>

        {/* LOW STOCK ALERT */}
        {lowStockParts.length > 0 && tab !== "inventory" && (
          <div className="card fade-in" style={{background:"#FFF3CD",padding:"12px 16px",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between"}} onClick={()=>setTab("inventory")}>
            <div style={{fontSize:13,color:"#856404",fontWeight:600}}>⚠️ {lowStockParts.length} {lang==="en"?"items low or out of stock":"artículos bajos o agotados"}</div>
            <div style={{fontSize:12,color:"#856404"}}>View →</div>
          </div>
        )}

        {/* ── CATALOG TAB ── */}
        {tab==="catalog" && (<>
          <input style={{width:"100%",background:"#fff",border:"none",borderRadius:14,padding:"13px 16px",fontSize:15,color:"#1C1C1E",outline:"none",marginBottom:12,boxShadow:"0 2px 8px rgba(0,0,0,.06)"}} placeholder={"🔍  " + t.search} value={search} onChange={e=>setSearch(e.target.value)} />

          <div style={{display:"flex",gap:8,overflowX:"auto",marginBottom:14,paddingBottom:2}}>
            {CATEGORIES.map(c=>(
              <button key={c} className="btn pill" style={{flexShrink:0,fontSize:12,fontWeight:600,padding:"7px 14px",background:activeCategory===c?categoryColor[c]||"#1C1C1E":"#fff",color:activeCategory===c?"#fff":"#3A3A3C",boxShadow:"0 1px 4px rgba(0,0,0,.08)"}} onClick={()=>setActiveCategory(c)}>
                {c!=="All"?categoryEmoji[c]+" ":""}{c==="All"?All (${parts.length}):c}{c!=="All"&&categoryCounts[c]?` (${categoryCounts[c]})`:""  }
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{textAlign:"center",padding:"48px 0",color:"#8E8E93"}}>
              <div style={{fontSize:32,marginBottom:8}}>⏳</div>{t.loading}
            </div>
          ) : filtered.length===0 ? (
            <div style={{textAlign:"center",padding:"48px 0",color:"#8E8E93",fontSize:15}}>{t.noPartsFound}</div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {filtered.map(p=>(
                <div key={p.id} className="card slide-up" style={{overflow:"hidden"}}>
                  <div style={{padding:"14px 16px",display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer"}} onClick={()=>setExpandedId(expandedId===p.id?null:p.id)}>
                    <div style={{width:44,height:44,borderRadius:12,background:(categoryColor[p.category]||"#8E8E93")+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{categoryEmoji[p.category]||"📦"}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,fontSize:15,color:"#1C1C1E",lineHeight:1.3,marginBottom:2}}>{p.name}</div>
                      <div style={{fontSize:12,color:"#8E8E93"}}>{p.brand&&p.brand!=="Unknown"?p.brand+" · ":""}{p.category} · SKU {p.sku}</div>
                      <div style={{fontSize:12,color:"#8E8E93",marginTop:2}}>{t.qty}: {p.qtyPerUnit}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:19,fontWeight:700,color:"#007AFF"}}>${parseFloat(p.unitPrice).toFixed(2)}</div>
                      <div style={{fontSize:11,color:statusColors[stockStatus(p.id)],marginTop:2,fontWeight:600}}>{stockStatus(p.id)==="in"?t.inStock:stockStatus(p.id)==="low"?t.low:t.out}</div>
                    </div>
                  </div>
                  {expandedId===p.id&&(
                    <div style={{padding:"0 16px 16px",borderTop:"1px solid #F2F2F7"}}>
                      <p style={{fontSize:14,color:"#3A3A3C",lineHeight:1.65,marginTop:12,marginBottom:12}}>{p.description||<span style={{fontStyle:"italic",color:"#C7C7CC"}}>{lang==="en"?"No description yet.":"Sin descripción aún."}</span>}</p>
                      {p.notes&&<p style={{fontSize:12,color:"#8E8E93",marginBottom:12}}>📝 {p.notes}</p>}
                      <div style={{display:"flex",gap:8}}>
                        <button className="btn pill" style={{background:"#F2F2F7",color:"#007AFF",padding:"8px 16px",fontSize:13}} onClick={e=>openEdit(p,e)}>✏️ {t.edit}</button>
                        <button className="btn pill" style={{background:"#FFF0F0",color:"#FF3B30",padding:"8px 16px",fontSize:13}} onClick={e=>{e.stopPropagation();setDeleteConfirm(p.id);}}>🗑️ {t.remove}</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!loading&&filtered.length>0&&(
            <div className="card" style={{padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12}}>
              <span style={{color:"#8E8E93",fontSize:13}}>{filtered.length} {t.partsShown}</span>
              <span style={{color:"#007AFF",fontWeight:700,fontSize:18}}>${filtered.reduce((s,p)=>s+parseFloat(p.unitPrice)*parseInt(p.qtyPerUnit),0).toFixed(2)} / {lang==="en"?"unit":"unidad"}</span>
            </div>
          )}
        </>)}

        {/* ── TEMPLATES TAB ── */}
        {tab==="templates"&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {templates.map(tmpl=>(
              <div key={tmpl.id} className="card" style={{overflow:"hidden"}}>
                <div style={{padding:"16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12}} onClick={()=>setExpandedTemplate(expandedTemplate===tmpl.id?null:tmpl.id)}>
                  <div style={{fontSize:28}}>{tmpl.emoji}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:15,color:"#1C1C1E"}}>{tmpl.title}</div>
                    <div style={{fontSize:12,color:"#8E8E93",marginTop:2}}>{tmpl.summary.substring(0,60)}...</div>
                  </div>
                  <div style={{fontSize:20,color:"#C7C7CC"}}>{expandedTemplate===tmpl.id?"⌃":"⌄"}</div>
                </div>

                {expandedTemplate===tmpl.id&&(
                  <div style={{borderTop:"1px solid #F2F2F7"}}>
                    <div style={{padding:"12px 16px",fontSize:13,color:"#3A3A3C",lineHeight:1.65,background:"#F9F9FB"}}>{tmpl.summary}</div>

                    {[["measurements","📐 "+t.measurements],["tools","🔧 "+t.tools],["parts","📦 "+t.partsNeeded],["steps","📋 "+t.steps],["mistakes","⚠️ "+t.mistakes]].map(([key,label])=>(
                      <div key={key} style={{borderTop:"1px solid #F2F2F7"}}>
                        <div style={{padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",fontWeight:600,fontSize:14,color:"#1C1C1E"}} onClick={()=>setExpandedSection(prev=>({...prev,[${tmpl.id}-${key}]:!prev[${tmpl.id}-${key}]}))}>
                          {label}
                          <span style={{color:"#C7C7CC",fontSize:16}}>{expandedSection[${tmpl.id}-${key}]?"⌃":"⌄"}</span>
                        </div>
                        {expandedSection[${tmpl.id}-${key}]&&(
                          <div style={{padding:"0 16px 14px"}}>
                            {(tmpl[key]||[]).map((item,i)=>(
                              <div key={i} style={{fontSize:13,color:"#3A3A3C",lineHeight:1.6,padding:"4px 0",borderBottom:i<tmpl[key].length-1?"1px solid #F2F2F7":"none"}}>
                                {key==="steps"?<span><span style={{fontWeight:700,color:"#007AFF",marginRight:6}}>{i+1}.</span>{item}</span>:<span>{"• "}{item}</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    <div style={{padding:"12px 16px",borderTop:"1px solid #F2F2F7"}}>
                      <button className="btn pill" style={{background:"#007AFF",color:"#fff",padding:"10px 20px",fontSize:14,width:"100%"}} onClick={()=>copyTemplateParts(tmpl)}>
                        {copied?"✅ "+t.copied:"📋 "+t.copyList}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── INVENTORY TAB ── */}
        {tab==="inventory"&&(<>
          {lowStockParts.length>0&&(
            <div className="card" style={{padding:"14px 16px",marginBottom:12,background:"#FFF8EC"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontWeight:700,fontSize:15,color:"#1C1C1E"}}>⚠️ {lang==="en"?"Reorder Needed":"Necesita Reorden"} ({lowStockParts.length})</div>
                <button className="btn pill" style={{background:"#FF9F0A",color:"#fff",padding:"7px 14px",fontSize:12}} onClick={copyReorderList}>{copied?"✅":t.reorderList}</button>
              </div>
              {lowStockParts.slice(0,3).map(p=>(
                <div key={p.id} style={{fontSize:13,color:"#856404",padding:"2px 0"}}>• {p.name} — {t[stockStatus(p.id)]}</div>
              ))}
              {lowStockParts.length>3&&<div style={{fontSize:12,color:"#856404",marginTop:4}}>+{lowStockParts.length-3} more</div>}
            </div>
          )}

          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {parts.map(p=>{
              const inv = inventory[p.id] || {current:0,min:2};
              const status = stockStatus(p.id);
              return (
                <div key={p.id} className="card" style={{padding:"14px 16px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                    <div style={{fontSize:22}}>{categoryEmoji[p.category]||"📦"}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:14,color:"#1C1C1E",lineHeight:1.3}}>{p.name}</div>
                      <div style={{fontSize:11,color:"#8E8E93"}}>SKU {p.sku}</div>
                    </div>
                    <div className="pill" style={{background:statusBg[status],color:statusColors[status],padding:"4px 10px",fontSize:12,fontWeight:700}}>
                      {status==="in"?t.inStock:status==="low"?t.low:t.out}
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <div style={{background:"#F2F2F7",borderRadius:12,padding:"10px 14px"}}>
                      <div style={{fontSize:11,color:"#8E8E93",marginBottom:4}}>{t.currentStock}</div>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <button className="btn" style={{width:32,height:32,borderRadius:10,background:"#FF3B30",color:"#fff",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>adjustInventory(p.id,-1)}>−</button>
                        <span style={{fontWeight:700,fontSize:20,color:"#1C1C1E",flex:1,textAlign:"center"}}>{inv.current}</span>
                        <button className="btn" style={{width:32,height:32,borderRadius:10,background:"#34C759",color:"#fff",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>adjustInventory(p.id,1)}>+</button>
                      </div>
                    </div>
                    <div style={{background:"#F2F2F7",borderRadius:12,padding:"10px 14px"}}>
                      <div style={{fontSize:11,color:"#8E8E93",marginBottom:4}}>{t.minStock}</div>
                      <input type="number" min="0" value={inv.min} onChange={e=>setMinStock(p.id,e.target.value)} style={{width:"100%",background:"transparent",border:"none",outline:"none",fontWeight:700,fontSize:20,color:"#1C1C1E",textAlign:"center",fontFamily:"inherit"}} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>)}

        {/* ── ASSISTANT TAB ── */}
        {tab==="assistant"&&(<>
          <div className="card" style={{padding:"18px 16px",marginBottom:12}}>
            <div style={{fontWeight:700,fontSize:17,color:"#1C1C1E",marginBottom:6}}>{t.jobAssistant}</div>
            <div style={{fontSize:14,color:"#8E8E93",marginBottom:14,lineHeight:1.6}}>{lang==="en"?"Describe the job in plain English — I'll pull the exact parts from your catalog.":"Describe el trabajo — obtendré las piezas exactas de tu catálogo."}</div>
            <textarea style={{width:"100%",background:"#F2F2F7",border:"none",borderRadius:12,padding:"12px 14px",fontSize:15,color:"#1C1C1E",outline:"none",minHeight:80,marginBottom:12,fontFamily:"inherit"}} placeholder={t.describeJob} value={jobQuery} onChange={e=>setJobQuery(e.target.value)} />
            <button className="btn pill" style={{background:"#007AFF",color:"#fff",padding:"14px",fontSize:15,width:"100%",opacity:aiLoading?.6:1}} onClick={()=>runAssistant()} disabled={aiLoading}>
              {aiLoading?"⏳ "+t.findingParts:"🔍 "+t.getPartsList}
            </button>
          </div>

          {!aiResult&&!aiLoading&&(<>
            <div style={{fontSize:12,fontWeight:700,color:"#8E8E93",marginBottom:10,letterSpacing:".04em"}}>{t.quickExamples.toUpperCase()}</div>
            {QUICK_PROMPTS[lang].map(q=>(
              <button key={q} className="btn card" style={{display:"block",width:"100%",padding:"14px 16px",textAlign:"left",fontSize:14,color:"#1C1C1E",marginBottom:8,fontWeight:500}} onClick={()=>runAssistant(q)}>
                → {q}
              </button>
            ))}
          </>)}

          {aiError&&<div className="card" style={{padding:"14px 16px",background:"#FFF0F0",marginBottom:12,color:"#FF3B30",fontSize:14}}>⚠️ {aiError}</div>}

          {aiResult&&!aiLoading&&(<>
            <div className="card" style={{padding:"16px",marginBottom:10,background:"#F0F7FF"}}>
              <div style={{fontSize:11,fontWeight:700,color:"#007AFF",letterSpacing:".08em",marginBottom:6}}>{t.jobSummary.toUpperCase()}</div>
              <div style={{fontSize:17,fontWeight:700,color:"#1C1C1E",marginBottom:8}}>{aiResult.jobTitle}</div>
              <div style={{fontSize:14,color:"#3A3A3C",lineHeight:1.65}}>{aiResult.jobSummary}</div>
              {aiResult.tips&&<div style={{marginTop:10,background:"#fff",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#007AFF",lineHeight:1.6}}>💡 <strong>{t.proTip}:</strong> {aiResult.tips}</div>}
            </div>

            <div style={{fontSize:12,fontWeight:700,color:"#8E8E93",marginBottom:10,letterSpacing:".04em"}}>{t.partsNeeded.toUpperCase()} ({aiResult.partsNeeded?.length||0})</div>

            {(aiResult.partsNeeded||[]).map((p,i)=>(
              <div key={i} className="card" style={{padding:"14px 16px",marginBottom:8}}>
                <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <div style={{fontSize:22,flexShrink:0}}>{categoryEmoji[p.part.category]||"📦"}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:15,color:"#1C1C1E",marginBottom:3}}>{p.part.name}</div>
                    <div style={{fontSize:12,color:"#8E8E93",marginBottom:6}}>{p.part.brand!=="Unknown"?p.part.brand+" · ":""}SKU {p.part.sku}</div>
                    <div style={{fontSize:13,color:"#3A3A3C",fontStyle:"italic",lineHeight:1.5}}>{p.reason}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontWeight:800,fontSize:20,color:"#1C1C1E"}}>{p.qtyNeeded}</div>
                    <div style={{fontSize:14,fontWeight:700,color:"#007AFF"}}>${(p.part.unitPrice*p.qtyNeeded).toFixed(2)}</div>
                  </div>
                </div>
              </div>
            ))}

            {aiResult.missingParts?.length>0&&(
              <div className="card" style={{padding:"14px 16px",marginBottom:10,background:"#FFF8EC"}}>
                <div style={{fontWeight:700,fontSize:13,color:"#FF9F0A",marginBottom:8}}>⚠️ {t.notInCatalog}</div>
                {aiResult.missingParts.map((m,i)=><div key={i} style={{fontSize:13,color:"#856404",padding:"3px 0"}}>• {m}</div>)}
              </div>
            )}

            <div className="card" style={{padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div>
                <div style={{fontSize:12,color:"#8E8E93",marginBottom:2}}>{t.estimatedTotal.toUpperCase()}</div>
                <div style={{fontSize:28,fontWeight:800,color:"#007AFF"}}>${(aiResult.partsNeeded||[]).reduce((s,p)=>s+p.part.unitPrice*p.qtyNeeded,0).toFixed(2)}</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button className="btn pill" style={{background:"#F2F2F7",color:"#1C1C1E",padding:"10px 16px",fontSize:14}} onClick={copyList}>{copied?"✅ "+t.copied:"📋 "+t.copyList}</button>
                <button className="btn pill" style={{background:"#F2F2F7",color:"#8E8E93",padding:"10px 16px",fontSize:14}} onClick={()=>{setAiResult(null);setJobQuery("");}}>{t.clear}</button>
              </div>
            </div>
          </>)}
        </>)}
      </div>

      {/* BOTTOM TAB BAR */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"rgba(242,242,247,.95)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderTop:"1px solid rgba(0,0,0,.08)",display:"flex",padding:"8px 0 20px",zIndex:50}}>
        {[
          {id:"catalog",emoji:"📦",label:t.catalog},
          {id:"templates",emoji:"📋",label:t.jobTemplates},
          {id:"inventory",emoji:"🏪",label:t.inventory},
          {id:"assistant",emoji:"🤖",label:t.assistant},
        ].map(item=>(
          <button key={item.id} className="btn" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"4px 0",background:"transparent",color:tab===item.id?"#007AFF":"#8E8E93"}} onClick={()=>setTab(item.id)}>
            <span style={{fontSize:22}}>{item.emoji}</span>
            <span style={{fontSize:10,fontWeight:tab===item.id?700:500}}>{item.label}</span>
          </button>
        ))}
      </div>

      {/* ADD/EDIT MODAL */}
      {showForm&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)closeForm();}}>
          <div className="floating" style={{background:"#fff",borderRadius:"28px 28px 0 0",padding:"24px 20px 40px",width:"100%",maxWidth:600,maxHeight:"92vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
            <div style={{width:36,height:4,background:"#E5E5EA",borderRadius:2,margin:"0 auto 20px"}}/>
            <div style={{fontSize:19,fontWeight:700,color:"#1C1C1E",marginBottom:20}}>{editId?"✏️ "+t.edit:"➕ "+t.addPart}</div>

            <div style={{fontSize:12,fontWeight:600,color:"#8E8E93",marginBottom:6}}>{t.itemName} *</div>
            <input style={{width:"100%",background:"#F2F2F7",border:"none",borderRadius:12,padding:"13px 14px",fontSize:15,color:"#1C1C1E",outline:"none",marginBottom:14}} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Delta Foundations Shower Valve" />

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {[[t.sku,"sku","e.g. 813456"],[t.brand,"brand","e.g. Delta"]].map(([label,field,ph])=>(
                <div key={field}>
                  <div style={{fontSize:12,fontWeight:600,color:"#8E8E93",marginBottom:6}}>{label}</div>
                  <input style={{width:"100%",background:"#F2F2F7",border:"none",borderRadius:12,padding:"13px 14px",fontSize:15,color:"#1C1C1E",outline:"none",marginBottom:14}} value={form[field]} onChange={e=>setForm(f=>({...f,[field]:e.target.value}))} placeholder={ph} />
                </div>
              ))}
            </div>

            <div style={{fontSize:12,fontWeight:600,color:"#8E8E93",marginBottom:6}}>{t.category}</div>
            <select style={{width:"100%",background:"#F2F2F7",border:"none",borderRadius:12,padding:"13px 14px",fontSize:15,color:"#1C1C1E",outline:"none",marginBottom:14,appearance:"none"}} value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
              {CATEGORIES.filter(c=>c!=="All").map(c=><option key={c}>{c}</option>)}
            </select>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {[[t.price,"unitPrice","0.00","number"],[t.qty,"qtyPerUnit","1","number"]].map(([label,field,ph,type])=>(
                <div key={field}>
                  <div style={{fontSize:12,fontWeight:600,color:"#8E8E93",marginBottom:6}}>{label}</div>
                  <input type={type} step={field==="unitPrice"?"0.01":"1"} min="0" style={{width:"100%",background:"#F2F2F7",border:"none",borderRadius:12,padding:"13px 14px",fontSize:15,color:"#1C1C1E",outline:"none",marginBottom:14}} value={form[field]} onChange={e=>setForm(f=>({...f,[field]:e.target.value}))} placeholder={ph} />
                </div>
              ))}
            </div>

            <div style={{fontSize:12,fontWeight:600,color:"#8E8E93",marginBottom:6}}>{t.description}</div>
            <textarea style={{width:"100%",background:"#F2F2F7",border:"none",borderRadius:12,padding:"13px 14px",fontSize:15,color:"#1C1C1E",outline:"none",marginBottom:14,minHeight:80,fontFamily:"inherit"}} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder={lang==="en"?"What is this part? Sizes, where used...":"¿Qué es esta pieza? Tamaños, dónde se usa..."} />

            <div style={{fontSize:12,fontWeight:600,color:"#8E8E93",marginBottom:6}}>{t.notes}</div>
            <input style={{width:"100%",background:"#F2F2F7",border:"none",borderRadius:12,padding:"13px 14px",fontSize:15,color:"#1C1C1E",outline:"none",marginBottom:20}} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Receipt #, lot #..." />

            <div style={{display:"flex",gap:10}}>
              <button className="btn pill" style={{flex:1,background:"#F2F2F7",color:"#8E8E93",padding:"14px"}} onClick={closeForm}>{t.cancel}</button>
              <button className="btn pill" style={{flex:2,background:"#007AFF",color:"#fff",padding:"14px",fontSize:15,opacity:saving?.6:1}} onClick={savePart} disabled={saving}>{saving?t.saving:editId?t.save:t.add}</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirm&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setDeleteConfirm(null)}>
          <div style={{background:"#fff",borderRadius:"28px 28px 0 0",padding:"24px 20px 40px",width:"100%",maxWidth:500}} onClick={e=>e.stopPropagation()}>
            <div style={{width:36,height:4,background:"#E5E5EA",borderRadius:2,margin:"0 auto 20px"}}/>
            <div style={{fontSize:19,fontWeight:700,color:"#FF3B30",marginBottom:10}}>{lang==="en"?"Remove Part?":"¿Eliminar Pieza?"}</div>
            <div style={{fontSize:14,color:"#3A3A3C",marginBottom:24,lineHeight:1.6}}>
              {lang==="en"?"This will permanently remove ":"Esto eliminará permanentemente "}<strong style={{color:"#1C1C1E"}}>{parts.find(p=>p.id===deleteConfirm)?.name}</strong>{lang==="en"?" from the catalog.":" del catálogo."}
            </div>
            <div style={{display:"flex",gap:10}}>
              <button className="btn pill" style={{flex:1,background:"#F2F2F7",color:"#8E8E93",padding:"14px"}} onClick={()=>setDeleteConfirm(null)}>{t.cancel}</button>
              <button className="btn pill" style={{flex:1,background:"#FF3B30",color:"#fff",padding:"14px",opacity:saving?.6:1}} onClick={()=>deletePart(deleteConfirm)}>{saving?t.removing:t.remove}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
